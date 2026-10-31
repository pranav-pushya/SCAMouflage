#!/usr/bin/env python3
"""
Scamouflage - URL Dataset Collection & Preprocessing Pipeline
Teammate 2: URL Engine & Brand Dataset Lead

This script collects, cleans, processes, and splits phishing and legitimate URLs
to create benchmark datasets for AI-powered phishing and scam detection.

Key Pipeline Steps:
1. Source Verification & Downloading (OpenPhish, Phishing.Database, Tranco).
2. URL Normalization, Sanitization, and Deduplication.
3. India-Specific Phishing Identification (Evidentiary matching against backend/data/brands.json).
4. Domain-Based Group Train-Test Splitting (Zero registered-domain leakage).
5. Safe Defanged Representative Sample Generation (hxxp and [.] replacement).
"""

import os
import re
import sys
import json
import random
import zipfile
import argparse
import datetime
from pathlib import Path
from urllib.parse import urlparse, urlunparse

import requests
import pandas as pd
import tldextract

# Configure tldextract for fast, offline extraction
EXTRACTOR = tldextract.TLDExtract(suffix_list_urls=None)

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DEFAULT_URLS_DIR = PROJECT_ROOT / "data" / "urls"
DEFAULT_BRANDS_FILE = PROJECT_ROOT / "backend" / "data" / "brands.json"

# Feed Sources configuration
FEED_SOURCES = {
    "openphish": {
        "name": "OpenPhish Community Feed",
        "url": "https://openphish.com/feed.txt",
        "filename": "openphish.txt",
        "description": "Real-time community feed of active phishing URLs"
    },
    "phishing_database": {
        "name": "Phishing.Database Active Links",
        "url": "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt",
        "fallback_url": "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE-TODAY.txt",
        "filename": "phishing_database_active.txt",
        "description": "Curated threat intelligence database of active phishing links"
    },
    "tranco": {
        "name": "Tranco Top-1M List",
        "url": "https://tranco-list.eu/top-1m.csv.zip",
        "filename": "tranco_top1m.csv.zip",
        "description": "Research-oriented top website ranking list"
    }
}

USER_AGENT = "Scamouflage-Dataset-Pipeline/1.0 (+https://github.com/scamouflage-project)"

