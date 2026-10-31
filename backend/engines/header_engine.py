"""Email header detection engine for PhishShield India.

Parses raw email headers with Python standard email library, extracts SPF, DKIM,
and DMARC authentication verdicts from Authentication-Results and Received-SPF,
and detects From vs Reply-To mismatches and brand display-name spoofing.
"""

import email
import email.header
import email.utils
import json
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple

import tldextract

from .header_config import FREE_MAIL_DOMAINS, HEADER_RULE_WEIGHTS

# Offline tldextract snapshot to prevent runtime network access
_EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=())

_BRANDS_CACHE: Optional[List[Dict[str, Any]]] = None


def _get_brands() -> List[Dict[str, Any]]:
    """Load brand definitions from backend/data/brands.json with caching."""
    global _BRANDS_CACHE
    if _BRANDS_CACHE is not None:
        return _BRANDS_CACHE

    brands_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "brands.json"
    )
    if os.path.isfile(brands_path):
        try:
            with open(brands_path, "r", encoding="utf-8") as f:
                _BRANDS_CACHE = json.load(f)
                return _BRANDS_CACHE
        except Exception:
            pass
    _BRANDS_CACHE = []
    return _BRANDS_CACHE


def _get_registered_domain(ext: Any) -> str:
    """Safely obtain registered domain without deprecation warning."""
    if hasattr(ext, "top_domain_under_public_suffix"):
        return ext.top_domain_under_public_suffix or ""
    return getattr(ext, "registered_domain", "") or ""


def _decode_header_str(val: str) -> str:
    """Decode MIME encoded-word syntax (e.g. =?UTF-8?B?...?=)."""
    if not val:
        return ""
    try:
        parts = email.header.decode_header(val)
        decoded = []
        for text, encoding in parts:
            if isinstance(text, bytes):
                decoded.append(text.decode(encoding or "utf-8", errors="replace"))
            else:
                decoded.append(str(text))
        return " ".join(decoded)
    except Exception:
        return str(val)


def _clean_domain(addr: str) -> str:
    """Extract clean domain part from email address string, handling defanging."""
    if not addr or "@" not in addr:
        return ""
    domain = addr.split("@")[-1].strip().strip(">").strip()
    domain = domain.replace("[.]", ".").replace("(.)", ".")
    return domain.lower()


