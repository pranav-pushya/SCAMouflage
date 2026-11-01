# 🛡️ PhishShield India (SCAMouflage)

> **Explainable Multi-Engine Cyber Fraud & Phishing Detection System Tailored for Indian Scam Vectors**  
> Built for **GRAVITON 2026** — *Problem Statement 02: Phishing and Scam Detection*

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS v3](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-86%20Passed-brightgreen.svg)]()
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-yellow.svg)]()

---

## 📌 Executive Summary

India experiences millions of financial fraud attempts daily across SMS, WhatsApp, malicious web links, and spoofed emails. Conventional cyber security scanners (VirusTotal, standard spam filters) fall short because they:
1. **Fail on Romanized Dialects & Hinglish:** Traditional tokenizers fail on phonetic Hindi/Punjabi spellings (*"aaj raat 9:30 baje bijli kaat di jayegi"*, *"khata block ho jayega"*).
2. **Miss Domestic Fraud Modus Operandi:** Generic tools look for PayPal/Netflix, missing **Digital Arrest** (fake CBI/NCB video call summons), **FASTag blacklisting**, **fake e-challans**, and **SBI YONO KYC** threats.
3. **Act as Opaque Black Boxes:** Victims are given a raw probability score with no human-readable reasoning or domestic remediation steps.
4. **Isolate Signals:** An innocent-looking SMS with a hidden malicious shortlink is evaluated only as text, averaging out the threat.

**PhishShield India** solves this with an explainable, multi-signal ensemble that analyzes text, links, and email headers both independently and synergistically, delivering actionable verdicts, plain-Hinglish reasons, and direct links to India's National Cybercrime Helpline (**1930**).

---

## 🚀 Key Features

- 🧠 **Multi-Signal Tri-Engine Analysis:** Auto-detects and inspects URLs, SMS text, or raw RFC 5322 email headers through dedicated parallel engines.
- 🇮🇳 **Domestic Threat Library:** Tunable heuristic rules for **Digital Arrest**, **FASTag**, **Electricity bill disconnection**, **SBI/HDFC/Paytm KYC**, **Part-time Telegram jobs**, and **instant fake loan apps**.
- 🔤 **Sub-Word Hinglish ML Classifier:** Character n-gram TF-IDF pipeline (`char_wb`, n-grams 2–5) + Logistic Regression, resilient to intentional spelling distortions.
- 🔗 **Advanced URL Forensics:** 
  - RapidFuzz typosquatting matching against 50+ official Indian banking and telecom domains.
  - Combosquatting and keyword-stuffing detection.
  - RDAP domain age profiling (<30 days high risk).
  - Unshortens redirect chains up to 5 hops with SSRF protection.
  - 200-estimator Random Forest classifier trained on 12 host-level structural features.
