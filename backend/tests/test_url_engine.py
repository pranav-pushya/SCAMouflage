"""Unit and contract tests for the PhishShield India URL Engine.

Tests MUST NOT make real network calls; all external dependencies (HTTP, RDAP, DNS)
are strictly mocked.
"""

from unittest.mock import MagicMock, patch
import pytest

from engines.url_engine import (
    analyze_url,
    extract_features,
    get_domain_age_days,
    is_ssrf_safe_url,
    normalize_url,
    unwrap_redirects,
)


@pytest.fixture(autouse=True)
def block_external_network():
    """Safety guard ensuring no test accidentally makes real network requests."""
    with patch("requests.get") as mock_get, patch("requests.head") as mock_head, patch("socket.getaddrinfo") as mock_dns:
        # Default mock: DNS returns a benign public IP
        mock_dns.return_value = [(2, 1, 0, "", ("93.184.216.34", 80))]
        # Default mock: 404 for random HTTP requests
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_resp.json.return_value = {}
        mock_get.return_value = mock_resp
        mock_head.return_value = mock_resp
        yield


# ---------------------------------------------------------------------------
# 1. Official domain guard
# ---------------------------------------------------------------------------

def test_official_domain_guard_sbi():
    """Official bank domains must never be flagged as risky and score <= 10."""
    result = analyze_url("https://sbi.co.in")
    assert result["score"] <= 10
    assert result["flags"] == []
    assert result["meta"]["registered_domain"] == "sbi.co.in"


def test_official_domain_guard_subdomain():
    """Subdomains of official bank domains are protected."""
    result = analyze_url("https://retail.onlinesbi.sbi/personal/login")
    assert result["score"] <= 10
    assert result["flags"] == []


# ---------------------------------------------------------------------------
# 2. Brand lookalike detection
# ---------------------------------------------------------------------------

def test_brand_lookalike_token_match():
    """Lookalike domain containing brand keyword triggers BRAND_LOOKALIKE with high score."""
    result = analyze_url("http://sbi-kyc-update.xyz")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "BRAND_LOOKALIKE" in flag_codes
    assert result["score"] >= 35

    # Check user-facing reason format
    lookalike_flag = next(f for f in result["flags"] if f["code"] == "BRAND_LOOKALIKE")
    assert "SBI jaisa dikhta hai" in lookalike_flag["reason"]
    assert len(lookalike_flag["reason"]) <= 80


def test_brand_lookalike_rapidfuzz_near_miss():
    """Near-miss typos detected via RapidFuzz trigger BRAND_LOOKALIKE."""
    result = analyze_url("http://sbii.xyz")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "BRAND_LOOKALIKE" in flag_codes


# ---------------------------------------------------------------------------
# 3. Lexical tricks: IP host, Punycode, @ symbol
# ---------------------------------------------------------------------------

def test_ip_address_host():
    """URL with direct IP address host triggers IP_ADDRESS_HOST flag."""
    result = analyze_url("http://198.51.100.1/login")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "IP_ADDRESS_HOST" in flag_codes
    assert result["score"] >= 25


def test_punycode_host():
    """Domain with punycode xn-- prefix triggers PUNYCODE flag."""
    result = analyze_url("http://xn--sbi-9o0a.com")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "PUNYCODE" in flag_codes


def test_at_symbol_trick():
    """URL using @ userinfo trick triggers AT_SYMBOL flag."""
    result = analyze_url("http://google.com@evil-phish.xyz")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "AT_SYMBOL" in flag_codes


# ---------------------------------------------------------------------------
# 4. Defanged input normalization
# ---------------------------------------------------------------------------

def test_defanged_url_normalization():
    """Defanged conventions (hxxp, [.], (:)) are normalized to clean URLs."""
    assert normalize_url("hxxp://example[.]xyz") == "http://example.xyz"
    assert normalize_url("hxxps://secure-bank(.)com/login") == "https://secure-bank.com/login"
    assert normalize_url("http[:]//test[.]site") == "http://test.site"


# ---------------------------------------------------------------------------
# 5. Scheme-less input
# ---------------------------------------------------------------------------

def test_schemeless_url_handled():
    """URLs provided without scheme default to http://."""
    result = analyze_url("example.xyz/path")
    assert result["meta"]["normalized_url"] == "http://example.xyz/path"
    assert result["meta"]["registered_domain"] == "example.xyz"


# ---------------------------------------------------------------------------
# 6. Shortener redirect unwrapping
# ---------------------------------------------------------------------------

def test_shortener_redirect_to_lookalike():
    """Shortener link resolves to destination and merges lookalike flags."""
    mock_resp = MagicMock()
    mock_resp.status_code = 301
    mock_resp.headers = {"Location": "http://hdfc-bank-verify.xyz"}

    with patch("requests.Session.head", return_value=mock_resp), \
         patch("engines.url_engine.is_ssrf_safe_url", return_value=True):
        result = analyze_url("http://bit.ly/test-fake-shortener")

    flag_codes = [f["code"] for f in result["flags"]]
    assert "SHORTENER_REDIRECT" in flag_codes
    assert "BRAND_LOOKALIKE" in flag_codes
    assert result["meta"]["final_destination"] == "http://hdfc-bank-verify.xyz"


