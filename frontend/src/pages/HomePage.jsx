import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ArrowRight, Sparkles, MessageSquare, Link2, Mail, Globe, Cpu, Zap, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import RadarHero from '../components/RadarHero';
import LiveTelemetry from '../components/LiveTelemetry';
import QuickTestLauncher from '../components/QuickTestLauncher';

export default function HomePage() {
  const { isDark } = useTheme();
  const [pasteContent, setPasteContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleAutoAnalyze = (e) => {
    if (e) e.preventDefault();
    const text = pasteContent.trim();
    if (!text) return;

    let targetRoute = '/sms';

    if (/^(?:Authentication-Results:|Received:|From:|DKIM-Signature:|Return-Path:)/im.test(text)) {
      targetRoute = '/email';
    } else if (!text.includes(' ') && !text.includes('\n')) {
      if (/^(?:https?|hxxps?|ftp):\/\//i.test(text) || text.startsWith('www.') || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(text)) {
        targetRoute = '/url';
      }
    }

    navigate(targetRoute, { state: { content: text, autoRun: true } });
  };

  const handleSelectSample = (sampleText) => {
    setPasteContent(sampleText);
    setTimeout(() => {
      const inputEl = document.getElementById('home-paste-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Two Columns Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
        {/* LEFT COLUMN (lg:col-span-7) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Graviton Hackathon Chip with Pulsing Beacon */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#2E151B] border border-[#DA7B93]/40 text-[#DA7B93] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#DA7B93] animate-ping" />
            <span>GRAVITON 2026 · PROBLEM STATEMENT 02</span>
          </div>

          {/* H1 Heading with Haus Palette Gradient */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#F8FAFC] leading-[1.08]">
            Multi-Engine AI Defense Against{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isDark
                ? 'from-[#DA7B93] via-[#E899AE] to-[#376E6F]'
                : 'from-[#B83A5D] via-[#DA7B93] to-[#205455]'
            }`}>
              Indian Cyber Frauds
            </span>
          </h1>

          {/* One line description */}
          <p className="text-sm sm:text-base text-[#B8C5D6] leading-relaxed max-w-2xl">
            Real-time inspection for fake KYC, digital arrest summons, FASTag blacklist links, and electricity bill scams. Get explainable risk scores and direct 1930 reporting guidance in clear Hinglish.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/sms"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-[#DA7B93] ${
                  isDark
                    ? 'bg-[#DA7B93] text-[#1C3334] hover:bg-[#E899AE] shadow-[#DA7B93]/20'
                    : 'bg-[#B83A5D] text-white hover:bg-[#9E2B4B] shadow-rose-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Check an SMS</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/url"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] border font-semibold text-xs sm:text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DA7B93] shadow-sm ${
                  isDark
                    ? 'bg-[#1C3334]/80 border-[#376E6F]/60 text-[#F8FAFC] hover:bg-[#2F4454] hover:border-[#DA7B93] hover:text-[#DA7B93]'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-[#B83A5D] hover:text-[#B83A5D] hover:bg-slate-50'
                }`}
              >
                <Link2 className={`w-4 h-4 ${isDark ? 'text-[#DA7B93]' : 'text-[#B83A5D]'}`} />
                <span>Check a link</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/email"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] border font-semibold text-xs sm:text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DA7B93] shadow-sm ${
                  isDark
                    ? 'bg-[#1C3334]/80 border-[#376E6F]/40 text-[#B8C5D6] hover:bg-[#2F4454] hover:text-[#F8FAFC]'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-[#B83A5D] hover:text-[#B83A5D] hover:bg-slate-50'
                }`}
              >
                <Mail className={`w-4 h-4 ${isDark ? 'text-[#376E6F]' : 'text-[#205455]'}`} />
                <span>Email Headers</span>
              </Link>
            </motion.div>
          </div>

          {/* Compact Auto-detect Paste Box with Haus Cyber Styling */}
          <form onSubmit={handleAutoAnalyze} className="pt-2">
            <div
              className={`relative bg-[#1C3334]/80 border rounded-[16px] p-4 backdrop-blur-md space-y-3 transition-all duration-300 shadow-xl ${
                isFocused
                  ? 'border-[#DA7B93] shadow-[0_0_25px_rgba(218,123,147,0.25)]'
                  : 'border-[#376E6F]/40 hover:border-[#DA7B93]/50'
              }`}
            >
              {/* Decorative cyber corner accents in Rose */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#DA7B93]/70 rounded-tl" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#DA7B93]/70 rounded-br" />

              <div className="flex items-center justify-between">
                <label htmlFor="home-paste-input" className="block text-xs font-mono text-[#B8C5D6] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#DA7B93]" />
                  <span>UNIVERSAL AUTO-DETECT SCANNER:</span>
                </label>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  isDark
                    ? 'text-[#376E6F] bg-[#1C3334] border-[#376E6F]/60'
                    : 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]'
                }`}>
                  Tri-Engine Ready
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="home-paste-input"
                  type="text"
                  value={pasteContent}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste suspicious SMS, link (hxxp://...), or RFC email headers..."
                  className="flex-1 bg-[#0F1D1E] border border-[#376E6F]/40 rounded-[10px] px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-[#B8C5D6]/40 focus:outline-none focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93] transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!pasteContent.trim()}
                  className={`min-h-[42px] px-5 py-2.5 font-semibold text-xs sm:text-sm rounded-[10px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2 shadow-md ${
                    isDark
                      ? 'bg-gradient-to-r from-[#2E151B] to-[#376E6F] hover:from-[#DA7B93] hover:to-[#376E6F] border border-[#DA7B93]/60 text-[#DA7B93] hover:text-[#1C3334] focus:ring-2 focus:ring-[#DA7B93] shadow-[#DA7B93]/15'
                      : 'bg-[#B83A5D] hover:bg-[#9E2B4B] border border-[#B83A5D] text-white shadow-rose-200'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Analyze</span>
                </motion.button>
              </div>

              {/* 1-Click Interactive Test Scenarios */}
              <QuickTestLauncher onSelectSample={handleSelectSample} />
            </div>
          </form>
        </motion.div>

        {/* RIGHT COLUMN (lg:col-span-5): Cyber Threat Radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-5 flex items-center justify-center lg:justify-end"
        >
          <RadarHero />
        </motion.div>
      </div>

      {/* Live Cyber Intelligence & Telemetry Bar */}
      <LiveTelemetry />

      {/* Deep-Dive Inspection Engines Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-[#376E6F]/30 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#DA7B93]" />
            <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#F8FAFC]">
              SPECIALIZED DEFENSE MODULES // INDIAN CYBER VECTORS
            </h2>
          </div>
          <span className="text-xs font-mono text-[#B8C5D6]">4 Modules Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SMS / WhatsApp Module */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="rounded-[16px] bg-[#1C3334]/80 border border-[#376E6F]/30 p-5 backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-[#DA7B93]/60 hover:shadow-lg hover:shadow-[#DA7B93]/10 transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#2E151B] border border-[#DA7B93]/40 flex items-center justify-center group-hover:border-[#DA7B93] transition-colors">
                <MessageSquare className="w-5 h-5 text-[#DA7B93]" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#DA7B93] transition-colors">
                SMS & WhatsApp
              </h3>
              <p className="text-xs text-[#B8C5D6] leading-relaxed">
                Indian scam pack: Fake KYC, FASTag blacklist, Digital arrest, electricity bill cut, and Hinglish urgency phrasing.
              </p>
            </div>
            <Link
              to="/sms"
              className="text-xs font-semibold text-[#DA7B93] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform w-fit"
            >
              <span>Launch Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* URL Forensics Module */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="rounded-[16px] bg-[#1C3334]/80 border border-[#376E6F]/30 p-5 backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-[#376E6F]/70 hover:shadow-lg hover:shadow-[#376E6F]/15 transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#1C3334] border border-[#376E6F]/60 flex items-center justify-center group-hover:border-[#376E6F] transition-colors">
                <Link2 className="w-5 h-5 text-[#376E6F]" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#376E6F] transition-colors">
                Link Journey Forensics
              </h3>
              <p className="text-xs text-[#B8C5D6] leading-relaxed">
                Recursive unshortener up to 5 hops, typosquatting Levenshtein distance, combosquatting, and RDAP domain age profiling.
              </p>
            </div>
            <Link
              to="/url"
              className="text-xs font-semibold text-[#376E6F] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform w-fit"
            >
              <span>Inspect Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Email Headers Module */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="rounded-[16px] bg-[#1C3334]/80 border border-[#376E6F]/30 p-5 backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-[#DA7B93]/60 hover:shadow-lg hover:shadow-[#DA7B93]/10 transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#2E151B] border border-[#DA7B93]/30 flex items-center justify-center group-hover:border-[#DA7B93] transition-colors">
                <Mail className="w-5 h-5 text-[#DA7B93]" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#DA7B93] transition-colors">
                Email Authentication
              </h3>
              <p className="text-xs text-[#B8C5D6] leading-relaxed">
                Raw RFC 5322 header forensics: SPF, DKIM, DMARC validation, Display Name spoofing, and Free Webmail impersonation.
              </p>
            </div>
            <Link
              to="/email"
              className="text-xs font-semibold text-[#DA7B93] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform w-fit"
            >
              <span>Analyze Headers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* OSINT Footprint Module */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="rounded-[16px] bg-[#1C3334]/80 border border-[#376E6F]/30 p-5 backdrop-blur-md flex flex-col justify-between space-y-4 group hover:border-[#2F4454] hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#2F4454] border border-[#376E6F]/40 flex items-center justify-center group-hover:border-[#DA7B93] transition-colors">
                <Globe className="w-5 h-5 text-[#DA7B93]" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#DA7B93] transition-colors">
                Passive OSINT & Footprint
              </h3>
              <p className="text-xs text-[#B8C5D6] leading-relaxed">
                Infrastructure reconnaissance: DNS, PTR reverse lookup, MX mail hygiene, disposable hosting check, and 12+ OSINT tools directory.
              </p>
            </div>
            <Link
              to="/footprint"
              className="text-xs font-semibold text-[#DA7B93] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform w-fit"
            >
              <span>Explore OSINT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
