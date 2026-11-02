import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Trash2,
  Upload,
  FileText,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Cpu,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ResultCard from './ResultCard';
import PrecautionsCard from './PrecautionsCard';
import ScanHUD from './ScanHUD';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SharedAnalyzer({
  mode = 'sms', // 'email' | 'sms' | 'url'
  title = '',
  subtitle = '',
  placeholder = '',
  samples = [],
  inputKind = 'textarea', // 'textarea' | 'input'
}) {
  const { isDark } = useTheme();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [emailTab, setEmailTab] = useState('paste');
  const [uploadError, setUploadError] = useState(null);

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

  const handleFileUpload = (e) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      setUploadError('File size 200 KB se zyada hai. Kripya chhota .eml file upload karein.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setContent(text);
        setEmailTab('paste');
      }
    };
    reader.onerror = () => {
      setUploadError('File padhne me dikkat aayi. Kripya text headers paste karein.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title & Subtitle with Haus Rose accent */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#2E151B] border border-[#DA7B93]/40 text-[#DA7B93]">
          <Cpu className="w-3 h-3 text-[#DA7B93]" />
          <span>FORENSIC ENGINE // {mode.toUpperCase()}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#B8C5D6] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* Two-Column Grid: Left Input, Right Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Input Card in Haus Spruce & Teal */}
        <div className="relative bg-[#1C3334]/90 border border-[#376E6F]/30 rounded-[18px] p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-xl">
          {/* Laser scan line over input when loading */}
          {loading && <div className="animate-scanline" aria-hidden="true" />}

          {/* Email mode tabs */}
          {mode === 'email' && (
            <div className="flex items-center space-x-1 p-1 bg-[#0F1D1E] border border-[#376E6F]/30 rounded-[10px] w-fit">
              <button
                type="button"
                onClick={() => setEmailTab('paste')}
                className={`text-xs font-mono px-3 py-1.5 rounded-[8px] transition-all flex items-center gap-1.5 ${
                  emailTab === 'paste'
                    ? 'bg-[#2E151B] border border-[#DA7B93]/50 text-[#DA7B93] font-medium'
                    : 'text-[#B8C5D6] hover:text-[#F8FAFC]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Headers</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailTab('upload');
                  fileInputRef.current?.click();
                }}
                className={`text-xs font-mono px-3 py-1.5 rounded-[8px] transition-all flex items-center gap-1.5 ${
                  emailTab === 'upload'
                    ? 'bg-[#2E151B] border border-[#DA7B93]/50 text-[#DA7B93] font-medium'
                    : 'text-[#B8C5D6] hover:text-[#F8FAFC]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .eml</span>
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
            <div className="p-3 bg-[#2E151B] border border-[#DA7B93] rounded-[10px] text-xs text-[#DA7B93] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#B8C5D6]">
              <label htmlFor="analyzer-input" className="uppercase tracking-wider flex items-center gap-1">
                <span>{mode === 'email' ? 'RFC Email Headers' : mode === 'url' ? 'Target Link' : 'Payload Message'}</span>
              </label>
              {content && (
                <button
                  type="button"
                  onClick={() => {
                    setContent('');
                    setResult(null);
                    setError(null);
                  }}
                  className="text-[11px] text-[#DA7B93] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {inputKind === 'textarea' ? (
              <textarea
                id="analyzer-input"
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-[#0F1D1E] border border-[#376E6F]/40 rounded-[12px] p-3.5 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-[#B8C5D6]/40 focus:outline-none focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93] leading-relaxed transition-all shadow-inner"
              />
            ) : (
              <input
                id="analyzer-input"
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-[#0F1D1E] border border-[#376E6F]/40 rounded-[12px] px-3.5 py-3 text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder-[#B8C5D6]/40 focus:outline-none focus:ring-1 focus:ring-[#DA7B93] focus:border-[#DA7B93] transition-all shadow-inner"
              />
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-[#B8C5D6] pt-0.5">
              <span>{content.length} characters</span>
              <span className="hidden sm:inline text-[#B8C5D6]/70">
                {inputKind === 'textarea' ? 'Ctrl+Enter to inspect' : 'Enter to inspect'}
              </span>
            </div>
          </div>

          {/* Quick-sample buttons */}
          {samples && samples.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="block text-[11px] font-mono text-[#B8C5D6] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#DA7B93]" />
                <span>Preloaded Attack Scenarios:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {samples.map((sample, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setContent(sample.content);
                      setResult(null);
                      setError(null);
                    }}
                    className="text-xs font-mono px-3 py-1.5 rounded-[9px] bg-[#0F1D1E] hover:bg-[#2E151B] border border-[#376E6F]/30 hover:border-[#DA7B93]/50 text-[#F8FAFC] transition-all cursor-pointer flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-[#DA7B93]"
                  >
                    <span className="text-[#DA7B93] shrink-0">
                      {sample.icon || <Zap className="w-3.5 h-3.5 text-[#DA7B93]" />}
                    </span>
                    <span>{sample.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => runAnalysis()}
              disabled={loading || !content.trim()}
              className={`w-full sm:w-auto min-h-[44px] px-7 py-2.5 font-semibold text-xs sm:text-sm rounded-[12px] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#DA7B93] shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-[#2E151B] to-[#376E6F] hover:from-[#DA7B93] hover:to-[#376E6F] border border-[#DA7B93]/60 text-[#DA7B93] hover:text-[#1C3334] shadow-[#DA7B93]/15'
                  : 'bg-[#B83A5D] hover:bg-[#9E2B4B] border border-[#B83A5D] text-white shadow-rose-200'
              }`}
            >
              {loading ? (
                <>
                  <svg className={`animate-spin h-4 w-4 ${isDark ? 'text-[#DA7B93]' : 'text-white'}`} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Running Tri-Engine Scan...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Inspection</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* RIGHT COLUMN: Result Card / States */}
        <div className="relative min-h-[380px]">
          {/* Scanning HUD while loading */}
          {loading && <ScanHUD mode={mode} />}

          {/* Error State */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-[#2E151B] border border-[#DA7B93] rounded-[18px] p-6 text-xs text-[#DA7B93] space-y-4 shadow-xl"
            >
              <div className="space-y-1">
                <strong className="block text-sm font-semibold text-[#DA7B93] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Analysis Diagnostics Failed</span>
                </strong>
                <p className="text-[#F8FAFC] leading-relaxed font-mono">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => runAnalysis()}
                className="px-4 py-2 bg-[#1C3334] border border-[#DA7B93] text-[#DA7B93] hover:text-white rounded-[10px] font-mono text-xs cursor-pointer transition-colors"
              >
                Retry Scan
              </button>
            </motion.div>
          )}

          {/* Success State */}
          {!loading && !error && result && (
            <ResultCard result={result} originalContent={content} />
          )}

          {/* Idle State */}
          {!loading && !error && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full min-h-[380px] bg-[#1C3334]/60 border border-dashed border-[#376E6F]/40 rounded-[18px] p-8 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#2E151B] border border-[#DA7B93]/40 flex items-center justify-center text-[#DA7B93] shadow-inner">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <span className="text-sm font-mono font-bold text-[#F8FAFC] block">
                  AWAITING PAYLOAD INPUT
                </span>
                <p className="text-xs text-[#B8C5D6] leading-relaxed">
                  Enter message text, suspicious link, or headers and execute inspection to view multi-signal forensic breakdown.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#B8C5D6] bg-[#0F1D1E] px-3 py-1 rounded-full border border-[#376E6F]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#376E6F]" />
                Zero-Latency Heuristics Active
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Full-Width Precautions Card below */}
      <PrecautionsCard mode={mode} />
    </div>
  );
}