# High-confidence brand impersonation patterns for Indian brands
BRAND_PATTERNS = {
    "SBI": [r"\bonlinesbi\b", r"\byonosbi\b", r"\bstatebankofindia\b", r"\bsbi-?\w*(?:bank|kyc|yono|login|reward|otp|online|portal|verify|account)", r"(?:bank|kyc|yono|login|reward|otp|online|portal|verify|account)-?\w*sbi\b"],
    "HDFC Bank": [r"\bhdfcbank\b", r"\bhdfcnetbanking\b", r"\bhdfc-?\w*(?:bank|kyc|login|otp|portal|verify|loan|netbanking)"],
    "ICICI Bank": [r"\bicicibank\b", r"\bicicinetbanking\b", r"\bicici-?\w*(?:bank|kyc|login|otp|portal|verify|netbanking)"],
    "Axis Bank": [r"\baxisbank\b", r"\baxisnetbanking\b", r"\baxis-?\w*(?:bank|kyc|login|otp|portal|verify|netbanking)"],
    "PNB": [r"\bpnbindia\b", r"\bpnbnetbanking\b", r"\bpunjabnationalbank\b", r"\bpnb-?\w*(?:bank|kyc|login|otp|portal|verify|netbanking)"],
    "Kotak Mahindra Bank": [r"\bkotakbank\b", r"\bkotak811\b", r"\bkotaknetbanking\b", r"\bkotak-?\w*(?:bank|kyc|811|login|otp|portal|verify)"],
    "Bank of Baroda": [r"\bbankofbaroda\b", r"\bbobworld\b", r"\bbobibanking\b"],
    "Paytm": [r"\bpaytm\b", r"\bpaytmbank\b", r"\bpaytmpayments\b", r"\bpaytmwallet\b"],
    "PhonePe": [r"\bphonepe\b", r"\bphonepebusiness\b"],
    "Google Pay": [r"\bgooglepay\b", r"\bgpay\b"],
    "BHIM": [r"\bbhimupi\b", r"\bbhim-?\w*(?:upi|pay|login|otp)"],
    "CRED": [r"\bcredclub\b", r"\bcred-?(?:app|club|pay|login|bill|reward)\b"],
    "MobiKwik": [r"\bmobikwik\b", r"\bzipemi\b", r"\bmobikwikwallet\b"],
    "Razorpay": [r"\brazorpay\b", r"\brazorpayx\b"],
    "India Post": [r"\bindiapost\b", r"\bspeedpost\b", r"\bippb\b", r"\bindia-?post\b"],
    "Income Tax Department": [r"\bincometax\b", r"\bincometaxindia\b", r"\bincometaxefiling\b"],
    "UIDAI": [r"\buidai\b", r"\baadhaar\b", r"\bmyaadhaar\b", r"\beaadhaar\b"],
    "EPFO": [r"\bepfo\b", r"\bepfindia\b", r"\bepfpassbook\b", r"\bmemberesewa\b", r"\buanmember\b"],
    "IRCTC": [r"\birctc\b", r"\birctctourism\b", r"\birctctrain\b"],
    "NHAI": [r"\bnhai\b", r"\brajmargyatra\b"],
    "FASTag": [r"\bfastag\b", r"\bihmcl\b"],
    "Jio": [r"\bmyjio\b", r"\bjiotv\b", r"\bjiofiber\b", r"\bjiocinema\b", r"\bjio-?\w*(?:sim|recharge|5g|4g|offer|login|plan|prepaid)"],
    "Airtel": [r"\bairtel\b", r"\bairtelthanks\b", r"\bairtelpayment\b", r"\bairtelpaymentsbank\b"],
    "Vi": [r"\bmyvi\b", r"\bvodafoneidea\b", r"\bvodafone-?\w*(?:recharge|bill|plan|sim|india|in)"],
    "Amazon": [r"\bamazon\b", r"\bamazonin\b", r"\bamazonpay\b"],
    "Flipkart": [r"\bflipkart\b", r"\bsupercoins\b"],
    "Meesho": [r"\bmeesho\b", r"\bmeeshosupplier\b"],
    "Myntra": [r"\bmyntra\b", r"\bmyntrainsider\b"],
    "JioMart": [r"\bjiomart\b", r"\bjiomartgrocery\b"],
    "Blue Dart": [r"\bbluedart\b", r"\btrackdart\b"],
    "Delhivery": [r"\bdelhivery\b", r"\bdelhiverydirect\b", r"\bdelhiveryexpress\b"],
    "DTDC": [r"\bdtdc\b", r"\bdtdctracking\b", r"\bdtdcexpress\b"],
    "LIC": [r"\blicindia\b", r"\blicpolicy\b", r"\blicpremium\b", r"\blic-?\w*(?:policy|premium|insurance|portal|login|bonus)"],
    "HDFC Life": [r"\bhdfclife\b", r"\bhdfclifeinsurance\b"],
    "ICICI Prudential": [r"\biciciprulife\b", r"\bicicilife\b", r"\biciciprudential\b"],
    "SBI Life": [r"\bsbilife\b", r"\bsbilifeinsurance\b"],
    "DigiLocker": [r"\bdigilocker\b"],
    "Zerodha": [r"\bzerodha\b", r"\bkitezerodha\b", r"\bcoinzerodha\b"],
    "Groww": [r"\bgroww\b", r"\bgrowwinvest\b"],
    "Tata Neu": [r"\btataneu\b", r"\bneupass\b", r"\bneucoins\b"]
}


def log(msg: str):
    """Timestamped stdout logger."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] {msg}", flush=True)


def check_source_availability(url: str, timeout: int = 10) -> bool:
    """Check whether a remote source is accessible before downloading."""
    try:
        r = requests.head(url, headers={"User-Agent": USER_AGENT}, timeout=timeout, allow_redirects=True)
        if r.status_code == 200:
            return True
        r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout, stream=True)
        return r.status_code == 200
    except Exception as e:
        log(f"Source availability check note for {url}: {e}")
        return False


def download_feed(url: str, dest_path: Path, description: str, fallback_url: str = None) -> bool:
    """Download a raw feed file with streaming and error handling."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    target_url = url
    log(f"Checking availability of {description} ({target_url})...")
    if not check_source_availability(target_url):
        if fallback_url and check_source_availability(fallback_url):
            log(f"Primary URL failed, using fallback URL: {fallback_url}")
            target_url = fallback_url
        else:
            log(f"Error: {description} is currently unreachable.")
            return False

    log(f"Downloading {description} -> {dest_path.name}...")
    try:
        with requests.get(target_url, headers={"User-Agent": USER_AGENT}, stream=True, timeout=60) as r:
            r.raise_for_status()
            with open(dest_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=65536):
                    if chunk:
                        f.write(chunk)
        log(f"Successfully downloaded {dest_path.name} ({dest_path.stat().st_size:,} bytes).")
        return True
    except Exception as e:
        log(f"Error downloading {description}: {e}")
        if dest_path.exists():
            dest_path.unlink()
        return False


