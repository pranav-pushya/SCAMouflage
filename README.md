# Scamouflage: AI-Powered Phishing & Scam Detection System

**Lead Component:** URL Engine & Brand Dataset Pipeline  
**Role:** Teammate 2 – URL Engine & Brand Dataset Lead  
**Repository:** `Scamouflage`  

Scamouflage is an intelligent cybersecurity engine designed to detect, analyze, and neutralize phishing and social-engineering scams targeting Indian and global consumers across web, SMS (smishing), and instant messaging channels.

---

## 1. Directory Structure

```text
Scamouflage/
├── backend/
│   └── data/
│       └── brands.json             # 40 verified Indian & targeted brands with official domains & keywords
├── data/
│   ├── raw/                        # Downloaded raw threat-intel feeds & archives (ignored in git)
│   │   ├── openphish.txt
│   │   ├── phishing_database_active.txt
│   │   └── tranco_top1m.csv.zip
│   └── urls/                       # Processed, deduplicated, and split datasets
│       ├── train.csv               # Domain-split training dataset (4,967 URLs)
│       ├── test.csv                # Domain-split testing dataset (1,033 URLs)
│       ├── india_phishing.csv      # Confirmed India-targeted phishing URLs (4,241 URLs)
│       └── sample.csv              # 80 representative URLs, strictly defanged (hxxp and [.])
├── scripts/
│   └── fetch_urls.py               # Complete dataset collection, cleaning, splitting & defanging pipeline
├── brands_verification_report.md   # Domain verification audit report for all 40 brands
├── .gitignore                      # Ignores large raw files, archives, and python cache
└── README.md                       # Comprehensive pipeline documentation
```

---

## 2. Dataset Sources & Access Conditions

| Source | Type | Endpoint / Access | Usage Conditions & Restrictions |
|---|---|---|---|
| **OpenPhish** | Phishing Feed | `https://openphish.com/feed.txt` | Free community feed; non-commercial research/evaluation; limited to active feeds (~200–500 URLs). |
| **Phishing.Database** | Threat Intel | `https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt` | Open threat intelligence repository (MIT License); active links curated from community feeds, certs, and honeypots. |
| **Tranco List** | Legitimate Domains | `https://tranco-list.eu/top-1m.csv.zip` | Scientifically reproducible ranking list combining Umbrella, Alexa, Majestic, and Chrome UX report. Daily release. |
| **Verified Brand DB** | Ground Truth | `backend/data/brands.json` | Curated and independently audited register of 40 Indian brands, 78 official domains, and phishing tokens. |

---

## 3. Installation & Environment Requirements

The pipeline requires **Python 3.10+** and the following dependencies:

```bash
pip install requests pandas tldextract urllib3
```

*Note: `tldextract` is configured to use built-in snapshots (`suffix_list_urls=None`) so extraction runs instantaneously and offline without network delays or Public Suffix List query errors.*

---

## 4. How to Execute the Pipeline

Run the pipeline from the project root:

```bash
# Standard execution (uses local raw files if present, downloads if missing)
python scripts/fetch_urls.py

# Force re-download of latest raw feeds from the web
python scripts/fetch_urls.py --force-download

# Custom target sizes, split ratio, and random seed
python scripts/fetch_urls.py --phishing-target 3000 --legitimate-target 3000 --train-ratio 0.8 --seed 42
```

### Script CLI Arguments

* `--phishing-target`: Target count of unique phishing URLs (default: `3000`).
* `--legitimate-target`: Target count of unique legitimate URLs (default: `3000`).
* `--train-ratio`: Proportion of unique domains allocated to the training set (default: `0.8`).
* `--seed`: Random seed for reproducible sampling and shuffling (default: `42`).
* `--force-download`: Re-fetches raw feeds from remote servers even if cached in `data/raw/`.
* `--raw-dir`: Directory for caching large raw threat intelligence feeds (default: `data/raw`).
* `--urls-dir`: Output directory for generated CSV files (default: `data/urls`).
* `--brands-file`: Path to verified brand JSON database (default: `backend/data/brands.json`).

---

## 5. Dataset Cleaning & Preprocessing

