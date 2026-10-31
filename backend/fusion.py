"""Router and Fusion layer for PhishShield India.

Detects input type (URL, SMS/text, email header) and aggregates multi-engine
signals into a unified risk verdict, reasons list, and actionable next steps.
"""

from __future__ import annotations

import re
from typing import Any

from fusion_config import (
    CATEGORY_ALERTS,
    HIGH_RISK_TRIGGER,
    RECOMMENDED_NEXT_STEPS,
    WEIGHT_SMS_TEXT,
    WEIGHT_SMS_URL,
    get_verdict,
)

# Common RFC 5322 header field prefixes
HEADER_PATTERNS = [
    re.compile(r"^Received:\s+", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^Authentication-Results:\s+", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^DKIM-Signature:\s+", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^Return-Path:\s+", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^Delivered-To:\s+", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^ARC-Authentication-Results:\s+", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^ARC-Seal:\s+", re.IGNORECASE | re.MULTILINE),
]

# Standard header pairs (e.g. From + Subject)
HEADER_FIELD_FROM = re.compile(r"^From:\s+", re.IGNORECASE | re.MULTILINE)
HEADER_FIELD_SUBJECT = re.compile(r"^Subject:\s+", re.IGNORECASE | re.MULTILINE)
HEADER_FIELD_DATE = re.compile(r"^Date:\s+", re.IGNORECASE | re.MULTILINE)

# URL prefixes and single-token patterns
URL_PREFIX_PATTERN = re.compile(r"^(?:https?|hxxps?|ftp)://", re.IGNORECASE)
URL_TOKEN_PATTERN = re.compile(r"^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/[^\s]*)?$")
IP_PORT_PATTERN = re.compile(r"^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s]*)?$")


def detect_input_type(content: str) -> str:
    """Auto-detect whether input is a raw email header, URL, or SMS text.

    Args:
        content: Raw user input string.

    Returns:
        One of "header", "url", or "sms".
    """
    if not content or not isinstance(content, str):
        return "sms"

    stripped = content.strip()
    if not stripped:
        return "sms"

    # 1. Check for email headers
    # Strong header signals: presence of Received, Authentication-Results, DKIM, etc.
    header_matches = sum(1 for pat in HEADER_PATTERNS if pat.search(content))
    if header_matches >= 1:
        return "header"

    # Secondary header signal: multiple standard header fields in multi-line text
    has_from = bool(HEADER_FIELD_FROM.search(content))
    has_subject = bool(HEADER_FIELD_SUBJECT.search(content))
    has_date = bool(HEADER_FIELD_DATE.search(content))
    if "\n" in content and sum([has_from, has_subject, has_date]) >= 2:
        return "header"

    # 2. Check for URL
    # Single-line, no spaces, starts with protocol or matches domain pattern
    if " " not in stripped and "\n" not in stripped:
        if URL_PREFIX_PATTERN.match(stripped) or stripped.lower().startswith("www."):
            return "url"
        if URL_TOKEN_PATTERN.match(stripped) or IP_PORT_PATTERN.match(stripped):
            return "url"

    # If it starts with a clear URL prefix even if followed by trailing path
    if URL_PREFIX_PATTERN.match(stripped) and len(stripped.split()) == 1:
        return "url"

    # 3. Default to SMS/text
    return "sms"


def fuse(engine_results: dict[str, Any], detected_type: str = "auto") -> dict[str, Any]:
    """Fuse multi-engine analysis results into a consolidated verdict and advice.

    Args:
        engine_results: Dictionary containing outputs from url, text, and header engines.
        detected_type: The detected or user-specified input type.

    Returns:
        Consolidated dictionary conforming to PhishShield India API contract.
    """
    try:
        url_res = engine_results.get("url") or {}
        text_res = engine_results.get("text") or {}
        header_res = engine_results.get("header") or {}

        url_score = url_res.get("score")
        text_score = text_res.get("score")
        header_score = header_res.get("score")

        valid_scores = [s for s in [url_score, text_score, header_score] if isinstance(s, int)]

        # Score Fusion Logic
        if not valid_scores:
            final_score = None
        elif text_score is not None and url_score is not None:
            # Multi-engine: SMS text with embedded URL
            weighted_score = round(WEIGHT_SMS_TEXT * text_score + WEIGHT_SMS_URL * url_score)
            # High-water mark protection: malicious link must not be washed out by benign text
            if max(text_score, url_score) >= HIGH_RISK_TRIGGER:
                final_score = max(weighted_score, max(text_score, url_score))
            else:
                final_score = weighted_score
        else:
            # Single active engine score or maximum of available valid scores
            final_score = max(valid_scores)

        # Cap score between 0 and 100 if present
        if isinstance(final_score, int):
            final_score = max(0, min(100, final_score))

        verdict = get_verdict(final_score)

        # Collect and deduplicate reasons from all active engines
        reasons: list[str] = []
        matched_category_codes: set[str] = set()

        for eng_data in [url_res, text_res, header_res]:
            for flag in eng_data.get("flags", []):
                code = flag.get("code")
                reason = flag.get("reason")
                if code:
                    matched_category_codes.add(code)
                if reason and reason not in reasons:
                    reasons.append(reason)

        # Also pull categories from text meta if present
        text_meta_cats = text_res.get("meta", {}).get("matched_categories", [])
        for cat in text_meta_cats:
            matched_category_codes.add(cat)

        # Assemble actionable next steps
        next_steps: list[str] = []

        # Prepend category-specific alerts
        for cat_code, alert_msg in CATEGORY_ALERTS.items():
            if cat_code in matched_category_codes:
                next_steps.append(alert_msg)

        # Add general verdict recommendations
        base_steps = RECOMMENDED_NEXT_STEPS.get(verdict, RECOMMENDED_NEXT_STEPS["low"])
        for step in base_steps:
            if step not in next_steps:
                next_steps.append(step)

        # Generate concise 1-line summary
        if final_score is None:
            summary = "Input samajh nahi aaya ya engine analysis uplabdh nahi hai."
        elif verdict == "high":
            matched_str = ", ".join(list(matched_category_codes)[:2]) if matched_category_codes else "Phishing"
            summary = f"Khatra: Sandigdha {matched_str} fraud detect hua hai (High Risk: {final_score}/100)."
        elif verdict == "medium":
            summary = f"Savdhaan: Sandigdha gatividhi detect hui hai, savdhani bartein (Medium Risk: {final_score}/100)."
        else:
            summary = f"Surakshit pratit ho raha hai, koi direct khatra nahi mila (Low Risk: {final_score}/100)."

        return {
            "dummy": False,
            "verdict": verdict,
            "score": final_score,
            "input_type": detected_type,
            "summary": summary,
            "reasons": reasons,
            "next_steps": next_steps,
            "engines": {
                "url": url_res if url_res else {"score": None, "flags": [], "meta": {}},
                "text": text_res if text_res else {"score": None, "flags": [], "meta": {}},
                "header": header_res if header_res else {"score": None, "flags": [], "meta": {}},
            },
        }

    except Exception as exc:
        # Fallback ensuring the API contract is never broken
        return {
            "dummy": False,
            "verdict": "low",
            "score": None,
            "input_type": detected_type,
            "summary": "Internal fusion layer issue occurred.",
            "reasons": [f"Fusion processing error: {exc}"],
            "next_steps": RECOMMENDED_NEXT_STEPS["low"],
            "engines": engine_results,
        }
