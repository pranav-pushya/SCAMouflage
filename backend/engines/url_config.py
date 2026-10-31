"""Configuration and expert-assumed scoring weights for the URL engine.

All scoring weights and thresholds are expert-assumed, tunable parameters
designed to avoid hardcoded scoring heuristics inside engine logic.
"""

from typing import Dict, Set

# Expert-assumed, tunable weights for URL heuristic flags (0-100 scale)
RULE_WEIGHTS: Dict[str, int] = {
    "IP_ADDRESS_HOST": 25,
    "PUNYCODE": 20,
    "AT_SYMBOL": 15,
    "MANY_SUBDOMAINS": 10,
    "MANY_HYPHENS": 10,
    "LONG_URL": 5,
    "SUSPICIOUS_TLD": 10,
    "NO_HTTPS": 5,
    "BRAND_LOOKALIKE": 55,
    "BRAND_IN_DOMAIN": 20,
    "SHORTENER_REDIRECT": 10,
    "REDIRECT_CHAIN_LONG": 10,
    "NEW_DOMAIN_UNDER_30D": 30,
    "NEW_DOMAIN_UNDER_90D": 15,
    "ML_HIGH_RISK": 25,
}

# Suspicious TLDs commonly exploited for low-cost, throwaway phishing links
SUSPICIOUS_TLDS: Set[str] = {
    "xyz", "top", "click", "live", "icu", "buzz", "shop", "vip",
    "work", "site", "online", "club", "pw", "cc", "fit", "rest",
    "surf", "gq", "ml", "cf", "tk", "ga"
}

# Commonly observed URL shortener domains
SHORTENER_DOMAINS: Set[str] = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly",
    "rb.gy", "shorturl.at", "ow.ly", "tiny.cc", "qr.ae", "buff.ly",
    "adf.ly", "bit.do"
}

# Phishing and credential harvesting keywords in domain labels
PHISHING_KEYWORDS: Set[str] = {
    "kyc", "update", "verify", "verification", "login", "signin",
    "secure", "security", "refund", "reward", "claim", "bonus",
    "otp", "support", "account", "help", "customer", "care",
    "service", "banking", "portal", "alert", "auth", "validation",
    "bill", "payment", "recharge", "blocked", "unblock",
}

# Rapidfuzz similarity threshold for near-miss domain typos (0 to 100)
BRAND_SIMILARITY_THRESHOLD: float = 85.0

# Official domain guard limit: protects genuine brand domains from false positives
OFFICIAL_DOMAIN_MAX_SCORE: int = 10

# Network tracing and RDAP query limits
MAX_REDIRECT_HOPS: int = 5
REQUEST_TIMEOUT_SECONDS: float = 3.0
NETWORK_BUDGET_SECONDS: float = 3.0

# Ensemble weighting for rule score vs machine learning probability score
W_RULE: float = 0.5
W_ML: float = 0.5
