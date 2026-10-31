"""Configuration and expert-assumed rule patterns for the Text Engine.

Stores regex patterns, weights, and user-facing Hinglish explanations for Indian SMS
and messaging scam detection. All weights are expert-assumed, tunable parameters.
"""

from typing import Any, Dict, List

# Scoring weights and regex definitions for India-focused scam categories
TEXT_RULES: List[Dict[str, Any]] = [
    {
        "code": "KYC_UPDATE",
        "weight": 0.50,
        "reason": "Fake KYC update ya document jama karne ki maang hai",
        "patterns": [
            r"\bkyc\s*(?:update|pending|incomplete|expire|suspended|verification|deactivated)\b",
            r"\bupdate\s+your\s+kyc\b",
            r"\bkyc\s*(?:karwa\s*lo|karwayen|karein|karo|bhejo|adhura|khatam|band)\b",
            r"\bkyc\s*(?:karvao|karao|karva\s*lo)\b",
            r"\bcomplete\s+your\s+kyc\b",
            r"\bkyc\s+dastavez\b",
        ],
    },
    {
        "code": "ACCOUNT_BLOCK_THREAT",
        "weight": 0.50,
        "reason": "Bank account ya card band hone ki dhamki di gayi hai",
        "patterns": [
            r"\b(?:account|card|sim|services?)\s*(?:will\s*be|has\s*been|is)\s*(?:blocked|suspended|deactivated|frozen|closed|terminated)\b",
            r"\bkhata\s*(?:band|block|suspend|freeze)\s*(?:ho\s*jayega|kar\s*diya|hoga)\b",
            r"\b(?:khata|account)\b.{0,50}\b(?:band|block|suspend|freeze)\s*(?:ho\s*jayega|kar\s*diya|hoga)?\b",
            r"\baccount\s*band\s*ho\s*jayega\b",
            r"\bkhatte\s*nu\s*block\b",
            r"\bkhata\s*band\s*hon\s*wala\s*hai\b",
            r"\bdeactivation\s*warning\b",
            r"\bto\s*avoid\s*(?:blocking|suspension|deactivation)\b",
        ],
    },
    {
        "code": "DIGITAL_ARREST",
        "weight": 0.65,
        "reason": "Digital arrest ya police/CBI case ki jhoothi dhamki hai",
        "patterns": [
            r"\b(?:digital\s*arrest|cbi|narcotics|ncb|mha|cyber\s*crime\s*cell|supreme\s*court)\b",
            r"\b(?:illegal\s*parcel|drugs?\s*found|contraband|money\s*laundering\s*case)\b",
            r"\b(?:arrest\s*warrant|police\s*case|fir\s*registered|court\s*summons?)\b",
            r"\b(?:video\s*call\s*investigation|stay\s*on\s*video\s*call|skype\s*call|camera\s*on)\b",
            r"\b(?:giraftari|arrest\s*ho\s*jaoge|digital\s*giraftari|police\s*inquiry)\b",
            r"\bparcel\s*me\s*(?:drugs|nasha|illegal)\b",
            r"\bvideo\s*call\s*(?:par\s*judo|chalu\s*rakho|pe\s*aao)\b",
        ],
    },
    {
        "code": "COURIER_CUSTOMS",
        "weight": 0.45,
        "reason": "Customs duty ya parcel fasne ka jhootha sandesh hai",
        "patterns": [
            r"\b(?:parcel|shipment|courier|consignment|package)\s*(?:held|detained|stopped|stuck|pending|undelivered)\b",
            r"\bcustoms?\s*(?:duty|fee|clearance|charges?|penalty|tax)\b",
            r"\bparcel\s*(?:ruka\s*hua\s*hai|fas\s*gaya|atack\s*gaya)\b",
            r"\bcustoms\s*charge\s*(?:bharna|dena)\s*padega\b",
            r"\bupdate\s*delivery\s*address\b",
            r"\bcourier\s*(?:hold|return|redelivery)\b",
        ],
    },
    {
        "code": "FASTAG",
        "weight": 0.40,
        "reason": "FASTag block hone ya recharge ke naam par fraud ka prayas",
        "patterns": [
            r"\bfastag\b.*?\b(?:blocked|blacklisted|expired|low\s*balance|deactivated|suspended|kyc|recharge)\b",
            r"\bfastag\s*(?:account\s*)?(?:is\s*)?(?:band|blocked|blacklisted|recharge|deactivated)\b",
            r"\bupdate\s*fastag\s*kyc\b",
            r"\btoll\s*(?:par\s*rukawat|clearance|penalty)\b",
        ],
    },
    {
        "code": "ELECTRICITY_DISCONNECT",
        "weight": 0.50,
        "reason": "Bijli connection kaatne ki farzi warning di gayi hai",
        "patterns": [
            r"\b(?:electricity|power|bijli)\s*(?:power|connection|supply)?\s*(?:will\s*be|is)\s*(?:disconnected|cut\s*off|terminated|suspended)\b",
            r"\bbijli\s*(?:kat\s*jayegi|band\s*ho\s*jayegi|kat\s*di\s*jayegi|katenge)\b",
            r"\bbijli\s*connection\s*(?:kat|band)\b",
            r"\bunpaid\s*(?:electricity\s*)?bill\b",
            r"\baaj\s*raat\s*(?:9|10|11|12)?\s*(?:baje\s*)?bijli\s*kat\b",
            r"\bbijli\s*kat\s*diti\s*javegi\b",
            r"\bpower\s*cut\s*(?:tonight|today)\b",
        ],
    },
    {
        "code": "AADHAAR_PAN_UPDATE",
        "weight": 0.45,
        "reason": "Aadhaar ya PAN link karne ke naam par phishing link hai",
        "patterns": [
            r"\b(?:aadhaar|aadhar|pan\s*card|pan)\s*(?:link|linking|update|mandatory|suspended|deactivated)\b",
            r"\blink\s+pan\s+with\s+(?:aadhaar|aadhar|bank)\b",
            r"\bpan\s*aadhaar\s*(?:link|jodein|karein)\b",
            r"\baadhaar\s*card\s*update\s*karayein\b",
            r"\bpan\s*card\s*(?:block|band)\s*ho\s*jayega\b",
            r"\bpan\s*link\s*nahi\s*kiya\s*toh\b",
        ],
    },
    {
        "code": "LOTTERY_KBC",
        "weight": 0.50,
        "reason": "Lottery ya KBC inaam ka farzi lalach diya gaya hai",
        "patterns": [
            r"\b(?:lottery|kbc|kaun\s*banega\s*crorepati|lucky\s*draw|jackpot)\b",
            r"\bcongratulations?\s*(?:you\s*have\s*)?won\b",
            r"\bwon\s*(?:cash|prize|car|iphone|amount|tata|harrier|crore|lakh)\b",
            r"\bkbc\s*(?:lottery|head\s*office|vijeta)\b",
            r"\b(?:25|50)\s*lakh\s*(?:ki\s*lottery|inaam|cash)\b",
            r"\binami\s*rashi\b",
            r"\bbadhai\s*ho\s*aapne\s*jita\b",
        ],
    },
    {
        "code": "JOB_TASK",
        "weight": 0.40,
        "reason": "Ghar baithe task karke paise kamane ka scam offer hai",
        "patterns": [
            r"\b(?:part[\s-]time\s*job|earn\s*daily|work\s*from\s*home|daily\s*income)\b",
            r"\b(?:like\s*and\s*subscribe|youtube\s*like|task[\s-]based\s*job)\b",
            r"\b(?:earn|kamayein)\s*(?:rs\.?|inr)?\s*\d{3,5}\s*(?:per\s*day|daily|rozana)\b",
            r"\bghar\s*baithe\s*kamayein\b",
            r"\bper\s*task\s*\d+\s*(?:rupaye|rs|inr)\b",
            r"\btelegram\s*(?:task|job|channel\s*join)\b",
        ],
    },
    {
        "code": "LOAN_APP",
        "weight": 0.40,
        "reason": "Bina documents turant loan dene ka sandigdh offer hai",
        "patterns": [
            r"\b(?:instant\s*loan|pre[\s-]approved\s*loan|loan\s*approved|loan\s*disbursal)\b",
            r"\b(?:no\s*cibil|no\s*documents?\s*required|zero\s*paperwork)\b",
            r"\bbina\s*kisi\s*document\s*(?:ke\s*)?loan\b",
            r"\bturant\s*loan\s*pao\b",
            r"\b\d+\s*minute\s*me\s*loan\b",
            r"\bloan\s*seedhe\s*khate\s*me\b",
        ],
    },
    {
        "code": "OTP_REQUEST",
        "weight": 0.60,
        "reason": "Aapse OTP ya secret code share karne ko kaha ja raha hai",
        "patterns": [
            r"\b(?:share|send|tell|give|forward|provide|batao|bataiye|batayein|bhejo)\s+(?:your\s+|me\s+|the\s+|apna\s+)?(?:otp|verification\s*code)\b",
            r"\b(?:otp|verification\s*code)\s*(?:ko\s*)?(?:share|send|tell|give|forward|provide|batao|bataiye|batayein|bhejo|dijiye)\b",
            r"\b(?:apna\s+)?otp\s+(?:karein|karo|batao|bataiye|bhejo)\b",
            r"\benter\s+otp\s+to\s+(?:unblock|continue|verify)\b",
        ],
    },
    {
        "code": "URGENCY",
        "weight": 0.25,
        "reason": "Jaldi karne aur samay seema ka dabav banaya ja raha hai",
        "patterns": [
            r"\b(?:urgently?|immediately|right\s*now|act\s*now|final\s*notice|last\s*chance)\b",
            r"\bwithin\s*(?:24|12|2|1)\s*(?:hours?|hrs?|ghante)\b",
            r"\baaj\s*hi\b",
            r"\babhi\s*turant\b",
            r"\bjaldi\s*(?:karein|karo)\b",
            r"\bwarna\s*abhi\s*band\s*hoga\b",
            r"\bhunn\s*hi\s*karo\b",
        ],
    },
    {
        "code": "LINK_PRESENT",
        "weight": 0.15,
        "reason": "Message me anjaan ya sandigdh link maujood hai",
        "patterns": [
            r"https?://[^\s<>'\"]+",
            r"hxxps?://[^\s<>'\"]+",
            r"\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|rb\.gy|shorturl\.at|wa\.me|t\.me)/[^\s<>'\"]+",
            r"\bwww\.[^\s<>'\"]+\.[a-z]{2,}\b",
        ],
    },
    {
        "code": "CALLBACK_NUMBER",
        "weight": 0.15,
        "reason": "Message me call karne ke liye phone number diya gaya hai",
        "patterns": [
            r"\b(?:call|contact|helpline|whatsapp|sampark|phone|dial)\s*(?:at|on|immediately|karein)?\s*:?\s*(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b",
            r"\bis\s*number\s*par\s*(?:call|sampark)\s*karein\b",
        ],
    },
    {
        "code": "MONEY_REQUEST",
        "weight": 0.35,
        "reason": "Shulk, charges ya paise transfer karne ki maang hai",
        "patterns": [
            r"\b(?:pay|transfer|send|deposit)\s+(?:fee|charges?|amount|money|rupees|rs\.?|inr)\b",
            r"\bprocessing\s*(?:fee|charges?)\b",
            r"\brefundable\s*deposit\b",
            r"\bpaise\s*(?:bhejo|transfer\s*karo|jama\s*karo)\b",
            r"\bshulk\s*jama\s*karein\b",
        ],
    },
]

