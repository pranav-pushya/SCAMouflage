"""Tests for Router and Fusion layer (Step 4 / Gate 2)."""

import pytest
from fastapi.testclient import TestClient

from fusion import detect_input_type, fuse
from fusion_config import (
    HELPLINE_CYBERCRIME_PHONE,
    HELPLINE_CYBERCRIME_PORTAL,
    get_verdict,
)
from main import app

client = TestClient(app)


def test_detect_input_type():
    """Verify input auto-detection for URLs, headers, and SMS messages."""
    # URLs
    assert detect_input_type("https://sbi.co.in") == "url"
    assert detect_input_type("hxxp://sbi-kyc-update.xyz/verify") == "url"
    assert detect_input_type("sbi-kyc.xyz") == "url"
    assert detect_input_type("192.168.1.1:8080/login") == "url"
    assert detect_input_type("www.onlinesbi.sbi") == "url"

    # Email Headers
    header_sample_1 = "Received: from mail.evil.xyz\nFrom: support@sbi.co.in\nSubject: Urgent"
    assert detect_input_type(header_sample_1) == "header"

    header_sample_2 = "Authentication-Results: spf=fail\nDKIM-Signature: v=1\nFrom: user@test.com"
    assert detect_input_type(header_sample_2) == "header"

    header_sample_3 = "From: hr@company.com\nSubject: Interview details\nDate: Mon, 20 Oct 2026 10:00:00"
    assert detect_input_type(header_sample_3) == "header"

    # SMS / Text messages
    sms_sample_1 = "Priye grahak, aapka bijli connection aaj raat 9 baje kat diya jayega."
    assert detect_input_type(sms_sample_1) == "sms"

    sms_sample_2 = "Your OTP is 482910 for transaction of Rs 500 at Amazon. Do not share with anyone."
    assert detect_input_type(sms_sample_2) == "sms"

    sms_sample_3 = "Dear customer, your SBI account is blocked. Update KYC now: http://sbi-kyc.xyz"
    assert detect_input_type(sms_sample_3) == "sms"


def test_fuse_score_and_verdict_logic():
    """Verify weighted score fusion, high-water mark, and verdict mapping."""
    # 1. SMS with high-risk link: high-water mark ensures overall score is >= 70
    engine_results = {
        "text": {
            "score": 40,
            "flags": [{"code": "KYC_UPDATE", "reason": "KYC update ka sandesh"}],
            "meta": {"matched_categories": ["KYC_UPDATE"]},
        },
        "url": {
            "score": 85,
            "flags": [{"code": "BRAND_LOOKALIKE", "reason": "SBI lookalike domain"}],
            "meta": {},
        },
        "header": {"score": None, "flags": [], "meta": {}},
    }
    fused = fuse(engine_results, detected_type="sms")
    assert fused["verdict"] == "high"
    assert fused["score"] >= 85
    assert "KYC update ka sandesh" in fused["reasons"]
    assert "SBI lookalike domain" in fused["reasons"]

    # 2. Low-risk result
    engine_results_low = {
        "text": {"score": 15, "flags": [], "meta": {}},
        "url": {"score": None, "flags": [], "meta": {}},
        "header": {"score": None, "flags": [], "meta": {}},
    }
    fused_low = fuse(engine_results_low, detected_type="sms")
    assert fused_low["verdict"] == "low"
    assert fused_low["score"] == 15

    # 3. None scores handled safely without raising
    engine_results_none = {
        "text": {"score": None, "flags": [], "meta": {}},
        "url": {"score": None, "flags": [], "meta": {}},
        "header": {"score": None, "flags": [], "meta": {}},
    }
    fused_none = fuse(engine_results_none, detected_type="sms")
    assert fused_none["score"] is None
    assert fused_none["verdict"] == "low"


def test_fuse_reasons_deduplication_and_helpline_advice():
    """Verify reason deduplication and presence of 1930 / cybercrime.gov.in in next_steps."""
    engine_results = {
        "text": {
            "score": 88,
            "flags": [
                {"code": "DIGITAL_ARREST", "reason": "CBI ya police arrest dhamki"},
                {"code": "URGENCY", "reason": "Turant action lene ka pressure"},
                {"code": "DIGITAL_ARREST", "reason": "CBI ya police arrest dhamki"},  # duplicate
            ],
            "meta": {"matched_categories": ["DIGITAL_ARREST"]},
        },
        "url": {"score": None, "flags": [], "meta": {}},
        "header": {"score": None, "flags": [], "meta": {}},
    }
    fused = fuse(engine_results, detected_type="sms")

    # Reasons must be deduplicated
    assert len(fused["reasons"]) == 2
    assert fused["reasons"] == ["CBI ya police arrest dhamki", "Turant action lene ka pressure"]

    # Next steps must contain official Indian Cybercrime reporting info
    next_steps_text = " ".join(fused["next_steps"])
    assert HELPLINE_CYBERCRIME_PHONE in next_steps_text
    assert HELPLINE_CYBERCRIME_PORTAL in next_steps_text
    # Prepending digital arrest specific alert
    assert "Digital Arrest" in next_steps_text


def test_api_analyze_auto_sms_with_embedded_url():
    """Test full /analyze pipeline with auto-detection for an SMS containing a phishing link."""
    payload = {
        "type": "auto",
        "content": "Priye grahak, aapka SBI account block ho gaya hai. KYC update karein: http://sbi-kyc-update.xyz",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["dummy"] is False
    assert data["input_type"] == "sms"
    assert data["verdict"] == "high"
    assert data["score"] >= 70

    # Multi-engine: both text and url engines must have executed
    assert data["engines"]["text"]["score"] is not None
    assert data["engines"]["url"]["score"] is not None
    assert data["engines"]["url"]["score"] >= 70

    # Ensure actionable next steps and reasons are populated
    assert len(data["reasons"]) > 0
    assert any("1930" in step for step in data["next_steps"])


def test_api_analyze_auto_legit_sms():
    """Test full /analyze pipeline with auto-detection on a clean transaction alert."""
    payload = {
        "type": "auto",
        "content": "Your a/c no. XX1234 is debited for Rs 450.00 on 30-Oct-26 by UPI. Bal: Rs 15400. Info: amazon. If not you, SMS BLOCK to 9223008333",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["input_type"] == "sms"
    assert data["verdict"] == "low"
    assert data["score"] <= 25


def test_api_analyze_auto_spoofed_header():
    """Test full /analyze pipeline with auto-detection on an email header."""
    header_content = (
        "Received: from mail.attacker-domain.xyz (198.51.100.1)\n"
        "From: State Bank of India <alert@sbi.co.in>\n"
        "Reply-To: refund@attacker-domain.xyz\n"
        "Authentication-Results: mx.google.com; dmarc=fail (p=reject)\n"
        "Subject: Urgent KYC Verification Required\n"
    )
    payload = {
        "type": "auto",
        "content": header_content,
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["input_type"] == "header"
    assert data["verdict"] == "high"
    assert data["engines"]["header"]["score"] >= 60


def test_api_analyze_auto_raw_url():
    """Test full /analyze pipeline with auto-detection on a raw URL."""
    payload = {
        "type": "auto",
        "content": "http://sbi-kyc-update.xyz",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["input_type"] == "url"
    assert data["verdict"] == "high"
    assert data["engines"]["url"]["score"] >= 70
