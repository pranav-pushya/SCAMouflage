import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [pasteContent, setPasteContent] = useState('');
  const navigate = useNavigate();

  const handleAutoAnalyze = (e) => {
    e.preventDefault();
    const text = pasteContent.trim();
    if (!text) return;

    // Client-side detection logic per specification:
    // lines like Authentication-Results/Received/From: => email
    // a single token starting with http/hxxp or containing a dot and no spaces => url
    // otherwise => sms
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

  return (
    <div className="space-y-12">
      {/* Two Columns Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 sm:pt-4">
        {/* LEFT COLUMN (lg:col-span-7): Heading, Pitch, Quick Buttons, Chips, Auto-detect Box */}
        <div className="lg:col-span-7 space-y-6">
          {/* Graviton Hackathon Chip */}
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-[#0A111C] border border-[#243247] text-[#22D3EE]">
            GRAVITON 2026 · PS 02
          </div>

          {/* H1 Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-tight text-[#E6EDF5] leading-[1.08]">
            PhishShield India
          </h1>

          {/* One line description */}
          <p className="text-sm sm:text-base text-[#93A1B5] leading-relaxed max-w-xl">
            Scam SMS, link ya email paste karo. Risk score, reasons aur next step milte hain, Hinglish mein.
          </p>

          {/* Two Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/sms"
              className="px-5 py-2.5 rounded-[10px] bg-[#22D3EE] text-[#070B12] font-semibold text-xs sm:text-sm hover:bg-[#22D3EE]/90 transition-all cursor-pointer shadow-lg shadow-[#22D3EE]/10 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
            >
              Check an SMS
            </Link>
            <Link
              to="/url"
              className="px-5 py-2.5 rounded-[10px] bg-[#0A111C] border border-[#243247] text-[#E6EDF5] font-semibold text-xs sm:text-sm hover:bg-[#0F1A2A] hover:border-[#1E3A4C] hover:text-[#22D3EE] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
            >
              Check a link
            </Link>
          </div>

          {/* Four Plain Feature Chips */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-[#93A1B5] font-mono">
            <span className="px-3 py-1 rounded-md bg-[#0A111C] border border-[#1B2433]">
              India scam pack
            </span>
            <span className="px-3 py-1 rounded-md bg-[#0A111C] border border-[#1B2433]">
              Link journey
            </span>
            <span className="px-3 py-1 rounded-md bg-[#0A111C] border border-[#1B2433]">
              Header forensics
            </span>
            <span className="px-3 py-1 rounded-md bg-[#0A111C] border border-[#1B2433]">
              Hinglish explanations
            </span>
          </div>

          {/* Compact Auto-detect Paste Box */}
          <form onSubmit={handleAutoAnalyze} className="pt-2">
            <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-3.5 backdrop-blur-md space-y-3">
              <label htmlFor="home-paste-input" className="block text-xs font-mono text-[#93A1B5]">
                Quick Auto-Detect:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="home-paste-input"
                  type="text"
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste suspicious SMS, link, or email headers..."
                  className="flex-1 bg-[#0A111C] border border-[#243247] rounded-[10px] px-3 py-2 text-xs font-mono text-[#E6EDF5] placeholder-[#93A1B5]/40 focus:outline-none focus:ring-1 focus:ring-[#22D3EE]"
                />
                <button
                  type="submit"
                  disabled={!pasteContent.trim()}
                  className="min-h-[40px] px-4 py-2 bg-[#0F1A2A] hover:bg-[#1E3A4C] border border-[#22D3EE]/50 text-[#22D3EE] font-medium text-xs rounded-[10px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#22D3EE] shrink-0"
                >
                  Analyze
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN (lg:col-span-5): Decorative SVG Hero Animation */}
        <div className="lg:col-span-5 flex items-center justify-center p-4">
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center select-none" aria-hidden="true">
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0E7490" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Concentric Ring 2: Outer (r=140) */}
              <circle
                cx="150"
                cy="150"
                r="135"
                fill="none"
                stroke="#1B2433"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="opacity-40"
              />

              {/* Concentric Ring 1: Inner (r=100) */}
              <circle
                cx="150"
                cy="150"
                r="95"
                fill="none"
                stroke="#1E3A4C"
                strokeWidth="1.5"
                className="opacity-60"
              />

              {/* Central Shield Shape */}
              <g transform="translate(150, 145)">
                <path
                  d="M0 -42 C26 -42 42 -30 42 -6 C42 30 18 52 0 62 C-18 52 -42 30 -42 -6 C-42 -30 -26 -42 0 -42 Z"
                  fill="url(#shieldGrad)"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                />
                {/* Green Checkmark inside Shield */}
                <path
                  d="M-14 2 L-3 13 L15 -7"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Green Dot 1: Moves into shield and fades out */}
              <circle r="4" fill="#34D399" className="hero-svg-dot">
                <animateMotion
                  path="M 30,80 L 140,140"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Green Dot 2: Moves into shield and fades out */}
              <circle r="3.5" fill="#34D399" className="hero-svg-dot">
                <animateMotion
                  path="M 50,230 L 142,152"
                  dur="3.8s"
                  begin="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0.8;0"
                  dur="3.8s"
                  begin="1.2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Red Dot 1: Stops at outer ring (r=135) and fades out */}
              <circle r="4" fill="#FB7185" className="hero-svg-dot">
                <animateMotion
                  path="M 270,40 L 225,95"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Red Dot 2: Stops at outer ring and fades out */}
              <circle r="3.5" fill="#FB7185" className="hero-svg-dot">
                <animateMotion
                  path="M 260,250 L 220,205"
                  dur="3.5s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  dur="3.5s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: Three Cards (Email, SMS, Link check) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        {/* Email Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#E6EDF5]">Email check</h3>
            <p className="text-xs text-[#93A1B5] leading-relaxed">
              Headers se spoofing pakdo: SPF, DKIM, DMARC.
            </p>
          </div>
          <div>
            <Link
              to="/email"
              className="text-xs font-semibold text-[#22D3EE] hover:underline flex items-center space-x-1 focus:outline-none focus:ring-1 focus:ring-[#22D3EE] rounded w-fit"
            >
              <span>Open</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* SMS Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#E6EDF5]">SMS check</h3>
            <p className="text-xs text-[#93A1B5] leading-relaxed">
              KYC, FASTag, digital arrest jaise scam pehchano.
            </p>
          </div>
          <div>
            <Link
              to="/sms"
              className="text-xs font-semibold text-[#22D3EE] hover:underline flex items-center space-x-1 focus:outline-none focus:ring-1 focus:ring-[#22D3EE] rounded w-fit"
            >
              <span>Open</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Link Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#E6EDF5]">Link check</h3>
            <p className="text-xs text-[#93A1B5] leading-relaxed">
              Short link ke peeche ka asli rasta dekho.
            </p>
          </div>
          <div>
            <Link
              to="/url"
              className="text-xs font-semibold text-[#22D3EE] hover:underline flex items-center space-x-1 focus:outline-none focus:ring-1 focus:ring-[#22D3EE] rounded w-fit"
            >
              <span>Open</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
