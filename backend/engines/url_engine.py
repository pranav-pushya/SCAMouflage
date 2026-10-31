"""URL detection engine for PhishShield India.

Analyzes URLs for lexical phishing indicators, brand spoofing, shortened redirects,
and domain age (RDAP) with machine learning ensemble support.
"""

import ipaddress
import json
import math
import os
import re
import socket
import urllib.parse
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import idna
import joblib
import requests
import tldextract
from rapidfuzz import fuzz

from .url_config import (
    BRAND_SIMILARITY_THRESHOLD,
    MAX_REDIRECT_HOPS,
    OFFICIAL_DOMAIN_MAX_SCORE,
    REQUEST_TIMEOUT_SECONDS,
    RULE_WEIGHTS,
    SHORTENER_DOMAINS,
    SUSPICIOUS_TLDS,
    W_ML,
    W_RULE,
)

# Use offline snapshot for tldextract to prevent runtime downloads or network dependency
_EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=())

# In-memory caches to make repeated queries instant during live demos
_BRANDS_CACHE: Optional[List[Dict[str, Any]]] = None
_RDAP_CACHE: Dict[str, Optional[int]] = {}
_REDIRECT_CACHE: Dict[str, Tuple[Optional[str], int]] = {}
_MODEL_CACHE: Optional[Dict[str, Any]] = None
_MODEL_CHECKED: bool = False


def get_brands() -> List[Dict[str, Any]]:
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


def _is_ip_host(host: str) -> bool:
    """Check whether a host string is a valid IPv4 or IPv6 address."""
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False


def normalize_url(url: str) -> str:
    """Normalize and defang input URLs (hxxp, [.], scheme-less, IDN punycode)."""
    if not isinstance(url, str):
        return ""

    raw = url.strip()
    if not raw:
        return ""

    # Reverse defanging conventions
    raw = re.sub(r"^hxxps?://", lambda m: "https://" if "s" in m.group(0).lower() else "http://", raw, flags=re.IGNORECASE)
    raw = raw.replace("[.]", ".").replace("(.)", ".")
    raw = re.sub(r"https?\[:\]//", lambda m: "https://" if "s" in m.group(0).lower() else "http://", raw, flags=re.IGNORECASE)

    # Prepend http:// if scheme is missing
    if raw.startswith("//"):
        raw = "http:" + raw
    elif not re.match(r"^[a-zA-Z][a-zA-Z0-9+\-.]*://", raw):
        raw = "http://" + raw

    try:
        parsed = urllib.parse.urlsplit(raw)
        scheme = parsed.scheme.lower() or "http"
        hostname = (parsed.hostname or "").lower()

        # Handle Internationalized Domain Names (IDN) to Punycode
        if hostname:
            try:
                hostname = idna.encode(hostname).decode("ascii")
            except Exception:
                pass

        # Reconstruct authority portion
        userinfo = ""
        if parsed.username or parsed.password:
            user = parsed.username or ""
            pwd = f":{parsed.password}" if parsed.password else ""
            userinfo = f"{user}{pwd}@"

        port_str = f":{parsed.port}" if parsed.port and parsed.port not in (80, 443) else ""
        netloc = f"{userinfo}{hostname}{port_str}"

        return urllib.parse.urlunsplit((
            scheme,
            netloc,
            parsed.path,
            parsed.query,
            parsed.fragment
        ))
    except Exception:
        return raw


def is_ssrf_safe_url(url: str) -> bool:
    """Ensure destination does not resolve to private, loopback, or non-standard ports."""
    try:
        parsed = urllib.parse.urlsplit(url)
        scheme = parsed.scheme.lower()
        if scheme not in ("http", "https"):
            return False

        port = parsed.port
        if port is not None and port not in (80, 443):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Check direct localhost or loopback names
        h_lower = hostname.lower()
        if h_lower == "localhost" or h_lower.endswith(".localhost"):
            return False

        # Check direct IP addresses
        if _is_ip_host(hostname):
            ip_obj = ipaddress.ip_address(hostname)
            if (
                ip_obj.is_private
                or ip_obj.is_loopback
                or ip_obj.is_link_local
                or ip_obj.is_multicast
                or ip_obj.is_reserved
                or ip_obj.is_unspecified
            ):
                return False

        # Resolve host to verify all bound IPs
        addr_info = socket.getaddrinfo(hostname, None)
        if not addr_info:
            return False

        for item in addr_info:
            ip_str = item[4][0]
            ip = ipaddress.ip_address(ip_str)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            ):
                return False

        return True
    except Exception:
        return False


