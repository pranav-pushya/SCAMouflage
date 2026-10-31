"""Unit and contract tests for the PhishShield India URL Engine.

Tests MUST NOT make real network calls; all external dependencies (HTTP, RDAP, DNS)
are strictly mocked.
"""

from unittest.mock import MagicMock, patch
import pytest

from engines.url_config import RULE_WEIGHTS
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


def test_sbi_spoofed_domains_not_treated_as_official():
    """sbi.co.in.evil.xyz and spoofed domains must NEVER be protected by official domain guard."""
    # Subdomain spoof on third-party registered domain
    res_sub = analyze_url("http://sbi.co.in.evil.xyz")
    assert res_sub["score"] > 10
    assert any(f["code"] == "BRAND_LOOKALIKE" for f in res_sub["flags"])
    assert res_sub["meta"]["registered_domain"] == "evil.xyz"

    # Tokenized spoof on legitimate TLD (respects < 4 char token boundary rule)
    res_pre = analyze_url("http://sbi-login.co.in")
    assert res_pre["score"] > 10
    assert any(f["code"] == "BRAND_LOOKALIKE" for f in res_pre["flags"])
    assert res_pre["meta"]["registered_domain"] == "sbi-login.co.in"

    # Non-tokenized domain is not protected by official guard
    res_unauth = analyze_url("http://evilsbi.co.in")
    assert res_unauth["meta"]["registered_domain"] == "evilsbi.co.in"
    assert res_unauth["meta"]["registered_domain"] not in ["sbi.co.in", "onlinesbi.sbi"]


# ---------------------------------------------------------------------------
# 2. Brand lookalike detection & scoring
# ---------------------------------------------------------------------------

def test_brand_lookalike_token_match():
    """Lookalike domain containing brand keyword triggers BRAND_LOOKALIKE with high score."""
    result = analyze_url("http://sbi-kyc-update.xyz")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "BRAND_LOOKALIKE" in flag_codes
    assert result["score"] >= 70

    # Check user-facing reason format
    lookalike_flag = next(f for f in result["flags"] if f["code"] == "BRAND_LOOKALIKE")
    assert "SBI jaisa dikhta hai" in lookalike_flag["reason"]
    assert len(lookalike_flag["reason"]) <= 80


def test_brand_lookalike_weight_by_itself_and_total():
    """BRAND_LOOKALIKE weight must be >= 40 by itself and sbi-kyc-update.xyz >= 70 total."""
    assert RULE_WEIGHTS["BRAND_LOOKALIKE"] >= 40

    result = analyze_url("http://sbi-kyc-update.xyz")
    assert result["score"] >= 70

    # Ensure official domain guard is still unaffected
    official_res = analyze_url("https://sbi.co.in")
    assert official_res["score"] <= 10
    assert official_res["flags"] == []


def test_brand_lookalike_rapidfuzz_near_miss():
    """Near-miss typos detected via RapidFuzz trigger BRAND_LOOKALIKE."""
    result = analyze_url("http://sbii.xyz")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "BRAND_LOOKALIKE" in flag_codes


def test_onlinesbi_kyc_flagged_as_brand_lookalike():
    """onlinesbi-kyc.xyz is flagged as BRAND_LOOKALIKE when brand list contains onlinesbi.sbi."""
    result = analyze_url("http://onlinesbi-kyc.xyz")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "BRAND_LOOKALIKE" in flag_codes
    assert result["score"] >= 70
    reason = next(f["reason"] for f in result["flags"] if f["code"] == "BRAND_LOOKALIKE")
    assert "SBI" in reason


# ---------------------------------------------------------------------------
# 3. Lexical tricks: IP host, Punycode, @ symbol
# ---------------------------------------------------------------------------

def test_ip_address_host():
    """URL with direct IP address host triggers IP_ADDRESS_HOST flag."""
    result = analyze_url("http://198.51.100.1/login")
    flag_codes = [f["code"] for f in result["flags"]]
    assert "IP_ADDRESS_HOST" in flag_codes
    assert result["score"] >= 25
    # MANY_SUBDOMAINS must not count IP octets
    assert "MANY_SUBDOMAINS" not in flag_codes


