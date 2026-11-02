import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Lock,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { defang, defangDomain } from '../utils/defang';
import AsliNakliCard from './AsliNakliCard';

export default function ResultCard({ result, originalContent = '' }) {
  const { isDark } = useTheme();
  const [displayScore, setDisplayScore] = useState(0);
  const [copiedReport, setCopiedReport] = useState(false);

  const score = result?.score;
  const verdict = result?.verdict || 'low';
  const isDummy = result?.dummy === true;

  // Animate score counter over ~650ms
  useEffect(() => {
    if (score === null || score === undefined) {
      setDisplayScore(null);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 650;
    const startTime = performance.now();

    const updateScore = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const currentScore = Math.round(start + (score - start) * easedProgress);

      setDisplayScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    };

    const animId = requestAnimationFrame(updateScore);

    // Fire celebratory Haus palette confetti for safe links/messages (#DA7B93, #376E6F, #2F4454)
    if (verdict === 'low' && score <= 30) {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#DA7B93', '#376E6F', '#2F4454', '#E0A96D'],
        disableForReducedMotion: true,
      });
    }

    return () => cancelAnimationFrame(animId);
  }, [score, verdict]);

  // Risk styling based on Haus Palette
  const getRiskStyles = () => {
    switch (verdict) {
      case 'high':
        return {
          chipText: 'HIGH RISK THREAT',
          chipBg: 'bg-[#2E151B]',
          chipBorder: 'border-[#DA7B93]',
          chipColor: 'text-[#DA7B93]',
          ringColor: '#DA7B93',
          glowColor: 'rgba(218, 123, 147, 0.45)',
          icon: ShieldAlert,
        };
      case 'medium':
        return {
          chipText: 'SUSPICIOUS / MEDIUM RISK',
          chipBg: 'bg-[#2E151B]',
          chipBorder: 'border-[#E0A96D]',
          chipColor: 'text-[#E0A96D]',
          ringColor: '#E0A96D',
          glowColor: 'rgba(224, 169, 109, 0.4)',
          icon: AlertTriangle,
        };
      default:
        return {
          chipText: 'VERIFIED LOW RISK / CLEAN',
          chipBg: 'bg-[#1C3334]',
          chipBorder: 'border-[#376E6F]',
          chipColor: 'text-[#376E6F]',
          ringColor: '#376E6F',
          glowColor: 'rgba(55, 110, 111, 0.45)',
          icon: ShieldCheck,
        };
    }
  };

  const risk = getRiskStyles();
  const RiskIcon = risk.icon;

  // Engine extraction
  const urlMeta = result?.engines?.url?.meta || {};
  const urlFlags = result?.engines?.url?.flags || [];
  const textMeta = result?.engines?.text?.meta || {};
  const headerMeta = result?.engines?.header?.meta || {};
  const headerFlags = result?.engines?.header?.flags || [];

  // Conditional 1: Link Journey
  const hasLinkJourney = Boolean(
    urlMeta.final_destination ||
      (urlMeta.domain_age_days !== null && urlMeta.domain_age_days !== undefined) ||
      urlFlags.some((f) => f.code === 'SHORTENER_REDIRECT')
  );

  // Conditional 2: Asli vs Nakli Lookalike
  const lookalikeFlag = urlFlags.find((f) => f.code === 'BRAND_LOOKALIKE');
  const hasLookalike = Boolean(lookalikeFlag);

  let lookalikeBrand = 'Brand';
  if (lookalikeFlag?.reason) {
    const match = lookalikeFlag.reason.match(/(\w+)\s+jaisa/i);
    if (match) lookalikeBrand = match[1];
  }
  const officialDomainGuess =
    urlMeta.official_domain ||
    (lookalikeBrand.toLowerCase() === 'sbi' ? 'sbi.co.in' : `${lookalikeBrand.toLowerCase()}.com`);
  const spoofedDomain = urlMeta.registered_domain || 'lookalike-domain[.]xyz';

  // Conditional 3: Header Authentication
  const hasAuthResults = Boolean(
    (headerMeta.spf !== null && headerMeta.spf !== undefined) ||
      (headerMeta.dkim !== null && headerMeta.dkim !== undefined) ||
      (headerMeta.dmarc !== null && headerMeta.dmarc !== undefined)
  );
  const hasFromReplyTo = Boolean(headerMeta.from || headerMeta.reply_to);

  const getAuthChipStyle = (status) => {
    if (!status) return { text: 'none', bg: 'bg-[#2E151B]', border: 'border-[#E0A96D]', color: 'text-[#E0A96D]' };
    const s = String(status).toLowerCase();
    if (s.includes('pass')) {
      return { text: 'pass', bg: 'bg-[#1C3334]', border: 'border-[#376E6F]', color: 'text-[#376E6F]' };
    }
    if (s.includes('fail') || s.includes('reject')) {
      return { text: 'fail', bg: 'bg-[#2E151B]', border: 'border-[#DA7B93]', color: 'text-[#DA7B93]' };
    }
    return { text: s, bg: 'bg-[#2E151B]', border: 'border-[#E0A96D]', color: 'text-[#E0A96D]' };
  };

  // Conditional 4: Message Highlights
  const evidencePhrases = result?.evidence || [];
  const hasHighlights = Boolean(evidencePhrases.length > 0 && originalContent);

  // SVG Radial Dimensions
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    displayScore !== null ? circumference - (circumference * displayScore) / 100 : circumference;

  // Copy analysis report handler
  const handleCopyReport = () => {
    const lines = [
      `🛡️ PhishShield India Incident Diagnostic Report`,
      `Score: ${score}/100 [Verdict: ${verdict.toUpperCase()}]`,
      `Summary: ${result?.summary || 'N/A'}`,
      `\nKyun Risky Hai:`,
      ...(result?.reasons || []).map((r) => `- ${r}`),
      `\nNext Steps:`,
      ...(result?.next_steps || []).map((s) => `- ${s}`),
      `\nNational Cybercrime Helpline: 1930 | cybercrime.gov.in`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full bg-[#1C3334]/95 border border-[#376E6F]/35 rounded-[20px] p-5 sm:p-7 backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative top accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${risk.ringColor}, transparent)`,
          boxShadow: `0 0 15px ${risk.ringColor}`,
        }}
      />

      {/* Visible DUMMY banner if mock data */}
      {isDummy && (
        <div className="p-3 bg-[#2E151B] border border-[#E0A96D] rounded-[10px] text-xs font-mono text-[#E0A96D] flex items-center justify-between">
          <span>DUMMY DATA, engines not wired</span>
          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-black/40">Mock</span>
        </div>
      )}

      {/* Top Section: Score Radial Dial + Verdict Chip + Summary */}
      <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          {/* Verdict Chip with Animated Beacon */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider rounded-lg border shadow-sm ${risk.chipBg} ${risk.chipBorder} ${risk.chipColor}`}
            >
              <RiskIcon className="w-4 h-4 animate-pulse" />
              <span>{risk.chipText}</span>
            </span>

            {/* Quick Share / Copy Action */}
            <button
              onClick={handleCopyReport}
              className="p-1.5 rounded-lg bg-[#0F1D1E] border border-[#376E6F]/40 hover:border-[#DA7B93] text-[#B8C5D6] hover:text-[#DA7B93] transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
              title="Copy incident report for police / bank complaint"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#376E6F]" />
                  <span className="text-[10px] text-[#376E6F] font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Copy Report</span>
                </>
              )}
            </button>
          </div>

          {/* Heading / Summary */}
          {result?.category && (
            <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] tracking-tight">
              {result.category}
            </h2>
          )}
          {result?.summary && (
            <p className="text-xs sm:text-sm text-[#B8C5D6] leading-relaxed">
              {result.summary}
            </p>
          )}
        </div>

        {/* Circular Radial Score Dial with Holographic Glow */}
        <div className="shrink-0 flex flex-col items-center justify-center self-center sm:self-auto">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Ambient circular glow */}
            <div
              className="absolute inset-2 rounded-full blur-xl pointer-events-none transition-all duration-700"
              style={{ backgroundColor: risk.glowColor }}
            />

            <svg className="w-28 h-28 transform -rotate-90 relative z-10" aria-hidden="true">
              {/* Background Track */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={isDark ? '#0F1D1E' : '#E2E8F0'}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={displayScore !== null ? risk.ringColor : '#B8C5D6'}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${risk.ringColor})`,
                }}
              />
            </svg>

            {/* Inner Dial Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
              {displayScore !== null ? (
                <>
                  <span className="text-3xl font-mono font-bold text-[#F8FAFC] tracking-tight leading-none">
                    {displayScore}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B8C5D6] mt-0.5">
                    / 100 RISK
                  </span>
                </>
              ) : (
                <span className="text-xs font-mono text-[#B8C5D6]">No score</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY 1930 CYBER HELPLINE BANNER (High Risk Urgent SOS in Haus Plum & Rose) */}
      {verdict === 'high' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[14px] bg-gradient-to-r from-[#2E151B] to-[#1C3334] border border-[#DA7B93] p-4 text-xs font-mono space-y-2.5 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[#DA7B93] font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4 text-[#DA7B93] animate-bounce" />
              <span>URGENT // REPORT CYBER FINANCIAL FRAUD</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#DA7B93]/20 text-[#DA7B93] font-bold text-[10px]">
              Toll-Free 24x7
            </span>
          </div>
          <p className="text-[#F8FAFC]/90 leading-relaxed text-[11px]">
            Agar aapne is link par click kiya ya paise transfer kiye hain, turant bank account freeze karane ke liye{' '}
            <strong className="text-[#DA7B93] underline font-bold">1930</strong> par call karein. Golden Hour (shuruati 2 ghante) mein report karne se paise recover hone ke chances sabse zyada hote hain.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DA7B93] hover:bg-[#E899AE] text-[#1C3334] font-bold text-xs transition-colors cursor-pointer shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1D1E] border border-[#DA7B93]/50 hover:border-[#DA7B93] text-[#DA7B93] text-xs transition-colors"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}

      {/* KYUN RISKY HAI */}
      {result?.reasons && result.reasons.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-[#376E6F]/30">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#DA7B93]" />
            <span>KYUN RISKY HAI // DETECTED ANOMALIES</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#F8FAFC]">
            {result.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2.5 p-2 rounded-lg bg-[#0F1D1E]/70 border border-[#376E6F]/30"
              >
                <span className="text-[#DA7B93] font-bold font-mono select-none mt-0.5">❯</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CONDITIONAL PANEL 1: Asli vs Nakli Lookalike Comparison */}
      {hasLookalike && (
        <AsliNakliCard
          brand={lookalikeBrand}
          officialDomain={officialDomainGuess}
          fakeDomain={spoofedDomain}
          similarity={89}
        />
      )}

      {/* CONDITIONAL PANEL 2: Link Journey Forensics */}
      {hasLinkJourney && (
        <div className="space-y-2.5 pt-2 border-t border-[#376E6F]/30">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6] flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#DA7B93]" />
            <span>LINK JOURNEY & UN-SHORTENER FORENSICS</span>
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {/* Original URL */}
            <div className="p-3 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[12px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#B8C5D6] text-[10px]">HOP 0:</span>
                <span className="text-[#F8FAFC] truncate">
                  {defang(urlMeta.normalized_url || originalContent)}
                </span>
              </div>
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#2E151B] border border-[#DA7B93]/40 text-[#DA7B93]">
                Short link
              </span>
            </div>

            {/* Destination URL & Domain Age */}
            <div className="p-3 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[12px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#DA7B93] text-[10px]">FINAL:</span>
                <span className="text-[#DA7B93] truncate font-semibold">
                  {defang(urlMeta.final_destination || urlMeta.registered_domain || 'destination[.]xyz')}
                </span>
              </div>
              {urlMeta.domain_age_days !== null && urlMeta.domain_age_days !== undefined && (
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#2E151B] border border-[#DA7B93]/50 text-[#DA7B93] font-semibold">
                  Domain {urlMeta.domain_age_days} din purana
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL PANEL 3: Authentication Chips & From vs Reply-To */}
      {(hasAuthResults || hasFromReplyTo) && (
        <div className="space-y-3 pt-2 border-t border-[#376E6F]/30">
          {hasAuthResults && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6]">
                EMAIL PROTOCOL AUTHENTICATION
              </h3>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {headerMeta.spf !== null &&
                  headerMeta.spf !== undefined &&
                  (() => {
                    const s = getAuthChipStyle(headerMeta.spf);
                    return (
                      <span className={`px-3 py-1 rounded-[8px] border ${s.bg} ${s.border} ${s.color}`}>
                        SPF: {s.text.toUpperCase()}
                      </span>
                    );
                  })()}
                {headerMeta.dkim !== null &&
                  headerMeta.dkim !== undefined &&
                  (() => {
                    const s = getAuthChipStyle(headerMeta.dkim);
                    return (
                      <span className={`px-3 py-1 rounded-[8px] border ${s.bg} ${s.border} ${s.color}`}>
                        DKIM: {s.text.toUpperCase()}
                      </span>
                    );
                  })()}
                {headerMeta.dmarc !== null &&
                  headerMeta.dmarc !== undefined &&
                  (() => {
                    const s = getAuthChipStyle(headerMeta.dmarc);
                    return (
                      <span className={`px-3 py-1 rounded-[8px] border ${s.bg} ${s.border} ${s.color}`}>
                        DMARC: {s.text.toUpperCase()}
                      </span>
                    );
                  })()}
              </div>
            </div>
          )}

          {hasFromReplyTo && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6]">
                FROM VS REPLY-TO ALIGNMENT
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                {headerMeta.from && (
                  <div className="p-2.5 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[10px] flex items-center justify-between">
                    <span className="text-[#B8C5D6]">From Header:</span>
                    <span className="text-[#F8FAFC] font-bold">{defangDomain(headerMeta.from)}</span>
                  </div>
                )}
                {headerMeta.reply_to && (
                  <div className="p-2.5 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[10px] flex items-center justify-between">
                    <span className="text-[#B8C5D6]">Reply-To Header:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#DA7B93] font-bold">{defangDomain(headerMeta.reply_to)}</span>
                      {headerMeta.reply_to_mismatch && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2E151B] border border-[#DA7B93] text-[#DA7B93] font-bold animate-pulse">
                          MISMATCH (Spoofing)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONDITIONAL PANEL 4: Message Highlights */}
      {hasHighlights && (
        <div className="space-y-2.5 pt-2 border-t border-[#376E6F]/30">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DA7B93]" />
            <span>MESSAGE MEIN KYA PAKDA // EVIDENCE TOKENS</span>
          </h3>
          <div className="p-3.5 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[12px] text-xs font-mono leading-relaxed text-[#F8FAFC]">
            {(() => {
              let highlighted = originalContent;
              evidencePhrases.forEach((phrase) => {
                if (phrase && phrase.length > 2) {
                  const reg = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                  highlighted = highlighted.replace(reg, '||MARK||$1||ENDMARK||');
                }
              });
              const parts = highlighted.split(/(\|\|MARK\|\||\|\|ENDMARK\|\|)/);
              let isMarked = false;
              return parts.map((part, i) => {
                if (part === '||MARK||') {
                  isMarked = true;
                  return null;
                }
                if (part === '||ENDMARK||') {
                  isMarked = false;
                  return null;
                }
                if (isMarked) {
                  return (
                    <mark
                      key={i}
                      className="bg-[#2E151B] text-[#DA7B93] px-1.5 py-0.5 rounded border border-[#DA7B93]/60 font-bold"
                    >
                      {defang(part)}
                    </mark>
                  );
                }
                return <span key={i}>{defang(part)}</span>;
              });
            })()}
          </div>
        </div>
      )}

      {/* Next steps list */}
      {result?.next_steps && result.next_steps.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-[#376E6F]/30">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#B8C5D6] flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#376E6F]" />
            <span>KAREIN AUR KYA NA KAREIN // ACTIONABLE ADVISORY</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#F8FAFC]">
            {result.next_steps.slice(0, 3).map((step, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2.5 p-2 rounded-lg bg-[#0F1D1E]/70 border border-[#376E6F]/30"
              >
                <span className="text-[#DA7B93] font-bold font-mono select-none mt-0.5">✔</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible Engine Breakdown */}
      {result?.engines && (
        <details className="pt-2 border-t border-[#376E6F]/30 group">
          <summary className="text-xs font-mono text-[#B8C5D6] hover:text-[#DA7B93] cursor-pointer select-none flex items-center justify-between py-1 transition-colors">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#DA7B93]" />
              <span>TRI-ENGINE TECHNICAL BREAKDOWN</span>
            </span>
            <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 space-y-3 pt-2 text-xs font-mono">
            {Object.entries(result.engines).map(([name, data]) => {
              if (!data) return null;
              return (
                <div
                  key={name}
                  className="p-3.5 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[12px] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DA7B93]" />
                      {name} Engine
                    </span>
                    <span className="text-[#B8C5D6]">
                      Score:{' '}
                      <strong className="text-[#DA7B93]">
                        {data.score !== null && data.score !== undefined ? `${data.score}/100` : 'N/A'}
                      </strong>
                    </span>
                  </div>
                  {data.flags && data.flags.length > 0 ? (
                    <div className="space-y-1.5">
                      {data.flags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="flex items-baseline space-x-2 text-[11px] p-1.5 rounded bg-[#1C3334]"
                        >
                          <span className="text-[#DA7B93] font-bold shrink-0">{flag.code}:</span>
                          <span className="text-[#B8C5D6]">{flag.reason}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#B8C5D6] italic">Koi anomaly flag nahi mila</div>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </motion.div>
  );
}
