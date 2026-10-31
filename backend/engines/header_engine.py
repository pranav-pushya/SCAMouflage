"""Email header analysis engine stub."""

def analyze_header(raw: str) -> dict:
    """Analyze raw email headers for SPF, DKIM, DMARC, and sender mismatches.

    TODO: Step 3 will implement email header parsing and authentication validation.
    """
    # Engines must never raise; default safe stub response following the contract
    return {
        "score": 0,
        "flags": []
    }