Raw feeds contain noisy, malformed, or duplicated strings. `scripts/fetch_urls.py` enforces a rigorous cleaning process:

1. **Protocol Sanitization:** Ensures all URLs possess a valid `http://` or `https://` scheme. Missing schemes are standardized to `http://`.
2. **Case Normalization:** Converts schemes and hostnames/netlocs to lowercase (e.g., `HTTPS://WWW.EXAMPLE.COM/Path` -> `https://www.example.com/Path`). Path and query parameters preserve character case where needed for feature extraction.
3. **Port Normalization:** Redundant default ports (`:80` for HTTP, `:443` for HTTPS) are removed.
4. **Domain Extraction:** Extracts the registered domain (`domain.suffix`, e.g. `sbi.co.in`, `paypal.com`) via `tldextract`. Malformed hosts lacking valid domain-suffix pairs are discarded.
5. **Deduplication:** URLs are deduplicated across feeds using their canonical normalized representation.

---

## 6. Train-Test Splitting Methodology (Preventing Data Leakage)

A common failure in ML-based phishing detection is random URL-level train-test splitting. If `phish-site.com/login` is in train and `phish-site.com/verify` is in test, models memorize the domain rather than learning generalizable phishing signals.

Scamouflage enforces **Domain-Based Group Splitting**:
1. **Phishing URLs:** Grouped strictly by `registered_domain`. Domains are partitioned (80% train, 20% test). All URLs under a domain remain exclusively in either train or test.
2. **Legitimate URLs:** Drawn from **disjoint Tranco rank bands**:
   - **Training Set:** Sampled from Tranco Ranks **1 to 50,000** (2,400 URLs).
   - **Testing Set:** Sampled from Tranco Ranks **50,001 to 100,000** (600 URLs).
3. **Cross-Split Collision Guard:** Tranco candidates that collide with phishing test domains are excluded from training, and vice versa.
4. **Verification:**
   $$\text{Domains}(\text{train.csv}) \cap \text{Domains}(\text{test.csv}) = \emptyset$$
   Verified: Exactly **0** overlapping registered domains between train (3,668 domains) and test (919 domains).

---

## 7. India-Specific Phishing Dataset

A dedicated dataset (`data/urls/india_phishing.csv`) isolates phishing URLs targeting high-risk Indian institutions.

### Evidentiary Criteria (Avoiding False Positives)
Simple keyword matching causes massive false alarms (e.g., `uan` inside *tijuana*, `lic` inside *public* or *acrylic*, `axis` inside *coaxial*, `cred` inside *credit card* or *Canada Post credentials*). 

The Scamouflage engine applies **three layers of evidence**:
1. **Threat Feed Verification:** The URL is a confirmed phishing link collected by security crawlers.
2. **Official Domain Exclusion:** The URL's registered domain does **not** match the brand's verified `official_domains` in `backend/data/brands.json`.
3. **Contextual Token Boundaries:** Keywords are matched using boundary and delimiter logic (`\bkeyword\b` or brand-phishing compounds like `sbi-kyc`, `hdfc-otp`, `onlinesbi`, `paytm-cashback`). English dictionary collisions are strictly blacklisted.

### Confirmed India Phishing Dataset Breakdown

Total verified India-targeted phishing URLs: **4,241** across 15 distinct brands:

| Targeted Brand | Confirmed Phishing URLs | Typical Scam / Phishing Vector |
|---|:---:|---|
| **Amazon** | 4,165 | Fake order cancellations, prime renewals, credential harvesting |
| **Vi (Vodafone Idea)** | 15 | Fake SIM deactivation alerts, unpaid mobile bill scam |
| **Axis Bank** | 12 | Fake KYC update, reward point redemption, loan approvals |
| **HDFC Bank** | 11 | NetBanking PAN link alert, netbanking update session |
| **ICICI Bank** | 8 | Fake iMobile login, netbanking session update, KYC expiry |
| **SBI (State Bank of India)** | 6 | YONO reward points (`rewardssbi.pages.dev`), KYC 4G sim scam |
| **India Post** | 5 | Package address delivery failure, customs fee payment (`indiapost-goov.cfd`) |
| **Razorpay** | 4 | Fake payment gateway checkout, merchant refund portal |
| **Reliance Jio** | 4 | Free 5G/recharge gift scheme (`jiorechargee.shop`, `myjio-offr.live`) |
| **Flipkart** | 3 | SuperCoins bonus, festival lottery clone (`flipkart-offer-zone.shop`) |
| **Google Pay** | 2 | Scratch card cashback scam, UPI pin refund form |
| **ICICI Prudential** | 2 | Insurance policy bonus payout, unclaimed dividend |
| **Paytm** | 2 | Paytm wallet KYC block, cashback reward claim |
| **IRCTC** | 1 | Tatkal ticket booking confirmation alert, refund cancellation |
| **Myntra** | 1 | Brand influencer scam, fashion sale clone |
| **Total** | **4,241** | |