def test_ip_literal_encodings_detected_as_ip_host():
    """Decimal, hex, octal, and dotted-quad IP hosts are flagged as IP_ADDRESS_HOST without MANY_SUBDOMAINS."""
    cases = [
        "http://2130706433",       # Decimal integer encoding of 127.0.0.1
        "http://0x7f000001",       # Hex encoding of 127.0.0.1
        "http://017700000001",     # Octal encoding of 127.0.0.1
        "http://0177.0.0.1",       # Dotted octal encoding
        "http://198.51.100.1",     # Standard dotted-quad
    ]
    for url in cases:
        res = analyze_url(url)
        codes = [f["code"] for f in res["flags"]]
        assert "IP_ADDRESS_HOST" in codes, f"Failed for {url}"
        assert "MANY_SUBDOMAINS" not in codes, f"MANY_SUBDOMAINS wrongly fired for IP host {url}"


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
# 6. Shortener redirect unwrapping & SSRF checks
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


def test_every_redirect_hop_is_ssrf_checked():
    """Every hop in a redirect chain is validated; unsafe destination halts chain before request."""
    # Hop 1 redirects to safe hop, Hop 2 attempts redirect to 127.0.0.1
    hop1_resp = MagicMock()
    hop1_resp.status_code = 301
    hop1_resp.headers = {"Location": "http://intermediate-hop.com/link"}

    hop2_resp = MagicMock()
    hop2_resp.status_code = 301
    hop2_resp.headers = {"Location": "http://127.0.0.1/admin"}

    with patch("requests.Session.head") as mock_session_head, \
         patch("requests.Session.get") as mock_session_get:
        mock_session_head.side_effect = [hop1_resp, hop2_resp]

        dest, hops = unwrap_redirects("http://bit.ly/test-ssrf-chain-hop")

        # Must stop when encountering 127.0.0.1 and never request it
        assert dest != "http://127.0.0.1/admin"
        assert hops == 1


# ---------------------------------------------------------------------------
# 7. SSRF Guard & Zero network calls
# ---------------------------------------------------------------------------

def test_ssrf_guard_blocks_private_and_loopback_ips():
    """SSRF guard blocks private, loopback, link-local IPs and non-standard ports."""
    # Loopback
    assert not is_ssrf_safe_url("http://127.0.0.1/admin")
    assert not is_ssrf_safe_url("http://localhost/admin")
    assert not is_ssrf_safe_url("http://2130706433/admin")
    assert not is_ssrf_safe_url("http://0x7f000001/admin")

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


def test_zero_network_calls_for_private_and_encoded_ips():
    """127.0.0.1, localhost, 2130706433, 0x7f000001, 169.254.169.254 and private DNS trigger zero network requests."""
    targets = [
        "127.0.0.1",
        "localhost",
        "http://2130706433",
        "http://0x7f000001",
        "http://169.254.169.254",
    ]

    with patch("requests.get") as mock_get, \
         patch("requests.head") as mock_head, \
         patch("requests.Session.get") as mock_sget, \
         patch("requests.Session.head") as mock_shead:

        for target in targets:
            analyze_url(target)
            unwrap_redirects(target)

        # Mock a hostname that resolves to a private IP
        with patch("socket.getaddrinfo") as mock_dns:
            mock_dns.return_value = [(2, 1, 0, "", ("10.0.0.1", 80))]
            analyze_url("http://private-internal-site.test")
            unwrap_redirects("http://private-internal-site.test")

        mock_get.assert_not_called()
        mock_head.assert_not_called()
        mock_sget.assert_not_called()
        mock_shead.assert_not_called()


# ---------------------------------------------------------------------------
# 8. Network and RDAP failure handling
# ---------------------------------------------------------------------------

def test_network_and_rdap_failure_gracefully_skipped():
    """RDAP or connection errors skip the signal and never raise."""
    with patch("requests.get", side_effect=Exception("Connection refused")):
        result = analyze_url("http://unknown-domain.xyz")

    assert isinstance(result, dict)
    assert result["meta"]["domain_age_days"] is None
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
# 9. Empty and unparseable inputs
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("bad_input", ["", "   ", "???", "asdf", None, 12345])
def test_empty_and_garbage_input_returns_valid_contract(bad_input):
    """Empty or unparseable inputs return score: null, INVALID_INPUT flag, and valid contract dict."""
    result = analyze_url(bad_input)
    assert result["score"] is None
    assert result["flags"] == [
        {
            "code": "INVALID_INPUT",
            "reason": "URL samajh nahi aaya",
        }
    ]
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
    """Scores must always be strictly clamped integers between 0 and 100 for valid URLs."""
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


# ---------------------------------------------------------------------------
# 13. Two-tier brand detection and latency budget
# ---------------------------------------------------------------------------

