from pathlib import Path
import pandas as pd

cols = ["text", "label", "category", "style", "source"]

# Resolve path relative to this script's directory so it works regardless of current working directory
base_dir = Path(__file__).resolve().parent
tr = pd.read_csv(base_dir / "data" / "sms" / "nandita.csv")
te = pd.read_csv(base_dir / "data" / "sms" / "nandita_test.csv")

for name, df in [("train", tr), ("test", te)]:
    print(f"\n== {name}: {df.shape} ==")
    assert list(df.columns) == cols, "Column names are wrong"
    print(df["label"].value_counts().to_string())
    print(df["category"].value_counts().to_string())
    print(df["style"].value_counts().to_string())
    print("empty cells:", df.isna().sum().sum())
    print("bad labels:", (~df["label"].isin(["scam", "legit"])).sum())
    print("duplicate texts:", df["text"].duplicated().sum())

print("\ntrain/test overlap:", len(set(tr["text"]) & set(te["text"])))
