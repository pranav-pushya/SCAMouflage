"""Training script for PhishShield India Text Model.

Trains a character n-gram TF-IDF + Logistic Regression classifier on Indian SMS scam samples
(KYC, Digital Arrest, FASTag, Electricity, Part-time job scams in Hinglish, English, and Romanized Punjabi).
Outputs trained model artifact to backend/models/text_model.joblib.
"""

import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"

from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline


def main():
    root_dir = Path(__file__).resolve().parent.parent
    sms_dir = root_dir / "data" / "sms"
    nandita_train = sms_dir / "nandita.csv"
    nandita_test = sms_dir / "nandita_test.csv"
    temp_train = sms_dir / "temp_samples.csv"
    model_dir = root_dir / "backend" / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    out_model_path = model_dir / "text_model.joblib"

    print(f"Loading training data from {sms_dir}...")
    dfs = []
    if nandita_train.is_file():
        df_n = pd.read_csv(nandita_train)
        dfs.append(df_n[["text", "label"]])
        print(f"  Loaded {len(df_n)} rows from {nandita_train.name}")

    if temp_train.is_file():
        df_t = pd.read_csv(temp_train)
        dfs.append(df_t[["text", "label"]])
        print(f"  Loaded {len(df_t)} rows from {temp_train.name}")

    if not dfs:
        raise FileNotFoundError("No SMS training datasets found in data/sms/")

    train_df = pd.concat(dfs, ignore_index=True).drop_duplicates(subset=["text"])
    print(f"Total unique training samples: {len(train_df)}")

    # Build character n-gram pipeline
    # analyzer='char_wb' captures sub-word morphology and handles Hinglish typos robustly
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), min_df=1)),
        ("clf", LogisticRegression(solver="liblinear", class_weight="balanced", random_state=42)),
    ])

    print("Fitting model...")
    pipeline.fit(train_df["text"], train_df["label"])

    # Evaluation on holdout test set if available
    if nandita_test.is_file():
        test_df = pd.read_csv(nandita_test)
        preds = pipeline.predict(test_df["text"])
        acc = accuracy_score(test_df["label"], preds)
        print("\n" + "=" * 50)
        print(f"EVALUATION ON TEST SET ({len(test_df)} samples): Accuracy = {acc * 100:.2f}%")
        print("=" * 50)
        print(classification_report(test_df["label"], preds, digits=4))

    # Save model artifact with metadata
    artifact = {
        "model": pipeline,
        "classes": list(pipeline.classes_),
        "version": "1.0",
        "analyzer": "char_wb",
        "ngram_range": (2, 5),
    }

    joblib.dump(artifact, out_model_path)
    print(f"\nModel successfully saved to {out_model_path}")


if __name__ == "__main__":
    main()
