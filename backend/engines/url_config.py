"""Configuration and expert-assumed scoring weights for the URL engine.

All scoring weights and thresholds are expert-assumed, tunable parameters
designed to avoid hardcoded scoring heuristics inside engine logic.
"""

from typing import Dict, Set

# Expert-assumed, tunable weights for URL heuristic flags (0-100 scale)
RULE_WEIGHTS: Dict[str, int] = {
    "IP_ADDRESS_HOST": 35,
    "PUNYCODE": 20,
    "AT_SYMBOL": 15,
    "MANY_SUBDOMAINS": 10,
    "MANY_HYPHENS": 10,
    "LONG_URL": 5,
    "SUSPICIOUS_TLD": 20,
    "NO_HTTPS": 5,
    "BRAND_LOOKALIKE": 55,
    "BRAND_IN_DOMAIN": 20,
    "SHORTENER_REDIRECT": 10,
    "REDIRECT_CHAIN_LONG": 10,
    "NEW_DOMAIN_UNDER_30D": 30,
    "NEW_DOMAIN_UNDER_90D": 15,
    "ML_HIGH_RISK": 25,
    "PHISHING_KEYWORD_STUFFING": 35,
    "PHISHING_KEYWORDS": 15,
    "SENSITIVE_PATH": 15,
    "CREDENTIAL_HARVESTING_PARAMS": 25,
    "FREE_HOSTING_PHISH": 35,
    "SUSPICIOUS_FILE_DOWNLOAD": 45,
}

# Suspicious TLDs commonly exploited for low-cost, throwaway phishing links & spam campaigns
SUSPICIOUS_TLDS: Set[str] = {
    "xyz", "top", "click", "live", "icu", "buzz", "shop", "vip",
    "work", "site", "online", "club", "pw", "cc", "fit", "rest",
    "surf", "gq", "ml", "cf", "tk", "ga", "link", "cam", "sbs",
    "monster", "cfd", "beauty", "hair", "skin", "quest", "autos",
    "homes", "boats", "country", "stream", "date", "racing", "party",
    "trade", "science", "download", "accountant", "loan", "faith",
    "cricket", "win"
}

# Commonly observed URL shortener domains
SHORTENER_DOMAINS: Set[str] = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly",
    "rb.gy", "shorturl.at", "ow.ly", "tiny.cc", "qr.ae", "buff.ly",
    "adf.ly", "bit.do"
}

# Free hosting, dynamic DNS, and serverless platforms frequently abused by spammers
FREE_HOSTING_DOMAINS: Set[str] = {
    "web.app", "firebaseapp.com", "pages.dev", "workers.dev",
    "github.io", "vercel.app", "netlify.app", "glitch.me",
    "herokuapp.com", "000webhostapp.com", "weebly.com", "wixsite.com",
    "blogspot.com", "sites.google.com", "forms.gle", "forms.office.com",
    "ngrok.io", "loca.lt", "serveo.net", "duckdns.org"
}

# Phishing and credential harvesting keywords in domain labels and paths
PHISHING_KEYWORDS: Set[str] = {
    "kyc", "update", "verify", "verification", "login", "signin",
    "secure", "security", "refund", "reward", "rewards", "claim", "bonus",
    "otp", "support", "account", "help", "customer", "care",
    "service", "banking", "portal", "alert", "auth", "validation",
    "bill", "payment", "recharge", "blocked", "unblock",
    "invoice", "overdue", "receipt", "ebill", "bijli", "tax-refund",
    "payout", "parcel", "shipment", "courier", "tracking", "customs",
    "clearance", "package", "delivery", "lottery", "kbc", "winner",
    "jackpot", "giftcard", "crypto", "wallet", "suspended", "deactivated",
    "password", "passcode", "credential"
}

# Sensitive actions in URL path on non-official sites
SENSITIVE_PATH_KEYWORDS: Set[str] = {
    "login", "signin", "sign-in", "log-in", "verify", "verification",
    "authenticate", "auth", "account", "update", "banking", "billing",
    "pay", "payment", "invoice", "claim", "reward", "kyc", "webscr",
    "checkout", "download", "wallet", "secure"
}

# Dangerous executable / payload extensions
DANGEROUS_FILE_EXTENSIONS: Set[str] = {
    ".apk", ".exe", ".scr", ".bat", ".vbs", ".iso", ".zip", ".msi", ".cmd"
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
