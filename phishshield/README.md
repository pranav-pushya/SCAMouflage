# PhishShield India

PhishShield India is an explainable phishing and scam detection system built for GRAVITON 2026 (Problem Statement 02). It analyzes suspicious SMS text, URLs, and email headers with specific detection rules tailored for Indian scam vectors (fake KYC, FASTag, electricity bills, courier frauds, digital arrest, and Hindi/Hinglish phrasing).

---

## Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+ and **npm**

---

## 1. Backend Setup

All backend commands must be run from the `backend/` directory.

### Create and activate virtual environment

**On Linux/macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

Copy the example environment file:
```bash
# In phishshield root or backend directory as needed:
cp ../.env.example .env
```
*(Leave `GROQ_API_KEY` empty until LLM integration is configured).*

### Run the backend API server

```bash
uvicorn main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## 2. Frontend Setup

All frontend commands must be run from the `frontend/` directory.

### Install dependencies

```bash
cd frontend
npm install
```

### Configure environment variables

Optionally copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Defaults to `http://localhost:8000` if not set).*

### Run the frontend dev server

```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 3. Running Tests

Run backend unit and contract tests using `pytest` from the `backend/` directory:

```bash
cd backend
pytest -v
```
To run a specific test file:
```bash
pytest tests/test_health.py -v
```

---

## Project Structure

```text
phishshield/
  AGENTS.md           # Project rules, architecture context, and JSON contract
  README.md           # Setup, run, and test instructions
  .gitignore          # Git ignore rules for Python, Node, and secrets
  .env.example        # Environment variable template
  backend/
    main.py           # FastAPI application entry point with /health and /analyze
    fusion.py         # Multi-engine score fusion stub
    requirements.txt  # Python backend dependencies
    engines/          # Detection engines (URL, Text, Header stubs)
    data/             # Backend reference data (.gitkeep)
    models/           # ML model storage (.gitkeep)
    tests/            # Test suite (FastAPI TestClient tests)
  scripts/            # Utility scripts (.gitkeep)
  data/
    urls/             # URL datasets (.gitkeep)
    sms/              # SMS datasets (.gitkeep)
    headers/          # Email header datasets (.gitkeep)
  frontend/           # React + Vite + Tailwind CSS v3 single-page app
```

---

## Implementation Status (Step 0)

- **Backend /analyze**: Currently returns a **STATIC dummy response** with `"dummy": true` for contract verification. Real detection engines and fusion will be implemented in subsequent steps.
- **Engines**: URL, text, and header engines are stubs returning `{"score": 0, "flags": []}`.
- **Frontend**: Scaffolding UI with raw JSON output, loading, and error handling.
