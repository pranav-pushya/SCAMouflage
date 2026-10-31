"""Footprint & Infrastructure Reconnaissance Engine for PhishShield India.

Performs passive intelligence gathering (OSINT) on target domains, URLs, and hosts:
- WHOIS & RDAP domain age profiling
- DNS & IP network footprinting
- Mail server posture & spoofing vulnerability
- Suspicious infrastructure indicators (disposable hosting, punycode, brand lookalikes)

Designed for GRAVITON 2026: Explainable, safe against SSRF, offline-testable.
"""

from __future__ import annotations

import ipaddress
import re
import socket
import urllib.parse
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import idna
import requests
import tldextract
from rapidfuzz import fuzz

from .footprint_config import (
    DISPOSABLE_HOSTING_KEYWORDS,
    FOOTPRINT_WEIGHTS,
    OFFICIAL_INDIAN_DOMAINS,
    REQUEST_TIMEOUT_SECONDS,
    SUSPICIOUS_TLDS,
    get_footprint_verdict,
)
from .url_engine import (
    get_brands,
    get_domain_age_days,
    is_ssrf_safe_url,
)

# Use offline suffix list to avoid network lookups during startup
_EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=())


def _normalize_target(raw: str) -> Tuple[str, str, str, bool]:
    """Normalize input target string into (clean_url, hostname, scheme, is_ip)."""
    text = (raw or "").strip()
    if not text:
        return "", "", "", False

    # Prepend scheme if missing so urllib parses netloc properly
    has_explicit_scheme = bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", text))
    if not has_explicit_scheme:
        # Default to https for analysis
        candidate_url = f"https://{text}"
    else:
        candidate_url = text

    parsed = urllib.parse.urlsplit(candidate_url)
    hostname = (parsed.hostname or "").strip().lower()
    scheme = parsed.scheme.lower() or "https"

    # Handle port if present in netloc
    if not hostname and parsed.netloc:
        hostname = parsed.netloc.split(":")[0].strip().lower()

    # Determine if hostname is an IP address
    is_ip = False
    try:
        ipaddress.ip_address(hostname)
        is_ip = True
    except ValueError:
        is_ip = False

    return candidate_url, hostname, scheme, is_ip


def _resolve_dns_footprint(hostname: str) -> Tuple[List[str], Optional[str], Optional[str]]:
    """Safely resolve IP addresses and reverse PTR host with timeout protection."""
    if not hostname:
        return [], None, None

    ips: List[str] = []
    reverse_host: Optional[str] = None
    provider_guess: Optional[str] = None

    try:
        # Safe DNS resolution via getaddrinfo
        results = socket.getaddrinfo(hostname, None, socket.AF_INET)
        for item in results:
            ip_str = item[4][0]
            if ip_str not in ips:
                ips.append(ip_str)
    except Exception:
        # DNS resolution failure or network isolated (e.g., in unit tests)
        pass

    if ips:
        primary_ip = ips[0]
        try:
            # Reverse PTR query
            rev = socket.gethostbyaddr(primary_ip)
            if rev and rev[0]:
                reverse_host = rev[0].lower()
        except Exception:
            pass

    # Heuristic hosting classification from reverse DNS / hostname
    search_space = f"{hostname} {reverse_host or ''}".lower()
    for provider in DISPOSABLE_HOSTING_KEYWORDS:
        if provider in search_space:
            provider_guess = provider.capitalize()
            break

    if not provider_guess:
        if "cloudflare" in search_space:
            provider_guess = "Cloudflare CDN / Proxy"
        elif "awsglobalaccelerator" in search_space or "amazon" in search_space or "compute.amazonaws" in search_space:
            provider_guess = "Amazon Web Services (AWS)"
        elif "google" in search_space or "1e100.net" in search_space:
            provider_guess = "Google Cloud / Infrastructure"
        elif "azure" in search_space or "microsoft" in search_space:
            provider_guess = "Microsoft Azure"
        elif "digitalocean" in search_space:
            provider_guess = "DigitalOcean"
        elif "namecheap" in search_space:
            provider_guess = "Namecheap Hosting"
        elif ips:
            provider_guess = "Standard Hosting / Dedicated IP"
        else:
            provider_guess = "Unresolved / Offline"

    return ips, reverse_host, provider_guess


def _check_mail_footprint(registered_domain: str) -> Dict[str, Any]:
    """Inspect mail routing configuration to assess email spoofing vulnerability."""
    if not registered_domain:
        return {
            "has_mail_infrastructure": False,
            "posture_assessment": "Domain missing or invalid",
            "spoofing_risk": "high",
        }

    # Attempt to resolve common MX / mail hosts (passive heuristic)
    has_mail = False
    try:
        # Check standard mail exchanger hostname pattern
        mail_host = f"mail.{registered_domain}"
        socket.getaddrinfo(mail_host, None, socket.AF_INET)
        has_mail = True
    except Exception:
        pass

    if has_mail:
        return {
            "has_mail_infrastructure": True,
            "posture_assessment": "Mail exchanger detected. Requires SPF/DKIM validation.",
            "spoofing_risk": "medium",
        }

    return {
        "has_mail_infrastructure": False,
        "posture_assessment": "No active mail exchange host found; likely a dedicated web-only phishing staging point.",
        "spoofing_risk": "low",
    }


