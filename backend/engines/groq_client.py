"""Groq API client for LLM-assisted scam tactics extraction.

Uses Groq chat completions in JSON mode with low temperature to detect
psychological fraud tactics (authority fear, artificial urgency, impersonation).
Designed with a strict network timeout and graceful local fallback:
if the API key is missing or the call fails, the system continues on ML + rules alone.
"""

import json
import os
from typing import Any, Dict, List, Optional
import requests

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"
GROQ_TIMEOUT_SECONDS = 2.5

SYSTEM_PROMPT = """You are a cybersecurity analyst specializing in Indian financial fraud and phishing scams.
Analyze the message text and return a JSON object with this exact schema:
{
  "is_scam": boolean,
  "confidence": float 0.0-1.0,
  "tactics": list of strings (e.g. "urgency", "fear_threat", "authority_impersonation", "greed_lottery", "credential_harvesting"),
  "explanation": string (short user-facing explanation in simple Hinglish, under 75 characters)
}
Be concise and strictly adhere to JSON format.
"""


def extract_tactics(text: str) -> Optional[Dict[str, Any]]:
    """Query Groq API for psychological scam tactics.

    Guaranteed to NEVER raise. If GROQ_API_KEY is not set or network fails,
    returns None to let the rule + ML classifier operate independently.
    """
    if not isinstance(text, str) or not text.strip():
        return None

    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.1,
        "max_tokens": 180,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this message:\n{text[:1000]}"},
        ],
    }

    try:
        resp = requests.post(
            GROQ_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=GROQ_TIMEOUT_SECONDS,
        )
        if resp.status_code == 200:
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return {
                "is_scam": bool(parsed.get("is_scam", False)),
                "confidence": float(parsed.get("confidence", 0.0)),
                "tactics": list(parsed.get("tactics", [])),
                "explanation": str(parsed.get("explanation", ""))[:80],
            }
    except Exception:
        # Graceful fallback: never crash on API or network errors
        pass

    return None