def unwrap_redirects(url: str) -> Tuple[Optional[str], int]:
    """Follow redirect hops with SSRF checks; never downloads page body."""
    if url in _REDIRECT_CACHE:
        return _REDIRECT_CACHE[url]

    current_url = url
    hops = 0

    session = requests.Session()
    session.cookies.clear()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PhishShield/1.0"}

    try:
        while hops < MAX_REDIRECT_HOPS:
            if not is_ssrf_safe_url(current_url):
                break

            resp = None
            try:
                resp = session.head(
                    current_url,
                    headers=headers,
                    timeout=REQUEST_TIMEOUT_SECONDS,
                    allow_redirects=False,
                )
                if resp.status_code == 405:
                    resp = session.get(
                        current_url,
                        headers=headers,
                        timeout=REQUEST_TIMEOUT_SECONDS,
                        allow_redirects=False,
                        stream=True,
                    )
            except Exception:
                try:
                    resp = session.get(
                        current_url,
                        headers=headers,
                        timeout=REQUEST_TIMEOUT_SECONDS,
                        allow_redirects=False,
                        stream=True,
                    )
                except Exception:
                    break

            if resp is None:
                break

            try:
                if resp.status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("Location")
                    if not location:
                        break
                    next_url = urllib.parse.urljoin(current_url, location)
                    hops += 1
                    current_url = next_url
                else:
                    break
            finally:
                resp.close()
    except Exception:
        pass

    final_dest = current_url if hops > 0 and current_url != url else None
    _REDIRECT_CACHE[url] = (final_dest, hops)
    return final_dest, hops


def get_domain_age_days(registered_domain: str) -> Optional[int]:
    """Query RDAP for domain registration date and calculate age in days."""
    if not registered_domain or _is_ip_host(registered_domain):
        return None

    if registered_domain in _RDAP_CACHE:
        return _RDAP_CACHE[registered_domain]

    rdap_url = f"https://rdap.org/domain/{registered_domain}"
    try:
        resp = requests.get(
            rdap_url,
            timeout=REQUEST_TIMEOUT_SECONDS,
            headers={"User-Agent": "PhishShield-RDAP-Client/1.0"},
        )
        if resp.status_code == 200:
            data = resp.json()
            events = data.get("events", [])
            for event in events:
                if event.get("eventAction") == "registration":
                    event_date_str = event.get("eventDate")
                    if event_date_str:
                        cleaned_date = event_date_str.replace("Z", "+00:00")
                        reg_date = datetime.fromisoformat(cleaned_date)
                        now = datetime.now(timezone.utc)
                        age_days = max(0, (now - reg_date).days)
                        _RDAP_CACHE[registered_domain] = age_days
                        return age_days
    except Exception:
        pass

    _RDAP_CACHE[registered_domain] = None
    return None


