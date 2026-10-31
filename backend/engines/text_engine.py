"""Text detection engine for PhishShield India.

Analyzes SMS and message text for scam categories, Indian fraud themes,
and urgency patterns with diminishing returns rule scoring and legit-message guards.
"""

import math
import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
import re
import unicodedata
from typing import Any, Dict, List, Optional, Set, Tuple

import joblib

from .groq_client import extract_tactics
from .text_config import LEGIT_OTP_WARNING_PATTERNS, LEGIT_TXN_PATTERNS, TEXT_RULES

# Precompiled regexes for extraction
URL_REGEX = re.compile(
    r"(?:https?://|hxxps?://|www\.)[^\s<>'\"`]+",
    re.IGNORECASE,
)
PHONE_REGEX = re.compile(
    r"(?:(?:\+91|91|0)[\s-]?)?([6-9]\d{9})\b",
)

# Compiled rule patterns for performance
_COMPILED_RULES = [
    {
        "code": rule["code"],
        "weight": float(rule["weight"]),
        "reason": rule["reason"],
        "patterns": [re.compile(p, re.IGNORECASE) for p in rule["patterns"]],
    }
    for rule in TEXT_RULES
]

_COMPILED_LEGIT_WARNINGS = [
    re.compile(p, re.IGNORECASE) for p in LEGIT_OTP_WARNING_PATTERNS
]
_COMPILED_LEGIT_TXNS = [
    re.compile(p, re.IGNORECASE) for p in LEGIT_TXN_PATTERNS
]

_TEXT_MODEL_CACHE: Optional[Dict[str, Any]] = None
_TEXT_MODEL_CHECKED: bool = False


def _load_text_model() -> Optional[Dict[str, Any]]:
    """Load trained TF-IDF + Logistic Regression artifact if present."""
    global _TEXT_MODEL_CACHE, _TEXT_MODEL_CHECKED
    if _TEXT_MODEL_CHECKED:
        return _TEXT_MODEL_CACHE

    _TEXT_MODEL_CHECKED = True
    model_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "models", "text_model.joblib"
    )
    if os.path.isfile(model_path):
        try:
            _TEXT_MODEL_CACHE = joblib.load(model_path)
        except Exception:
            _TEXT_MODEL_CACHE = None
    return _TEXT_MODEL_CACHE


def normalize_text(text: str) -> str:
    """Normalize Unicode (NFKC), lowercase, collapse whitespace, and truncate to 2000 chars."""
    if not isinstance(text, str):
        return ""
    # Unicode NFKC normalization
    norm = unicodedata.normalize("NFKC", text)
    # Lowercase
    norm = norm.lower()
    # Collapse whitespace
    norm = re.sub(r"\s+", " ", norm).strip()
    # Truncate to 2000 chars
    return norm[:2000]


def extract_entities(raw_text: str) -> Tuple[List[str], List[str]]:
    """Extract unique URLs and 10-digit mobile phone numbers."""
    if not isinstance(raw_text, str) or not raw_text:
        return [], []

    # Extract URLs
    urls: List[str] = []
    seen_urls: Set[str] = set()
    for m in URL_REGEX.finditer(raw_text):
        u = m.group(0).rstrip(".,;:!?)")
        if u not in seen_urls:
            seen_urls.add(u)
            urls.append(u)

    # Extract 10-digit Indian mobile numbers
    phones: List[str] = []
    seen_phones: Set[str] = set()
    for m in PHONE_REGEX.finditer(raw_text):
        num = m.group(1)
        if num not in seen_phones:
            seen_phones.add(num)
            phones.append(num)

    return urls, phones


def _is_legit_message(normalized: str) -> Tuple[bool, bool]:
    """Check if message is a legitimate OTP notification or transaction alert."""
    has_warning = any(p.search(normalized) for p in _COMPILED_LEGIT_WARNINGS)
    has_txn = any(p.search(normalized) for p in _COMPILED_LEGIT_TXNS)
    return has_warning, has_txn


