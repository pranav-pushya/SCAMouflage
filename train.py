from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# Resolve paths relative to script location
base_dir = Path(__file__).resolve().parent
train_path = base_dir / "data" / "sms" / "nandita.csv"
test_path = base_dir / "data" / "sms" / "nandita_test.csv"

# Load data
train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)

print(f"Loaded Train: {train_df.shape}, Test: {test_df.shape}")

# Create pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5))),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42))
])

# Fit on train
model.fit(train_df["text"], train_df["label"])

# Predict on test
y_pred = model.predict(test_df["text"])
test_df["pred"] = y_pred

# Print Classification Report
print("\n" + "=" * 50)
print("CLASSIFICATION REPORT")
print("=" * 50)
print(classification_report(test_df["label"], y_pred, digits=4))

# Confusion Matrix
print("\n" + "=" * 50)
print("CONFUSION MATRIX (labels: ['legit', 'scam'])")
print("=" * 50)
cm = confusion_matrix(test_df["label"], y_pred, labels=["legit", "scam"])
cm_df = pd.DataFrame(cm, index=["Actual Legit", "Actual Scam"], columns=["Pred Legit", "Pred Scam"])
print(cm_df)

# Accuracy Breakdown by Style
print("\n" + "=" * 50)
print("ACCURACY BY STYLE")
print("=" * 50)
for style in sorted(test_df["style"].unique()):
    sub = test_df[test_df["style"] == style]
    acc = accuracy_score(sub["label"], sub["pred"])
    print(f"Style: {style:10s} | Samples: {len(sub):2d} | Accuracy: {acc * 100:6.2f}%")

# Accuracy Breakdown by Category
print("\n" + "=" * 50)
print("ACCURACY BY CATEGORY")
print("=" * 50)
for cat in sorted(test_df["category"].unique()):
    sub = test_df[test_df["category"] == cat]
    acc = accuracy_score(sub["label"], sub["pred"])
    print(f"Category: {cat:15s} | Samples: {len(sub):2d} | Accuracy: {acc * 100:6.2f}%")

# Misclassified rows table
misclassified = test_df[test_df["label"] != test_df["pred"]]
print("\n" + "=" * 50)
print(f"MISCLASSIFIED TEST ROWS ({len(misclassified)} total)")
print("=" * 50)
if len(misclassified) == 0:
    print("None! All test rows classified correctly.")
else:
    for idx, row in misclassified.iterrows():
        print(f"\n[Index {idx}]")
        print(f"Text     : {row['text']}")
        print(f"Actual   : {row['label']}")
        print(f"Predicted: {row['pred']}")
        print(f"Category : {row['category']}")
        print(f"Style    : {row['style']}")
