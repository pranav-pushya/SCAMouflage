"""Text analysis engine stub."""

def analyze_text(text: str) -> dict:
    """Analyze SMS or email body text for urgency, scam keywords, and Indian context patterns.

    TODO: Step 2 will implement heuristic regex matching, Hinglish/Romanized Hindi
    keyword flagging, and Groq LLM integration.
    """
    # Engines must never raise; default safe stub response following the contract
    return {
        "score": 0,
        "flags": []
    }
