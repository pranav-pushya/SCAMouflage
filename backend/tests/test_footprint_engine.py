"""Tests for the Footprint & Infrastructure Reconnaissance Engine.

Ensures offline safety, proper parsing, flag triggering, and error resilience.
Zero real network calls are made: all DNS and RDAP queries are mocked.
"""

from unittest.mock import patch
from fastapi.testclient import TestClient

from engines.footprint_engine import (
    _normalize_target,
    _resolve_dns_footprint,
    analyze_footprint,
)
from main import app

client = TestClient(app)


def test_normalize_target_variations():
    """Test normalizing raw domain, URL with scheme, and IP address."""
    url, host, scheme, is_ip = _normalize_target("example.com")
    assert host == "example.com"
    assert is_ip is False

    url, host, scheme, is_ip = _normalize_target("http://test.org/path?q=1")
    assert host == "test.org"
    assert scheme == "http"
    assert is_ip is False

    url, host, scheme, is_ip = _normalize_target("192.168.1.1")
    assert host == "192.168.1.1"
    assert is_ip is True


def test_analyze_footprint_empty_input():
    """Engine must return a safe fallback without raising on empty input."""
    res = analyze_footprint("")
    assert res["verdict"] == "low"
    assert res["score"] == 0
    assert any(f["code"] == "INVALID_INPUT" for f in res["flags"])


@patch("engines.footprint_engine.get_domain_age_days")
@patch("engines.footprint_engine._resolve_dns_footprint")
def test_analyze_footprint_new_domain_and_suspicious_tld(mock_dns, mock_age):
    """Domain under 30 days on a suspicious TLD must produce high risk flags."""
    mock_age.return_value = 5  # 5 days old
    mock_dns.return_value = (["203.0.113.10"], "srv1.disposable.com", "Vercel")

    res = analyze_footprint("hxxp://fake-login-update.xyz")
    assert res["verdict"] in ("medium", "high")
    assert res["score"] > 30

    flag_codes = [f["code"] for f in res["flags"]]
    assert "DOMAIN_NEW_UNDER_30D" in flag_codes
    assert "SUSPICIOUS_TLD" in flag_codes
    assert "FREE_OR_DISPOSABLE_HOSTING" in flag_codes


@patch("engines.footprint_engine.get_domain_age_days")
@patch("engines.footprint_engine._resolve_dns_footprint")
def test_analyze_footprint_official_gov_domain(mock_dns, mock_age):
    """Official Indian government domain (.gov.in) must receive zero risk."""
    mock_age.return_value = 5000
    mock_dns.return_value = (["164.100.1.1"], "nic.in", "National Informatics Centre")

    res = analyze_footprint("https://incometax.gov.in")
    assert res["score"] == 0
    assert res["verdict"] == "low"
    assert res["domain_info"]["is_official_gov"] is True


def test_api_footprint_endpoint():
    """Test the POST /footprint FastAPI endpoint with a simulated target."""
    with patch("engines.footprint_engine.get_domain_age_days", return_value=120):
        with patch("engines.footprint_engine._resolve_dns_footprint", return_value=(["198.51.100.1"], None, "Cloudflare")):
            resp = client.post("/footprint", json={"target": "example-sample.com"})
            assert resp.status_code == 200
            data = resp.json()
            assert "verdict" in data
            assert "score" in data
            assert "domain_info" in data
            assert "whois" in data
            assert "network" in data


def test_api_footprint_empty_validation():
    """POST /footprint must reject empty input with HTTP 422."""
    resp = client.post("/footprint", json={"target": ""})
    assert resp.status_code == 422
