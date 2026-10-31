"""FastAPI application entry point for PhishShield India."""

from typing import Literal
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="PhishShield India API",
    description="Backend API for phishing and scam detection",
    version="0.1.0",
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


# Static dummy response for Step 0 scaffolding
DUMMY_ANALYZE_RESPONSE = {
    "dummy": True,
    "verdict": "high",
    "score": 87,
    "engines": {
        "url": {
            "score": 90,
            "flags": [
                {
                    "code": "NEW_DOMAIN",
                    "reason": "Domain sirf 2 din purana hai",
                }
            ],
        },
        "text": {
            "score": 80,
            "flags": [],
        },
        "header": {
            "score": 0,
            "flags": [],
        },
    },
    "reasons": ["Domain sirf 2 din purana hai"],
    "next_steps": ["Link mat kholo", "Bank ko call karo"],
}


@app.get("/health")
def health() -> dict:
    """Basic health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict:
    """Analyze input using URL, text, and header engines.

    Currently returns a static dummy response for Step 0 scaffolding.
    """
    # Reject empty or whitespace-only strings with a clear 422
    if not payload.content or not payload.content.strip():
        raise HTTPException(
            status_code=422,
            detail="Content must be a non-empty string",
        )

    return DUMMY_ANALYZE_RESPONSE