def _parse_auth_results(msg: email.message.Message) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extract SPF, DKIM, and DMARC status strings from authentication headers."""
    auth_headers = (
        msg.get_all("Authentication-Results", [])
        + msg.get_all("ARC-Authentication-Results", [])
    )
    auth_str = " ".join(_decode_header_str(h) for h in auth_headers).lower()

    spf_match = re.search(r"\bspf=([a-z]+)\b", auth_str)
    dkim_match = re.search(r"\bdkim=([a-z]+)\b", auth_str)
    dmarc_match = re.search(r"\bdmarc=([a-z]+)\b", auth_str)

    spf_status = spf_match.group(1) if spf_match else None
    dkim_status = dkim_match.group(1) if dkim_match else None
    dmarc_status = dmarc_match.group(1) if dmarc_match else None

    # Fallback to Received-SPF header if SPF was not in Authentication-Results
    if not spf_status:
        received_spf = " ".join(_decode_header_str(h) for h in msg.get_all("Received-SPF", [])).lower().strip()
        rec_match = re.search(r"^(pass|fail|softfail|neutral|none|temperror|permerror)\b", received_spf)
        if rec_match:
            spf_status = rec_match.group(1)

    return spf_status, dkim_status, dmarc_status


def analyze_header(raw: str) -> Dict[str, Any]:
    """Analyze raw email headers for phishing indicators, SPF/DKIM/DMARC status,

    and From/Reply-To/Return-Path spoofing.
    Guaranteed to NEVER raise an unhandled exception.
    """
    try:
        if not isinstance(raw, str) or not raw.strip():
            return {
                "score": None,
                "flags": [
                    {
                        "code": "INVALID_INPUT",
                        "reason": "Email header samajh nahi aaya ya khali hai",
                    }
                ],
                "meta": {
                    "from": None,
                    "from_display_name": None,
                    "reply_to": None,
                    "return_path": None,
                    "spf": None,
                    "dkim": None,
                    "dmarc": None,
                    "reply_to_mismatch": False,
                },
            }

        msg = email.message_from_string(raw)

        # Parse From address & display name (cleaning defanging for valid parsing)
        from_raw = _decode_header_str(msg.get("From", "")).replace("[.]", ".").replace("(.)", ".")
        from_name, from_addr = email.utils.parseaddr(from_raw)
        from_domain = _clean_domain(from_addr)
        from_ext = _EXTRACTOR(f"http://{from_domain}") if from_domain else None
        from_reg = _get_registered_domain(from_ext) if from_ext else ""

        # Parse Reply-To address
        reply_to_raw = _decode_header_str(msg.get("Reply-To", "")).replace("[.]", ".").replace("(.)", ".")
        reply_to_name, reply_to_addr = email.utils.parseaddr(reply_to_raw)
        reply_to_domain = _clean_domain(reply_to_addr)
        reply_to_ext = _EXTRACTOR(f"http://{reply_to_domain}") if reply_to_domain else None
        reply_to_reg = _get_registered_domain(reply_to_ext) if reply_to_ext else ""

        # Parse Return-Path address
        return_path_raw = _decode_header_str(msg.get("Return-Path", "")).replace("[.]", ".").replace("(.)", ".")
        _, return_path_addr = email.utils.parseaddr(return_path_raw)
        return_path_domain = _clean_domain(return_path_addr)
        return_path_ext = _EXTRACTOR(f"http://{return_path_domain}") if return_path_domain else None
        return_path_reg = _get_registered_domain(return_path_ext) if return_path_ext else ""

        # Parse Authentication-Results
        spf_status, dkim_status, dmarc_status = _parse_auth_results(msg)

        score = 0
        flags: List[Dict[str, str]] = []

        # 1. DMARC Authentication check
        if dmarc_status == "fail":
            flags.append({
                "code": "DMARC_FAIL",
                "reason": "DMARC policy fail ho gayi hai (email spoofed ho sakti hai)",
            })
            score += HEADER_RULE_WEIGHTS["DMARC_FAIL"]

        # 2. SPF Authentication check
        if spf_status == "fail":
            flags.append({
                "code": "SPF_FAIL",
                "reason": "SPF authentication fail ho gaya hai, sender unauthorized hai",
            })
            score += HEADER_RULE_WEIGHTS["SPF_FAIL"]
        elif spf_status == "softfail":
            flags.append({
                "code": "SPF_SOFTFAIL",
                "reason": "SPF softfail hai, sender domain se poori tarah authorized nahi hai",
            })
            score += HEADER_RULE_WEIGHTS["SPF_SOFTFAIL"]

        # 3. DKIM Cryptographic Signature check
        if dkim_status == "fail":
            flags.append({
                "code": "DKIM_FAIL",
                "reason": "DKIM cryptographic signature verify nahi ho payi",
            })
            score += HEADER_RULE_WEIGHTS["DKIM_FAIL"]

        # 4. From vs Reply-To Mismatch
        reply_to_mismatch = False
        if reply_to_reg and from_reg and reply_to_reg != from_reg:
            reply_to_mismatch = True
            flags.append({
                "code": "REPLY_TO_MISMATCH",
                "reason": f"Reply-To domain ({reply_to_domain}) From domain ({from_domain}) se alag hai",
            })
            score += HEADER_RULE_WEIGHTS["REPLY_TO_MISMATCH"]

        # 5. Display-Name Spoofing & Free Webmail impersonation
        brands = _get_brands()
        name_lower = from_name.lower()
        if from_name and from_domain:
            for b in brands:
                b_name = b.get("name", "")
                official_domains = b.get("official_domains", [])
                keywords = b.get("keywords", [])

                # Check if display name matches an official institution
                name_match = (
                    (b_name and b_name.lower() in name_lower)
                    or any(kw in name_lower for kw in keywords if len(kw) >= 3)
                )

                if name_match:
                    is_official_sender = from_reg in official_domains or any(
                        from_domain == off or from_domain.endswith("." + off)
                        for off in official_domains
                    )

                    if not is_official_sender:
                        if from_reg in FREE_MAIL_DOMAINS or from_domain in FREE_MAIL_DOMAINS:
                            flags.append({
                                "code": "FREE_WEBMAIL_BRAND_SPOOF",
                                "reason": f"Display name '{from_name}' official domain ke bajaye free {from_domain} use kar raha hai",
                            })
                            score += HEADER_RULE_WEIGHTS["FREE_WEBMAIL_BRAND_SPOOF"]
                        else:
                            flags.append({
                                "code": "DISPLAY_NAME_SPOOF",
                                "reason": f"Display name '{from_name}' brand claim karta hai par domain {from_domain} hai",
                            })
                            score += HEADER_RULE_WEIGHTS["DISPLAY_NAME_SPOOF"]
                        break

        # 6. Defanged conventions in headers ([.] or hxxp)
        if "[.]" in raw or "hxxp" in raw.lower():
            flags.append({
                "code": "DEFANGED_HEADER",
                "reason": "Email headers me defanged conventions ([.]) payi gayi hain",
            })
            score += HEADER_RULE_WEIGHTS["DEFANGED_HEADER"]

        final_score = max(0, min(100, score))

        return {
            "score": final_score,
            "flags": flags,
            "meta": {
                "from": from_addr or None,
                "from_display_name": from_name or None,
                "reply_to": reply_to_addr or None,
                "return_path": return_path_addr or None,
                "spf": spf_status,
                "dkim": dkim_status,
                "dmarc": dmarc_status,
                "reply_to_mismatch": reply_to_mismatch,
            },
        }

    except Exception:
        # Engine contract: must never raise; on unexpected failure return score null and no flags
        return {
            "score": None,
            "flags": [],
            "meta": {
                "from": None,
                "from_display_name": None,
                "reply_to": None,
                "return_path": None,
                "spf": None,
                "dkim": None,
                "dmarc": None,
                "reply_to_mismatch": False,
            },
        }
