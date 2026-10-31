# PhishShield India - project context (read before every task)

What: a 24-hour hackathon project (GRAVITON 2026, PS 02: phishing and scam detection). A user pastes a suspicious SMS, link, or email headers into a web app. The backend returns a risk verdict, the reasons, and next steps. It must be explainable: every score comes with human-readable reasons. India-focused: fake KYC, FASTag, digital arrest, courier, electricity-bill scams; SBI/HDFC/Paytm/India Post lookalikes; Hinglish and Romanized Hindi/Punjabi text.

Architecture: React frontend -> FastAPI POST /analyze -> three independent engines (url, text, header) -> fusion -> response.

Stack (do not add other frameworks): Python 3.11, FastAPI, scikit-learn, pandas, rapidfuzz, tldextract, requests, idna, joblib, pytest, python-dotenv. Frontend: React + Vite + Tailwind CSS v3. LLM: Groq API, backend only, key in backend .env, never in the frontend.

JSON contract:
- Request: {"type": "auto|sms|url|header", "content": "..."}
- Engine output: {"score": 0-100, "flags": [{"code": "NEW_DOMAIN", "reason": "..."}]} (higher score = more suspicious)
- Final response: {"verdict": "low|medium|high", "score": 0-100, "engines": {...}, "reasons": [...], "next_steps": [...]}
- Engines must never raise; on failure skip the signal and continue.

Rules for the agent:
- Developer is a student who must explain every line to judges: simple readable code, short comments explaining WHY.
- Touch only the files named in the current task. Never edit files outside scope.
- No secrets in code or git. Never commit .env. No real phishing URLs in code or tests (use fake strings, defanged hxxp, mock the network).
- Tests must not use the real network.
- Never present mocked or stubbed behaviour as real. State clearly what is real, mocked, or not implemented.
- Scoring weights are "expert-assumed, tunable" and live in config files, not hardcoded in logic.
- Keep scope tight: no browser extension, no extra features.
