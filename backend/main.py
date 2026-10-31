"""FastAPI application entry point for PhishShield India."""

import logging
from typing import Literal

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from engines.header_engine import analyze_header
from engines.text_engine import analyze_text
from engines.url_engine import analyze_url
from fusion import detect_input_type, fuse

logger = logging.getLogger(__name__)

app = FastAPI(
    title="PhishShield India API",
    description="Backend API for phishing and scam detection",
    version="0.2.0",
)

# Configure CORS so Vite dev server can call this API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    """Payload schema for /analyze."""

    type: Literal["auto", "sms", "url", "header"]
    content: str = Field(..., min_length=1, description="Input text, URL, or header to analyze")


@app.get("/health")
def health() -> dict:
    """Basic health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict:
    """Analyze input using URL, text, and header engines with multi-signal fusion.

    Auto-detects input type if requested, delegates to relevant engines,
    and returns a fused verdict with actionable guidance.
    """
    # Reject empty or whitespace-only strings with a clear 422
    if not payload.content or not payload.content.strip():
        raise HTTPException(
            status_code=422,
            detail="Content must be a non-empty string",
        )

    try:
        # Determine actual input type
        if payload.type == "auto":
            resolved_type = detect_input_type(payload.content)
        else:
            resolved_type = payload.type

        engine_results = {
            "url": {"score": None, "flags": [], "meta": {}},
            "text": {"score": None, "flags": [], "meta": {}},
            "header": {"score": None, "flags": [], "meta": {}},
        }

        if resolved_type == "url":
            engine_results["url"] = analyze_url(payload.content)

        elif resolved_type == "header":
            engine_results["header"] = analyze_header(payload.content)

        else:
            # resolved_type == "sms"
            text_res = analyze_text(payload.content)
            engine_results["text"] = text_res

            # Multi-engine signal: if the SMS text contains embedded URLs, analyze them
            urls = text_res.get("meta", {}).get("urls", [])
            if urls:
                engine_results["url"] = analyze_url(urls[0])

        return fuse(engine_results, detected_type=resolved_type)

    except Exception as exc:
        logger.error("Unexpected error in /analyze pipeline: %s", exc)
        return {
            "dummy": False,
            "verdict": "low",
            "score": None,
            "input_type": payload.type,
            "summary": "Internal analysis error occurred.",
            "reasons": [f"System error: {exc}"],
            "next_steps": [
                "Bina pushti ke kisi sandigdha link par click na karein.",
                "1930 Cyber Fraud Helpline par call karein ya cybercrime.gov.in par report karein.",
            ],
            "engines": {
                "url": {"score": None, "flags": [], "meta": {}},
                "text": {"score": None, "flags": [], "meta": {}},
                "header": {"score": None, "flags": [], "meta": {}},
            },
        }