def analyze_footprint(raw_input: str) -> Dict[str, Any]:
    """Perform passive infrastructure reconnaissance on a target URL or domain.

    Returns risk score, WHOIS footprint, network details, and explainable flags.
    Engine contract: never raises an uncaught exception.
    """
    clean_url, hostname, scheme, is_ip = _normalize_target(raw_input)

    # Fallback for empty or invalid input
    if not hostname:
        return {
            "target": raw_input or "",
            "verdict": "low",
            "score": 0,
            "domain_info": {
                "hostname": "",
                "registered_domain": "",
                "subdomain": "",
                "tld": "",
                "is_punycode": False,
                "is_official_gov": False,
            },
            "whois": {
                "age_days": None,
                "status": "unknown",
                "created_note": "Aapne koi valid domain ya URL provide nahi kiya.",
            },
            "network": {
                "ip_addresses": [],
                "reverse_host": None,
                "hosting_provider": "Unknown",
                "is_disposable_tier": False,
                "has_https": False,
            },
            "mail_security": {
                "has_mail_infrastructure": False,
                "posture_assessment": "No data",
                "spoofing_risk": "low",
            },
            "flags": [
                {
                    "code": "INVALID_INPUT",
                    "reason": "Please provide a valid domain, host, or URL to inspect.",
                    "severity": "low",
                }
            ],
            "reasons": ["Valid domain ya host enter karein."],
            "recommendations": ["Domain format check karein (jaise: example.com ya https://example.com)."],
        }

    try:
        flags: List[Dict[str, Any]] = []
        score = 0

        # 1. Parse domain using tldextract
        ext = _EXTRACTOR(hostname)
        subdomain = ext.subdomain or ""
        domain = ext.domain or ""
        suffix = ext.suffix or ""
        registered_domain = f"{domain}.{suffix}" if domain and suffix else hostname

        # Punycode check
        is_punycode = "xn--" in hostname
        if is_punycode:
            score += FOOTPRINT_WEIGHTS["PUNYCODE_IDN"]
            flags.append({
                "code": "PUNYCODE_IDN",
                "reason": "Internationalized / Punycode characters detected (used for lookalike visual deception).",
                "severity": "high",
            })

        # Official Government domain check
        is_official_gov = any(registered_domain.endswith(f".{gov_tld}") or registered_domain == gov_tld for gov_tld in OFFICIAL_INDIAN_DOMAINS)

        # 2. IP literal check
        if is_ip:
            score += FOOTPRINT_WEIGHTS["IP_LITERAL_HOST"]
            flags.append({
                "code": "IP_LITERAL_HOST",
                "reason": "Target uses a raw IP address instead of a registered domain name.",
                "severity": "medium",
            })

        # 3. Suspicious TLD check
        tld_part = suffix.lower().split(".")[-1] if suffix else ""
        if tld_part in SUSPICIOUS_TLDS and not is_official_gov:
            score += FOOTPRINT_WEIGHTS["SUSPICIOUS_TLD"]
            flags.append({
                "code": "SUSPICIOUS_TLD",
                "reason": f"High-risk top-level domain '.{tld_part}' frequently exploited in cheap disposable scam campaigns.",
                "severity": "medium",
            })

        # 4. Multiple subdomains check
        sub_parts = [p for p in subdomain.split(".") if p]
        if len(sub_parts) >= 2:
            score += FOOTPRINT_WEIGHTS["MULTIPLE_SUBDOMAINS"]
            flags.append({
                "code": "MULTIPLE_SUBDOMAINS",
                "reason": f"Deep subdomain hierarchy ({len(sub_parts)} levels) often used to disguise real destination.",
                "severity": "low",
            })

        # 5. Brand similarity check (typosquatting)
        brands = get_brands()
        for b in brands:
            brand_id = b.get("id", "").lower()
            official_domains = b.get("domains", [])
            if registered_domain in official_domains:
                continue

            similarity = fuzz.partial_ratio(brand_id, domain.lower())
            if similarity >= 85 and brand_id in domain.lower():
                score += FOOTPRINT_WEIGHTS["BRAND_LOOKALIKE"]
                flags.append({
                    "code": "BRAND_LOOKALIKE",
                    "reason": f"Infrastructure impersonates legitimate brand '{brand_id.upper()}' without official domain authorization.",
                    "severity": "high",
                })
                break

        # 6. WHOIS & Domain Age Reconnaissance
        domain_age_days: Optional[int] = None
        whois_status = "unknown"
        created_note = "RDAP/WHOIS age record unavailable"

        if not is_ip and registered_domain:
            domain_age_days = get_domain_age_days(registered_domain)
            if domain_age_days is not None:
                if domain_age_days < 30:
                    whois_status = "new"
                    score += FOOTPRINT_WEIGHTS["DOMAIN_NEW_UNDER_30D"]
                    created_note = f"Domain was registered only {domain_age_days} day(s) ago (high scam correlation)."
                    flags.append({
                        "code": "DOMAIN_NEW_UNDER_30D",
                        "reason": f"Freshly registered domain ({domain_age_days} days old). Throwaway infrastructure is typical of active phishing waves.",
                        "severity": "high",
                    })
                elif domain_age_days < 90:
                    whois_status = "recent"
                    score += FOOTPRINT_WEIGHTS["DOMAIN_NEW_UNDER_90D"]
                    created_note = f"Domain registered recently ({domain_age_days} days ago)."
                    flags.append({
                        "code": "DOMAIN_NEW_UNDER_90D",
                        "reason": f"Recent domain age ({domain_age_days} days). Elevated risk.",
                        "severity": "medium",
                    })
                else:
                    whois_status = "mature"
                    created_note = f"Domain is mature ({domain_age_days} days old, registered > {domain_age_days // 365} year(s) ago)."

        # 7. Network & DNS Footprint
        ips, reverse_host, hosting_provider = _resolve_dns_footprint(hostname)
        is_disposable_tier = any(disp in (hosting_provider or "").lower() for disp in DISPOSABLE_HOSTING_KEYWORDS)
        if is_disposable_tier and not is_official_gov:
            score += FOOTPRINT_WEIGHTS["FREE_OR_DISPOSABLE_HOSTING"]
            flags.append({
                "code": "FREE_OR_DISPOSABLE_HOSTING",
                "reason": f"Hosted on a free/disposable platform ({hosting_provider}), commonly abused to host phishing without KYC.",
                "severity": "medium",
            })

        has_https = scheme == "https"
        if not has_https and not is_official_gov:
            score += FOOTPRINT_WEIGHTS["NO_HTTPS_CONFIGURED"]
            flags.append({
                "code": "NO_HTTPS_CONFIGURED",
                "reason": "Missing SSL/TLS encryption (HTTP plain-text), exposing user data.",
                "severity": "low",
            })

        # 8. Mail Security Footprint
        mail_info = _check_mail_footprint(registered_domain)

        # Cap score between 0 and 100
        final_score = max(0, min(100, score))
        if is_official_gov:
            final_score = 0  # Official government domains bypass heuristic false positives

        verdict = get_footprint_verdict(final_score)

        # Explainable human reasons
        reasons: List[str] = [f["reason"] for f in flags]
        if not reasons:
            reasons = ["No overt suspicious infrastructure footprints detected on this domain."]

        # Actionable recommendations
        recommendations: List[str] = []
        if verdict == "high":
            recommendations.append("Do not enter banking credentials, OTPs, or personal identity details on this domain.")
            recommendations.append("Report this infrastructure to 1930 Cyber Fraud Helpline and cybercrime.gov.in.")
        elif verdict == "medium":
            recommendations.append("Exercise caution. Verify the domain through official bank/company channels before proceeding.")
        else:
            recommendations.append("Infrastructure appears standard, but always verify sender identity before sharing sensitive information.")

        return {
            "target": clean_url,
            "verdict": verdict,
            "score": final_score,
            "domain_info": {
                "hostname": hostname,
                "registered_domain": registered_domain,
                "subdomain": subdomain,
                "tld": suffix,
                "is_punycode": is_punycode,
                "is_official_gov": is_official_gov,
            },
            "whois": {
                "age_days": domain_age_days,
                "status": whois_status,
                "created_note": created_note,
            },
            "network": {
                "ip_addresses": ips,
                "reverse_host": reverse_host,
                "hosting_provider": hosting_provider or "Unknown",
                "is_disposable_tier": is_disposable_tier,
                "has_https": has_https,
            },
            "mail_security": mail_info,
            "flags": flags,
            "reasons": reasons,
            "recommendations": recommendations,
        }

    except Exception:
        # Engine contract: never raise
        return {
            "target": raw_input,
            "verdict": "low",
            "score": 0,
            "domain_info": {
                "hostname": hostname,
                "registered_domain": hostname,
                "subdomain": "",
                "tld": "",
                "is_punycode": False,
                "is_official_gov": False,
            },
            "whois": {
                "age_days": None,
                "status": "unknown",
                "created_note": "Reconnaissance scan could not complete.",
            },
            "network": {
                "ip_addresses": [],
                "reverse_host": None,
                "hosting_provider": "Unknown",
                "is_disposable_tier": False,
                "has_https": False,
            },
            "mail_security": {
                "has_mail_infrastructure": False,
                "posture_assessment": "Scan error",
                "spoofing_risk": "low",
            },
            "flags": [],
            "reasons": ["Reconnaissance scan encountered an unexpected parsing state."],
            "recommendations": ["Verify the URL and try again."],
        }
