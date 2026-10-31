# Scamouflage: Brand Domain Verification & Database Audit Report

**Project:** Scamouflage (AI-Powered Phishing and Scam Detection System)  
**Role:** Teammate 2 – URL Engine & Brand Dataset Lead  
**Database File:** `backend/data/brands.json`  
**Report File:** `brands_verification_report.md`  
**Audit Status:** Complete & Verified  

---

## 1. Executive Summary & Audit Overview

This report provides the full domain verification and database audit for `backend/data/brands.json`, the authoritative Indian Brand Database supporting the Scamouflage URL and Phishing Detection Engine.

Phishing, smishing, and digital banking scams targeting Indian consumers regularly impersonate major financial, governmental, telecommunications, and digital service entities. Attackers use look-alike domains, typosquats, and brand names inside subdomains or URL paths (e.g., `sbi-reward-login.site`, `incometax-refund-status.online`, `indiapost-tracking-fee.top`). To ensure precise classification without false positives:
- Every brand and domain was independently audited against authoritative government registries (RBI, IDRBT, MeitY, NIXI) and primary corporate disclosures.
- Overly broad domains (such as generic root domains like `google.com` under Google Pay) were eliminated to avoid false matches.
- Domains that could not be verified as genuine active properties of the specific brand (e.g., `kotakbank.com`) were removed.
- Substring-dangerous or generic keywords (e.g., `uan`, `taxrefund`, `postoffice`) were replaced with safe, brand-specific tokens.

### Key Audit Metrics

* **Total Brands in Database:** 40
* **Successfully Verified Brands:** 40 (100% verification rate; 0 unverified brands)
* **Total Official Domains:** 78
* **Unique Official Domains:** 78 (0 duplicate domains across the database)
* **Duplicate Brands:** 0
* **Malformed / Empty Fields:** 0
* **RBI `.bank.in` Migration Conformance:** Fully Audited & Documented

---

## 2. Sectoral Distribution

| Category | Brands | Verified Brands | Total Official Domains |
|---|---|:---:|:---:|
| **1. Banking** | SBI, HDFC Bank, ICICI Bank, Axis Bank, PNB, Kotak Mahindra Bank, Bank of Baroda | 7 | 23 |
| **2. Payments & UPI** | Paytm, PhonePe, Google Pay, BHIM, CRED, MobiKwik, Razorpay | 7 | 12 |
| **3. Government & Public Services** | India Post, Income Tax Department, UIDAI (Aadhaar), EPFO, IRCTC | 5 | 11 |
| **4. Transport & Tolls** | NHAI, FASTag / IHMCL | 2 | 3 |
| **5. Telecom** | Reliance Jio, Bharti Airtel, Vodafone Idea (Vi) | 3 | 6 |
| **6. E-Commerce** | Amazon India, Flipkart, Meesho, Myntra, JioMart | 5 | 9 |
| **7. Courier & Logistics** | Blue Dart, Delhivery, DTDC | 3 | 4 |
| **8. Insurance** | LIC, HDFC Life, ICICI Prudential, SBI Life | 4 | 5 |
| **9. Digital Platforms & FinTech** | DigiLocker, Zerodha, Groww, Tata Neu | 4 | 5 |
| **Total** | | **40** | **78** |

---

## 3. Detailed Brand-by-Brand Audit & Verification Register

### Category 1: Banking

