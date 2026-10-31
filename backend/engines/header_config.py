"""Configuration and expert-assumed scoring weights for the Email Header Engine.

All scoring weights and thresholds are tunable parameters designed to avoid
hardcoded scoring heuristics inside engine logic.
"""

from typing import Dict, Set

HEADER_RULE_WEIGHTS: Dict[str, int] = {
    "DMARC_FAIL": 45,
    "SPF_FAIL": 30,
    "SPF_SOFTFAIL": 15,
    "DKIM_FAIL": 25,
    "REPLY_TO_MISMATCH": 35,
    "RETURN_PATH_MISMATCH": 15,
    "DISPLAY_NAME_SPOOF": 40,
    "FREE_WEBMAIL_BRAND_SPOOF": 45,
    "DEFANGED_HEADER": 10,
}

# Free or public webmail providers commonly abused when spoofing official institutions
FREE_MAIL_DOMAINS: Set[str] = {
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "rediffmail.com",
    "zoho.com",
    "protonmail.com",
    "proton.me",
    "icloud.com",
    "mail.com",
    "yandex.com",
    "gmx.com",
}