def clean_and_normalize_url(raw_url: str) -> tuple[str, str]:
    """
    Clean and normalize URL:
    - Strips whitespace.
    - Normalizes scheme and netloc to lowercase.
    - Preserves path and query parameters for detection features.
    - Extracts registered domain.
    Returns: (normalized_url, registered_domain) or (None, None) if invalid.
    """
    if not raw_url or not isinstance(raw_url, str):
        return None, None
    url = raw_url.strip()
    if not url:
        return None, None
        
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
        
    try:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        if scheme not in ("http", "https"):
            return None, None
            
        netloc = parsed.netloc.lower().strip()
        if not netloc:
            return None, None
            
        # Strip default port numbers
        if netloc.endswith(":80") and scheme == "http":
            netloc = netloc[:-3]
        elif netloc.endswith(":443") and scheme == "https":
            netloc = netloc[:-4]
            
        ext = EXTRACTOR(netloc)
        if not ext.domain:
            return None, None
            
        registered_domain = f"{ext.domain}.{ext.suffix}".lower() if ext.suffix else ext.domain.lower()
        path = parsed.path if parsed.path else "/"
        
        normalized_url = urlunparse((
            scheme,
            netloc,
            path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        return normalized_url, registered_domain
    except Exception:
        return None, None


def load_openphish_urls(filepath: Path) -> list[dict]:
    """Parse phishing URLs from OpenPhish community feed."""
    urls = []
    if not filepath.exists():
        return urls
    today = datetime.date.today().isoformat()
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                norm_url, reg_domain = clean_and_normalize_url(line)
                if norm_url and reg_domain:
                    urls.append({
                        "url": norm_url,
                        "label": 1,
                        "source": "OpenPhish",
                        "date_collected": today,
                        "registered_domain": reg_domain
                    })
    log(f"Parsed {len(urls)} valid URLs from OpenPhish.")
    return urls


def load_phishing_database_urls(filepath: Path, limit: int = None, sample_reservoir: bool = True, seed: int = 42) -> list[dict]:
    """Parse phishing URLs from Phishing.Database active links file using reservoir sampling or head."""
    urls = []
    if not filepath.exists():
        return urls
    today = datetime.date.today().isoformat()
    
    # Read and clean lines
    log(f"Reading phishing URLs from {filepath.name}...")
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f):
            line = line.strip()
            if line and not line.startswith("#"):
                norm_url, reg_domain = clean_and_normalize_url(line)
                if norm_url and reg_domain:
                    urls.append({
                        "url": norm_url,
                        "label": 1,
                        "source": "Phishing.Database",
                        "date_collected": today,
                        "registered_domain": reg_domain
                    })
            if limit and not sample_reservoir and len(urls) >= limit:
                break
                
    log(f"Parsed {len(urls)} total valid URLs from {filepath.name}.")
    if limit and len(urls) > limit:
        rng = random.Random(seed)
        urls = rng.sample(urls, limit)
        log(f"Sampled {len(urls)} URLs from {filepath.name}.")
    return urls


def extract_confirmed_india_phishing(raw_file: Path, openphish_file: Path, brands_file: Path) -> pd.DataFrame:
    """
    Extract confirmed India-specific brand phishing URLs using strict evidentiary matching:
    1. Threat-intelligence verified phishing link.
    2. Registered domain is NOT an official domain of the targeted brand.
    3. Brand pattern matches as a discrete token or brand-prefixed phishing compound.
    """
    if not brands_file.exists():
        log(f"Error: Brands file {brands_file} does not exist.")
        return pd.DataFrame()

    with open(brands_file, "r", encoding="utf-8") as f:
        brands = json.load(f)

    # Precompile regex
    compiled_patterns = {}
    for brand, pat_list in BRAND_PATTERNS.items():
        combined = "|".join(f"(?:{p})" for p in pat_list)
        compiled_patterns[brand] = re.compile(combined, re.IGNORECASE)

    official_domains = {}
    for b in brands:
        official_domains[b["name"]] = set(d.lower() for d in b["official_domains"])

    today = datetime.date.today().isoformat()
    matched_records = []
    seen_urls = set()

    for fpath, src_name in [(openphish_file, "OpenPhish"), (raw_file, "Phishing.Database")]:
        if not fpath.exists():
            continue
        log(f"Scanning {src_name} ({fpath.name}) for confirmed Indian brand impersonations...")
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                url_clean, reg_domain = clean_and_normalize_url(line)
                if not url_clean or not reg_domain:
                    continue
                if url_clean in seen_urls:
                    continue

                url_lower = url_clean.lower()
                for brand, pat in compiled_patterns.items():
                    if reg_domain in official_domains.get(brand, set()):
                        continue  # Legitimate official domain
                    m = pat.search(url_lower)
                    if m:
                        matched_text = m.group(0)
                        seen_urls.add(url_clean)
                        matched_records.append({
                            "url": url_clean,
                            "label": 1,
                            "source": src_name,
                            "date_collected": today,
                            "registered_domain": reg_domain,
                            "targeted_brand": brand,
                            "matched_keyword": matched_text
                        })
                        break

    india_df = pd.DataFrame(matched_records)
    log(f"Extracted {len(india_df)} confirmed India-specific phishing URLs across {len(india_df['targeted_brand'].unique())} brands.")
    return india_df


def load_tranco_legitimate_urls(
    zip_path: Path,
    train_range: tuple[int, int] = (1, 50000),
    test_range: tuple[int, int] = (50001, 100000),
    train_target: int = 2400,
    test_target: int = 600,
    phish_test_domains: set = None,
    phish_train_domains: set = None,
    seed: int = 42
) -> tuple[list[dict], list[dict]]:
    """
    Extract legitimate domains from Tranco Top-1M using non-overlapping rank ranges,
    with strict exclusion of any domains present in the opposing phishing split.
    """
    if not zip_path.exists():
        log(f"Warning: Tranco archive {zip_path} not found.")
        return [], []

    phish_test_domains = phish_test_domains or set()
    phish_train_domains = phish_train_domains or set()
    today = datetime.date.today().isoformat()

    train_candidates = []
    test_candidates = []

    log(f"Reading Tranco Top-1M archive {zip_path.name}...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        csv_filename = [name for name in zf.namelist() if name.endswith(".csv")][0]
        with zf.open(csv_filename) as f:
            for line_bytes in f:
                line = line_bytes.decode("utf-8", errors="ignore").strip()
                if not line or "," not in line:
                    continue
                parts = line.split(",", 1)
                try:
                    rank = int(parts[0].strip())
                    domain_name = parts[1].strip().lower()
                except ValueError:
                    continue

                if train_range[0] <= rank <= train_range[1]:
                    # Exclude domain if it exists in phishing test split
                    if domain_name not in phish_test_domains:
                        train_candidates.append(domain_name)
                elif test_range[0] <= rank <= test_range[1]:
                    # Exclude domain if it exists in phishing train split or train candidates
                    if domain_name not in phish_train_domains and domain_name not in train_candidates:
                        test_candidates.append(domain_name)

                if rank > max(train_range[1], test_range[1]):
                    break

    log(f"Filtered Tranco candidates: {len(train_candidates)} for train (Rank 1-50k), {len(test_candidates)} for test (Rank 50k-100k).")

    rng = random.Random(seed)
    selected_train = rng.sample(train_candidates, min(train_target, len(train_candidates)))
    # Ensure selected test has zero overlap with selected train
    train_domain_set = set(selected_train)
    available_test = [d for d in test_candidates if d not in train_domain_set]
    selected_test = rng.sample(available_test, min(test_target, len(available_test)))

    train_records = []
    for d in selected_train:
        url = f"https://{d}/"
        norm_url, reg_domain = clean_and_normalize_url(url)
        if norm_url and reg_domain:
            train_records.append({
                "url": norm_url,
                "label": 0,
                "source": "Tranco (Rank 1-50k)",
                "date_collected": today,
                "registered_domain": reg_domain
            })

    test_records = []
    for d in selected_test:
        url = f"https://{d}/"
        norm_url, reg_domain = clean_and_normalize_url(url)
        if norm_url and reg_domain:
            test_records.append({
                "url": norm_url,
                "label": 0,
                "source": "Tranco (Rank 50k-100k)",
                "date_collected": today,
                "registered_domain": reg_domain
            })

    log(f"Created {len(train_records)} legitimate train URLs and {len(test_records)} legitimate test URLs.")
    return train_records, test_records


def split_datasets_without_leakage(
    phishing_df: pd.DataFrame,
    tranco_zip: Path,
    train_ratio: float = 0.8,
    phish_target: int = 3000,
    legit_target: int = 3000,
    seed: int = 42
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split the dataset by registered domain to ensure ZERO domain leakage.
    - Groups phishing URLs by registered domain and assigns 80% to train, 20% to test.
    - Samples legitimate URLs from disjoint Tranco ranks while strictly preventing cross-split collisions.
    """
    rng = random.Random(seed)

    # Group phishing URLs by registered domain
    domain_groups = phishing_df.groupby("registered_domain")
    unique_domains = list(domain_groups.groups.keys())
    rng.shuffle(unique_domains)

    split_idx = int(len(unique_domains) * train_ratio)
    phish_train_domains = set(unique_domains[:split_idx])
    phish_test_domains = set(unique_domains[split_idx:])

    phish_train = phishing_df[phishing_df["registered_domain"].isin(phish_train_domains)]
    phish_test = phishing_df[phishing_df["registered_domain"].isin(phish_test_domains)]

    legit_train_target = int(legit_target * train_ratio)
    legit_test_target = legit_target - legit_train_target

    legit_train_records, legit_test_records = load_tranco_legitimate_urls(
        tranco_zip,
        train_range=(1, 50000),
        test_range=(50001, 100000),
        train_target=legit_train_target,
        test_target=legit_test_target,
        phish_test_domains=phish_test_domains,
        phish_train_domains=phish_train_domains,
        seed=seed
    )

    legit_train_df = pd.DataFrame(legit_train_records)
    legit_test_df = pd.DataFrame(legit_test_records)

    train_df = pd.concat([phish_train, legit_train_df], ignore_index=True)
    test_df = pd.concat([phish_test, legit_test_df], ignore_index=True)

    # Shuffle splits
    train_df = train_df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    test_df = test_df.sample(frac=1.0, random_state=seed).reset_index(drop=True)

    # Assert strictly zero domain overlap
    train_domains = set(train_df["registered_domain"])
    test_domains = set(test_df["registered_domain"])
    overlap = train_domains.intersection(test_domains)

    if overlap:
        raise ValueError(f"Domain leakage detected! Overlapping domains: {list(overlap)[:5]}")

    log(f"Strict domain-split validation passed: 0 overlapping domains between train ({len(train_domains)} domains) and test ({len(test_domains)} domains).")
    return train_df, test_df


def defang_url(url: str) -> str:
    """
    Defang a URL for safe storage and inspection:
    - Replaces 'https://' with 'hxxps://' and 'http://' with 'hxxp://'
    - Replaces all 'http' instances (including embedded query URLs) with 'hxxp'
    - Replaces all dots '.' with '[.]'
    Guarantees no clickable or live hyperlinks remain anywhere in the URL string.
    """
    if not url:
        return ""
    # Defang all protocols and embedded URLs
    defanged = url.replace("https://", "hxxps://").replace("http://", "hxxp://")
    defanged = re.sub(r"https?", lambda m: "hxxps" if m.group(0).lower() == "https" else "hxxp", defanged, flags=re.IGNORECASE)
    return defanged.replace(".", "[.]")


def create_defanged_sample(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    india_df: pd.DataFrame,
    total_samples: int = 80,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate data/urls/sample.csv with 50-100 representative URLs.
    Includes phishing, legitimate, and India-targeted URLs.
    All URLs are defanged.
    """
    samples = []
    
    # 1. India Phishing Samples (up to 15)
    if not india_df.empty:
        n_india = min(15, len(india_df))
        sampled_india = india_df.sample(n=n_india, random_state=seed)
        for _, row in sampled_india.iterrows():
            samples.append({
                "url": defang_url(row["url"]),
                "label": int(row["label"]),
                "source": f"{row['source']} (India Phishing: {row['targeted_brand']})",
                "date_collected": row["date_collected"],
                "registered_domain": defang_url(row["registered_domain"])
            })

    # 2. General Phishing Samples (35)
    phish_pool = train_df[train_df["label"] == 1]
    sampled_phish = phish_pool.sample(n=min(35, len(phish_pool)), random_state=seed)
    for _, row in sampled_phish.iterrows():
        samples.append({
            "url": defang_url(row["url"]),
            "label": int(row["label"]),
            "source": row["source"],
            "date_collected": row["date_collected"],
            "registered_domain": defang_url(row["registered_domain"])
        })

    # 3. Legitimate Samples (30)
    legit_pool = train_df[train_df["label"] == 0]
    sampled_legit = legit_pool.sample(n=min(30, len(legit_pool)), random_state=seed)
    for _, row in sampled_legit.iterrows():
        samples.append({
            "url": defang_url(row["url"]),
            "label": int(row["label"]),
            "source": row["source"],
            "date_collected": row["date_collected"],
            "registered_domain": defang_url(row["registered_domain"])
        })

    sample_df = pd.DataFrame(samples).drop_duplicates(subset=["url"]).reset_index(drop=True)
    log(f"Generated {len(sample_df)} defanged representative URLs for sample.csv.")
    return sample_df


def main():
    parser = argparse.ArgumentParser(description="Scamouflage URL Dataset Collection & Preprocessing Pipeline")
    parser.add_argument("--phishing-target", type=int, default=3000, help="Target number of unique phishing URLs (default: 3000)")
    parser.add_argument("--legitimate-target", type=int, default=3000, help="Target number of unique legitimate URLs (default: 3000)")
    parser.add_argument("--train-ratio", type=float, default=0.8, help="Ratio of data allocated to training (default: 0.8)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    parser.add_argument("--force-download", action="store_true", help="Force re-download of raw feeds")
    parser.add_argument("--raw-dir", type=str, default=str(DEFAULT_RAW_DIR), help="Directory to store raw feeds")
    parser.add_argument("--urls-dir", type=str, default=str(DEFAULT_URLS_DIR), help="Directory to output CSV datasets")
    parser.add_argument("--brands-file", type=str, default=str(DEFAULT_BRANDS_FILE), help="Path to brands.json")

    args = parser.parse_args()

    raw_dir = Path(args.raw_dir)
    urls_dir = Path(args.urls_dir)
    brands_file = Path(args.brands_file)

    raw_dir.mkdir(parents=True, exist_ok=True)
    urls_dir.mkdir(parents=True, exist_ok=True)

    log("==================================================================")
    log("Scamouflage URL Engine: Dataset Collection & Preprocessing")
    log("==================================================================")

    # -------------------------------------------------------------
    # Step 1: Download Feeds (if needed)
    # -------------------------------------------------------------
    openphish_file = raw_dir / FEED_SOURCES["openphish"]["filename"]
    if args.force_download or not openphish_file.exists():
        download_feed(FEED_SOURCES["openphish"]["url"], openphish_file, FEED_SOURCES["openphish"]["name"])

    phish_db_file = raw_dir / FEED_SOURCES["phishing_database"]["filename"]
    if args.force_download or not phish_db_file.exists():
        download_feed(
            FEED_SOURCES["phishing_database"]["url"],
            phish_db_file,
            FEED_SOURCES["phishing_database"]["name"],
            fallback_url=FEED_SOURCES["phishing_database"].get("fallback_url")
        )

    tranco_file = raw_dir / FEED_SOURCES["tranco"]["filename"]
    if args.force_download or not tranco_file.exists():
        download_feed(FEED_SOURCES["tranco"]["url"], tranco_file, FEED_SOURCES["tranco"]["name"])

    # -------------------------------------------------------------
    # Step 2: Extract Confirmed India-Specific Phishing Dataset
    # -------------------------------------------------------------
    india_df = extract_confirmed_india_phishing(phish_db_file, openphish_file, brands_file)
    india_file = urls_dir / "india_phishing.csv"
    india_df.to_csv(india_file, index=False, encoding="utf-8")
    log(f"Saved confirmed India-specific phishing dataset -> {india_file} ({len(india_df):,} records).")

    # -------------------------------------------------------------
    # Step 3: Assemble Phishing Dataset (Target: 3,000 URLs)
    # -------------------------------------------------------------
    phishing_records = []
    
    # 3a. Add all OpenPhish URLs
    openphish_urls = load_openphish_urls(openphish_file)
    phishing_records.extend(openphish_urls)

    # 3b. Add confirmed India-specific phishing URLs into the dataset
    for _, row in india_df.iterrows():
        phishing_records.append({
            "url": row["url"],
            "label": 1,
            "source": row["source"],
            "date_collected": row["date_collected"],
            "registered_domain": row["registered_domain"]
        })

    # 3c. Add general phishing URLs from Phishing.Database to reach the target
    needed = max(0, (args.phishing_target * 2) - len(phishing_records))
    phish_db_urls = load_phishing_database_urls(phish_db_file, limit=needed, sample_reservoir=False, seed=args.seed)
    phishing_records.extend(phish_db_urls)

    phishing_df = pd.DataFrame(phishing_records).drop_duplicates(subset=["url"]).reset_index(drop=True)
    log(f"Total unique phishing URLs gathered: {len(phishing_df):,}.")

    if len(phishing_df) > args.phishing_target:
        phishing_df = phishing_df.sample(n=args.phishing_target, random_state=args.seed).reset_index(drop=True)
        log(f"Sampled exactly {args.phishing_target:,} unique phishing URLs.")
    else:
        log(f"Collected total available {len(phishing_df):,} phishing URLs.")

    # -------------------------------------------------------------
    # Step 4: Domain-Based Group Train-Test Split (with Tranco Legitimate URLs)
    # -------------------------------------------------------------
    train_df, test_df = split_datasets_without_leakage(
        phishing_df=phishing_df,
        tranco_zip=tranco_file,
        train_ratio=args.train_ratio,
        phish_target=args.phishing_target,
        legit_target=args.legitimate_target,
        seed=args.seed
    )

    train_file = urls_dir / "train.csv"
    test_file = urls_dir / "test.csv"

    # Select standard output columns
    output_cols = ["url", "label", "source", "date_collected", "registered_domain"]
    train_df[output_cols].to_csv(train_file, index=False, encoding="utf-8")
    test_df[output_cols].to_csv(test_file, index=False, encoding="utf-8")

    log(f"Saved clean training dataset -> {train_file} ({len(train_df):,} rows).")
    log(f"Saved clean testing dataset -> {test_file} ({len(test_df):,} rows).")

    # -------------------------------------------------------------
    # Step 5: Generate Defanged Representative Sample
    # -------------------------------------------------------------
    sample_df = create_defanged_sample(train_df, test_df, india_df, total_samples=80, seed=args.seed)
    sample_file = urls_dir / "sample.csv"
    sample_df[["url", "label", "source", "date_collected", "registered_domain"]].to_csv(sample_file, index=False, encoding="utf-8")
    log(f"Saved defanged representative sample -> {sample_file} ({len(sample_df):,} rows).")

    # -------------------------------------------------------------
    # Step 6: Summary Metrics
    # -------------------------------------------------------------
    phish_train_cnt = len(train_df[train_df["label"] == 1])
    legit_train_cnt = len(train_df[train_df["label"] == 0])
    phish_test_cnt = len(test_df[test_df["label"] == 1])
    legit_test_cnt = len(test_df[test_df["label"] == 0])

    log("==================================================================")
    log("PIPELINE SUMMARY & VERIFICATION METRICS")
    log("==================================================================")
    log(f"Total Phishing URLs Collected    : {len(phishing_df):,}")
    log(f"Total Legitimate URLs Collected  : {legit_train_cnt + legit_test_cnt:,}")
    log(f"Total Dataset Size               : {len(train_df) + len(test_df):,}")
    log(f"Training Dataset (train.csv)     : {len(train_df):,} (Phishing: {phish_train_cnt:,}, Legitimate: {legit_train_cnt:,})")
    log(f"Testing Dataset (test.csv)       : {len(test_df):,} (Phishing: {phish_test_cnt:,}, Legitimate: {legit_test_cnt:,})")
    log(f"India-Specific Phishing URLs     : {len(india_df):,} (india_phishing.csv)")
    log(f"Representative Sample (sample.csv): {len(sample_df):,} (All strictly defanged)")
    log("Zero Domain Leakage Status       : VERIFIED (0 registered domain overlap between train and test)")
    log("==================================================================")


if __name__ == "__main__":
    main()