---

## 8. Dataset Summary & Final Metrics

| Dataset File | Total Rows | Phishing ($1$) | Legitimate ($0$) | Unique Registered Domains | Domain Overlap with Other Split |
|---|:---:|:---:|:---:|:---:|:---:|
| `data/urls/train.csv` | **4,967** | 2,567 | 2,400 | 3,668 | **0** |
| `data/urls/test.csv` | **1,033** | 433 | 600 | 919 | **0** |
| **Combined Benchmark** | **6,000** | **3,000** | **3,000** | **4,587** | **0** |
| `data/urls/india_phishing.csv` | **4,241** | 4,241 | 0 | 2,891 | N/A (Specialized subset) |
| `data/urls/sample.csv` | **80** | 49 | 31 | 75 | Fully Defanged |

### Standard Columns
All CSV files adhere to a consistent schema:
* `url`: Normalized URL string (defanged in `sample.csv`).
* `label`: Binary classification target (`1` = Phishing, `0` = Legitimate).
* `source`: Data source identifier (`OpenPhish`, `Phishing.Database`, `Tranco (Rank 1-50k)`, `Tranco (Rank 50k-100k)`).
* `date_collected`: ISO 8601 date stamp of collection (`YYYY-MM-DD`).
* `registered_domain`: Extracted `domain.suffix` via `tldextract`.

---

## 9. Representative Sample Dataset (`sample.csv`) & Defanging Protocol

For safe inspection, documentation, and sharing without triggering browser security warnings or web mail filters, all 80 URLs in `data/urls/sample.csv` are **strictly defanged**:
* `http://` $\rightarrow$ `hxxp://`
* `https://` $\rightarrow$ `hxxps://`
* All embedded query URLs (e.g. OpenID redirect parameters) $\rightarrow$ `hxxp://` / `hxxps://`
* All periods `.` $\rightarrow$ `[.]`

**Example Defanged Entries:**
```text
hxxps://rewardssbi[.]pages[.]dev/
hxxps://sbibank-kyc[.]in/wait[.]php
hxxps://indiapost-goov[.]cfd/i
hxxps://jiorechargee[.]shop/
hxxps://google[.]com/
```
No live or clickable hyperlinks exist in `sample.csv`.

---

## 10. Known Limitations & Data-Source Restrictions

1. **OpenPhish Community Feed Quota:** The public OpenPhish feed is limited to ~200–500 live links at any given point in time. It provides high-fidelity zero-hour phishing links but must be paired with repositories like Phishing.Database to construct multi-thousand URL datasets.
2. **Phishing.Database Structure Changes:** The repository periodically renames its active daily files (e.g., `phishing-links-ACTIVE-TODAY.txt` returned HTTP 404 while `phishing-links-ACTIVE.txt` was active and contained 789k+ links). The pipeline includes automated fallback logic to ensure uninterrupted execution.
3. **Tranco Subpage Distribution:** Tranco provides registered root domains (`example.com`). In the pipeline, legitimate URLs are standardized with scheme and root paths (`https://example.com/`). Real-world legitimate traffic features varied subdirectories, which Teammate 1/3 feature extractors should take into account.
4. **RBI `.bank.in` Banking Domain Transition:** As of 2025–2026, Indian banks have migrated primary netbanking portals to `.bank.in` under RBI directives. Detectors must cross-reference both new `.bank.in` and legacy domains (`.com`, `.co.in`, `.sbi`) recorded in `backend/data/brands.json`.
