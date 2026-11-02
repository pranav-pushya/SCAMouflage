import { useState } from 'react';
import {
  Search,
  Globe,
  Server,
  Mail,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Terminal,
  Lock,
  Unlock,
  Layers,
  Phone,
  Info,
  ArrowRight,
  Radio,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Curated list of premier OSINT & Footprinting Intelligence tools
const OSINT_TOOLS = [
  {
    id: 'hibp',
    name: 'Have I Been Pwned',
    url: 'https://haveibeenpwned.com',
    category: 'Identity & Breach',
    tagline: 'Global Data Breach & Credential Exposure Index',
    footprint: 'Aggregates billions of compromised records from data breaches, infostealer logs, and dark web paste dumps.',
    phishingContext: 'Explains how scammers obtain phone numbers and personal details for targeted fake KYC, FASTag, and digital arrest scams.',
    access: 'Free Search & Alerting',
    badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]',
  },
  {
    id: 'behindtheemail',
    name: 'Behind the Email',
    url: 'https://behindtheemail.com',
    category: 'Identity & Breach',
    tagline: 'Live Reverse Email OSINT & Account Enrichment',
    footprint: 'Queries live platforms (Google, GitHub, Microsoft, Spotify, LinkedIn) to map out public profile traces tied to an email address.',
    phishingContext: 'Unmasks whether a suspicious sender is a disposable burner address or a hijacked legitimate personal profile.',
    access: 'Freemium / Public Web',
    badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]',
  },
  {
    id: 'fingerprint',
    name: 'Fingerprint (FingerprintJS)',
    url: 'https://fingerprint.com',
    category: 'Browser & Device Fingerprinting',
    tagline: 'Device Intelligence & Persistent Browser Identification',
    footprint: 'Synthesizes 100+ hardware, canvas, audio, and browser configuration signals into a unique, persistent visitor ID.',
    phishingContext: 'Crucial for detecting scam botnets, automated credential stuffing, headless browsers, and VPN/proxy evasion.',
    access: 'Commercial & Open Source',
    badgeColor: 'border-[#376E6F]/40 text-[#376E6F] bg-[#1C3334]',
  },
  {
    id: 'epieos',
    name: 'Epieos',
    url: 'https://epieos.com',
    category: 'Identity & Breach',
    tagline: 'Silent Reverse Email & Phone Reconnaissance',
    footprint: 'Performs passive reconnaissance on emails and phone numbers, finding Google Maps reviews, calendars, and profile photos.',
    phishingContext: 'Reveals how much contextual intelligence an attacker can gather with just an Indian phone number or Gmail ID.',
    access: 'Free Community Web',
    badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]',
  },
  {
    id: 'urlscan',
    name: 'URLScan.io',
    url: 'https://urlscan.io',
    category: 'Scam Infrastructure',
    tagline: 'Automated URL Sandbox & DOM Inspector',
    footprint: 'Navigates to target links in an isolated browser sandbox, capturing screenshots, full HTTP transactions, DOM scripts, and IP/ASN.',
    phishingContext: 'Safely inspects credential harvesting landing pages and deceptive redirect chains without exposing the analyst.',
    access: 'Free Public Sandbox',
    badgeColor: 'border-[#E0A96D]/40 text-[#E0A96D] bg-[#2E151B]',
  },
  {
    id: 'virustotal',
    name: 'VirusTotal',
    url: 'https://virustotal.com',
    category: 'Scam Infrastructure',
    tagline: 'Multi-Vendor Threat Intelligence & Blocklists',
    footprint: 'Aggregates URL, domain, and IP reputation reports from 70+ antivirus scanners, blocklists, and security engines.',
    phishingContext: 'Verifies if an attacker domain has already been flagged as malicious by global threat feeds.',
    access: 'Free Community Web & API',
    badgeColor: 'border-[#E0A96D]/40 text-[#E0A96D] bg-[#2E151B]',
  },
  {
    id: 'mxtoolbox',
    name: 'MXToolbox',
    url: 'https://mxtoolbox.com',
    category: 'Scam Infrastructure',
    tagline: 'Mail Exchanger & Email Authentication Diagnostic',
    footprint: 'Inspects MX records, SPF record syntax, DKIM keys, DMARC policies, and DNS blacklist status.',
    phishingContext: 'Detects misconfigured or missing DMARC policies that allow scammers to spoof legitimate company or bank sender domains.',
    access: 'Free Web Diagnostics',
    badgeColor: 'border-[#E0A96D]/40 text-[#E0A96D] bg-[#2E151B]',
  },
  {
    id: 'dnsdumpster',
    name: 'DNSDumpster',
    url: 'https://dnsdumpster.com',
    category: 'Scam Infrastructure',
    tagline: 'DNS Reconnaissance & Subdomain Mapper',
    footprint: 'Performs passive DNS lookups to discover subdomains, hosting servers, and mail routing maps.',
    phishingContext: 'Uncovers hidden staging subdomains (e.g., sbi.verify-payment.top) deployed on compromised or lookalike domains.',
    access: 'Free Community Tool',
    badgeColor: 'border-[#E0A96D]/40 text-[#E0A96D] bg-[#2E151B]',
  },
  {
    id: 'coveryourtracks',
    name: 'Cover Your Tracks (EFF)',
    url: 'https://coveryourtracks.eff.org',
    category: 'Browser & Device Fingerprinting',
    tagline: 'EFF Browser Configuration & Fingerprint Defense Test',
    footprint: 'Tests browser fingerprint uniqueness and resistance to WebGL, canvas, and tracker-based surveillance.',
    phishingContext: 'Demonstrates how browser configurations can uniquely fingerprint users across web sessions without third-party cookies.',
    access: 'Free / EFF Privacy Project',
    badgeColor: 'border-[#376E6F]/40 text-[#376E6F] bg-[#1C3334]',
  },
  {
    id: 'amiunique',
    name: 'AmIUnique',
    url: 'https://amiunique.org',
    category: 'Browser & Device Fingerprinting',
    tagline: 'Browser Fingerprint Distinctiveness Lab',
    footprint: 'Provides an academic breakdown of HTTP headers, WebGL parameters, system fonts, and audio context identifiers.',
    phishingContext: 'Highlights how unique hardware signals can track infected or compromised sessions during cyber attacks.',
    access: 'Free Academic Research',
    badgeColor: 'border-[#376E6F]/40 text-[#376E6F] bg-[#1C3334]',
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    url: 'https://hunter.io',
    category: 'Identity & Breach',
    tagline: 'Corporate Domain Email Pattern & Identity Finder',
    footprint: 'Indexes public email patterns, corporate contact formats, and verified employee addresses across organizations.',
    phishingContext: 'Used by attackers during spear-phishing recon to map out corporate reporting lines for Business Email Compromise (BEC).',
    access: 'Freemium',
    badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]',
  },
  {
    id: 'tafcop',
    name: 'TAFCOP Portal (DoT India)',
    url: 'https://tafcop.dgtelecom.gov.in',
    category: 'India Telecom & Identity',
    tagline: 'Department of Telecommunications SIM Footprint Check',
    footprint: 'Official Government of India portal enabling citizens to check how many active SIM connections are registered in their name.',
    phishingContext: 'Essential defense against SIM-swap fraud and unauthorized mobile numbers used in cybercrime and UPI fraud.',
    access: 'Official Free Citizen Service',
    badgeColor: 'border-[#376E6F]/50 text-[#F8FAFC] bg-[#376E6F]/20',
  },
  {
    id: 'chakshu',
    name: 'Sanchar Saathi & Chakshu',
    url: 'https://sancharsaathi.gov.in/sfc/',
    category: 'India Telecom & Identity',
    tagline: 'Indian Citizen Reporting for Suspected Fraud Communications',
    footprint: 'Central Government facility to report suspected fraudulent SMS, calls, or WhatsApp messages before financial loss occurs.',
    phishingContext: 'Direct reporting channel for Indian scam vectors (fake KYC, electricity bill cutoff, digital arrest, courier scams).',
    access: 'Official Free Citizen Service',
    badgeColor: 'border-[#376E6F]/50 text-[#F8FAFC] bg-[#376E6F]/20',
  },
];