def test_two_tier_brand_lookalike_and_brand_in_domain():
    """Verify tier 1 (BRAND_LOOKALIKE) vs tier 2 (BRAND_IN_DOMAIN) and short token rule."""
    # 1. Tier 1: brand token + phishing keyword -> BRAND_LOOKALIKE, score >= 70
    res_sbi_kyc = analyze_url("http://sbi-kyc-update.xyz")
    codes_sbi_kyc = [f["code"] for f in res_sbi_kyc["flags"]]
    assert "BRAND_LOOKALIKE" in codes_sbi_kyc
    assert res_sbi_kyc["score"] >= 70

    res_onlinesbi_kyc = analyze_url("http://onlinesbi-kyc.xyz")
    codes_onlinesbi_kyc = [f["code"] for f in res_onlinesbi_kyc["flags"]]
    assert "BRAND_LOOKALIKE" in codes_onlinesbi_kyc
    assert res_onlinesbi_kyc["score"] >= 70

    # 2. Tier 1: brand in subdomain labels while registered domain is different -> strongly flagged
    res_sub = analyze_url("http://sbi.co.in.evil.xyz")
    codes_sub = [f["code"] for f in res_sub["flags"]]
    assert "BRAND_LOOKALIKE" in codes_sub
    assert res_sub["score"] >= 70
    assert res_sub["meta"]["registered_domain"] == "evil.xyz"

    # 3. Tier 2: brand >= 4 chars as substring in larger word without phishing triggers -> at most BRAND_IN_DOMAIN, score <= 25
    res_hdfc = analyze_url("http://hdfclife.com")
    codes_hdfc = [f["code"] for f in res_hdfc["flags"]]
    assert "BRAND_LOOKALIKE" not in codes_hdfc
    assert "BRAND_IN_DOMAIN" in codes_hdfc
    assert res_hdfc["score"] <= 25
    hdfc_flag = next(f for f in res_hdfc["flags"] if f["code"] == "BRAND_IN_DOMAIN")
    assert "Domain name me HDFC Bank shamil hai" in hdfc_flag["reason"]
    assert len(hdfc_flag["reason"]) <= 80

    res_paytm = analyze_url("http://paytmmall.com")
    codes_paytm = [f["code"] for f in res_paytm["flags"]]
    assert "BRAND_LOOKALIKE" not in codes_paytm
    assert "BRAND_IN_DOMAIN" in codes_paytm
    assert res_paytm["score"] <= 25
    paytm_flag = next(f for f in res_paytm["flags"] if f["code"] == "BRAND_IN_DOMAIN")
    assert "Domain name me Paytm shamil hai" in paytm_flag["reason"]
    assert len(paytm_flag["reason"]) <= 80

    # 4. Short brand tokens (< 4 chars) never match as substring of larger word
    res_mysbitech = analyze_url("http://mysbitech.com")
    codes_mysbitech = [f["code"] for f in res_mysbitech["flags"]]
    assert "BRAND_LOOKALIKE" not in codes_mysbitech
    assert "BRAND_IN_DOMAIN" not in codes_mysbitech

    # 5. Official-domain guard remains unchanged (score <= 10, empty flags)
    res_off = analyze_url("https://sbi.co.in")
    assert res_off["score"] <= 10
    assert res_off["flags"] == []


def test_domain_age_under_30d_upgrades_brand_in_domain_to_lookalike():
    """Domain age < 30 days satisfies condition (d) and upgrades BRAND_IN_DOMAIN to BRAND_LOOKALIKE."""
    mock_rdap_resp = MagicMock()
    mock_rdap_resp.status_code = 200
    mock_rdap_resp.json.return_value = {
        "events": [
            {"eventAction": "registration", "eventDate": "2026-10-25T10:00:00Z"}
        ]
    }
    with patch("requests.get", return_value=mock_rdap_resp):
        res = analyze_url("http://hdfclife-promo.com")

    codes = [f["code"] for f in res["flags"]]
    assert "BRAND_LOOKALIKE" in codes
    assert "BRAND_IN_DOMAIN" not in codes
    assert "NEW_DOMAIN" in codes


def test_slow_rdap_capped_by_network_budget():
    """A slow mocked RDAP (sleeping 10s) must not cause analyze_url to exceed ~3.5s."""
    import time

    def slow_rdap(*args, **kwargs):
        time.sleep(10)
        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {}
        return resp

    with patch("requests.get", side_effect=slow_rdap):
        start_time = time.monotonic()
        result = analyze_url("http://example-slow-rdap-test.com")
        duration = time.monotonic() - start_time

    assert duration < 3.5, f"analyze_url took {duration:.2f}s, exceeding 3.5s budget"
    assert result["meta"]["domain_age_days"] is None
    assert isinstance(result["score"], int)
