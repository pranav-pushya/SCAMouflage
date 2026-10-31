"""Configuration and tunable parameters for the Fusion & Router layer."""

# Verdict risk thresholds
# Expert-assumed, tunable boundaries
VERDICT_THRESHOLDS = {
    "low": (0, 39),
    "medium": (40, 69),
    "high": (70, 100),
}

# Multi-engine weights for combined SMS + URL analysis
# Expert-assumed, tunable weights
WEIGHT_SMS_TEXT = 0.45
WEIGHT_SMS_URL = 0.55

# High-water mark trigger: if any single engine flags risk >= 70,
# overall verdict remains high risk so a benign text cannot dilute a phishing URL.
HIGH_RISK_TRIGGER = 70

# Official Verified Indian Helplines & Reporting Portals
HELPLINE_CYBERCRIME_PHONE = "1930"
HELPLINE_CYBERCRIME_PORTAL = "cybercrime.gov.in"
HELPLINE_SANCHAR_SAATHI_PORTAL = "sancharsaathi.gov.in/sfc"

# Standard next steps recommendations based on risk verdict
RECOMMENDED_NEXT_STEPS = {
    "high": [
        "Is message, email ya link par bilkul click na karein aur koi bhi file download na karein.",
        "Apna OTP, UPI PIN, password ya bank card details kisi se bhi share na karein.",
        "Agar koi paise kat gaye hain, to bina deri kiye 1930 Cyber Fraud Helpline par call karein ya cybercrime.gov.in par complaint darj karein.",
        "Apne bank ke official customer care number par turant call karke netbanking aur card block karwayen.",
        "Fraud sandesh ko Chakshu portal (sancharsaathi.gov.in) par report karein.",
    ],
    "medium": [
        "Satark rahein! Yeh sandesh sandigdha pratit ho raha hai.",
        "Kisi anjaan call ya message ke kehne par screen-sharing apps (AnyDesk, TeamViewer etc.) install na karein.",
        "Kewal official website ya verified mobile app ke madhyam se hi account status ya payment check karein.",
        "Sandigdha lagne par 1930 ya cybercrime.gov.in par report karein.",
    ],
    "low": [
        "Abhi ke liye koi sandigdha phishing gatividhi detect nahi hui hai, lekin savdhani bartein.",
        "Yaad rakhein: Bank ya sarkari vibhag kabhi bhi phone ya SMS par secret OTP ya password nahi maangte.",
        "Hamesha official bank portal aur HTTPS secure connections ka hi upyog karein.",
    ],
}

# Category-specific emergency alerts
CATEGORY_ALERTS = {
    "DIGITAL_ARREST": "CBI, Police ya Customs kabhi bhi WhatsApp/Skype video call par 'Digital Arrest' nahi karte - ye 100% fraud hai. Turant 1930 par call karein.",
    "ELECTRICITY_DISCONNECT": "Bijli vibhag SMS bhejkar raat ko light katne ki dhamki nahi deta - kisi anjaan helpline number par call na karein.",
    "COURIER_CUSTOMS": "India Post ya courier service parcels ke customs duty ke liye anjaan link par paise transfer karne ko nahi bolti.",
    "FASTAG": "FASTag block hone par kewal apne authorized bank app ya NHAI helpline 1033 par sampark karein.",
    "LOTTERY_KBC": "KBC ya kisi bhi lottery ka inam lene ke liye koi processing fee ya tax pehle jama nahi karna hota.",
}


def get_verdict(score: int | None) -> str:
    """Calculate categorical risk verdict from numeric risk score."""
    if score is None:
        return "low"
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"
