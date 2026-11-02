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
import { useTheme } from '../context/ThemeContext';
import ExtensionModal from './ExtensionModal';

export default function Footer() {
  const { isDark } = useTheme();
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
    <footer className="w-full border-t border-[#376E6F]/30 bg-[#0E1C1D]/95 backdrop-blur-md text-[#B8C5D6] transition-colors duration-200 mt-auto">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-12 space-y-10">
        {/* Top Emergency Helpline Banner (Golden Hour Action) */}
        <div className="rounded-[16px] bg-[#1C3334] border border-[#376E6F]/40 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#2E151B] border-[#DA7B93]/50 text-[#DA7B93]' : 'bg-[#FDF2F4] border-[#DA7B93] text-[#B83A5D]'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#F8FAFC]">
                  Victim of Financial Cyber Fraud? Act in the "Golden Hour"
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#2E151B] border border-[#DA7B93]/40 text-[#DA7B93]">
                  24x7 Emergency
                </span>
              </div>
              <p className="text-xs text-[#B8C5D6] mt-0.5 leading-relaxed">
                Dial helpline <strong className="text-[#DA7B93] font-mono">1930</strong> immediately to block transaction channels and freeze stolen money, or file a complaint at{' '}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#376E6F] hover:text-[#DA7B93] hover:underline font-mono"
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
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#2E151B] border border-[#DA7B93]/50 text-[#DA7B93] hover:bg-[#DA7B93] hover:text-[#1C3334] text-xs font-mono font-medium transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#1C3334] border border-[#376E6F]/50 text-[#F8FAFC] hover:border-[#DA7B93] hover:text-[#DA7B93] text-xs font-mono font-medium transition-all"
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
              className="inline-flex items-center space-x-2 font-mono text-sm tracking-widest font-bold text-[#F8FAFC] hover:text-[#DA7B93] transition-colors focus:outline-none focus:ring-2 focus:ring-[#DA7B93] rounded"
            >
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                isDark ? 'bg-[#2E151B] border-[#DA7B93]/40 text-[#DA7B93]' : 'bg-[#FDF2F4] border-[#DA7B93] text-[#B83A5D]'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>PHISHSHIELD // INDIA</span>
            </Link>

            <p className="text-xs text-[#B8C5D6] leading-relaxed">
              Explainable phishing and scam detection system built for India's digital ecosystem. Powered by multi-engine heuristics, deep link forensics, and Hindi/Hinglish NLP models.
            </p>

            {/* Hackathon Badge & System Engine Status */}
            <div className="p-3 rounded-[12px] bg-[#0E1C1D] border border-[#376E6F]/30 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[#F8FAFC]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#376E6F] animate-pulse" />
                  <span className="font-semibold text-xs">Engine Cluster</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2E151B] border border-[#DA7B93]/40 text-[#DA7B93]">
                  3 / 3 Ready
                </span>
              </div>
              <div className="text-[11px] text-[#B8C5D6] grid grid-cols-2 gap-1.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#376E6F]" />
                  <span>URL Forensics</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#376E6F]" />
                  <span>SMS / NLP</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#376E6F]" />
                  <span>Email Headers</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#DA7B93]" />
                  <span>Fusion Model</span>
                </span>
              </div>
            </div>

            {/* Chrome Extension CTA button */}
            <div>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#2E151B] border border-[#DA7B93]/50 text-[#DA7B93] hover:bg-[#DA7B93] hover:text-[#1C3334] text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DA7B93]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Real-Time Extension</span>
              </button>
            </div>
          </div>

          {/* Column 2: Detection Suite (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#F8FAFC]">
              Detection Suite
            </h4>
            <ul className="space-y-2 text-xs">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={scrollToTop}
                    className="text-[#B8C5D6] hover:text-[#DA7B93] transition-colors inline-block focus:outline-none focus:ring-1 focus:ring-[#DA7B93] rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="text-[#B8C5D6] hover:text-[#DA7B93] transition-colors text-left focus:outline-none focus:ring-1 focus:ring-[#DA7B93] rounded"
                >
                  Browser Extension v1.0
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Indian Cyber Helplines & Authorities (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#F8FAFC]">
              National Helplines
            </h4>
            <ul className="space-y-2.5 text-xs">
              {govResources.map((res) => (
                <li key={res.name}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block text-[#B8C5D6] hover:text-[#DA7B93] transition-colors focus:outline-none focus:ring-1 focus:ring-[#DA7B93] rounded"
                  >
                    <div className="flex items-center gap-1 font-medium text-[#F8FAFC] group-hover:text-[#DA7B93]">
                      <span>{res.name}</span>
                      <ExternalLink className="w-3 h-3 text-[#B8C5D6] group-hover:text-[#DA7B93] transition-colors" />
                    </div>
                    <div className="text-[11px] text-[#B8C5D6]/80 mt-0.5 leading-snug">
                      {res.desc}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Protected Threat Vectors (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#F8FAFC]">
              Scam Vectors Monitored
            </h4>
            <div className="space-y-2">
              {scamVectors.map((vector) => (
                <div
                  key={vector.title}
                  className="p-2 rounded-[8px] bg-[#0E1C1D] border border-[#376E6F]/30 flex items-center justify-between text-xs"
                >
                  <span className="text-[#F8FAFC] truncate text-[11px] pr-2">
                    {vector.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2E151B] text-[#DA7B93] border border-[#DA7B93]/40 shrink-0">
                    {vector.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Disclaimers, Privacy Pledge & Back to Top */}
        <div className="border-t border-[#376E6F]/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[#F8FAFC]">
              <span>PhishShield India · GRAVITON 2026 (PS 02)</span>
              <span className="text-[#376E6F] hidden sm:inline">|</span>
              <span className="text-[#376E6F] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>100% In-Memory Analysis · Zero Telemetry</span>
              </span>
            </div>
            <p className="text-[11px] text-[#B8C5D6] max-w-2xl leading-normal">
              Educational & cybersecurity triage prototype. No passwords, credentials, or sensitive headers are stored on servers. Always verify financial claims via official branch channels.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0E1C1D] border border-[#376E6F]/40 hover:border-[#DA7B93]/50 text-[#B8C5D6] hover:text-[#DA7B93] transition-all text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#DA7B93] cursor-pointer"
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