- ✉️ **Email Header Verification:** Evaluates SPF, DKIM, and DMARC alignment, detects `From` vs `Reply-To` mismatch, and flags free webmail brand impersonation.
- 🌐 **Passive Footprint & OSINT Engine (`/footprint`):** Profiles target infrastructure (DNS records, PTR reverse lookup, MX mail server posture, and disposable hosting identification).
- 🧩 **Chrome Extension (Manifest V3):** Real-time in-browser text and link scanning with on-page warning banners and floating inspection badges.
- 🛡️ **Client-Side Defanging:** Automatically renders malicious URLs as `hxxps[://]` and `[.]com` to eliminate accidental clicks.
- 🌓 **Dynamic Theme Engine:** Full Light / Dark mode toggle with persistent state, accessibility compliance, and custom cyber styling.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend: React 18 + Vite SPA                       │
│  - Persistent Light / Dark Mode Toggle                                │
│  - Dedicated Analyzers: Auto, SMS Scam, URL Forensics, Email Header   │
│  - Live Target Footprint Inspector & Curated OSINT Directory          │
│  - Chrome Extension Quick-Download & Documentation                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Backend: FastAPI (Python 3.11)                      │
│     - Endpoints: /health, /analyze, /footprint                        │
│     - Automatic Input-Type Classifier (RFC 5322 vs URL vs SMS)         │
│     - CORS Regex: Web Client + Chrome Extension (chrome-extension://) │
└───────────┬─────────────────┬──────────────────┬─────────────────┬─────┘
            │                 │                  │                 │
            ▼                 ▼                  ▼                 ▼
     ┌─────────────┐   ┌─────────────┐    ┌─────────────┐   ┌─────────────┐
     │ URL Engine  │   │ Text Engine │    │Header Engine│   │  Footprint  │
     │ - Lexical   │   │ - Hinglish  │    │ - RFC 5322  │   │   Engine    │
     │ - RapidFuzz │   │ - TF-IDF ML │    │ - SPF/DKIM  │   │ - DNS/PTR   │
     │ - RF ML     │   │ - Groq LLM  │    │ - DMARC     │   │ - MX & Mail │
     └──────┬──────┘   └──────┬──────┘    └──────┬──────┘   │ - RDAP Age  │
            │                 │                  │          └─────────────┘
            └─────────────────┼──────────────────┘
                              ▼
                ┌───────────────────────────┐
                │    Multi-Signal Fusion    │
                │ - High-Water Mark Override│
                │ - Mathematical Aggregate  │
                │ - Explainable Verdict     │
                └───────────────────────────┘
```

---

## 🔬 Machine Learning & Detection Methodology

### 1. SMS / Text Model (`text_model.joblib`)
- **Vectorizer:** `TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), min_df=1)`
- **Classifier:** `LogisticRegression(solver="liblinear", class_weight="balanced", random_state=42)`
- **Rationale:** Sub-word character n-grams capture grammatical morphology and phonetic variants across Hinglish, Hindi, English, and Romanized Punjabi, bypassing evasion techniques used by spammers.
- **Guardrails:** Regex-based positive signals protect genuine bank OTP warnings and transaction debit/credit receipts from false positives.

### 2. URL Classification Model (`url_model.joblib`)
- **Classifier:** `RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42)`
- **Features (12 Strictly Host-Level):** `host_length`, `num_hyphens`, `num_digits`, `digit_ratio`, `entropy`, `subdomain_count`, `is_punycode`, `is_ip`, `has_at_symbol`, `is_suspicious_tld`, `has_brand_keyword`, `has_https`.
- **Zero Path-Length Bias:** URL paths were deliberately excluded during training to prevent the model from overfitting to short paths in top-domain benchmarks (Tranco).

### 3. Cognitive LLM Tactics Extraction (Groq Cloud)
- **Model:** `llama-3.1-8b-instant` via Groq Cloud API in JSON mode (`temperature=0.1`).
- **Role:** Extracts psychological coercion tactics: `urgency`, `fear_threat`, `authority_impersonation`, `digital_arrest`, `credential_harvesting`.
- **Resilience:** Built with a strict **2.5s network timeout** and **zero-crash fallback**—if offline or without API keys, the system runs autonomously on local ML and rule engines.

---

## 📂 Project Directory Structure

```text
phishshield/
├── AGENTS.md                          # Hackathon specification, agent rules, and API contracts
├── README.md                          # Comprehensive project documentation
├── .env.example                       # Environment configuration template
├── backend/                           # FastAPI Application Root
│   ├── main.py                        # API routes (/health, /analyze, /footprint)
│   ├── fusion.py                      # Multi-signal fusion and verdict scoring
│   ├── fusion_config.py               # Tunable verdict thresholds and next-step advice
│   ├── requirements.txt               # Backend Python dependencies
│   ├── data/
│   │   └── brands.json                # 50+ official Indian brand domains & aliases
│   ├── models/
│   │   ├── text_model.joblib          # Pre-trained Hinglish SMS classifier
│   │   └── url_model.joblib           # Pre-trained Random Forest URL model
│   ├── engines/
│   │   ├── url_engine.py              # URL lexical, RDAP & ML engine
│   │   ├── url_config.py              # URL scoring weights & suspicious TLD sets
│   │   ├── text_engine.py             # SMS Hinglish rule aggregator & ML
│   │   ├── text_config.py             # 10+ Indian scam categories and regexes
│   │   ├── header_engine.py           # Email authentication & spoofing parser
│   │   ├── header_config.py           # Email scoring rules & free webmail list
│   │   ├── footprint_engine.py        # Infrastructure reconnaissance & OSINT
│   │   ├── footprint_config.py        # Footprint scoring & disposable host rules
│   │   └── groq_client.py             # Resilient Groq LLM tactics client
│   └── tests/                         # Pytest Suite (86 Unit & Contract Tests)
├── frontend/                          # React + Vite + Tailwind Single-Page App
│   ├── index.html                     # HTML5 entry point
│   ├── package.json                   # Dependencies (React, Lucide, Framer Motion)
│   ├── tailwind.config.js             # Custom styling tokens and class-based dark mode
│   ├── src/
│   │   ├── App.jsx                    # Root routes and ThemeProvider wrapper
│   │   ├── index.css                  # Custom cyber styles, scanline & light mode
│   │   ├── context/
│   │   │   └── ThemeContext.jsx       # Persistent Light/Dark theme manager
│   │   ├── components/
│   │   │   ├── TopNav.jsx             # Header with route tabs and theme toggle
│   │   │   ├── SharedAnalyzer.jsx     # Reusable analyzer interface
│   │   │   ├── ResultCard.jsx         # Risk gauge, reasons & defanged links
│   │   │   ├── PrecautionsCard.jsx    # Actionable helpline steps (1930)
│   │   │   ├── ExtensionModal.jsx     # Chrome extension guide and zip download
│   │   │   └── Footer.jsx             # Comprehensive footer with official portals
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Auto-detector landing page
│   │   │   ├── SmsPage.jsx            # SMS / Text scam testing sandbox
│   │   │   ├── UrlPage.jsx            # URL forensics analyzer
│   │   │   ├── EmailPage.jsx          # Email header analyzer
│   │   │   └── FootprintPage.jsx      # Live reconnaissance & OSINT directory
│   │   └── utils/
│   │       └── defang.js              # URL defanging helpers
│   └── public/
│       └── phishshield-extension.zip  # Downloadable ready-to-load extension
├── extension/                         # Chrome Extension (Manifest V3)
│   ├── manifest.json                  # Manifest V3 configuration
│   ├── background/
│   │   └── service-worker.js          # API proxy and background event listener
│   ├── content/
│   │   ├── content-script.js          # In-page link highlighter and warning injector
│   │   └── content-style.css          # Injected warning banners and tooltip styles
│   ├── popup/
│   │   ├── popup.html                 # Quick scan popup UI
│   │   ├── popup.js                   # Popup logic and status checkers
│   │   └── popup.css                  # Cyber-themed popup styling
│   └── rules/
│       └── detector-engine.js         # Offline client-side rule evaluation engine
└── scripts/
    ├── train_text_model.py            # SMS model training script
    └── train_url_model.py             # URL model training script
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python**: `3.11+`
- **Node.js**: `18+` and **npm**