def extract_features(url: str) -> Dict[str, Any]:
    """Extract pure lexical domain features without any network calls.

    IMPORTANT dataset artifact note:
    Legitimate benchmark datasets (e.g. Tranco) contain bare domain names,
    whereas active phishing feeds capture full deep paths. Models trained
    with path features invariably learn the biased rule 'has a path = phishing'.
    Therefore, all features here are derived strictly from hostname and scheme.
    """
    try:
        norm = normalize_url(url)
        parsed = urllib.parse.urlsplit(norm)
        host = (parsed.hostname or "").lower()
        ext = _EXTRACTOR(norm)
        registered_domain = _get_registered_domain(ext)
        suffix = ext.suffix.lower()

        is_ip = 1 if _is_ip_host(host) else 0

        # Check brand keyword presence for ML feature
        brands = get_brands()
        has_brand_keyword = 0
        host_tokens = [t for t in re.split(r"[.\-_0-9]", host) if t]
        domain_part = (ext.domain or "").lower()

        for b in brands:
            official_list = b.get("official_domains", [])
            is_off = (
                registered_domain in official_list
                or any(host == off or host.endswith("." + off) for off in official_list)
            )
            if not is_off:
                for kw in b.get("keywords", []):
                    kw_clean = kw.lower()
                    if kw_clean in host_tokens or kw_clean in domain_part:
                        has_brand_keyword = 1
                        break
            if has_brand_keyword:
                break

        # Calculate Shannon entropy of host string
        entropy = 0.0
        if host:
            counts = Counter(host)
            h_len = len(host)
            entropy = -sum((c / h_len) * math.log2(c / h_len) for c in counts.values())

        digits = sum(c.isdigit() for c in host)
        h_len = max(1, len(host))

        # Check suspicious TLD
        suffix_parts = suffix.split(".")
        is_susp_tld = 1 if (any(p in SUSPICIOUS_TLDS for p in suffix_parts) or suffix in SUSPICIOUS_TLDS) else 0

        return {
            "host_length": len(host),
            "num_hyphens": host.count("-"),
            "num_digits": digits,
            "digit_ratio": round(digits / h_len, 4),
            "entropy": round(entropy, 4),
            "subdomain_count": len([l for l in host.split(".") if l]),
            "is_punycode": 1 if "xn--" in host else 0,
            "is_ip": is_ip,
            "has_at_symbol": 1 if "@" in (parsed.netloc or "") else 0,
            "is_suspicious_tld": is_susp_tld,
            "has_brand_keyword": has_brand_keyword,
            "has_https": 1 if parsed.scheme.lower() == "https" else 0,
        }
    except Exception:
        return {
            "host_length": 0,
            "num_hyphens": 0,
            "num_digits": 0,
            "digit_ratio": 0.0,
            "entropy": 0.0,
            "subdomain_count": 0,
            "is_punycode": 0,
            "is_ip": 0,
            "has_at_symbol": 0,
            "is_suspicious_tld": 0,
            "has_brand_keyword": 0,
            "has_https": 0,
        }