# ---------------------------------------------------------------------------
# 7. SSRF Guard
# ---------------------------------------------------------------------------

def test_ssrf_guard_blocks_private_and_loopback_ips():
    """SSRF guard blocks private, loopback, link-local IPs and non-standard ports."""
    # Loopback
    assert not is_ssrf_safe_url("http://127.0.0.1/admin")
    assert not is_ssrf_safe_url("http://localhost/admin")

    # Private ranges
    assert not is_ssrf_safe_url("http://10.0.0.1/status")
    assert not is_ssrf_safe_url("http://192.168.1.1/")
    assert not is_ssrf_safe_url("http://172.16.0.1/")

    # Link-local AWS metadata IP
    assert not is_ssrf_safe_url("http://169.254.169.254/latest/meta-data")

    # Non-standard ports
    assert not is_ssrf_safe_url("http://example.com:8080/")
    assert not is_ssrf_safe_url("http://example.com:22/")

    # Standard ports
    with patch("socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 0, "", ("93.184.216.34", 80))]
        assert is_ssrf_safe_url("http://example.com:80/")
        assert is_ssrf_safe_url("https://example.com:443/")


# ---------------------------------------------------------------------------
# 8. Network and RDAP failure handling
# ---------------------------------------------------------------------------

def test_network_and_rdap_failure_gracefully_skipped():
    """RDAP or connection errors skip the signal and never raise."""
    with patch("requests.get", side_effect=Exception("Connection refused")):
        result = analyze_url("http://unknown-domain.xyz")

    assert isinstance(result, dict)
    assert result["meta"]["domain_age_days"] is None
    # Still flagged by static rules (e.g. SUSPICIOUS_TLD, NO_HTTPS)
    assert result["score"] >= 0


def test_rdap_recent_domain_flagged():
    """Domain younger than 30 days receives NEW_DOMAIN flag."""
    mock_rdap_resp = MagicMock()
    mock_rdap_resp.status_code = 200
    mock_rdap_resp.json.return_value = {
        "events": [
            {"eventAction": "registration", "eventDate": "2026-10-29T10:00:00Z"}
        ]
    }

    with patch("requests.get", return_value=mock_rdap_resp):
        result = analyze_url("https://recently-created-test.com")

    flag_codes = [f["code"] for f in result["flags"]]
    assert "NEW_DOMAIN" in flag_codes
    assert result["meta"]["domain_age_days"] is not None
    assert result["meta"]["domain_age_days"] < 30


# ---------------------------------------------------------------------------
# 9. Empty and garbage inputs
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("bad_input", ["", "   ", "???", None, 12345])
def test_empty_and_garbage_input_returns_valid_contract(bad_input):
    """Empty or malformed inputs return score 0 and valid contract dict without raising."""
    result = analyze_url(bad_input)
    assert result["score"] == 0
    assert result["flags"] == []
    assert "meta" in result
    assert result["meta"]["final_destination"] is None
    assert result["meta"]["domain_age_days"] is None
    assert result["meta"]["ml_probability"] is None


# ---------------------------------------------------------------------------
# 10. Missing model file fallback
# ---------------------------------------------------------------------------

def test_missing_model_file_fallback():
    """When ML model file is not present, rule engine alone computes score."""
    with patch("engines.url_engine._load_ml_model", return_value=None):
        result = analyze_url("http://sbi-fake-portal.xyz")

    assert result["meta"]["ml_probability"] is None
    assert isinstance(result["score"], int)
    assert result["score"] > 0


# ---------------------------------------------------------------------------
# 11. Score bounds & Reason length constraints
# ---------------------------------------------------------------------------

def test_score_is_always_int_between_0_and_100():
    """Scores must always be strictly clamped integers between 0 and 100."""
    urls = [
        "https://sbi.co.in",
        "http://sbi-kyc-update.xyz",
        "http://198.51.100.1/fake/deep/path",
        "http://google.com@evil-site.xyz:80/sbi-portal",
        "http://xn--sbi-9o0a.xyz",
    ]
    for u in urls:
        res = analyze_url(u)
        assert isinstance(res["score"], int)
        assert 0 <= res["score"] <= 100
        for flag in res["flags"]:
            assert "code" in flag
            assert "reason" in flag
            assert len(flag["reason"]) <= 80


# ---------------------------------------------------------------------------
# 12. Feature extraction purity
# ---------------------------------------------------------------------------

def test_extract_features_pure_and_no_network():
    """extract_features must be a pure function returning all required keys."""
    feats = extract_features("https://sbi-fake-update.xyz/login?user=test")
    expected_keys = [
        "host_length",
        "num_hyphens",
        "num_digits",
        "digit_ratio",
        "entropy",
        "subdomain_count",
        "is_punycode",
        "is_ip",
        "has_at_symbol",
        "is_suspicious_tld",
        "has_brand_keyword",
        "has_https",
    ]
    for k in expected_keys:
        assert k in feats
        assert isinstance(feats[k], (int, float))

    # Path features must not be present
    assert "path_length" not in feats
    assert "query_length" not in feats