---

### 1. Backend Setup

All commands are run from the `backend/` directory:

```bash
cd backend

# Create and activate virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp ../.env.example .env
# (Optional) Add your GROQ_API_KEY in .env for LLM tactics extraction
```

#### Run the Backend Server
```bash
uvicorn main:app --reload --port 8000
```
- **API Base:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

---

### 2. Frontend Setup

All commands are run from the `frontend/` directory:

```bash
cd frontend

# Install npm dependencies
npm install

# Run the Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

To create an optimized production build:
```bash
npm run build
```

---

### 3. Chrome Extension Installation (Manifest V3)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` folder located inside the `phishshield` project directory.
5. The **PhishShield India** extension icon will appear in your Chrome toolbar. Ensure the backend server is running on `http://localhost:8000` for live cloud-assisted scoring.

---

## 🧪 Running the Test Suite

The project includes 86 automated unit, regression, and API contract tests using `pytest`. All tests execute **100% offline** with mocked external endpoints:

```bash
cd backend
pytest -v
```

```text
============================== test session starts ==============================
collected 86 items

tests/test_health.py .                                                    [  1%]
tests/test_text_engine.py .........................                      [ 30%]
tests/test_url_engine.py ............................                    [ 62%]
tests/test_header_engine.py .................                             [ 82%]
tests/test_footprint_engine.py ..........                                 [ 94%]
tests/test_fusion.py .....                                                [100%]

======================== 86 passed, 1 warning in 16.68s =========================
```

---

## 📡 API Reference

### 1. `POST /analyze`
Analyzes an input string with multi-signal fusion.

#### Request Body
```json
{
  "type": "auto",
  "content": "SBI Alert: Your YONO account will be blocked today. Please complete your KYC at http://sbi-kyc-update.top"
}
```
*`type` accepts: `"auto"`, `"sms"`, `"url"`, or `"header"`.*

