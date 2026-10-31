import { useState, useEffect } from 'react';
import { defang, defangDomain } from '../utils/defang';

export default function ResultCard({ result, originalContent = '' }) {
  const [displayScore, setDisplayScore] = useState(0);

  const score = result?.score;
  const verdict = result?.verdict || 'low';
  const isDummy = result?.dummy === true;

  // Animate score counter over ~600ms (respects prefers-reduced-motion)
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
    const duration = 600; // ms
    const startTime = performance.now();

    const updateScore = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const currentScore = Math.round(start + (score - start) * easedProgress);

      setDisplayScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    };

    const animId = requestAnimationFrame(updateScore);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  // Risk styling based on verdict (ONLY colors specified in design tokens)
  const getRiskStyles = () => {
    switch (verdict) {
      case 'high':
        return {
          chipText: 'HIGH RISK',
          chipBg: 'bg-[#2A0F1B]',
          chipBorder: 'border-[#7F1D3A]',
          chipColor: 'text-[#FB7185]',
          ringColor: '#FB7185',
        };
      case 'medium':
        return {
          chipText: 'MEDIUM RISK',
          chipBg: 'bg-[#2A1B07]',
          chipBorder: 'border-[#78350F]',
          chipColor: 'text-[#FBBF24]',
          ringColor: '#FBBF24',
        };
      default:
        return {
          chipText: 'LOW RISK',
          chipBg: 'bg-[#0B2018]',
          chipBorder: 'border-[#14532D]',
          chipColor: 'text-[#34D399]',
          ringColor: '#34D399',
        };
    }
  };

  const risk = getRiskStyles();

  // Engine extraction
  const urlMeta = result?.engines?.url?.meta || {};
  const urlFlags = result?.engines?.url?.flags || [];
  const textMeta = result?.engines?.text?.meta || {};
  const headerMeta = result?.engines?.header?.meta || {};
  const headerFlags = result?.engines?.header?.flags || [];

  // Conditional 1: Link Journey data check
  const hasLinkJourney = Boolean(
    urlMeta.final_destination ||
    urlMeta.domain_age_days !== null && urlMeta.domain_age_days !== undefined ||
    urlFlags.some((f) => f.code === 'SHORTENER_REDIRECT')
  );

  // Conditional 2: Asli vs Nakli Lookalike check
  const lookalikeFlag = urlFlags.find((f) => f.code === 'BRAND_LOOKALIKE');
  const hasLookalike = Boolean(lookalikeFlag);

  // Extract lookalike brand name from flag reason if available
  let lookalikeBrand = 'Brand';
  if (lookalikeFlag?.reason) {
    const match = lookalikeFlag.reason.match(/(\w+)\s+jaisa/i);
    if (match) lookalikeBrand = match[1];
  }
  const officialDomainGuess = urlMeta.official_domain || (lookalikeBrand.toLowerCase() === 'sbi' ? 'sbi.co.in' : `${lookalikeBrand.toLowerCase()}.com`);
  const spoofedDomain = urlMeta.registered_domain || 'lookalike-domain[.]xyz';

  // Conditional 3: Header Authentication & From vs Reply-To check
  const hasAuthResults = Boolean(
    headerMeta.spf !== null && headerMeta.spf !== undefined ||
    headerMeta.dkim !== null && headerMeta.dkim !== undefined ||
    headerMeta.dmarc !== null && headerMeta.dmarc !== undefined
  );
  const hasFromReplyTo = Boolean(headerMeta.from || headerMeta.reply_to);

  const getAuthChipStyle = (status) => {
    if (!status) return { text: 'none', bg: 'bg-[#2A1B07]', border: 'border-[#78350F]', color: 'text-[#FBBF24]' };
    const s = String(status).toLowerCase();
    if (s.includes('pass')) {
      return { text: 'pass', bg: 'bg-[#0B2018]', border: 'border-[#14532D]', color: 'text-[#34D399]' };
    }
    if (s.includes('fail') || s.includes('reject')) {
      return { text: 'fail', bg: 'bg-[#2A0F1B]', border: 'border-[#7F1D3A]', color: 'text-[#FB7185]' };
    }
    return { text: s, bg: 'bg-[#2A1B07]', border: 'border-[#78350F]', color: 'text-[#FBBF24]' };
  };

  // Conditional 4: Message Highlights check
  const evidencePhrases = result?.evidence || [];
  const hasHighlights = Boolean(evidencePhrases.length > 0 && originalContent);

  // SVG Ring dimensions
  const radius = 42;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = displayScore !== null
    ? circumference - (circumference * displayScore) / 100
    : circumference;

  return (
    <div className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] p-5 sm:p-6 backdrop-blur-md space-y-6">
      {/* Visible DUMMY banner if mock data */}
      {isDummy && (
        <div className="p-3 bg-[#2A1B07] border border-[#78350F] rounded-[10px] text-xs font-mono text-[#FBBF24] flex items-center justify-between">
          <span>DUMMY DATA, engines not wired</span>
          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-black/40">Mock</span>
        </div>
      )}

      {/* Top Section: Score Ring + Verdict Chip + Summary */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          {/* Verdict Chip */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block px-3 py-1 text-xs font-mono font-bold tracking-wider rounded-md border ${risk.chipBg} ${risk.chipBorder} ${risk.chipColor}`}
            >
              {risk.chipText}
            </span>
          </div>

          {/* Heading: Category or Summary */}
          {result?.category && (
            <h2 className="text-lg sm:text-xl font-bold text-[#E6EDF5] tracking-tight">
              {result.category}
            </h2>
          )}
          {result?.summary && (
            <p className="text-xs sm:text-sm text-[#93A1B5] leading-relaxed">
              {result.summary}
            </p>
          )}
        </div>

        {/* Risk Ring */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" aria-hidden="true">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#1B2433"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={displayScore !== null ? risk.ringColor : '#93A1B5'}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {displayScore !== null ? (
                <span className="text-2xl font-mono font-bold text-[#E6EDF5]">
                  {displayScore}
                </span>
              ) : (
                <span className="text-xs font-mono text-[#93A1B5]">No score</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KYUN RISKY HAI (List of reasons) */}
      {result?.reasons && result.reasons.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1B2433]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
            KYUN RISKY HAI
          </h3>
          <ul className="space-y-1.5 text-xs text-[#E6EDF5]">
            {result.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#FB7185] font-bold select-none">•</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CONDITIONAL PANEL 1: Link Journey */}
      {hasLinkJourney && (
        <div className="space-y-2 pt-2 border-t border-[#1B2433]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
            LINK JOURNEY
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            {/* Original URL */}
            <div className="p-2.5 bg-[#0A111C] border border-[#1B2433] rounded-[10px] flex items-center justify-between gap-2">
              <span className="text-[#E6EDF5] truncate">
                {defang(urlMeta.normalized_url || originalContent)}
              </span>
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE]">
                Short link
              </span>
            </div>

            {/* Destination URL & Domain Age */}
            <div className="p-2.5 bg-[#0A111C] border border-[#1B2433] rounded-[10px] flex items-center justify-between gap-2">
              <span className="text-[#FB7185] truncate font-semibold">
                {defang(urlMeta.final_destination || urlMeta.registered_domain || 'destination[.]xyz')}
              </span>
              {urlMeta.domain_age_days !== null && urlMeta.domain_age_days !== undefined && (
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#2A0F1B] border border-[#7F1D3A] text-[#FB7185]">
                  Domain {urlMeta.domain_age_days} din purana
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL PANEL 2: Asli vs Nakli Lookalike Comparison */}
      {hasLookalike && (
        <div className="space-y-2 pt-2 border-t border-[#1B2433]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
            ASLI VS NAKLI
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2.5 bg-[#0A111C] border border-[#1B2433] rounded-[10px] flex items-center justify-between gap-2">
              <span className="text-[#34D399] font-medium">{defangDomain(officialDomainGuess)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B2018] border border-[#14532D] text-[#34D399]">
                Asli {lookalikeBrand} domain
              </span>
            </div>
            <div className="p-2.5 bg-[#0A111C] border border-[#1B2433] rounded-[10px] flex items-center justify-between gap-2">
              <span className="text-[#FB7185] font-medium">{defangDomain(spoofedDomain)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#2A0F1B] border border-[#7F1D3A] text-[#FB7185]">
                {lookalikeBrand} jaisa dikhta hai
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL PANEL 3: Authentication Chips & From vs Reply-To */}
      {(hasAuthResults || hasFromReplyTo) && (
        <div className="space-y-3 pt-2 border-t border-[#1B2433]">
          {hasAuthResults && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
                AUTHENTICATION
              </h3>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {headerMeta.spf !== null && headerMeta.spf !== undefined && (() => {
                  const s = getAuthChipStyle(headerMeta.spf);
                  return (
                    <span className={`px-2.5 py-1 rounded-[6px] border ${s.bg} ${s.border} ${s.color}`}>
                      SPF {s.text}
                    </span>
                  );
                })()}
                {headerMeta.dkim !== null && headerMeta.dkim !== undefined && (() => {
                  const s = getAuthChipStyle(headerMeta.dkim);
                  return (
                    <span className={`px-2.5 py-1 rounded-[6px] border ${s.bg} ${s.border} ${s.color}`}>
                      DKIM {s.text}
                    </span>
                  );
                })()}
                {headerMeta.dmarc !== null && headerMeta.dmarc !== undefined && (() => {
                  const s = getAuthChipStyle(headerMeta.dmarc);
                  return (
                    <span className={`px-2.5 py-1 rounded-[6px] border ${s.bg} ${s.border} ${s.color}`}>
                      DMARC {s.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          )}

          {hasFromReplyTo && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
                FROM VS REPLY-TO
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                {headerMeta.from && (
                  <div className="p-2 bg-[#0A111C] border border-[#1B2433] rounded-[10px] flex items-center justify-between">
                    <span className="text-[#93A1B5]">From</span>
                    <span className="text-[#E6EDF5]">{defangDomain(headerMeta.from)}</span>
                  </div>
                )}
                {headerMeta.reply_to && (
                  <div className="p-2 bg-[#0A111C] border border-[#1B2433] rounded-[10px] flex items-center justify-between">
                    <span className="text-[#93A1B5]">Reply-To</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#FB7185]">{defangDomain(headerMeta.reply_to)}</span>
                      {headerMeta.reply_to_mismatch && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A0F1B] border border-[#7F1D3A] text-[#FB7185]">
                          Mismatch
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
        <div className="space-y-2 pt-2 border-t border-[#1B2433]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
            MESSAGE MEIN KYA PAKDA
          </h3>
          <div className="p-3 bg-[#0A111C] border border-[#1B2433] rounded-[10px] text-xs font-mono leading-relaxed text-[#E6EDF5]">
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
                    <mark key={i} className="bg-[#4A1424] text-[#FDA4AF] px-1 py-0.5 rounded">
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

      {/* Next steps short list if present */}
      {result?.next_steps && result.next_steps.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1B2433]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#93A1B5]">
            NEXT STEPS
          </h3>
          <ul className="space-y-1 text-xs text-[#E6EDF5]">
            {result.next_steps.slice(0, 3).map((step, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#22D3EE] font-bold select-none">•</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible Engine Breakdown */}
      {result?.engines && (
        <details className="pt-2 border-t border-[#1B2433] group">
          <summary className="text-xs font-mono text-[#93A1B5] hover:text-[#E6EDF5] cursor-pointer select-none flex items-center justify-between py-1">
            <span>Engine breakdown</span>
            <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 space-y-3 pt-2 text-xs">
            {Object.entries(result.engines).map(([name, data]) => {
              if (!data) return null;
              return (
                <div key={name} className="p-3 bg-[#0A111C] border border-[#1B2433] rounded-[10px] space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="capitalize font-semibold text-[#E6EDF5]">{name} Engine</span>
                    <span className="text-[#93A1B5]">
                      Score: <strong className="text-[#E6EDF5]">{data.score !== null && data.score !== undefined ? data.score : 'N/A'}</strong>
                    </span>
                  </div>
                  {data.flags && data.flags.length > 0 ? (
                    <div className="space-y-1">
                      {data.flags.map((flag, idx) => (
                        <div key={idx} className="flex items-baseline space-x-2 text-[11px]">
                          <span className="font-mono text-[#22D3EE] shrink-0">{flag.code}:</span>
                          <span className="text-[#93A1B5]">{flag.reason}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#93A1B5] italic">Koi flag nahi mila</div>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