#### 1. SBI (State Bank of India)
* **Brand Name:** SBI
* **Verified Official Domains:** `bank.sbi`, `sbi.bank.in`, `sbi.co.in`, `onlinesbi.sbi`, `onlinesbi.com`
* **Domains Removed or Marked Unverified:** `sbi.com` (Unverified / rejected — not owned by State Bank of India).
* **Keywords:** `sbi`, `onlinesbi`, `yonosbi`, `statebankofindia`, `yono`
* **Official Verification Source(s):** [https://bank.sbi](https://bank.sbi), [https://sbi.bank.in](https://sbi.bank.in), [https://www.onlinesbi.sbi](https://www.onlinesbi.sbi)
* **Audit Notes:** SBI holds its dedicated proprietary `.sbi` gTLD (`bank.sbi`, `onlinesbi.sbi`) alongside the RBI-mandated `.bank.in` infrastructure (`sbi.bank.in`) and legacy consumer portals (`onlinesbi.com`, `sbi.co.in`).

#### 2. HDFC Bank
* **Brand Name:** HDFC Bank
* **Verified Official Domains:** `hdfc.bank.in`, `hdfcbank.com`, `hdfc.com`, `hdfcbank.bank.in`
* **Domains Removed or Marked Unverified:** None (All listed domains verified).
* **Keywords:** `hdfc`, `hdfcbank`, `hdfcnetbanking`
* **Official Verification Source(s):** [https://hdfc.bank.in](https://hdfc.bank.in), [https://www.hdfcbank.com](https://www.hdfcbank.com)
* **Audit Notes:** Following the 2023 merger of HDFC Limited into HDFC Bank, `hdfc.com` officially redirects to HDFC Bank's home loan portal. `hdfc.bank.in` is the primary `.bank.in` host.

#### 3. ICICI Bank
* **Brand Name:** ICICI Bank
* **Verified Official Domains:** `icici.bank.in`, `icicibank.com`, `icicibank.bank.in`
* **Domains Removed or Marked Unverified:** `icici.com` (Unverified / rejected — not owned or operated by ICICI Bank).
* **Keywords:** `icici`, `icicibank`, `imobile`, `icicinetbanking`
* **Official Verification Source(s):** [https://www.icici.bank.in](https://www.icici.bank.in), [https://www.icicibank.com](https://www.icicibank.com)
* **Audit Notes:** Netbanking operations operate via `icici.bank.in` with persistent redirection from `icicibank.com`.

#### 4. Axis Bank
* **Brand Name:** Axis Bank
* **Verified Official Domains:** `axis.bank.in`, `axisbank.com`, `axisbank.bank.in`
* **Domains Removed or Marked Unverified:** `axis.com` (Unverified / rejected — belongs to third-party Swedish entity Axis Communications).
* **Keywords:** `axis`, `axisbank`, `axisnetbanking`
* **Official Verification Source(s):** [https://www.axis.bank.in](https://www.axis.bank.in), [https://www.axisbank.com](https://www.axisbank.com)
* **Audit Notes:** Migrated core corporate and consumer internet banking under RBI directive to `axis.bank.in`.

#### 5. PNB (Punjab National Bank)
* **Brand Name:** PNB
* **Verified Official Domains:** `pnb.bank.in`, `pnbindia.in`, `netpnb.com`
* **Domains Removed or Marked Unverified:** `pnb.com` (Unverified / rejected — not operated by Punjab National Bank).
* **Keywords:** `pnb`, `pnbindia`, `pnbnetbanking`, `punjabnationalbank`
* **Official Verification Source(s):** [https://pnb.bank.in](https://pnb.bank.in), [https://www.pnbindia.in](https://www.pnbindia.in)
* **Audit Notes:** Added legacy internet banking domain `netpnb.com` which securely routes to `pnb.bank.in`.

#### 6. Kotak Mahindra Bank
* **Brand Name:** Kotak Mahindra Bank
* **Verified Official Domains:** `kotak.bank.in`, `kotak.com`
* **Domains Removed or Marked Unverified:** `kotakbank.com` (Removed — not an official active domain of Kotak Mahindra Bank).
* **Keywords:** `kotak`, `kotakbank`, `kotak811`, `kotaknetbanking`
* **Official Verification Source(s):** [https://www.kotak.bank.in](https://www.kotak.bank.in), [https://www.kotak.com](https://www.kotak.com)
* **Audit Notes:** Primary banking is hosted on `kotak.bank.in` and `kotak.com`. `kotakbank.com` was verified as not an official portal and removed.

#### 7. Bank of Baroda
* **Brand Name:** Bank of Baroda
* **Verified Official Domains:** `bankofbaroda.bank.in`, `bankofbaroda.in`, `bobibanking.com`
* **Domains Removed or Marked Unverified:** None (All listed domains verified).
* **Keywords:** `bankofbaroda`, `bobworld`, `bobibanking`
* **Official Verification Source(s):** [https://bankofbaroda.bank.in](https://bankofbaroda.bank.in), [https://www.bankofbaroda.in](https://www.bankofbaroda.in)
* **Audit Notes:** `bobibanking.com` operates retail netbanking; `bankofbaroda.bank.in` is the official `.bank.in` domain.

---

### Category 2: Payments & UPI

#### 8. Paytm
* **Brand Name:** Paytm
* **Verified Official Domains:** `paytm.com`, `paytmbank.com`, `paytm.bank.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `paytm`, `paytmbank`, `paytmpayments`, `paytmwallet`
* **Official Verification Source(s):** [https://paytm.com](https://paytm.com), [https://paytm.bank.in](https://paytm.bank.in)
* **Audit Notes:** Main services on `paytm.com`; regulatory banking domain retained on `paytm.bank.in`.

#### 9. PhonePe
* **Brand Name:** PhonePe
* **Verified Official Domains:** `phonepe.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `phonepe`, `phonepebusiness`
* **Official Verification Source(s):** [https://www.phonepe.com](https://www.phonepe.com)
* **Audit Notes:** All consumer, business, and developer subdomains originate from `phonepe.com`.

#### 10. Google Pay
* **Brand Name:** Google Pay
* **Verified Official Domains:** `pay.google.com`
* **Domains Removed or Marked Unverified:** `google.com` (Removed — overly broad domain that could lead to false positives on legitimate Google properties or blind detection to malicious Google Forms/Docs phishing).
* **Keywords:** `googlepay`, `gpay`, `tez`
* **Official Verification Source(s):** [https://pay.google.com](https://pay.google.com)
* **Audit Notes:** Google Pay services are isolated under `pay.google.com`. Removing the umbrella root `google.com` prevents broad classification false positives.

#### 11. BHIM
* **Brand Name:** BHIM
* **Verified Official Domains:** `bhimupi.org.in`, `bhim.org.in`
* **Domains Removed or Marked Unverified:** `npci.org.in` (Removed from BHIM entry — corporate parent entity, overly broad for the single BHIM application).
* **Keywords:** `bhim`, `bhimupi`, `npci`
* **Official Verification Source(s):** [https://www.bhimupi.org.in](https://www.bhimupi.org.in)
* **Audit Notes:** NPCI operates BHIM through NPCI BHIM Services Ltd (NBSL); `bhimupi.org.in` and `bhim.org.in` are dedicated brand domains.

#### 12. CRED
* **Brand Name:** CRED
* **Verified Official Domains:** `cred.club`, `cred.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `cred`, `credclub`
* **Official Verification Source(s):** [https://cred.club](https://cred.club), [https://cred.in](https://cred.in)
* **Audit Notes:** Operated by Dreamplug Technologies; both domains verified.

#### 13. MobiKwik
* **Brand Name:** MobiKwik
* **Verified Official Domains:** `mobikwik.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `mobikwik`, `zipemi`, `mobikwikwallet`
* **Official Verification Source(s):** [https://www.mobikwik.com](https://www.mobikwik.com)
* **Audit Notes:** One MobiKwik Systems Limited operates all wallet and ZIP services on `mobikwik.com`.

#### 14. Razorpay
* **Brand Name:** Razorpay
* **Verified Official Domains:** `razorpay.com`, `razorpay.me`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `razorpay`, `razorpayx`
* **Official Verification Source(s):** [https://razorpay.com](https://razorpay.com), [https://razorpay.me](https://razorpay.me)
* **Audit Notes:** `razorpay.me` is Razorpay's dedicated payment-handle short link infrastructure.

---

### Category 3: Government & Public Services

#### 15. India Post
* **Brand Name:** India Post
* **Verified Official Domains:** `indiapost.gov.in`, `ippbonline.com`, `ippbonline.bank.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `indiapost`, `speedpost`, `ippb` (Removed generic keyword `postoffice` to avoid broad lexical overlap).
* **Official Verification Source(s):** [https://www.indiapost.gov.in](https://www.indiapost.gov.in), [https://www.ippbonline.bank.in](https://www.ippbonline.bank.in)
* **Audit Notes:** Department of Posts runs `indiapost.gov.in`; India Post Payments Bank operates on `ippbonline.com` and `ippbonline.bank.in`.

#### 16. Income Tax Department
* **Brand Name:** Income Tax Department
* **Verified Official Domains:** `incometax.gov.in`, `incometaxindia.gov.in`, `incometaxindiaefiling.gov.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `incometax`, `incometaxindia`, `incometaxefiling`, `itr` (Removed generic terms `efiling` and `taxrefund`).
* **Official Verification Source(s):** [https://www.incometax.gov.in](https://www.incometax.gov.in), [https://www.incometaxindia.gov.in](https://www.incometaxindia.gov.in)
* **Audit Notes:** Official e-Filing portal is `incometax.gov.in`; informational portals route through official `.gov.in` addresses.

#### 17. UIDAI (Aadhaar)
* **Brand Name:** UIDAI
* **Verified Official Domains:** `uidai.gov.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `uidai`, `aadhaar`, `myaadhaar`, `eaadhaar`
* **Official Verification Source(s):** [https://uidai.gov.in](https://uidai.gov.in), [https://myaadhaar.uidai.gov.in](https://myaadhaar.uidai.gov.in)
* **Audit Notes:** Statutory authority under MeitY; all services reside on `uidai.gov.in`.

#### 18. EPFO
* **Brand Name:** EPFO
* **Verified Official Domains:** `epfindia.gov.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `epfo`, `epfindia`, `epfpassbook`, `uanmember`, `memberesewa` (Removed dangerous 3-letter substring `uan` which causes false matches on words like *tijuana*, *taiwan*, *sichuan*).
* **Official Verification Source(s):** [https://www.epfindia.gov.in](https://www.epfindia.gov.in)
* **Audit Notes:** Ministry of Labour and Employment EPFO portal and Unified Member portals hosted on `epfindia.gov.in`.

#### 19. IRCTC
* **Brand Name:** IRCTC
* **Verified Official Domains:** `irctc.co.in`, `irctc.com`, `irctctourism.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `irctc`, `irctctourism`, `irctctrain`
* **Official Verification Source(s):** [https://www.irctc.co.in](https://www.irctc.co.in), [https://www.irctc.com](https://www.irctc.com)
* **Audit Notes:** E-ticketing resides on `irctc.co.in`; corporate tenders on `irctc.com`; holiday packages on `irctctourism.com`.

---

### Category 4: Transport & Tolls

#### 20. NHAI
* **Brand Name:** NHAI
* **Verified Official Domains:** `nhai.gov.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `nhai`, `rajmargyatra`
* **Official Verification Source(s):** [https://nhai.gov.in](https://nhai.gov.in)
* **Audit Notes:** National Highways Authority of India governmental portal.

#### 21. FASTag
* **Brand Name:** FASTag
* **Verified Official Domains:** `ihmcl.co.in`, `netc.org.in`
* **Domains Removed or Marked Unverified:** `fastag.in` (Unverified / rejected — not an official issuing domain; registered by independent entity).
* **Keywords:** `fastag`, `ihmcl`, `netc`, `fastagkyc`, `fastagrecharge`
* **Official Verification Source(s):** [https://ihmcl.co.in](https://ihmcl.co.in), [https://www.netc.org.in](https://www.netc.org.in)
* **Audit Notes:** Managed jointly by Indian Highways Management Company Ltd. (`ihmcl.co.in`) and NPCI NETC (`netc.org.in`).

---

### Category 5: Telecom

#### 22. Jio
* **Brand Name:** Jio
* **Verified Official Domains:** `jio.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `jio`, `myjio`, `jiotv`, `jiofiber`, `jiocinema`
* **Official Verification Source(s):** [https://www.jio.com](https://www.jio.com)
* **Audit Notes:** Reliance Jio Infocomm Limited consumer portal.

#### 23. Airtel
* **Brand Name:** Airtel
* **Verified Official Domains:** `airtel.in`, `airtel.com`, `airtelpayments.bank.in`
* **Domains Removed or Marked Unverified:** `airtelbank.com` (Unverified — Airtel Payments Bank operates under `airtel.in/bank` and `airtelpayments.bank.in`).
* **Keywords:** `airtel`, `airtelthanks`, `airtelpayment`, `airtelpaymentsbank`
* **Official Verification Source(s):** [https://www.airtel.in](https://www.airtel.in), [https://www.airtelpayments.bank.in](https://www.airtelpayments.bank.in)
* **Audit Notes:** Consumer portal is `airtel.in`; payments bank is officially registered under `airtelpayments.bank.in`.

#### 24. Vi
* **Brand Name:** Vi
* **Verified Official Domains:** `myvi.in`, `vodafoneidea.com`
* **Domains Removed or Marked Unverified:** `vi.com` (Unverified — unrelated global domain).
* **Keywords:** `myvi`, `vodafoneidea`, `vodafone`, `ideacellular`
* **Official Verification Source(s):** [https://www.myvi.in](https://www.myvi.in), [https://www.vodafoneidea.com](https://www.vodafoneidea.com)
* **Audit Notes:** Consumer telecom on `myvi.in`; corporate entity on `vodafoneidea.com`.

---

### Category 6: E-Commerce

#### 25. Amazon
* **Brand Name:** Amazon
* **Verified Official Domains:** `amazon.in`, `amazon.com`, `amazonpay.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `amazon`, `amazonin`, `amazonpay`, `amazondelivery`
* **Official Verification Source(s):** [https://www.amazon.in](https://www.amazon.in), [https://www.amazonpay.in](https://www.amazonpay.in)
* **Audit Notes:** Covers Indian marketplace (`amazon.in`), international portal (`amazon.com`), and digital payments (`amazonpay.in`).

#### 26. Flipkart
* **Brand Name:** Flipkart
* **Verified Official Domains:** `flipkart.com`, `flipkart.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `flipkart`, `flipkartplus`, `supercoins`
* **Official Verification Source(s):** [https://www.flipkart.com](https://www.flipkart.com)
* **Audit Notes:** E-commerce portal on `flipkart.com`; `.in` held under corporate control.

#### 27. Meesho
* **Brand Name:** Meesho
* **Verified Official Domains:** `meesho.com`, `meesho.io`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `meesho`, `meeshosupplier`
* **Official Verification Source(s):** [https://www.meesho.com](https://www.meesho.com), [https://meesho.io](https://meesho.io)
* **Audit Notes:** `meesho.com` operates the marketplace; `meesho.io` hosts official tech, engineering, and career pages.

#### 28. Myntra
* **Brand Name:** Myntra
* **Verified Official Domains:** `myntra.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `myntra`, `myntrainsider`
* **Official Verification Source(s):** [https://www.myntra.com](https://www.myntra.com)
* **Audit Notes:** Major fashion e-commerce subsidiary under Flipkart Group.

#### 29. JioMart
* **Brand Name:** JioMart
* **Verified Official Domains:** `jiomart.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `jiomart`, `jiomartgrocery`
* **Official Verification Source(s):** [https://www.jiomart.com](https://www.jiomart.com)
* **Audit Notes:** Reliance Retail e-commerce portal.

---

### Category 7: Courier & Logistics

#### 30. Blue Dart
* **Brand Name:** Blue Dart
* **Verified Official Domains:** `bluedart.com`
* **Domains Removed or Marked Unverified:** `bluedart.in` (Unverified / rejected — not the official active tracking portal; Blue Dart operates on `bluedart.com`).
* **Keywords:** `bluedart`, `trackdart`
* **Official Verification Source(s):** [https://www.bluedart.com](https://www.bluedart.com)
* **Audit Notes:** Primary courier and parcel tracking infrastructure hosted on `bluedart.com`.

#### 31. Delhivery
* **Brand Name:** Delhivery
* **Verified Official Domains:** `delhivery.com`
* **Domains Removed or Marked Unverified:** `delhivery.in` (Unverified / not official tracking host).
* **Keywords:** `delhivery`, `delhiverydirect`, `delhiveryexpress`
* **Official Verification Source(s):** [https://www.delhivery.com](https://www.delhivery.com)
* **Audit Notes:** Verified tracking and business services operate on `delhivery.com`.

#### 32. DTDC
* **Brand Name:** DTDC
* **Verified Official Domains:** `dtdc.com`, `dtdc.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `dtdc`, `dtdctracking`, `dtdcexpress`
* **Official Verification Source(s):** [https://www.dtdc.com](https://www.dtdc.com), [https://www.dtdc.in](https://www.dtdc.in)
* **Audit Notes:** `dtdc.com` is the primary corporate domain; `dtdc.in` is the legacy Indian portal.

---

### Category 8: Insurance

#### 33. LIC (Life Insurance Corporation of India)
* **Brand Name:** LIC
* **Verified Official Domains:** `licindia.in`
* **Domains Removed or Marked Unverified:** `licindia.com` (Unverified / rejected — not the official LIC portal).
* **Keywords:** `lic`, `licindia`, `licpolicy`, `licpremium`
* **Official Verification Source(s):** [https://licindia.in](https://licindia.in)
* **Audit Notes:** Statutory life insurance corporation operating under Ministry of Finance.

#### 34. HDFC Life
* **Brand Name:** HDFC Life
* **Verified Official Domains:** `hdfclife.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `hdfclife`, `hdfclifeinsurance`
* **Official Verification Source(s):** [https://www.hdfclife.com](https://www.hdfclife.com)
* **Audit Notes:** Joint venture life insurance arm of HDFC.

#### 35. ICICI Prudential
* **Brand Name:** ICICI Prudential
* **Verified Official Domains:** `iciciprulife.com`, `icicilife.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `iciciprulife`, `icicilife`, `iciciprudential`
* **Official Verification Source(s):** [https://www.iciciprulife.com](https://www.iciciprulife.com), [https://www.icicilife.com](https://www.icicilife.com)
* **Audit Notes:** Both domains are actively owned and operated by ICICI Prudential Life Insurance.

#### 36. SBI Life
* **Brand Name:** SBI Life
* **Verified Official Domains:** `sbilife.co.in`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `sbilife`, `sbilifeinsurance`
* **Official Verification Source(s):** [https://www.sbilife.co.in](https://www.sbilife.co.in)
* **Audit Notes:** Subsidiary life insurance entity of State Bank of India.

---

### Category 9: Digital Platforms & FinTech

#### 37. DigiLocker
* **Brand Name:** DigiLocker
* **Verified Official Domains:** `digilocker.gov.in`
* **Domains Removed or Marked Unverified:** `digilocker.com` (Unverified / rejected — not official; DigiLocker is strictly on `.gov.in`).
* **Keywords:** `digilocker`, `meity`
* **Official Verification Source(s):** [https://www.digilocker.gov.in](https://www.digilocker.gov.in)
* **Audit Notes:** National digital wallet initiative hosted under MeitY.

#### 38. Zerodha
* **Brand Name:** Zerodha
* **Verified Official Domains:** `zerodha.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `zerodha`, `kitezerodha`, `coinzerodha`
* **Official Verification Source(s):** [https://zerodha.com](https://zerodha.com), [https://kite.zerodha.com](https://kite.zerodha.com)
* **Audit Notes:** Retail discount brokerage; trading engines (`kite`) and reporting (`console`) are subdomains of `zerodha.com`.

#### 39. Groww
* **Brand Name:** Groww
* **Verified Official Domains:** `groww.in`
* **Domains Removed or Marked Unverified:** `groww.com` (Unverified as primary consumer brokerage in India; Groww operates on `groww.in`).
* **Keywords:** `groww`, `growwinvest`
* **Official Verification Source(s):** [https://groww.in](https://groww.in)
* **Audit Notes:** Investment platform operated by Nextbillion Technology Pvt Ltd.

#### 40. Tata Neu
* **Brand Name:** Tata Neu
* **Verified Official Domains:** `tataneu.com`, `tatadigital.com`
* **Domains Removed or Marked Unverified:** None.
* **Keywords:** `tataneu`, `tatadigital`, `neupass`, `neucoins`
* **Official Verification Source(s):** [https://www.tataneu.com](https://www.tataneu.com), [https://www.tatadigital.com](https://www.tatadigital.com)
* **Audit Notes:** `tataneu.com` hosts the super app consumer platform; `tatadigital.com` is the official parent company.

---

## 4. Summary of Audit Corrections & Enhancements

1. **Elimination of Overly Broad Domains:**
   - **`google.com`** removed from **Google Pay** (`pay.google.com` retained). This prevents legitimate Google properties from causing false positive brand associations or blinding the engine to malicious Google Forms / Docs phishing.
   - **`npci.org.in`** removed from **BHIM** (`bhimupi.org.in` and `bhim.org.in` retained). NPCI is an umbrella entity operating multiple national payment systems; isolating BHIM to its dedicated domains prevents broad cross-service false detections.
2. **Removal of Unverified / Non-Official Domains:**
   - **`kotakbank.com`** removed from **Kotak Mahindra Bank** after independent WHOIS and web audit confirmed the bank operates officially on `kotak.com` and `kotak.bank.in`.
3. **Addition of Verified Official Domains:**
   - Added **`hdfc.com`** to **HDFC Bank** following independent verification of the HDFC Ltd merger and active redirection to `hdfcbank.com`.
   - Added **`netpnb.com`** to **PNB** following verification of its legacy internet banking portal redirecting to `pnb.bank.in`.
   - Added **`bhim.org.in`** to **BHIM** following verification of NPCI's official domain registration.
4. **Keyword Refinement for Phishing Safety:**
   - **India Post:** Removed generic `postoffice` (kept `indiapost`, `speedpost`, `ippb`).
   - **Income Tax Department:** Removed generic terms `efiling` and `taxrefund` (retained `incometax`, `incometaxindia`, `incometaxefiling`, `itr`).
   - **EPFO:** Replaced 3-letter substring `uan` with `uanmember` to avoid false positive triggers on common geographical and lexical words (*tijuana*, *taiwan*, *sichuan*).
5. **Final Database Integrity Status:**
   - 40 Brands, 78 Official Domains, 0 duplicates, 0 empty fields, 100% schema compliance.
