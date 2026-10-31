"""Configuration and expert-assumed scoring weights for the Footprint Engine.

All scoring weights and thresholds are expert-assumed, tunable parameters
designed to avoid hardcoded heuristics inside engine logic.
"""

from typing import Dict, Set

# Tunable scoring weights for infrastructure footprint signals (0-100 scale)
FOOTPRINT_WEIGHTS: Dict[str, int] = {
    "DOMAIN_NEW_UNDER_30D": 35,
    "DOMAIN_NEW_UNDER_90D": 20,
    "IP_LITERAL_HOST": 25,
    "PUNYCODE_IDN": 20,
    "SUSPICIOUS_TLD": 15,
    "BRAND_LOOKALIKE": 40,
    "MISSING_MAIL_AUTHENTICATION": 15,
    "FREE_OR_DISPOSABLE_HOSTING": 15,
    "MULTIPLE_SUBDOMAINS": 10,
    "NO_HTTPS_CONFIGURED": 10,
}

# Suspicious TLDs frequently abused in cheap or throwaway scam campaigns
SUSPICIOUS_TLDS: Set[str] = {
    "xyz", "top", "click", "live", "icu", "buzz", "shop", "vip",
    "work", "site", "online", "club", "pw", "cc", "fit", "rest",
    "surf", "gq", "ml", "cf", "tk", "ga", "kim", "country"
}

# Hosting providers frequently abused for free/disposable phishing stages
DISPOSABLE_HOSTING_KEYWORDS: Set[str] = {
    "vercel", "netlify", "firebase", "glitch", "ngrok", "localtunnel",
    "pages.dev", "github.io", "web.app", "render.com", "onrender"
}

# Legitimate Indian government & official top-level suffixes
OFFICIAL_INDIAN_DOMAINS: Set[str] = {
    "gov.in", "nic.in", "ac.in", "edu.in", "res.in", "mil.in"
}

# Verdict calculation thresholds
SCORE_HIGH_RISK_THRESHOLD: int = 60
SCORE_MEDIUM_RISK_THRESHOLD: int = 30

REQUEST_TIMEOUT_SECONDS: float = 3.0
NETWORK_BUDGET_SECONDS: float = 5.0


def get_footprint_verdict(score: int) -> str:
    """Map numeric score (0-100) to risk verdict."""
    if score >= SCORE_HIGH_RISK_THRESHOLD:
        return "high"
    if score >= SCORE_MEDIUM_RISK_THRESHOLD:
        return "medium"
    return "low"
