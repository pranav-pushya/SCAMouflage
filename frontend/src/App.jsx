import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Demo samples for instant live testing & mentoring presentation
const DEMO_SAMPLES = [
  {
    label: '🚨 Fake SBI KYC SMS',
    type: 'sms',
    content: 'Priye grahak, aapka SBI account block ho gaya hai. Turant KYC update karein nahi to account band ho jayega: http://sbi-kyc-update.xyz',
  },
  {
    label: '⚡ Electricity Disconnect',
    type: 'sms',
    content: 'Bijli vibhag suchna: Priya upbhokta, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki pichla bill jama nahi hua hai. Sampark karein: 9876543210',
  },
  {
    label: '👮 Digital Arrest CBI',
    type: 'sms',
    content: 'CBI Cyber Crime Cell: A courier parcel containing illegal contraband and narcotics was seized under your Aadhaar. Digital arrest warrant issued. Join video call immediately.',
  },
  {
    label: '🔗 Lookalike Phish Link',
    type: 'url',
    content: 'http://sbi-kyc-update.xyz',
  },
  {
    label: '✉️ Spoofed Tax Header',
    type: 'header',
    content: `Received: from mail.attacker-domain.xyz (198.51.100.1)
From: Income Tax Department <alerts@incometax.gov.in>
Reply-To: refund-claim@attacker-domain.xyz
Authentication-Results: mx.google.com; dmarc=fail (p=reject); spf=softfail
Subject: Urgent: Tax Refund Approved of Rs 24,500 - Claim Now`,
  },
  {
    label: '✅ Legit Bank Alert',
    type: 'sms',
    content: 'Your a/c no. XX1234 is debited for Rs 450.00 on 30-Oct-26 by UPI. Bal: Rs 15400. Info: amazon. If not you, SMS BLOCK to 9223008333. SBI',
  },
];

