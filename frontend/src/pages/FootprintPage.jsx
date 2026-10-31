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
    badgeColor: 'border-[#22D3EE]/40 text-[#22D3EE] bg-[#22D3EE]/10',
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
    badgeColor: 'border-[#34D399]/40 text-[#34D399] bg-[#34D399]/10',
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
    badgeColor: 'border-[#A78BFA]/40 text-[#A78BFA] bg-[#A78BFA]/10',
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
    badgeColor: 'border-[#22D3EE]/40 text-[#22D3EE] bg-[#22D3EE]/10',
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
    badgeColor: 'border-[#FBBF24]/40 text-[#FBBF24] bg-[#FBBF24]/10',
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
    badgeColor: 'border-[#FBBF24]/40 text-[#FBBF24] bg-[#FBBF24]/10',
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
    badgeColor: 'border-[#FBBF24]/40 text-[#FBBF24] bg-[#FBBF24]/10',
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
    badgeColor: 'border-[#FBBF24]/40 text-[#FBBF24] bg-[#FBBF24]/10',
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
    badgeColor: 'border-[#A78BFA]/40 text-[#A78BFA] bg-[#A78BFA]/10',
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
    badgeColor: 'border-[#A78BFA]/40 text-[#A78BFA] bg-[#A78BFA]/10',
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
    badgeColor: 'border-[#22D3EE]/40 text-[#22D3EE] bg-[#22D3EE]/10',
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
    badgeColor: 'border-[#34D399]/40 text-[#34D399] bg-[#34D399]/10',
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
    badgeColor: 'border-[#34D399]/40 text-[#34D399] bg-[#34D399]/10',
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
      <div className="border-b border-[#0E1622] pb-6 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE]">
            <Fingerprint className="w-5 h-5" />
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE]">
            Reconnaissance & OSINT Intelligence
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#E6EDF5]">
          Digital Footprint Analyzer
        </h1>
        <p className="text-sm sm:text-base text-[#93A1B5] max-w-3xl leading-relaxed">
          Every phishing attack begins with <strong className="text-[#E6EDF5]">Footprinting</strong>—scammers
          reconnaissance victims via data leaks and spin up disposable lookalike servers. Use this module to inspect
          attacker infrastructure and explore industry OSINT platforms.
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors flex items-center space-x-2 ${
              activeTab === 'inspector'
                ? 'bg-[#0F1A2A] border-[#1E3A4C] text-[#22D3EE] shadow-sm'
                : 'bg-[#0A111C] border-[#1E293B] text-[#93A1B5] hover:text-[#E6EDF5] hover:bg-[#0E1622]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. Infrastructure Inspector (Live Tool)</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors flex items-center space-x-2 ${
              activeTab === 'directory'
                ? 'bg-[#0F1A2A] border-[#1E3A4C] text-[#22D3EE] shadow-sm'
                : 'bg-[#0A111C] border-[#1E293B] text-[#93A1B5] hover:text-[#E6EDF5] hover:bg-[#0E1622]'
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
          <div className="bg-[#0A111C] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#E6EDF5] flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#22D3EE]" />
                <span>Passive Scam Infrastructure Recon</span>
              </h2>
              <p className="text-xs text-[#93A1B5] mt-1">
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
                  className="w-full bg-[#070B12] border border-[#243247] rounded-xl px-4 py-3.5 text-sm font-mono text-[#E6EDF5] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent transition-all"
                />
              </div>

              {/* Sample Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-[#64748B]">Quick Samples:</span>
                {SAMPLE_TARGETS.map((sample) => (
                  <button
                    key={sample.target}
                    type="button"
                    onClick={() => {
                      setTargetInput(sample.target);
                      handleInspect(sample.target);
                    }}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#0F1A2A] border border-[#1E3A4C] text-[#93A1B5] hover:text-[#22D3EE] hover:border-[#22D3EE]/50 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#2A0F1B] border border-[#7F1D3A] text-xs text-[#FB7185] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-xs sm:text-sm bg-[#22D3EE] text-[#070B12] hover:bg-[#67E8F9] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-cyan-500/20 flex items-center justify-center space-x-2 font-mono font-bold"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#070B12] border-t-transparent rounded-full animate-spin" />
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
                    ? 'bg-[#2A0F1B] border-[#7F1D3A]'
                    : inspectResult.verdict === 'medium'
                    ? 'bg-[#2A1B07] border-[#78350F]'
                    : 'bg-[#071F18] border-[#065F46]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {inspectResult.verdict === 'high' ? (
                      <ShieldAlert className="w-6 h-6 text-[#FB7185]" />
                    ) : inspectResult.verdict === 'medium' ? (
                      <AlertTriangle className="w-6 h-6 text-[#FBBF24]" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-[#34D399]" />
                    )}
                    <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#E6EDF5]">
                      Footprint Risk Assessment
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#E6EDF5] font-mono">
                    {inspectResult.domain_info?.registered_domain || inspectResult.target}
                  </h3>
                  <p className="text-xs text-[#93A1B5]">
                    {inspectResult.verdict === 'high'
                      ? 'High correlation with throwaway phishing infrastructure or brand impersonation.'
                      : inspectResult.verdict === 'medium'
                      ? 'Suspicious attributes detected. Infrastructure requires caution.'
                      : 'Legitimate or established infrastructure profile detected.'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#E6EDF5]">
                      {inspectResult.score}
                      <span className="text-sm font-normal text-[#93A1B5]">/100</span>
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#93A1B5]">
                      Threat Score
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                      inspectResult.verdict === 'high'
                        ? 'bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/40'
                        : inspectResult.verdict === 'medium'
                        ? 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40'
                        : 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                    }`}
                  >
                    {inspectResult.verdict.toUpperCase()} RISK
                  </div>
                </div>
              </div>

              {/* Technical Footprint Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. WHOIS & Domain Age */}
                <div className="bg-[#0A111C] border border-[#1E293B] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-[#22D3EE]">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      WHOIS & Registration
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Domain Age:</span>
                      <span className="font-mono font-bold text-[#E6EDF5]">
                        {inspectResult.whois?.age_days !== null
                          ? `${inspectResult.whois?.age_days} Days`
                          : 'Not Disclosed'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">TLD Suffix:</span>
                      <span className="font-mono text-[#E6EDF5]">
                        .{inspectResult.domain_info?.tld || 'n/a'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Punycode / IDN:</span>
                      <span className="font-mono text-[#E6EDF5]">
                        {inspectResult.domain_info?.is_punycode ? 'Yes (Detected)' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#93A1B5]">Official Gov:</span>
                      <span className="font-mono text-[#34D399]">
                        {inspectResult.domain_info?.is_official_gov ? 'Yes (.gov.in)' : 'No'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] pt-1 italic">
                      {inspectResult.whois?.created_note}
                    </p>
                  </div>
                </div>

                {/* 2. DNS & Hosting Network */}
                <div className="bg-[#0A111C] border border-[#1E293B] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-[#34D399]">
                    <Server className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      Network & Hosting
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Provider / ASN:</span>
                      <span className="font-mono text-[#E6EDF5] truncate max-w-[150px]">
                        {inspectResult.network?.hosting_provider || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Primary IP:</span>
                      <span className="font-mono text-[#E6EDF5]">
                        {inspectResult.network?.ip_addresses?.[0] || 'Unresolved'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Disposable Tier:</span>
                      <span className="font-mono text-[#E6EDF5]">
                        {inspectResult.network?.is_disposable_tier ? (
                          <span className="text-[#FB7185]">Yes (High Risk)</span>
                        ) : (
                          'No'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#93A1B5]">SSL Encryption:</span>
                      <span className="font-mono flex items-center space-x-1">
                        {inspectResult.network?.has_https ? (
                          <>
                            <Lock className="w-3 h-3 text-[#34D399]" />
                            <span className="text-[#34D399]">HTTPS Active</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 text-[#FB7185]" />
                            <span className="text-[#FB7185]">Plain HTTP</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Mail Security Posture */}
                <div className="bg-[#0A111C] border border-[#1E293B] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-[#FBBF24]">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      Mail Posture
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Mail Server:</span>
                      <span className="font-mono text-[#E6EDF5]">
                        {inspectResult.mail_security?.has_mail_infrastructure
                          ? 'Configured (MX Present)'
                          : 'None / Web-Only'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1E293B]">
                      <span className="text-[#93A1B5]">Spoofing Vulnerability:</span>
                      <span
                        className={`font-mono uppercase font-bold ${
                          inspectResult.mail_security?.spoofing_risk === 'high'
                            ? 'text-[#FB7185]'
                            : inspectResult.mail_security?.spoofing_risk === 'medium'
                            ? 'text-[#FBBF24]'
                            : 'text-[#34D399]'
                        }`}
                      >
                        {inspectResult.mail_security?.spoofing_risk || 'Low'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] pt-2 leading-relaxed">
                      {inspectResult.mail_security?.posture_assessment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detected Footprint Flags */}
              {inspectResult.flags?.length > 0 && (
                <div className="bg-[#0A111C] border border-[#1E293B] rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5] flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-[#22D3EE]" />
                    <span>Reconnaissance Indicators & Behavioral Flags</span>
                  </h4>
                  <div className="space-y-2.5">
                    {inspectResult.flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-start space-x-3 ${
                          flag.severity === 'high'
                            ? 'bg-[#2A0F1B]/60 border-[#7F1D3A] text-[#FB7185]'
                            : flag.severity === 'medium'
                            ? 'bg-[#2A1B07]/60 border-[#78350F] text-[#FBBF24]'
                            : 'bg-[#0F1A2A] border-[#1E3A4C] text-[#93A1B5]'
                        }`}
                      >
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-[#070B12] border border-current flex-shrink-0 mt-0.5">
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
                <div className="bg-[#0F1A2A] border border-[#1E3A4C] rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#22D3EE] flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Defensive Actions & Investigation Steps</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#E6EDF5]">
                    {inspectResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <ArrowRight className="w-3.5 h-3.5 text-[#22D3EE] flex-shrink-0 mt-0.5" />
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
          <div className="bg-[#0A111C] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools by name, footprint target, or phishing vector..."
                  className="w-full bg-[#070B12] border border-[#243247] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-[#E6EDF5] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
                />
              </div>
              <div className="text-xs font-mono text-[#93A1B5] sm:text-right">
                Showing <strong className="text-[#22D3EE]">{filteredTools.length}</strong> intelligence tools
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#22D3EE] text-[#070B12] border-[#22D3EE] font-semibold'
                      : 'bg-[#070B12] border-[#1E293B] text-[#93A1B5] hover:text-[#E6EDF5] hover:border-[#243247]'
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
                className="bg-[#0A111C] border border-[#1E293B] hover:border-[#22D3EE]/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all group"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Access Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${tool.badgeColor}`}
                    >
                      {tool.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070B12] border border-[#243247] text-[#93A1B5]">
                      {tool.access}
                    </span>
                  </div>

                  {/* Tool Title & Tagline */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#E6EDF5] group-hover:text-[#22D3EE] transition-colors flex items-center space-x-2">
                      <span>{tool.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-[#93A1B5] font-mono mt-0.5">{tool.tagline}</p>
                  </div>

                  {/* Footprint Recon Capability */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-mono uppercase text-[#64748B] font-semibold">
                      What it Footprints:
                    </span>
                    <p className="text-[#CBD5E1] text-xs leading-relaxed">{tool.footprint}</p>
                  </div>

                  {/* Connection to Phishing */}
                  <div className="p-3 rounded-xl bg-[#070B12] border border-[#1E293B] text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-[#22D3EE] text-[11px] font-mono font-bold uppercase">
                      <Info className="w-3.5 h-3.5" />
                      <span>Role in Phishing Attacks & Defense</span>
                    </div>
                    <p className="text-[#93A1B5] text-[11px] leading-relaxed">
                      {tool.phishingContext}
                    </p>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="pt-2 border-t border-[#1E293B]/60">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs font-mono font-medium text-[#22D3EE] hover:text-[#67E8F9] hover:underline"
                  >
                    <span>Launch {tool.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="p-12 text-center bg-[#0A111C] border border-[#1E293B] rounded-2xl space-y-2">
              <Search className="w-8 h-8 text-[#64748B] mx-auto opacity-50" />
              <p className="text-sm text-[#93A1B5]">No tools found matching "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-[#22D3EE] hover:underline font-mono"
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
