import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  ArrowUp,
  Download,
  Lock,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import ExtensionModal from './ExtensionModal';

export default function Footer() {
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home Auto-Detector', path: '/' },
    { name: 'SMS Scam Analyzer', path: '/sms' },
    { name: 'URL & Link Forensics', path: '/url' },
    { name: 'Email Header Check', path: '/email' },
    { name: 'Digital Footprint & OSINT', path: '/footprint' },
  ];

  const govResources = [
    {
      name: 'National Cyber Crime Portal',
      url: 'https://cybercrime.gov.in',
      desc: 'Official filing portal for cybercrime & financial fraud',
    },
    {
      name: 'Helpline 1930 (Citizen Support)',
      url: 'tel:1930',
      desc: '24x7 toll-free citizen financial fraud reporting',
    },
    {
      name: 'DoT Chakshu (Sanchar Saathi)',
      url: 'https://sancharsaathi.gov.in/sfc/',
      desc: 'Report suspected fraudulent calls, SMS & WhatsApp',
    },
    {
      name: 'CERT-In Incident Response',
      url: 'https://www.cert-in.org.in',
      desc: 'National nodal agency for cybersecurity incident response',
    },
    {
      name: 'RBI Kehta Hai (Fraud Awareness)',
      url: 'https://rbikehtahai.rbi.org.in',
      desc: 'Reserve Bank of India safe digital banking advisories',
    },
  ];

  const scamVectors = [
    { title: 'Digital Arrest & Police Impersonation', tag: 'High Severity' },
    { title: 'Fake Electricity Disconnection SMS', tag: 'Urgent Threat' },
    { title: 'Bank KYC & PAN Card Expiry Spoofs', tag: 'Credentials' },
    { title: 'FASTag Balance & Toll Surcharge Fraud', tag: 'Smishing' },
    { title: 'Telegram Part-time Work / Task Scam', tag: 'Ponzi / Trap' },
    { title: 'Malicious APK Sideloading via WhatsApp', tag: 'Android Malware' },
  ];

  return (
    <footer className="w-full border-t border-[#0E1622] bg-[#070B12]/95 backdrop-blur-md text-[#93A1B5] transition-colors duration-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-10">
        {/* Top Emergency Helpline Banner (Golden Hour Action) */}
        <div className="rounded-[16px] bg-[#0A111C] border border-[#243247] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#2A1B07] border border-[#78350F] flex items-center justify-center shrink-0 text-[#FBBF24]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#E6EDF5]">
                  Victim of Financial Cyber Fraud? Act in the "Golden Hour"
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#2A1B07] border border-[#78350F] text-[#FBBF24]">
                  24x7 Emergency
                </span>
              </div>
              <p className="text-xs text-[#93A1B5] mt-0.5 leading-relaxed">
                Dial helpline <strong className="text-[#FBBF24] font-mono">1930</strong> immediately to block transaction channels and freeze stolen money, or file a complaint at{' '}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#22D3EE] hover:underline font-mono"
                >
                  cybercrime.gov.in
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <a
              href="tel:1930"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#2A1B07] border border-[#78350F] text-[#FBBF24] hover:bg-[#78350F]/20 text-xs font-mono font-medium transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE] hover:bg-[#1E3A4C]/50 text-xs font-mono font-medium transition-colors"
            >
              <span>Report Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main Footer Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand & Project Details (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              onClick={scrollToTop}
              className="inline-flex items-center space-x-2 font-mono text-sm tracking-widest font-bold text-[#E6EDF5] hover:text-[#22D3EE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22D3EE] rounded"
            >
              <div className="w-6 h-6 rounded-lg bg-[#0F1A2A] border border-[#1E3A4C] flex items-center justify-center text-[#22D3EE]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>PHISHSHIELD // INDIA</span>
            </Link>

            <p className="text-xs text-[#93A1B5] leading-relaxed">
              Explainable phishing and scam detection system built for India's digital ecosystem. Powered by multi-engine heuristics, deep link forensics, and Hindi/Hinglish NLP models.
            </p>

            {/* Hackathon Badge & System Engine Status */}
            <div className="p-3 rounded-[12px] bg-[#0A111C] border border-[#1B2433] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[#E6EDF5]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span className="font-semibold text-xs">Engine Cluster</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0F1A2A] border border-[#1E3A4C] text-[#34D399]">
                  3 / 3 Ready
                </span>
              </div>
              <div className="text-[11px] text-[#93A1B5] grid grid-cols-2 gap-1.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                  <span>URL Forensics</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                  <span>SMS / NLP</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                  <span>Email Headers</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                  <span>Fusion Model</span>
                </span>
              </div>
            </div>

            {/* Chrome Extension CTA button */}
            <div>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE] hover:border-[#22D3EE] hover:bg-[#1E3A4C]/30 text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Real-Time Extension</span>
              </button>
            </div>
          </div>

          {/* Column 2: Detection Suite (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#E6EDF5]">
              Detection Suite
            </h4>
            <ul className="space-y-2 text-xs">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={scrollToTop}
                    className="text-[#93A1B5] hover:text-[#22D3EE] transition-colors inline-block focus:outline-none focus:ring-1 focus:ring-[#22D3EE] rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="text-[#93A1B5] hover:text-[#22D3EE] transition-colors text-left focus:outline-none focus:ring-1 focus:ring-[#22D3EE] rounded"
                >
                  Browser Extension v1.0
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Indian Cyber Helplines & Authorities (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#E6EDF5]">
              National Helplines
            </h4>
            <ul className="space-y-2.5 text-xs">
              {govResources.map((res) => (
                <li key={res.name}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block text-[#93A1B5] hover:text-[#22D3EE] transition-colors focus:outline-none focus:ring-1 focus:ring-[#22D3EE] rounded"
                  >
                    <div className="flex items-center gap-1 font-medium text-[#E6EDF5] group-hover:text-[#22D3EE]">
                      <span>{res.name}</span>
                      <ExternalLink className="w-3 h-3 text-[#93A1B5] group-hover:text-[#22D3EE] transition-colors" />
                    </div>
                    <div className="text-[11px] text-[#93A1B5]/80 mt-0.5 leading-snug">
                      {res.desc}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Protected Threat Vectors (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#E6EDF5]">
              Scam Vectors Monitored
            </h4>
            <div className="space-y-2">
              {scamVectors.map((vector) => (
                <div
                  key={vector.title}
                  className="p-2 rounded-[8px] bg-[#0A111C] border border-[#1B2433] flex items-center justify-between text-xs"
                >
                  <span className="text-[#E6EDF5] truncate text-[11px] pr-2">
                    {vector.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0F1A2A] text-[#22D3EE] border border-[#1E3A4C] shrink-0">
                    {vector.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Disclaimers, Privacy Pledge & Back to Top */}
        <div className="border-t border-[#0E1622] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[#E6EDF5]">
              <span>PhishShield India · GRAVITON 2026 (PS 02)</span>
              <span className="text-[#243247] hidden sm:inline">|</span>
              <span className="text-[#34D399] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>100% In-Memory Analysis · Zero Telemetry</span>
              </span>
            </div>
            <p className="text-[11px] text-[#93A1B5] max-w-2xl leading-normal">
              Educational & cybersecurity triage prototype. No passwords, credentials, or sensitive headers are stored on servers. Always verify financial claims via official branch channels.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0A111C] border border-[#243247] hover:border-[#1E3A4C] text-[#93A1B5] hover:text-[#22D3EE] transition-all text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#22D3EE] cursor-pointer"
              title="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Extension Download Guide Modal */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </footer>
  );
}