export default function App() {
  const [type, setType] = useState('auto');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | engines | raw

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Kripya analyze karne ke liye koi SMS, link ya header paste karein.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            errorMsg = typeof errorJson.detail === 'string'
              ? errorJson.detail
              : JSON.stringify(errorJson.detail);
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);
      setActiveTab('overview');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while analyzing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setType(sample.type);
    setContent(sample.content);
    setResult(null);
    setError(null);
  };

  const getVerdictTheme = (verdict) => {
    switch (verdict) {
      case 'high':
        return {
          bg: 'bg-red-950/40 border-red-800 text-red-200',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
          gaugeColor: '#ef4444',
          label: 'HIGH RISK (KHATRA)',
        };
      case 'medium':
        return {
          bg: 'bg-amber-950/40 border-amber-800 text-amber-200',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gaugeColor: '#f59e0b',
          label: 'SUSPICIOUS (SAVDHAAN)',
        };
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-800 text-emerald-200',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          gaugeColor: '#10b981',
          label: 'LOW RISK (SURAKSHIT)',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Banner */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PhishShield India • Hackathon PS 02</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Helpline: <strong className="text-amber-400">1930</strong></span>
          <span>Portal: <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">cybercrime.gov.in</a></span>
        </div>
      </div>

      <main className="w-full max-w-4xl p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  PhishShield India
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Live Ensemble
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time Indian Phishing & Scam Detection (SMS • URL • Email Headers)
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Engines:</span>
            <span className="text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">URL</span>
            <span className="text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Text/NLP</span>
            <span className="text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">RFC Header</span>
          </div>
        </header>

        {/* Demo Samples Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Quick Test Samples (Click to load):
          </label>
          <div className="flex flex-wrap gap-2">
            {DEMO_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-xs px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls Card */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['auto', 'sms', 'url', 'header'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setType(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    type === tab
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'auto' ? '⚡ Auto Detect' : tab.toUpperCase()}
                </button>
              ))}
            </div>
            {content && (
              <button
                type="button"
                onClick={() => { setContent(''); setResult(null); setError(null); }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear input
              </button>
            )}
          </div>

          <div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious SMS, link (http://...), or raw email headers here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              {content.length} characters • Input mode: <strong className="text-slate-300">{type}</strong>
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-medium text-sm rounded-lg shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Scanning Threat Vector...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Analyze Threat</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold">Analysis Failed:</strong> {error}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Verdict Hero Card */}
            {(() => {
              const theme = getVerdictTheme(result.verdict);
              const score = result.score ?? 0;
              return (
                <section className={`rounded-xl border p-6 shadow-2xl ${theme.bg}`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Left details */}
                    <div className="space-y-3 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badgeBg}`}>
                          {theme.label}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700 text-slate-300">
                          Detected Type: <strong className="text-cyan-300">{result.input_type}</strong>
                        </span>
                      </div>

                      <h2 className="text-xl font-bold tracking-tight text-white">
                        {result.summary || 'Threat assessment complete.'}
                      </h2>

                      {/* Scam Category Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {result.reasons && result.reasons.length > 0 ? (
                          result.reasons.map((r, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded bg-black/40 border border-slate-700/60 text-slate-300">
                              ⚠️ {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Koi active scam flag detect nahi hua.</span>
                        )}
                      </div>
                    </div>

                    {/* Right Risk Score Gauge */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800 rounded-xl min-w-[140px]">
                      <span className="text-xs uppercase font-semibold text-slate-400 mb-1">Risk Score</span>
                      <div className="relative flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="38" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke={theme.gaugeColor}
                            strokeWidth="8"
                            strokeDasharray={238.7}
                            strokeDashoffset={238.7 - (238.7 * score) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-2xl font-black text-white">{score}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">out of 100</span>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Emergency Action & Helpline Section */}
            <section className="bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Recommended Action & Emergency Helpline (Agla Kadam)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Steps List */}
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.next_steps && result.next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Direct Helplines Box */}
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-bold block mb-2">Government Helplines</span>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                      <span className="text-slate-300">National Cyber Fraud:</span>
                      <a href="tel:1930" className="text-amber-400 font-bold hover:underline">📞 1930</a>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                      <span className="text-slate-300">Cyber Crime Portal:</span>
                      <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">cybercrime.gov.in</a>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-300">Chakshu Portal (SMS Fraud):</span>
                      <a href="https://sancharsaathi.gov.in/sfc" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">sancharsaathi.gov.in</a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Analysis Breakdown Tabs */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'overview'
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Engine Signals Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'raw'
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw JSON Audit
                </button>
              </div>

              <div className="p-5">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* URL Engine Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          🔗 URL Engine
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {result.engines.url.score !== null ? `${result.engines.url.score}/100` : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-400">
                        {result.engines.url.flags && result.engines.url.flags.length > 0 ? (
                          result.engines.url.flags.map((f, i) => (
                            <div key={i} className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[11px]">
                              <span className="font-semibold text-rose-300 block">{f.code}</span>
                              <span className="text-slate-300">{f.reason}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">No flags triggered</div>
                        )}
                        {result.engines.url.meta?.registered_domain && (
                          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                            Domain: <strong className="text-slate-200">{result.engines.url.meta.registered_domain}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text Engine Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          💬 Text / NLP Engine
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {result.engines.text.score !== null ? `${result.engines.text.score}/100` : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-400">
                        {result.engines.text.flags && result.engines.text.flags.length > 0 ? (
                          result.engines.text.flags.map((f, i) => (
                            <div key={i} className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[11px]">
                              <span className="font-semibold text-rose-300 block">{f.code}</span>
                              <span className="text-slate-300">{f.reason}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">No flags triggered</div>
                        )}
                        {result.engines.text.meta?.ml_probability !== undefined && (
                          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                            ML Probability: <strong className="text-slate-200">{(result.engines.text.meta.ml_probability * 100).toFixed(1)}%</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Header Engine Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          ✉️ Header Engine
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {result.engines.header.score !== null ? `${result.engines.header.score}/100` : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs space-y-1.5 text-slate-400">
                        {result.engines.header.flags && result.engines.header.flags.length > 0 ? (
                          result.engines.header.flags.map((f, i) => (
                            <div key={i} className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[11px]">
                              <span className="font-semibold text-rose-300 block">{f.code}</span>
                              <span className="text-slate-300">{f.reason}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">No flags triggered</div>
                        )}
                        {result.engines.header.meta?.dmarc && (
                          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                            DMARC: <strong className="text-slate-200">{result.engines.header.meta.dmarc}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'raw' && (
                  <pre className="bg-black/70 p-4 rounded-lg text-xs font-mono text-cyan-400 overflow-x-auto max-h-[350px]">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-600 border-t border-slate-900 mt-auto">
        PhishShield India • Pair programmed for GRAVITON 2026 • AI Scam Detection Engine
      </footer>
    </div>
  );
}