const CATEGORIES = [
  'All',
  'Identity & Breach',
  'Scam Infrastructure',
  'Browser & Device Fingerprinting',
  'India Telecom & Identity',
];

const SAMPLE_TARGETS = [
  { label: 'SBI Lookalike (Scam Demo)', target: 'sbi-kyc-verify.in' },
  { label: 'Free Recharge (.top TLD)', target: 'free-recharge-bonus.top' },
  { label: 'Raw IP Host', target: '185.220.101.5' },
  { label: 'Official Gov Domain', target: 'incometax.gov.in' },
];

export default function FootprintPage() {
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' | 'directory'
  const [targetInput, setTargetInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inspectResult, setInspectResult] = useState(null);

  // Directory filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleInspect = async (targetToInspect) => {
    const raw = (targetToInspect ?? targetInput).trim();
    if (!raw) {
      setError('Kripya domain, host, ya URL enter karein.');
      return;
    }

    setLoading(true);
    setError(null);
    setInspectResult(null);

    try {
      const response = await fetch(`${API_BASE}/footprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: raw }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.detail || `Server returned error status ${response.status}`);
      }

      const data = await response.json();
      setInspectResult(data);
    } catch (err) {
      setError(err.message || 'Footprint inspection failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = OSINT_TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.tagline.toLowerCase().includes(q) ||
      tool.footprint.toLowerCase().includes(q) ||
      tool.phishingContext.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#376E6F]/20 pb-6 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#2E151B] border border-[#DA7B93]/40 text-[#DA7B93]">
            <Fingerprint className="w-5 h-5" />
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#DA7B93]">
            Reconnaissance & OSINT Intelligence
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Digital Footprint Analyzer
        </h1>
        <p className="text-sm sm:text-base text-[#B8C5D6] max-w-3xl leading-relaxed">
          Every phishing attack begins with <strong className="text-[#DA7B93]">Footprinting</strong>—scammers
          reconnaissance victims via data leaks and spin up disposable lookalike servers. Use this module to inspect
          attacker infrastructure and explore industry OSINT platforms.
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-[#2E151B] border-[#DA7B93]/50 text-[#DA7B93] shadow-md shadow-[#DA7B93]/10 font-semibold'
                : 'bg-[#1C3334]/80 border-[#376E6F]/30 text-[#B8C5D6] hover:text-[#F8FAFC] hover:bg-[#1C3334]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. Infrastructure Inspector (Live Tool)</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-[#2E151B] border-[#DA7B93]/50 text-[#DA7B93] shadow-md shadow-[#DA7B93]/10 font-semibold'
                : 'bg-[#1C3334]/80 border-[#376E6F]/30 text-[#B8C5D6] hover:text-[#F8FAFC] hover:bg-[#1C3334]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. OSINT & Threat Intel Hub ({OSINT_TOOLS.length} Tools)</span>
          </button>
        </div>
      </div>

      {/* SUB-PAGE 1: INFRASTRUCTURE INSPECTOR */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          {/* Input Panel */}
          <div className="bg-[#1C3334]/90 border border-[#376E6F]/30 rounded-2xl p-6 sm:p-8 space-y-5 backdrop-blur-md shadow-xl">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#DA7B93]" />
                <span>Passive Scam Infrastructure Recon</span>
              </h2>
              <p className="text-xs text-[#B8C5D6] mt-1">
                Enter any domain, IP address, or URL. We query WHOIS/RDAP, inspect DNS routing, identify hosting networks, and assess mail spoofing risk.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInspect();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="e.g. sbi-kyc-verify.in or https://free-recharge.top"
                  className="w-full bg-[#0E1C1D] border border-[#376E6F]/40 rounded-xl px-4 py-3.5 text-sm font-mono text-[#F8FAFC] placeholder-[#B8C5D6]/40 focus:outline-none focus:ring-2 focus:ring-[#DA7B93] focus:border-transparent transition-all shadow-inner"
                />
              </div>

              {/* Sample Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-[#B8C5D6]">Quick Samples:</span>
                {SAMPLE_TARGETS.map((sample) => (
                  <button
                    key={sample.target}
                    type="button"
                    onClick={() => {
                      setTargetInput(sample.target);
                      handleInspect(sample.target);
                    }}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#0E1C1D] border border-[#376E6F]/30 text-[#B8C5D6] hover:text-[#DA7B93] hover:border-[#DA7B93]/50 hover:bg-[#2E151B] transition-all cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#2E151B] border border-[#DA7B93] text-xs text-[#DA7B93] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-xs sm:text-sm bg-[#DA7B93] text-[#1C3334] hover:bg-[#E899AE] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#DA7B93]/20 flex items-center justify-center space-x-2 font-mono font-bold cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#1C3334] border-t-transparent rounded-full animate-spin" />
                      <span>Gathering Recon Intelligence...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Inspect Infrastructure Footprint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Inspection Results */}
          {inspectResult && (
            <div className="space-y-6 animate-fadeIn">
              {/* Verdict Banner */}
              <div
                className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  inspectResult.verdict === 'high'
                    ? 'bg-[#2E151B] border-[#DA7B93]'
                    : inspectResult.verdict === 'medium'
                    ? 'bg-[#2E151B]/80 border-[#E0A96D]'
                    : 'bg-[#1C3334] border-[#376E6F]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {inspectResult.verdict === 'high' ? (
                      <ShieldAlert className="w-6 h-6 text-[#DA7B93]" />
                    ) : inspectResult.verdict === 'medium' ? (
                      <AlertTriangle className="w-6 h-6 text-[#E0A96D]" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-[#376E6F]" />
                    )}
                    <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#F8FAFC]">
                      Footprint Risk Assessment
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] font-mono">
                    {inspectResult.domain_info?.registered_domain || inspectResult.target}
                  </h3>
                  <p className="text-xs text-[#B8C5D6]">
                    {inspectResult.verdict === 'high'
                      ? 'High correlation with throwaway phishing infrastructure or brand impersonation.'
                      : inspectResult.verdict === 'medium'
                      ? 'Suspicious attributes detected. Infrastructure requires caution.'
                      : 'Legitimate or established infrastructure profile detected.'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#F8FAFC]">
                      {inspectResult.score}
                      <span className="text-sm font-normal text-[#B8C5D6]">/100</span>
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#B8C5D6]">
                      Threat Score
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                      inspectResult.verdict === 'high'
                        ? 'bg-[#2E151B] text-[#DA7B93] border border-[#DA7B93]/60'
                        : inspectResult.verdict === 'medium'
                        ? 'bg-[#2E151B]/60 text-[#E0A96D] border border-[#E0A96D]/60'
                        : 'bg-[#1C3334] text-[#376E6F] border border-[#376E6F]/60'
                    }`}
                  >
                    {inspectResult.verdict.toUpperCase()} RISK
                  </div>
                </div>
              </div>

              {/* Technical Footprint Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. WHOIS & Domain Age */}
                <div className="bg-[#1C3334]/80 border border-[#376E6F]/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-[#DA7B93]">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      WHOIS & Registration
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Domain Age:</span>
                      <span className="font-mono font-bold text-[#F8FAFC]">
                        {inspectResult.whois?.age_days !== null
                          ? `${inspectResult.whois?.age_days} Days`
                          : 'Not Disclosed'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">TLD Suffix:</span>
                      <span className="font-mono text-[#F8FAFC]">
                        .{inspectResult.domain_info?.tld || 'n/a'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Punycode / IDN:</span>
                      <span className="font-mono text-[#F8FAFC]">
                        {inspectResult.domain_info?.is_punycode ? 'Yes (Detected)' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#B8C5D6]">Official Gov:</span>
                      <span className="font-mono text-[#376E6F]">
                        {inspectResult.domain_info?.is_official_gov ? 'Yes (.gov.in)' : 'No'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#B8C5D6]/70 pt-1 italic">
                      {inspectResult.whois?.created_note}
                    </p>
                  </div>
                </div>

                {/* 2. DNS & Hosting Network */}
                <div className="bg-[#1C3334]/80 border border-[#376E6F]/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-[#376E6F]">
                    <Server className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      Network & Hosting
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Provider / ASN:</span>
                      <span className="font-mono text-[#F8FAFC] truncate max-w-[150px]">
                        {inspectResult.network?.hosting_provider || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Primary IP:</span>
                      <span className="font-mono text-[#F8FAFC]">
                        {inspectResult.network?.ip_addresses?.[0] || 'Unresolved'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Disposable Tier:</span>
                      <span className="font-mono text-[#F8FAFC]">
                        {inspectResult.network?.is_disposable_tier ? (
                          <span className="text-[#DA7B93]">Yes (High Risk)</span>
                        ) : (
                          'No'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#B8C5D6]">SSL Encryption:</span>
                      <span className="font-mono flex items-center space-x-1">
                        {inspectResult.network?.has_https ? (
                          <>
                            <Lock className="w-3 h-3 text-[#376E6F]" />
                            <span className="text-[#376E6F]">HTTPS Active</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 text-[#DA7B93]" />
                            <span className="text-[#DA7B93]">Plain HTTP</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Mail Security Posture */}
                <div className="bg-[#1C3334]/80 border border-[#376E6F]/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-[#E0A96D]">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      Mail Posture
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Mail Server:</span>
                      <span className="font-mono text-[#F8FAFC]">
                        {inspectResult.mail_security?.has_mail_infrastructure
                          ? 'Configured (MX Present)'
                          : 'None / Web-Only'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#376E6F]/20">
                      <span className="text-[#B8C5D6]">Spoofing Vulnerability:</span>
                      <span
                        className={`font-mono uppercase font-bold ${
                          inspectResult.mail_security?.spoofing_risk === 'high'
                            ? 'text-[#DA7B93]'
                            : inspectResult.mail_security?.spoofing_risk === 'medium'
                            ? 'text-[#E0A96D]'
                            : 'text-[#376E6F]'
                        }`}
                      >
                        {inspectResult.mail_security?.spoofing_risk || 'Low'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#B8C5D6]/70 pt-2 leading-relaxed">
                      {inspectResult.mail_security?.posture_assessment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Footprint Flags */}
              {inspectResult.flags?.length > 0 && (
                <div className="bg-[#1C3334]/80 border border-[#376E6F]/30 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6] flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-[#DA7B93]" />
                    <span>Reconnaissance Indicators & Behavioral Flags</span>
                  </h4>
                  <div className="space-y-2.5">
                    {inspectResult.flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-start space-x-3 ${
                          flag.severity === 'high'
                            ? 'bg-[#2E151B]/80 border-[#DA7B93] text-[#DA7B93]'
                            : flag.severity === 'medium'
                            ? 'bg-[#2E151B]/50 border-[#E0A96D] text-[#E0A96D]'
                            : 'bg-[#0E1C1D] border-[#376E6F]/30 text-[#B8C5D6]'
                        }`}
                      >
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-[#0E1C1D] border border-current flex-shrink-0 mt-0.5">
                          {flag.code}
                        </span>
                        <span className="leading-relaxed">{flag.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {inspectResult.recommendations?.length > 0 && (
                <div className="bg-[#1C3334] border border-[#376E6F]/40 rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#DA7B93] flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Defensive Actions & Investigation Steps</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#F8FAFC]">
                    {inspectResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <ArrowRight className="w-3.5 h-3.5 text-[#DA7B93] flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-PAGE 2: OSINT & THREAT INTEL DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-[#1C3334]/90 border border-[#376E6F]/30 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#B8C5D6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools by name, footprint target, or phishing vector..."
                  className="w-full bg-[#0E1C1D] border border-[#376E6F]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-[#B8C5D6]/40 focus:outline-none focus:ring-2 focus:ring-[#DA7B93]"
                />
              </div>
              <div className="text-xs font-mono text-[#B8C5D6] sm:text-right">
                Showing <strong className="text-[#DA7B93]">{filteredTools.length}</strong> intelligence tools
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#2E151B] text-[#DA7B93] border-[#DA7B93] font-semibold shadow-sm'
                      : 'bg-[#0E1C1D] border-[#376E6F]/30 text-[#B8C5D6] hover:text-[#F8FAFC] hover:border-[#DA7B93]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-[#1C3334]/80 border border-[#376E6F]/30 hover:border-[#DA7B93]/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all group backdrop-blur-sm"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Access Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${tool.badgeColor}`}
                    >
                      {tool.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E1C1D] border border-[#376E6F]/30 text-[#B8C5D6]">
                      {tool.access}
                    </span>
                  </div>

                  {/* Tool Title & Tagline */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] group-hover:text-[#DA7B93] transition-colors flex items-center space-x-2">
                      <span>{tool.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-[#B8C5D6] font-mono mt-0.5">{tool.tagline}</p>
                  </div>

                  {/* Footprint Recon Capability */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-mono uppercase text-[#376E6F] font-semibold">
                      What it Footprints:
                    </span>
                    <p className="text-[#B8C5D6] text-xs leading-relaxed">{tool.footprint}</p>
                  </div>

                  {/* Connection to Phishing */}
                  <div className="p-3 rounded-xl bg-[#0E1C1D] border border-[#376E6F]/20 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-[#DA7B93] text-[11px] font-mono font-bold uppercase">
                      <Info className="w-3.5 h-3.5" />
                      <span>Role in Phishing Attacks & Defense</span>
                    </div>
                    <p className="text-[#B8C5D6]/90 text-[11px] leading-relaxed">
                      {tool.phishingContext}
                    </p>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="pt-2 border-t border-[#376E6F]/20">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs font-mono font-medium text-[#DA7B93] hover:text-[#E899AE] hover:underline"
                  >
                    <span>Launch {tool.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="p-12 text-center bg-[#1C3334]/80 border border-[#376E6F]/30 rounded-2xl space-y-2">
              <Search className="w-8 h-8 text-[#B8C5D6] mx-auto opacity-50" />
              <p className="text-sm text-[#B8C5D6]">No tools found matching "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-[#DA7B93] hover:underline font-mono cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