# Patterns in legitimate transactional and security alert messages
LEGIT_OTP_WARNING_PATTERNS: List[str] = [
    r"do\s+not\s+share\s+(?:this\s+|your\s+)?otp",
    r"never\s+share\s+(?:this\s+|your\s+)?otp",
    r"kisi\s+ke\s+saath\s+share\s+na\s+karein",
    r"kisi\s+ko\s+(?:bhi\s+)?na\s+batayein",
    r"kisi\s+ko\s+mat\s+batana",
    r"kisi\s+nu\s+na\s+dasso",
    r"share\s+mat\s+karna",
    r"bank\s+never\s+asks\s+for\s+otp",
    r"otp\s+is\s+confidential",
    r"valid\s+for\s+\d+\s+mins?",
]

LEGIT_TXN_PATTERNS: List[str] = [
    r"\b(?:ac|a/c|account)\s+.*?\s+(?:debited|credited)\s+(?:for|by|with)\s+(?:rs\.?|inr)\b",
    r"\b(?:rs\.?|inr)\s*[\d,]+(?:\.\d{2})?\s+(?:debited|credited)\b",
    r"\bis\s+your\s+(?:secret\s+)?otp\b",
    r"\buse\s+otp\s+\d+\s+to\s+(?:login|authenticate)\b",
    r"\byour\s+one\s+time\s+password\s+(?:is|\:)\b",
]
