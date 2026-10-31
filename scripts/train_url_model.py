"""Train and evaluate the Random Forest URL classifier for PhishShield India.

Reads data/urls/train.csv and test.csv if available.
Features are strictly derived from hostname and scheme to prevent the model
from exploiting the path-length artifact between Tranco and phishing feeds.
"""

import os
import sys
from typing import Any

# Ensure backend directory is in sys.path to access engines
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score

from engines.url_engine import extract_features

# Feature list ordered consistently for training and inference
FEATURE_NAMES = [
    "host_length",
    "num_hyphens",
    "num_digits",
    "digit_ratio",
    "entropy",
    "subdomain_count",
    "is_punycode",
    "is_ip",
    "has_at_symbol",
    "is_suspicious_tld",
    "has_brand_keyword",
    "has_https",
]


def parse_label(label: Any) -> int:
    """Normalize labels into binary 0 (legit) and 1 (phishing)."""
    val = str(label).strip().lower()
    if val in ("1", "phishing", "bad", "malicious", "true"):
        return 1
    return 0


def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    train_csv = os.path.join(root_dir, "data", "urls", "train.csv")
    test_csv = os.path.join(root_dir, "data", "urls", "test.csv")
    model_dir = os.path.join(backend_dir, "models")
    model_output = os.path.join(model_dir, "url_model.joblib")

    if not os.path.isfile(train_csv) or not os.path.isfile(test_csv):
        print(f"[STAGE 5 SKIPPED] Dataset files not found:")
        print(f"  train: {train_csv} (exists: {os.path.isfile(train_csv)})")
        print(f"  test:  {test_csv} (exists: {os.path.isfile(test_csv)})")
        print("Stages 1-4 URL heuristic and RDAP engine remain fully functional without ML model.")
        return 0

    print(f"Loading datasets:\n  Train: {train_csv}\n  Test:  {test_csv}")
    train_df = pd.read_csv(train_csv)
    test_df = pd.read_csv(test_csv)

    print(f"Dataset sizes: Train={len(train_df)} rows, Test={len(test_df)} rows")

    y_train = [parse_label(l) for l in train_df["label"]]
    y_test = [parse_label(l) for l in test_df["label"]]

    print("Extracting lexical domain features (no path features to avoid Tranco bias)...")
    X_train = []
    for u in train_df["url"]:
        feats = extract_features(str(u))
        X_train.append([feats[name] for name in FEATURE_NAMES])

    X_test = []
    for u in test_df["url"]:
        feats = extract_features(str(u))
        X_test.append([feats[name] for name in FEATURE_NAMES])

    print("Training RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)...")
    clf = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Save model and feature names
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump({"model": clf, "feature_names": FEATURE_NAMES}, model_output)
    print(f"Model saved to: {model_output}")

    # Evaluate on Train to expose overfitting
    y_train_pred = clf.predict(X_train)
    train_prec = precision_score(y_train, y_train_pred, zero_division=0)
    train_rec = recall_score(y_train, y_train_pred, zero_division=0)
    train_f1 = f1_score(y_train, y_train_pred, zero_division=0)

    # Evaluate on Test ONCE
    y_test_pred = clf.predict(X_test)
    test_prec = precision_score(y_test, y_test_pred, zero_division=0)
    test_rec = recall_score(y_test, y_test_pred, zero_division=0)
    test_f1 = f1_score(y_test, y_test_pred, zero_division=0)

    cm = confusion_matrix(y_test, y_test_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    print("\n" + "=" * 50)
    print("MODEL EVALUATION RESULTS")
    print("=" * 50)
    print(f"Train Precision:           {train_prec:.4f}")
    print(f"Train Recall:              {train_rec:.4f}")
    print(f"Train F1:                  {train_f1:.4f}")
    print("-" * 50)
    print(f"Test Precision:            {test_prec:.4f}")
    print(f"Test Recall:               {test_rec:.4f}")
    print(f"Test F1:                   {test_f1:.4f}")
    print(f"Test False Positive Rate:  {fpr:.4f} ({fp}/{fp + tn})")
    print("\nConfusion Matrix (Test):")
    print(f"  TN: {tn} | FP: {fp}")
    print(f"  FN: {fn} | TP: {tp}")
    print("=" * 50)

    return 0


if __name__ == "__main__":
    sys.exit(main())