#### Response (200 OK)
```json
{
  "dummy": false,
  "verdict": "high",
  "score": 88,
  "input_type": "sms",
  "summary": "Khatra: Sandigdha KYC_UPDATE, ACCOUNT_BLOCK_THREAT fraud detect hua hai (High Risk: 88/100).",
  "reasons": [
    "Fake KYC update ya document jama karne ki maang hai",
    "Bank account ya card band hone ki dhamki di gayi hai",
    "Domain SBI ke jaisa lagta hai lekin official nahi hai (Typosquatting)",
    "Khatarnak/cheap top-level domain (.top) use kiya hai"
  ],
  "next_steps": [
    "Bank kabhi SMS ya WhatsApp link bhejkar KYC update karne ko nahi kehta.",
    "National Cyber Crime Helpline 1930 par call karein ya cybercrime.gov.in par report karein."
  ],
  "engines": {
    "url": {
      "score": 85,
      "flags": [
        { "code": "BRAND_LOOKALIKE", "reason": "Domain SBI ke jaisa lagta hai..." },
        { "code": "SUSPICIOUS_TLD", "reason": "Khatarnak top-level domain (.top)..." }
      ],
      "meta": {
        "normalized_url": "hxxp://sbi-kyc-update[.]top",
        "registered_domain": "sbi-kyc-update.top",
        "domain_age_days": 8,
        "ml_probability": 0.96
      }
    },
    "text": {
      "score": 82,
      "flags": [
        { "code": "KYC_UPDATE", "reason": "Fake KYC update ki maang..." },
        { "code": "ACCOUNT_BLOCK_THREAT", "reason": "Bank account block ki dhamki..." }
      ],
      "meta": {
        "rules_score": 75,
        "ml_probability": 0.93,
        "groq_tactics": ["urgency", "authority_impersonation"],
        "urls": ["http://sbi-kyc-update.top"]
      }
    },
    "header": { "score": null, "flags": [], "meta": {} }
  }
}
```

---

### 2. `POST /footprint`
Performs passive OSINT infrastructure profiling on target domains or hostnames.

#### Request Body
```json
{
  "target": "https://sbi-kyc-update.top"
}
```

#### Response (200 OK)
```json
{
  "target": "https://sbi-kyc-update.top",
  "hostname": "sbi-kyc-update.top",
  "registered_domain": "sbi-kyc-update.top",
  "score": 75,
  "verdict": "high",
  "domain_profile": {
    "age_days": 8,
    "is_new_domain": true
  },
  "network": {
    "ip_addresses": ["185.220.101.5"],
    "is_disposable_hosting": true,
    "ptr_record": "tor-exit-node.example.org"
  },
  "mail_posture": {
    "has_mx": false,
    "has_spf": false,
    "has_dmarc": false
  },
  "flags": [
    { "code": "NEW_DOMAIN", "reason": "Domain is under 30 days old" },
    { "code": "NO_MX_RECORDS", "reason": "No mail server configured" }
  ]
}
```

---

## 🏛️ Citizen Protection & Indian Cyber Helplines

If you or someone you know has been targeted by a financial scam or cyber extortion:

| Authority / Resource | Channel | Purpose |
| :--- | :--- | :--- |
| **National Cybercrime Helpline** | 📞 **`1930`** (Toll-Free 24x7) | Immediate financial fraud reporting to freeze drained bank accounts |
| **National Cyber Crime Portal** | 🌐 [`cybercrime.gov.in`](https://cybercrime.gov.in) | Formal FIR and complaint registration with State Cyber Police |
| **DoT Chakshu (Sanchar Saathi)** | 🌐 [`sancharsaathi.gov.in/sfc`](https://sancharsaathi.gov.in/sfc/) | Reporting fraudulent calls, scam SMS, and compromised SIMs |
| **CERT-In Incident Response** | 🌐 [`cert-in.org.in`](https://www.cert-in.org.in) | Computer Emergency Response Team for security incident escalation |

---

## 📄 License & Attribution

This project is open-source under the [MIT License](LICENSE).  
Developed for **GRAVITON 2026** Hackathon (Problem Statement 02: Phishing and Scam Detection).
