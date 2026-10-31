"""URL analysis engine stub."""

def analyze_url(url: str) -> dict:
    """Analyze a suspicious URL for phishing signals.

    TODO: Step 1 will implement domain age checks, typosquatting detection,
    TLD risk, and brand imitation logic.
    """
    # Engines must never raise; default safe stub response following the contract
    return {
        "score": 0,
        "flags": []
    }