def _evaluate_rules_and_brands(normalized_url: str) -> Tuple[int, List[Dict[str, str]], bool, str]:
    """Evaluate lexical heuristics, brand spoofing, and official domain protection."""
    flags: List[Dict[str, str]] = []
    score = 0

    parsed = urllib.parse.urlsplit(normalized_url)
    host = (parsed.hostname or "").lower()
    ext = _EXTRACTOR(normalized_url)
    registered_domain = _get_registered_domain(ext)
    if not registered_domain and _is_ip_host(host):
        registered_domain = host

    # 1. Official domain check
    brands = get_brands()
    is_official = False
    for b in brands:
        official_list = b.get("official_domains", [])
        if (
            registered_domain in official_list
            or any(host == off or host.endswith("." + off) for off in official_list)
        ):
            is_official = True
            break

    if is_official:
        # Protected bank/official brand site: cap score low, add no risky flags
        return min(score, OFFICIAL_DOMAIN_MAX_SCORE), [], True, registered_domain

    # 2. IP address host
    if _is_ip_host(host):
        flags.append({
            "code": "IP_ADDRESS_HOST",
            "reason": "Website domain ke bajaye IP address use kar rahi hai",
        })
        score += RULE_WEIGHTS["IP_ADDRESS_HOST"]

    # 3. Punycode check
    if "xn--" in host:
        flags.append({
            "code": "PUNYCODE",
            "reason": "Domain me chhipa hua Punycode character hai",
        })
        score += RULE_WEIGHTS["PUNYCODE"]

    # 4. @ symbol trick
    if "@" in (parsed.netloc or ""):
        flags.append({
            "code": "AT_SYMBOL",
            "reason": "URL me '@' symbol ka use kiya gaya hai",
        })
        score += RULE_WEIGHTS["AT_SYMBOL"]

    # 5. Many subdomains (4 or more dot-separated labels)
    labels = [l for l in host.split(".") if l]
    if len(labels) >= 4:
        flags.append({
            "code": "MANY_SUBDOMAINS",
            "reason": "Host me zaroorat se zyada subdomains hain",
        })
        score += RULE_WEIGHTS["MANY_SUBDOMAINS"]

    # 6. Many hyphens in host (3 or more)
    if host.count("-") >= 3:
        flags.append({
            "code": "MANY_HYPHENS",
            "reason": "Domain name me bahut zyada hyphens (-) hain",
        })
        score += RULE_WEIGHTS["MANY_HYPHENS"]

    # 7. Long URL (over 75 chars)
    if len(normalized_url) > 75:
        flags.append({
            "code": "LONG_URL",
            "reason": "URL aam se zyada lamba hai",
        })
        score += RULE_WEIGHTS["LONG_URL"]

    # 8. Suspicious TLD
    suffix = ext.suffix.lower()
    suffix_parts = suffix.split(".")
    if any(p in SUSPICIOUS_TLDS for p in suffix_parts) or suffix in SUSPICIOUS_TLDS:
        flags.append({
            "code": "SUSPICIOUS_TLD",
            "reason": "Ye TLD aksar fraud aur spam ke liye use hota hai",
        })
        score += RULE_WEIGHTS["SUSPICIOUS_TLD"]

    # 9. No HTTPS
    if parsed.scheme.lower() != "https":
        flags.append({
            "code": "NO_HTTPS",
            "reason": "Website secure HTTPS connection use nahi kar rahi",
        })
        score += RULE_WEIGHTS["NO_HTTPS"]

    # 10. Brand lookalike and typo detection
    host_tokens = [t for t in re.split(r"[.\-_0-9]", host) if t]
    domain_part = (ext.domain or "").lower()

    for b in brands:
        brand_name = b.get("name", "Bank")
        official_list = b.get("official_domains", [])
        is_off_for_brand = (
            registered_domain in official_list
            or any(host == off or host.endswith("." + off) for off in official_list)
        )
        if is_off_for_brand:
            continue

        matched_brand = False
        for kw in b.get("keywords", []):
            kw_clean = kw.lower()
            # Token match in host or substring inside the domain label
            if kw_clean in host_tokens or kw_clean in domain_part:
                matched_brand = True
                break
            # RapidFuzz typo near-miss check
            if domain_part and len(domain_part) >= 3:
                sim = fuzz.ratio(domain_part, kw_clean)
                if sim >= BRAND_SIMILARITY_THRESHOLD:
                    matched_brand = True
                    break

        if matched_brand:
            flags.append({
                "code": "BRAND_LOOKALIKE",
                "reason": f"{brand_name} jaisa dikhta hai, par ye {brand_name} ka asli domain nahi hai",
            })
            score += RULE_WEIGHTS["BRAND_LOOKALIKE"]
            break

    return score, flags, False, registered_domain


def _load_ml_model() -> Optional[Dict[str, Any]]:
    """Attempt to load trained ML model if present in backend/models."""
    global _MODEL_CACHE, _MODEL_CHECKED
    if _MODEL_CHECKED:
        return _MODEL_CACHE

    _MODEL_CHECKED = True
    model_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "models", "url_model.joblib"
    )
    if os.path.isfile(model_path):
        try:
            _MODEL_CACHE = joblib.load(model_path)
        except Exception:
            _MODEL_CACHE = None
    return _MODEL_CACHE


