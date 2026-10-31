import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ResultCard from './ResultCard';
import PrecautionsCard from './PrecautionsCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SharedAnalyzer({
  mode = 'sms', // 'email' | 'sms' | 'url'
  title = '',
  subtitle = '',
  placeholder = '',
  samples = [],
  inputKind = 'textarea', // 'textarea' | 'input'
}) {
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [emailTab, setEmailTab] = useState('paste'); // 'paste' | 'upload'
  const [uploadError, setUploadError] = useState(null);

  // Auto-run if routed from Home page with state
  useEffect(() => {
    if (location.state?.content) {
      setContent(location.state.content);
      if (location.state?.autoRun) {
        runAnalysis(location.state.content);
      }
    }
  }, [location.state]);

  const runAnalysis = async (textToAnalyze) => {
    const text = (textToAnalyze ?? content).trim();
    if (!text) {
      setError('Kripya analyze karne ke liye content daalein.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Explicit type mapping: email -> header, sms -> sms, url -> url
    const requestType = mode === 'email' ? 'header' : mode;

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: requestType,
          content: text,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) {
            errorMsg = typeof errJson.detail === 'string'
              ? errJson.detail
              : JSON.stringify(errJson.detail);
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (inputKind === 'input' && e.key === 'Enter') {
      e.preventDefault();
      runAnalysis();
    } else if (inputKind === 'textarea' && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runAnalysis();
    }
  };

  // Client-side .eml file reader (max 200 KB, text only)
  const handleFileUpload = (e) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 200 KB (200 * 1024 bytes)
    if (file.size > 200 * 1024) {
      setUploadError('File size 200 KB se zyada hai. Kripya chhota .eml file upload karein.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setContent(text);
        setEmailTab('paste'); // return to editor view with populated headers
      }
    };
    reader.onerror = () => {
      setUploadError('File padhne me dikkat aayi. Kripya text headers paste karein.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EDF5]">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#93A1B5] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* Two-Column Grid: Left Input, Right Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Input Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-5 sm:p-6 backdrop-blur-md space-y-4">
          {/* Email mode specific tabs: Paste headers vs Upload .eml */}
          {mode === 'email' && (
            <div className="flex items-center space-x-1 p-1 bg-[#0A111C] border border-[#243247] rounded-[10px] w-fit">
              <button
                type="button"
                onClick={() => setEmailTab('paste')}
                className={`text-xs font-medium px-3 py-1.5 rounded-[8px] transition-colors ${
                  emailTab === 'paste'
                    ? 'bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE]'
                    : 'text-[#93A1B5] hover:text-[#E6EDF5]'
                }`}
              >
                Paste headers
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailTab('upload');
                  fileInputRef.current?.click();
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-[8px] transition-colors ${
                  emailTab === 'upload'
                    ? 'bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE]'
                    : 'text-[#93A1B5] hover:text-[#E6EDF5]'
                }`}
              >
                Upload .eml
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".eml,.txt"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload .eml email header file"
              />
            </div>
          )}

          {/* Upload error banner */}
          {uploadError && (
            <div className="p-3 bg-[#2A0F1B] border border-[#7F1D3A] rounded-[10px] text-xs text-[#FB7185]">
              {uploadError}
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-1">
            <label htmlFor="analyzer-input" className="block text-xs font-mono text-[#93A1B5] uppercase">
              {mode === 'email' ? 'Email headers' : mode === 'url' ? 'Link' : 'Message'}
            </label>

            {inputKind === 'textarea' ? (
              <textarea
                id="analyzer-input"
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-[#0A111C] border border-[#243247] rounded-[10px] p-3 text-xs sm:text-sm font-mono text-[#E6EDF5] placeholder-[#93A1B5]/40 focus:outline-none focus:ring-1 focus:ring-[#22D3EE] focus:border-[#22D3EE] leading-relaxed transition-all"
              />
            ) : (
              <input
                id="analyzer-input"
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-[#0A111C] border border-[#243247] rounded-[10px] px-3 py-2.5 text-xs sm:text-sm font-mono text-[#E6EDF5] placeholder-[#93A1B5]/40 focus:outline-none focus:ring-1 focus:ring-[#22D3EE] focus:border-[#22D3EE] transition-all"
              />
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-[#93A1B5] pt-1">
              <span>{content.length} characters</span>
              <span className="hidden sm:inline">
                {inputKind === 'textarea' ? 'Ctrl+Enter to analyze' : 'Enter to analyze'}
              </span>
            </div>
          </div>

          {/* Quick-sample buttons with small inline SVG icons (NO EMOJI) */}
          {samples && samples.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="block text-[11px] font-mono text-[#93A1B5] uppercase tracking-wider">
                Quick Samples:
              </span>
              <div className="flex flex-wrap gap-2">
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setContent(sample.content);
                      setResult(null);
                      setError(null);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-[8px] bg-[#0A111C] hover:bg-[#0F1A2A] border border-[#1B2433] hover:border-[#1E3A4C] text-[#E6EDF5] transition-all cursor-pointer flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-[#22D3EE]"
                  >
                    {/* SVG Icon */}
                    <span className="text-[#22D3EE] shrink-0" aria-hidden="true">
                      {sample.icon || (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </span>
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button (min 44px touch target) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#0F1A2A] hover:bg-[#1E3A4C] border border-[#22D3EE]/50 text-[#22D3EE] font-medium text-xs sm:text-sm rounded-[10px] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#22D3EE]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze</span>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Result Card / States */}
        <div className="relative">
          {/* Loading state: Thin animated scanline over card */}
          {loading && (
            <div className="w-full min-h-[380px] bg-white/[0.04] border border-white/10 rounded-[16px] p-6 backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center space-y-4">
              <div className="animate-scanline" aria-hidden="true" />
              <div className="w-12 h-12 rounded-full border-2 border-[#1E3A4C] border-t-[#22D3EE] animate-spin" />
              <p className="text-xs font-mono text-[#93A1B5]">
                Scanning payload signals...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="w-full bg-[#2A0F1B] border border-[#7F1D3A] rounded-[16px] p-6 text-xs text-[#FB7185] space-y-4">
              <div className="space-y-1">
                <strong className="block text-sm font-semibold text-[#FB7185]">Analysis Error</strong>
                <p className="text-[#FDA4AF] leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => runAnalysis()}
                className="px-4 py-2 bg-[#0F1A2A] border border-[#7F1D3A] text-[#FB7185] hover:text-white rounded-[10px] font-mono text-xs cursor-pointer transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && result && (
            <ResultCard result={result} originalContent={content} />
          )}

          {/* Idle State (Empty result card with short hint) */}
          {!loading && !error && !result && (
            <div className="w-full min-h-[380px] bg-white/[0.04] border border-white/10 rounded-[16px] p-8 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0A111C] border border-[#1B2433] flex items-center justify-center text-[#93A1B5]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-[#E6EDF5] block">Result Yahan Dikhaye Jayenge</span>
                <p className="text-xs text-[#93A1B5] max-w-xs leading-relaxed">
                  Analyze button dabao risk score, scam reasons aur forensic signals dekhne ke liye.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Width Precautions Card below */}
      <PrecautionsCard mode={mode} />
    </div>
  );
}
