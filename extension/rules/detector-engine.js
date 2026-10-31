/**
 * PhishShield India - Comprehensive Scam & Phishing Detection Engine
 * Client-side detector mirroring backend rules for zero-latency real-time scanning.
 * Specialized for Indian vectors: KYC, FASTag, Electricity bill, Digital arrest, etc.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PhishDetector = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const TEXT_RULES = [
    {
      code: "KYC_UPDATE",
      name: "Fake KYC / Verification Scam",
      weight: 0.50,
      reason: "Fake KYC update ya document jama karne ki maang hai (Fake KYC threat)",
      patterns: [
        /\bkyc\s*(?:update|pending|incomplete|expire|suspended|verification|deactivated)\b/i,
        /\bupdate\s+your\s+kyc\b/i,
        /\bkyc\s*(?:karwa\s*lo|karwayen|karein|karo|bhejo|adhura|khatam|band)\b/i,
        /\bkyc\s*(?:karvao|karao|karva\s*lo)\b/i,
        /\bcomplete\s+your\s+kyc\b/i,
        /\bkyc\s+dastavez\b/i,
        /\bkyc\s+link\b/i
      ]
    },
    {
      code: "ACCOUNT_BLOCK_THREAT",
      name: "Account Suspension / Block Threat",
      weight: 0.50,
      reason: "Bank account, SIM ya card band hone ki dhamki di gayi hai (Account block threat)",
      patterns: [
        /\b(?:account|card|sim|services?)\s*(?:will\s*be|has\s*been|is)\s*(?:blocked|suspended|deactivated|frozen|closed|terminated)\b/i,
        /\bkhata\s*(?:band|block|suspend|freeze)\s*(?:ho\s*jayega|kar\s*diya|hoga)\b/i,
        /\b(?:khata|account)\b.{0,50}\b(?:band|block|suspend|freeze)\s*(?:ho\s*jayega|kar\s*diya|hoga)?\b/i,
        /\baccount\s*band\s*ho\s*jayega\b/i,
        /\bdeactivation\s*warning\b/i,
        /\bto\s*avoid\s*(?:blocking|suspension|deactivation)\b/i
      ]
    },
    {
      code: "DIGITAL_ARREST",
      name: "Digital Arrest / Police Extortion",
      weight: 0.65,
      reason: "Digital arrest ya police/CBI/Narcotics case ki jhoothi dhamki hai (Digital arrest scam)",
      patterns: [
        /\b(?:digital\s*arrest|cbi|narcotics|ncb|mha|cyber\s*crime\s*cell|supreme\s*court)\b/i,
        /\b(?:illegal\s*parcel|drugs?\s*found|contraband|money\s*laundering\s*case)\b/i,
        /\b(?:arrest\s*warrant|police\s*case|fir\s*registered|court\s*summons?)\b/i,
        /\b(?:video\s*call\s*investigation|stay\s*on\s*video\s*call|skype\s*call|camera\s*on)\b/i,
        /\b(?:giraftari|arrest\s*ho\s*jaoge|digital\s*giraftari|police\s*inquiry)\b/i,
        /\bparcel\s*me\s*(?:drugs|nasha|illegal)\b/i,
        /\bvideo\s*call\s*(?:par\s*judo|chalu\s*rakho|pe\s*aao)\b/i
      ]
    },
    {
      code: "COURIER_CUSTOMS",
      name: "Courier / Customs Parcel Fraud",
      weight: 0.45,
      reason: "Customs duty ya parcel fasne ka jhootha sandesh hai (Courier scam)",
      patterns: [
        /\b(?:parcel|shipment|courier|consignment|package)\s*(?:held|detained|stopped|stuck|pending|undelivered)\b/i,
        /\bcustoms?\s*(?:duty|fee|clearance|charges?|penalty|tax)\b/i,
        /\bparcel\s*(?:ruka\s*hua\s*hai|fas\s*gaya|atack\s*gaya)\b/i,
        /\bcustoms\s*charge\s*(?:bharna|dena)\s*padega\b/i,
        /\bupdate\s*delivery\s*address\b/i,
        /\bcourier\s*(?:hold|return|redelivery)\b/i
      ]
    },
    {
      code: "FASTAG",
      name: "FASTag Deactivation / Toll Scam",
      weight: 0.40,
      reason: "FASTag block hone ya recharge ke naam par fraud ka prayas (FASTag scam)",
      patterns: [
        /\bfastag\b.*?\b(?:blocked|blacklisted|expired|low\s*balance|deactivated|suspended|kyc|recharge)\b/i,
        /\bfastag\s*(?:account\s*)?(?:is\s*)?(?:band|blocked|blacklisted|recharge|deactivated)\b/i,
        /\bupdate\s*fastag\s*kyc\b/i,
        /\btoll\s*(?:par\s*rukawat|clearance|penalty)\b/i
      ]
    },
    {
      code: "ELECTRICITY_DISCONNECT",
      name: "Electricity Bill Disconnection Fraud",
      weight: 0.50,
      reason: "Bijli connection kaatne ki farzi warning di gayi hai (Electricity disconnection scam)",
      patterns: [
        /\b(?:electricity|power|bijli)\s*(?:power|connection|supply)?\s*(?:will\s*be|is)\s*(?:disconnected|cut\s*off|terminated|suspended)\b/i,
        /\bbijli\s*(?:ka?at\s*jayegi|band\s*ho\s*jayegi|ka?at\s*di\s*jayegi|ka?atenge)\b/i,
        /\bbijli\s*connection\s*(?:ka?at|band)\b/i,
        /\bunpaid\s*(?:electricity\s*)?bill\b/i,
        /\baaj\s*raat\s*(?:9|10|11|12)?\s*(?:baje\s*)?bijli\s*kat\b/i,
        /\bpower\s*cut\s*(?:tonight|today)\b/i
      ]
    },
    {
      code: "AADHAAR_PAN_UPDATE",
      name: "PAN / Aadhaar Linking Phishing",
      weight: 0.45,
      reason: "Aadhaar ya PAN link karne ke naam par sandigdh link diya gaya hai (Aadhaar/PAN phishing)",
      patterns: [
        /\b(?:aadhaar|aadhar|pan\s*card|pan)\s*(?:link|linking|update|mandatory|suspended|deactivated)\b/i,
        /\blink\s+pan\s+with\s+(?:aadhaar|aadhar|bank)\b/i,
        /\bpan\s*aadhaar\s*(?:link|jodein|karein)\b/i,
        /\baadhaar\s*card\s*update\s*karayein\b/i,
        /\bpan\s*card\s*(?:block|band)\s*ho\s*jayega\b/i
      ]
    },
    {
      code: "LOTTERY_KBC",
      name: "Lottery / Prize / KBC Fraud",
      weight: 0.50,
      reason: "Lottery ya KBC inaam ka farzi lalach diya gaya hai (Lottery scam)",
      patterns: [
        /\b(?:lottery|kbc|kaun\s*banega\s*crorepati|lucky\s*draw|jackpot)\b/i,
        /\bcongratulations?\s*(?:you\s*have\s*)?won\b/i,
        /\bwon\s*(?:cash|prize|car|iphone|amount|tata|harrier|crore|lakh)\b/i,
        /\bkbc\s*(?:lottery|head\s*office|vijeta)\b/i,
        /\b(?:25|50)\s*lakh\s*(?:ki\s*lottery|inaam|cash)\b/i,
        /\binami\s*rashi\b/i,
        /\bbadhai\s*ho\s*aapne\s*jita\b/i
      ]
    },
    {
      code: "JOB_TASK",
      name: "Work-From-Home / Task Scam",
      weight: 0.40,
      reason: "Ghar baithe video like karke paise kamane ka scam offer hai (Job/Task fraud)",
      patterns: [
        /\b(?:part[\s-]time\s*job|earn\s*daily|work\s*from\s*home|daily\s*income)\b/i,
        /\b(?:like\s*and\s*subscribe|youtube\s*like|task[\s-]based\s*job)\b/i,
        /\b(?:earn|kamayein)\s*(?:rs\.?|inr)?\s*\d{3,5}\s*(?:per\s*day|daily|rozana)\b/i,
        /\bghar\s*baithe\s*kamayein\b/i,
        /\btelegram\s*(?:task|job|channel\s*join)\b/i
      ]
    },
    {
      code: "LOAN_APP",
      name: "Instant / Unverified Loan Fraud",
      weight: 0.40,
      reason: "Bina documents turant loan dene ka sandigdh offer hai (Loan app scam)",
      patterns: [
        /\b(?:instant\s*loan|pre[\s-]approved\s*loan|loan\s*approved|loan\s*disbursal)\b/i,
        /\b(?:no\s*cibil|no\s*documents?\s*required|zero\s*paperwork)\b/i,
        /\bbina\s*kisi\s*document\s*(?:ke\s*)?loan\b/i,
        /\bturant\s*loan\s*pao\b/i,
        /\bloan\s*seedhe\s*khate\s*me\b/i
      ]
    },
    {
      code: "OTP_REQUEST",
      name: "OTP / Security Code Harvesting",
      weight: 0.60,
      reason: "Aapse OTP ya secret code share karne ko kaha ja raha hai (OTP harvesting threat)",
      patterns: [
        /\b(?:share|send|tell|give|forward|provide|batao|bataiye|batayein|bhejo)\s+(?:your\s+|me\s+|the\s+|apna\s+)?(?:otp|verification\s*code)\b/i,
        /\b(?:otp|verification\s*code)\s*(?:ko\s*)?(?:share|send|tell|give|forward|provide|batao|bataiye|batayein|bhejo|dijiye)\b/i,
        /\b(?:apna\s+)?otp\s+(?:karein|karo|batao|bataiye|bhejo)\b/i,
        /\benter\s+otp\s+to\s+(?:unblock|continue|verify)\b/i
      ]
    },
    {
      code: "URGENCY",
      name: "Artificial Urgency & Fear Pressure",
      weight: 0.25,
      reason: "Jaldi karne aur samay seema ka dabav banaya ja raha hai (High urgency pressure)",
      patterns: [
        /\b(?:urgently?|immediately|right\s*now|act\s*now|final\s*notice|last\s*chance)\b/i,
        /\bwithin\s*(?:24|12|2|1)\s*(?:hours?|hrs?|ghante)\b/i,
        /\baaj\s*hi\b/i,
        /\babhi\s*turant\b/i,
        /\bjaldi\s*(?:karein|karo)\b/i,
        /\bwarna\s*abhi\s*band\s*hoga\b/i
      ]
    },
    {
      code: "MONEY_REQUEST",
      name: "Fee / Money Transfer Demand",
      weight: 0.35,
      reason: "Shulk, charges ya paise transfer karne ki maang hai (Advance fee fraud)",
      patterns: [
        /\b(?:pay|transfer|send|deposit)\s+(?:fee|charges?|amount|money|rupees|rs\.?|inr)\b/i,
        /\bprocessing\s*(?:fee|charges?)\b/i,
        /\brefundable\s*deposit\b/i,
        /\bpaise\s*(?:bhejo|transfer\s*karo|jama\s*karo)\b/i
      ]
    },
    {
      code: "MALICIOUS_APK",
      name: "Malicious APK Download Link",
      weight: 0.60,
      reason: "Direct APK ya mobile application download link diya gaya hai (Malware/Spyware risk)",
      patterns: [
        /\.apk\b/i,
        /\bdownload\s+(?:app|application|update)\b.*?(?:https?:\/\/|\.apk)/i,
        /\b(?:app|software)\s+install\s+karein\b/i
      ]
    },
    {
      code: "SUSPICIOUS_SHORTENER",
      name: "Obfuscated / Shortened Link",
      weight: 0.20,
      reason: "Asli website chupane ke liye link shortener ka prayog kiya gaya hai (URL Shortener)",
      patterns: [
        /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|rb\.gy|shorturl\.at|is\.gd|ow\.ly|buff\.ly)\/[^\s<>'\"]+/i
      ]
    }
  ];

  const LEGIT_OTP_WARNINGS = [
    /do\s+not\s+share\s+(?:this\s+|your\s+)?otp/i,
    /never\s+share\s+(?:this\s+|your\s+)?otp/i,
    /kisi\s+ke\s+saath\s+share\s+na\s+karein/i,
    /kisi\s+ko\s+(?:bhi\s+)?na\s+batayein/i,
    /bank\s+never\s+asks\s+for\s+otp/i,
    /otp\s+is\s+confidential/i
  ];

  const LEGIT_TXN_PATTERNS = [
    /\b(?:ac|a\/c|account)\s+.*?\s+(?:debited|credited)\s+(?:for|by|with)\s+(?:rs\.?|inr)\b/i,
    /\b(?:rs\.?|inr)\s*[\d,]+(?:\.\d{2})?\s+(?:debited|credited)\b/i,
    /\bis\s+your\s+(?:secret\s+)?otp\b/i,
    /\buse\s+otp\s+\d+\s+to\s+(?:login|authenticate)\b/i
  ];

  const SUSPICIOUS_TLDS = new Set([
    "xyz", "top", "click", "live", "icu", "buzz", "shop", "vip",
    "work", "site", "online", "club", "pw", "cc", "fit", "rest",
    "surf", "gq", "ml", "cf", "tk", "ga", "link"
  ]);

  const INDIAN_BRANDS = [
    { name: "SBI", official: ["bank.sbi", "sbi.co.in", "onlinesbi.sbi", "onlinesbi.com"], keys: ["sbi", "onlinesbi", "yonosbi", "yono", "statebankofindia"] },
    { name: "HDFC Bank", official: ["hdfcbank.com", "hdfc.com"], keys: ["hdfc", "hdfcbank", "hdfcnetbanking"] },
    { name: "ICICI Bank", official: ["icicibank.com", "imobile.icicibank.com"], keys: ["icici", "icicibank", "imobile"] },
    { name: "Axis Bank", official: ["axisbank.com"], keys: ["axis", "axisbank"] },
    { name: "Punjab National Bank", official: ["pnbindia.in"], keys: ["pnb", "pnbindia"] },
    { name: "Bank of Baroda", official: ["bankofbaroda.in"], keys: ["bob", "bankofbaroda"] },
    { name: "India Post", official: ["indiapost.gov.in", "indiapostgdsonline.gov.in"], keys: ["indiapost", "postinfo", "dakpay"] },
    { name: "Income Tax India", official: ["incometax.gov.in"], keys: ["incometax", "incometaxindia"] },
    { name: "UIDAI / Aadhaar", official: ["uidai.gov.in", "myaadhaar.uidai.gov.in"], keys: ["uidai", "aadhaar", "myaadhaar"] },
    { name: "FASTag / NHAI", official: ["ihmcl.co.in", "nhai.gov.in"], keys: ["fastag", "ihmcl", "toll"] },
    { name: "Paytm", official: ["paytm.com"], keys: ["paytm"] },
    { name: "PhonePe", official: ["phonepe.com"], keys: ["phonepe"] },
    { name: "Google Pay", official: ["pay.google.com"], keys: ["gpay", "googlepay"] }
  ];

  /** Extract all HTTP/HTTPS links from text */
  function extractUrls(text) {
    if (!text) return [];
    const urlRegex = /(?:https?:\/\/|www\.)[^\s<>'"()]+/gi;
    const matches = text.match(urlRegex) || [];
    return matches.map(u => {
      let cleaned = u.replace(/[.,;!?]+$/, '');
      if (!/^https?:\/\//i.test(cleaned)) {
        cleaned = 'https://' + cleaned;
      }
      return cleaned;
    });
  }

  /** Analyze text message (SMS, WhatsApp, Telegram, Email snippet) */
  function analyzeText(rawText) {
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return {
        verdict: "low",
        score: 0,
        summary: "Empty or invalid text provided.",
        reasons: [],
        flags: [],
        next_steps: ["No action needed."]
      };
    }

    const text = rawText.trim();
    const matchedRules = [];
    const weights = [];
    const reasons = [];

    // Evaluate scam rules
    for (const rule of TEXT_RULES) {
      let ruleFired = false;
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          ruleFired = true;
          break;
        }
      }
      if (ruleFired) {
        matchedRules.push(rule.code);
        weights.push(rule.weight);
        reasons.push(rule.reason);
      }
    }

    // Check for embedded URLs
    const embeddedUrls = extractUrls(text);
    let embeddedUrlAnalysis = null;
    if (embeddedUrls.length > 0) {
      embeddedUrlAnalysis = analyzeUrl(embeddedUrls[0]);
      if (embeddedUrlAnalysis.score > 40) {
        matchedRules.push("SUSPICIOUS_EMBEDDED_URL");
        weights.push(embeddedUrlAnalysis.score / 100 * 0.5);
        reasons.push(`Embedded link (${embeddedUrls[0].substring(0, 30)}...) is suspicious: ${embeddedUrlAnalysis.reasons[0] || 'Unverified target'}`);
      }
    }

    // Check legitimate safety markers
    let isLegitOtp = false;
    for (const p of LEGIT_OTP_WARNINGS) {
      if (p.test(text)) {
        isLegitOtp = true;
        break;
      }
    }

    let isLegitTxn = false;
    for (const p of LEGIT_TXN_PATTERNS) {
      if (p.test(text)) {
        isLegitTxn = true;
        break;
      }
    }

    // Diminishing returns combination: 1 - product(1 - w_i)
    let combinedWeight = 0;
    if (weights.length > 0) {
      let product = 1.0;
      for (const w of weights) {
        product *= (1.0 - Math.min(0.95, w));
      }
      combinedWeight = 1.0 - product;
    }

    let finalScore = Math.round(combinedWeight * 100);

    // Safeguard adjustments
    if (isLegitOtp && matchedRules.includes("OTP_REQUEST")) {
      // It's a genuine "do not share OTP" warning from a bank
      finalScore = Math.max(0, finalScore - 40);
      reasons.push("Message appears to be a legitimate banking alert advising you NOT to share your OTP.");
    }
    if (isLegitTxn && finalScore < 60) {
      finalScore = Math.min(finalScore, 20);
    }

    // Determine verdict
    let verdict = "low";
    if (finalScore >= 65) {
      verdict = "high";
    } else if (finalScore >= 35) {
      verdict = "medium";
    }

    // Generate clear advice and summary
    const nextSteps = [];
    let primaryCategory = matchedRules[0] || "GENERAL";

    if (verdict === "high") {
      nextSteps.push("DO NOT click any link or download attachments in this message.");
      nextSteps.push("Never disclose your OTP, PIN, password, or Aadhaar/PAN details.");
      nextSteps.push("Report immediately to Cyber Crime Helpline: 1930 or visit https://cybercrime.gov.in");
    } else if (verdict === "medium") {
      nextSteps.push("Verify the sender before responding or opening links.");
      nextSteps.push("Cross-check with the official app or customer helpline.");
      nextSteps.push("Do not make any unverified UPI or payment transfers.");
    } else {
      nextSteps.push("No immediate scam indicators detected. Stay vigilant.");
    }

    let summary = "";
    if (verdict === "high") {
      summary = `High-risk cyber scam detected (${matchedRules.slice(0, 2).join(", ")}). Strong indicators of fraudulent intent.`;
    } else if (verdict === "medium") {
      summary = `Suspicious message elements detected. Exercise caution and do not disclose credentials.`;
    } else {
      summary = `Message appears standard. No overt phishing patterns found.`;
    }

    return {
      verdict,
      score: finalScore,
      summary,
      reasons: [...new Set(reasons)],
      flags: matchedRules,
      next_steps: nextSteps,
      primaryCategory,
      embeddedUrls,
      embeddedUrlAnalysis
    };
  }

  /** Analyze URL for domain spoofing, suspicious TLDs, IP hosts, and phishing tricks */
  function analyzeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return {
        verdict: "low",
        score: 0,
        summary: "Empty URL provided.",
        reasons: [],
        flags: [],
        next_steps: ["No action needed."]
      };
    }

    let target = rawUrl.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }

    let parsed;
    try {
      parsed = new URL(target);
    } catch (e) {
      return {
        verdict: "medium",
        score: 45,
        summary: "Malformed or deceptive URL structure.",
        reasons: ["URL syntax is invalid or obfuscated."],
        flags: ["MALFORMED_URL"],
        next_steps: ["Do not visit malformed URLs."]
      };
    }

    const host = parsed.hostname.toLowerCase();
    const fullPath = (parsed.pathname + parsed.search).toLowerCase();
    const flags = [];
    const reasons = [];
    let score = 0;

    // Check if host is raw IP address
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(host)) {
      flags.push("IP_ADDRESS_HOST");
      score += 35;
      reasons.push("Host is a raw numerical IP address instead of a domain name.");
    }

    // Check for Punycode / IDN homograph attack
    if (host.includes("xn--")) {
      flags.push("PUNYCODE_HOMOGRAPH");
      score += 30;
      reasons.push("Domain uses Punycode (xn--), which can spoof legitimate brand alphabets.");
    }

    // Check for @ symbol trick
    if (target.includes("@")) {
      flags.push("AT_SYMBOL_OBFUSCATION");
      score += 25;
      reasons.push("URL contains '@' symbol to mislead the user about the destination server.");
    }

    // Check for suspicious TLD
    const parts = host.split('.');
    const tld = parts[parts.length - 1];
    if (SUSPICIOUS_TLDS.has(tld)) {
      flags.push("SUSPICIOUS_TLD");
      score += 20;
      reasons.push(`Uses high-risk low-cost TLD (.${tld}) frequently used by cyber criminals.`);
    }

    // Check for excessive subdomains or hyphens
    if (parts.length > 4) {
      flags.push("MANY_SUBDOMAINS");
      score += 15;
      reasons.push("Excessive subdomain depth often used to camouflage fake hostnames.");
    }
    const hyphenCount = (host.match(/-/g) || []).length;
    if (hyphenCount >= 3) {
      flags.push("MANY_HYPHENS");
      score += 15;
      reasons.push("Unusually high number of hyphens in the domain.");
    }

    // Check Indian Brand Lookalikes & Spoofing
    let isOfficialDomain = false;
    let spoofedBrand = null;

    for (const b of INDIAN_BRANDS) {
      // Check if it's genuinely the official domain
      const isOfficial = b.official.some(off => host === off || host.endsWith('.' + off));
      if (isOfficial) {
        isOfficialDomain = true;
        break;
      }

      // Check if brand name is mentioned in host or path while NOT being official
      const mentionsBrand = b.keys.some(k => host.includes(k) || fullPath.includes(k));
      if (mentionsBrand) {
        spoofedBrand = b.name;
        flags.push("BRAND_LOOKALIKE");
        score += 55;
        reasons.push(`Appears to impersonate ${b.name} on an unauthorized third-party domain (${host}).`);
        break;
      }
    }

    // Check phishing keywords in URL
    const PHISHING_KW = ["kyc", "unblock", "verify", "pan-link", "fastag-recharge", "apk", "bijli", "lottery", "login", "signin", "ebill"];
    const foundKeywords = PHISHING_KW.filter(kw => host.includes(kw) || fullPath.includes(kw));
    if (foundKeywords.length > 0 && !isOfficialDomain) {
      flags.push("PHISHING_KEYWORDS");
      score += 20;
      reasons.push(`Contains credential-harvesting keywords: [${foundKeywords.join(", ")}].`);
    }

    // Check for direct APK download
    if (fullPath.endsWith(".apk") || fullPath.includes(".apk?")) {
      flags.push("MALICIOUS_APK_LINK");
      score += 45;
      reasons.push("Direct APK download link detected. High risk of spyware or financial trojan.");
    }

    // Cap official domains
    if (isOfficialDomain) {
      score = Math.min(score, 5);
      flags.length = 0;
      flags.push("OFFICIAL_DOMAIN_VERIFIED");
      reasons.length = 0;
      reasons.push("Domain is recognized as an official verified portal.");
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    let verdict = "low";
    if (score >= 65) verdict = "high";
    else if (score >= 35) verdict = "medium";

    const nextSteps = [];
    if (verdict === "high") {
      nextSteps.push("DO NOT proceed to this website or submit any passwords/OTP.");
      nextSteps.push("Close this tab immediately.");
      nextSteps.push("Call Cyber Crime Helpline: 1930 if you shared sensitive details.");
    } else if (verdict === "medium") {
      nextSteps.push("Inspect the address bar carefully before typing credentials.");
      nextSteps.push("Check if the connection has a valid SSL certificate.");
    } else {
      nextSteps.push("No obvious domain risks detected. Practice standard cyber safety.");
    }

    return {
      verdict,
      score,
      target,
      host,
      flags,
      reasons,
      next_steps: nextSteps,
      isOfficialDomain,
      spoofedBrand,
      summary: verdict === "high"
        ? `High-risk spoofed URL detected (${spoofedBrand ? 'Impersonating ' + spoofedBrand : host}). Threat score: ${score}/100.`
        : verdict === "medium"
        ? `Suspicious URL traits found on ${host}. Threat score: ${score}/100.`
        : `URL ${host} passed standard heuristics. Threat score: ${score}/100.`
    };
  }

  return {
    analyzeText,
    analyzeUrl,
    extractUrls,
    TEXT_RULES,
    INDIAN_BRANDS
  };
});
