"""Unit and contract tests for the PhishShield India Email Header Engine.

Tests authenticate SPF, DKIM, DMARC, and sender mismatches against Teammate 3's
dataset and expected.csv specifications.
"""

import os
import pandas as pd
import pytest

from engines.header_engine import analyze_header


def _get_headers_dir() -> str:
    return os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "data", "headers"
    )


def test_teammate3_expected_csv_matches():
    """Verify all files match expected authentication results from Teammate 3."""
    h_dir = _get_headers_dir()
    csv_path = os.path.join(h_dir, "expected.csv")
    assert os.path.isfile(csv_path), f"expected.csv not found at {csv_path}"

    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        fn = str(row["filename"]).strip()
        fp = os.path.join(h_dir, fn)
        assert os.path.isfile(fp), f"Header sample {fn} not found"

        with open(fp, "r", encoding="utf-8") as f:
            raw = f.read()

        res = analyze_header(raw)
        assert res["score"] is not None

        # Verify SPF status
        exp_spf = str(row["spf"]).strip().lower()
        assert res["meta"]["spf"] == exp_spf, f"SPF mismatch on {fn}: got {res['meta']['spf']}, expected {exp_spf}"

        # Verify DKIM status
        exp_dkim = str(row["dkim"]).strip().lower()
        assert res["meta"]["dkim"] == exp_dkim, f"DKIM mismatch on {fn}: got {res['meta']['dkim']}, expected {exp_dkim}"

        # Verify DMARC status
        exp_dmarc = str(row["dmarc"]).strip().lower()
        assert res["meta"]["dmarc"] == exp_dmarc, f"DMARC mismatch on {fn}: got {res['meta']['dmarc']}, expected {exp_dmarc}"

        # Verify Reply-To mismatch
        exp_mismatch = str(row["reply_to_mismatch"]).strip().lower() == "yes"
        assert res["meta"]["reply_to_mismatch"] == exp_mismatch, f"Reply-to mismatch mismatch on {fn}"

        # Verify high-level score separation
        label = str(row["label"]).strip().lower()
        if label == "scam":
            assert res["score"] >= 40, f"Scam sample {fn} scored too low ({res['score']})"
            assert len(res["flags"]) > 0, f"Scam sample {fn} received no flags"
        elif label == "legit":
            assert res["score"] <= 10, f"Legit sample {fn} scored too high ({res['score']})"
            assert len(res["flags"]) == 0, f"Legit sample {fn} received flags: {res['flags']}"


def test_synthetic_1_reply_to_and_dmarc_fail():
    """synthetic_1.txt has DMARC fail, SPF fail, and Reply-To mismatch."""
    fp = os.path.join(_get_headers_dir(), "synthetic_1.txt")
    with open(fp, "r", encoding="utf-8") as f:
        res = analyze_header(f.read())

    codes = [fl["code"] for fl in res["flags"]]
    assert "DMARC_FAIL" in codes
    assert "SPF_FAIL" in codes
    assert "REPLY_TO_MISMATCH" in codes
    assert res["score"] >= 70


def test_synthetic_2_dkim_and_display_name_spoof():
    """synthetic_2.txt has DMARC fail, SPF fail, DKIM fail, and HDFC display-name spoof."""
    fp = os.path.join(_get_headers_dir(), "synthetic_2.txt")
    with open(fp, "r", encoding="utf-8") as f:
        res = analyze_header(f.read())

    codes = [fl["code"] for fl in res["flags"]]
    assert "DMARC_FAIL" in codes
    assert "SPF_FAIL" in codes
    assert "DKIM_FAIL" in codes
    assert res["score"] >= 80


def test_synthetic_3_free_webmail_brand_impersonation():
    """synthetic_3.txt passes technical auth but claims India Post on free Gmail."""
    fp = os.path.join(_get_headers_dir(), "synthetic_3.txt")
    with open(fp, "r", encoding="utf-8") as f:
        res = analyze_header(f.read())

    codes = [fl["code"] for fl in res["flags"]]
    assert "FREE_WEBMAIL_BRAND_SPOOF" in codes
    assert res["meta"]["spf"] == "pass"
    assert res["meta"]["dkim"] == "pass"
    assert res["meta"]["dmarc"] == "pass"
    assert res["score"] >= 40


@pytest.mark.parametrize("bad_input", ["", "   ", None, 12345])
def test_header_engine_invalid_input_contract(bad_input):
    """Empty or non-string input returns score: null and INVALID_INPUT flag."""
    res = analyze_header(bad_input)
    assert res["score"] is None
    assert len(res["flags"]) == 1
    assert res["flags"][0]["code"] == "INVALID_INPUT"
    assert "meta" in res
    assert res["meta"]["spf"] is None