def analyze_url(url: str) -> Dict[str, Any]:
    """Analyze a suspicious URL for phishing signals.

    Public entry point following the PhishShield contract.
    Guaranteed to NEVER raise an unhandled exception.
    """
    try:
        normalized_url = normalize_url(url)
        if not normalized_url or not isinstance(url, str) or not url.strip():
            return {
                "score": 0,
                "flags": [],
                "meta": {
                    "normalized_url": normalized_url,
                    "registered_domain": "",
                    "final_destination": None,
                    "domain_age_days": None,
                    "ml_probability": None,
                },
            }

        parsed = urllib.parse.urlsplit(normalized_url)
        host = (parsed.hostname or "").lower()
        ext = _EXTRACTOR(normalized_url)
        initial_reg_domain = _get_registered_domain(ext)

        # Reject garbage inputs lacking any valid host or registered domain
        if not host or (not initial_reg_domain and not _is_ip_host(host)):
            return {
                "score": 0,
                "flags": [],
                "meta": {
                    "normalized_url": normalized_url,
                    "registered_domain": initial_reg_domain,
                    "final_destination": None,
                    "domain_age_days": None,
                    "ml_probability": None,
                },
            }

        rule_score, flags, is_official, registered_domain = _evaluate_rules_and_brands(normalized_url)

        final_destination: Optional[str] = None
        domain_age_days: Optional[int] = None
        ml_probability: Optional[float] = None

        parsed = urllib.parse.urlsplit(normalized_url)
        host = (parsed.hostname or "").lower()

        # Handle URL shorteners & redirects
        is_shortener = (host in SHORTENER_DOMAINS) or (registered_domain in SHORTENER_DOMAINS)
        if is_shortener:
            flags.append({
                "code": "SHORTENER_REDIRECT",
                "reason": "Shortened link hai jo asli destination chhupata hai",
            })
            rule_score += RULE_WEIGHTS["SHORTENER_REDIRECT"]

            dest, hops = unwrap_redirects(normalized_url)
            if hops >= 3:
                flags.append({
                    "code": "REDIRECT_CHAIN_LONG",
                    "reason": "Redirect chain lambi hai (3 ya zyada hops)",
                })
                rule_score += RULE_WEIGHTS["REDIRECT_CHAIN_LONG"]

            if dest and dest != normalized_url:
                final_destination = dest
                # Check if final destination has a different registered domain
                dest_ext = _EXTRACTOR(dest)
                dest_reg = _get_registered_domain(dest_ext)
                if dest_reg and dest_reg != registered_domain:
                    dest_score, dest_flags, dest_is_off, _ = _evaluate_rules_and_brands(dest)
                    if dest_is_off:
                        is_official = True
                        rule_score = min(rule_score, OFFICIAL_DOMAIN_MAX_SCORE)
                        flags = []
                    else:
                        existing_codes = {f["code"] for f in flags}
                        for f in dest_flags:
                            if f["code"] not in existing_codes:
                                flags.append(f)
                                rule_score += RULE_WEIGHTS.get(f["code"], 0)

        # Domain age query via RDAP (only for non-official, non-IP domains)
        if not is_official and registered_domain and not _is_ip_host(host):
            domain_age_days = get_domain_age_days(registered_domain)
            if domain_age_days is not None:
                if domain_age_days < 30:
                    flags.append({
                        "code": "NEW_DOMAIN",
                        "reason": f"Domain sirf {domain_age_days} din purana hai",
                    })
                    rule_score += RULE_WEIGHTS["NEW_DOMAIN_UNDER_30D"]
                elif domain_age_days < 90:
                    flags.append({
                        "code": "NEW_DOMAIN",
                        "reason": f"Domain naya hai (sirf {domain_age_days} din purana)",
                    })
                    rule_score += RULE_WEIGHTS["NEW_DOMAIN_UNDER_90D"]

        # Machine learning scoring (Stage 5 integration)
        model_data = _load_ml_model()
        final_score = rule_score
        if model_data and not is_official:
            try:
                features = extract_features(normalized_url)
                feature_names = model_data.get("feature_names", [])
                vec = [[features.get(name, 0) for name in feature_names]]
                prob = float(model_data["model"].predict_proba(vec)[0][1])
                ml_probability = round(prob, 4)
                ml_score = int(round(prob * 100))

                final_score = int(round(W_RULE * rule_score + W_ML * ml_score))
                if prob >= 0.8:
                    flags.append({
                        "code": "ML_HIGH_RISK",
                        "reason": "Machine learning model ne is domain ko high risk flag kiya",
                    })
                    final_score += RULE_WEIGHTS.get("ML_HIGH_RISK", 25)
            except Exception:
                ml_probability = None
                final_score = rule_score

        # Apply official domain safeguard or 0-100 score bounds
        if is_official:
            final_score = min(final_score, OFFICIAL_DOMAIN_MAX_SCORE)
            flags = []
        else:
            final_score = max(0, min(100, int(final_score)))

        return {
            "score": final_score,
            "flags": flags,
            "meta": {
                "normalized_url": normalized_url,
                "registered_domain": registered_domain,
                "final_destination": final_destination,
                "domain_age_days": domain_age_days,
                "ml_probability": ml_probability,
            },
        }

    except Exception:
        # Engine contract: must never raise; on unexpected failure return safe defaults
        return {
            "score": 0,
            "flags": [],
            "meta": {
                "normalized_url": url if isinstance(url, str) else "",
                "registered_domain": "",
                "final_destination": None,
                "domain_age_days": None,
                "ml_probability": None,
            },
        }