def analyze_text(text: str) -> Dict[str, Any]:
    """Analyze SMS or message text for Indian scam patterns.

    Public entry point following the PhishShield contract.
    Guaranteed to NEVER raise an unhandled exception. On failure returns score null.
    """
    try:
        if not isinstance(text, str) or not text.strip():
            return {
                "score": None,
                "flags": [],
                "meta": {
                    "normalized_text": "",
                    "rules_score": None,
                    "matched_categories": [],
                    "urls": [],
                    "phones": [],
                },
            }

        normalized = normalize_text(text)
        urls, phones = extract_entities(text)

        # Check legit message guards
        has_otp_warning, has_txn_pattern = _is_legit_message(normalized)

        matched_weights: List[float] = []
        matched_categories: List[str] = []
        flags: List[Dict[str, str]] = []

        # High-severity scam categories that override legit transaction heuristics
        critical_categories = {
            "DIGITAL_ARREST",
            "KYC_UPDATE",
            "ACCOUNT_BLOCK_THREAT",
            "ELECTRICITY_DISCONNECT",
            "AADHAAR_PAN_UPDATE",
            "LOTTERY_KBC",
            "COURIER_CUSTOMS",
            "JOB_TASK",
            "LOAN_APP",
        }

        has_critical_scam = False

        for rule in _COMPILED_RULES:
            code = rule["code"]

            # Legit-message guard: do NOT flag OTP_REQUEST if message warns against sharing
            if code == "OTP_REQUEST" and has_otp_warning:
                continue

            # Check if any regex in this rule matches
            if any(p.search(normalized) for p in rule["patterns"]):
                matched_categories.append(code)
                matched_weights.append(rule["weight"])
                flags.append({
                    "code": code,
                    "reason": rule["reason"],
                })
                if code in critical_categories:
                    has_critical_scam = True

        # 1. Rule score calculation with diminishing returns
        if not matched_weights:
            rule_score = 0
        else:
            prod_remaining = math.prod(1.0 - w for w in matched_weights)
            combined_factor = 1.0 - prod_remaining
            rule_score = int(round(100.0 * combined_factor))
            rule_score = max(0, min(100, rule_score))

        # 2. Machine learning probability from TF-IDF + Logistic Regression
        ml_probability: Optional[float] = None
        ml_score: Optional[int] = None
        model_artifact = _load_text_model()
        if model_artifact:
            try:
                pipeline = model_artifact["model"]
                classes = list(model_artifact.get("classes", []))
                probs = pipeline.predict_proba([normalized])[0]
                scam_idx = classes.index("scam") if "scam" in classes else 1
                prob = float(probs[scam_idx])
                ml_probability = round(prob, 4)
                ml_score = int(round(prob * 100))
            except Exception:
                ml_probability = None
                ml_score = None

        # 3. Groq API for psychological scam tactics (low temp, JSON mode, with offline fallback)
        groq_tactics: List[str] = []
        groq_explanation: Optional[str] = None
        try:
            groq_res = extract_tactics(normalized)
            if groq_res:
                groq_tactics = groq_res.get("tactics", [])
                groq_explanation = groq_res.get("explanation")
                if groq_res.get("is_scam") and groq_res.get("confidence", 0) >= 0.8:
                    if groq_explanation:
                        flags.append({
                            "code": "AI_TACTIC_DETECTED",
                            "reason": groq_explanation[:80],
                        })
        except Exception:
            pass

        # 4. Ensemble calculation (rules + ML)
        final_score = rule_score
        if ml_score is not None:
            if not matched_weights:
                if ml_score >= 70:
                    final_score = ml_score
                    flags.append({
                        "code": "ML_TEXT_SCAM",
                        "reason": "Machine learning model ne is message ko high risk flag kiya",
                    })
            else:
                # If rule score is low (e.g. only LINK_PRESENT <= 20), do not let ML inflate legit alerts
                if rule_score <= 20 and not has_critical_scam:
                    final_score = rule_score
                else:
                    final_score = max(rule_score, int(round(0.6 * rule_score + 0.4 * ml_score)))

        # 5. Clean legit transaction override
        if (has_otp_warning or has_txn_pattern) and not has_critical_scam:
            # Clean safe transactional alert: keep score at 0 and clear false flags
            final_score = 0
            flags = []
            matched_categories = []

        final_score = max(0, min(100, int(final_score)))

        return {
            "score": final_score,
            "flags": flags,
            "meta": {
                "normalized_text": normalized,
                "rules_score": rule_score,
                "ml_probability": ml_probability,
                "groq_tactics": groq_tactics,
                "groq_explanation": groq_explanation,
                "matched_categories": matched_categories,
                "urls": urls,
                "phones": phones,
            },
        }

    except Exception:
        # Engine contract: must never raise; on unexpected failure return score null and no flags
        return {
            "score": None,
            "flags": [],
            "meta": {
                "normalized_text": "",
                "rules_score": None,
                "matched_categories": [],
                "urls": [],
                "phones": [],
            },
        }
