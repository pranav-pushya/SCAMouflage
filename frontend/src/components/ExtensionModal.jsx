import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, ShieldCheck, Check, Copy, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ExtensionModal({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  // Close on Escape & lock body scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = '/phishshield-extension.zip';
    link.download = 'phishshield-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl transition-all my-auto overflow-hidden ${
          isDark
            ? 'bg-[#1C3334] border-[#376E6F]/50 text-[#F8FAFC] shadow-black/60'
            : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1C3334] shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className={`shrink-0 flex items-center justify-between px-5 py-4 border-b ${
          isDark
            ? 'border-[#376E6F]/30 bg-[#152728]'
            : 'border-[#E2E8F0] bg-[#FDF2F4]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
              isDark
                ? 'bg-[#2E151B] border-[#DA7B93]/40 text-[#DA7B93]'
                : 'bg-[#FFFFFF] border-[#DA7B93] text-[#B83A5D]'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-mono text-sm sm:text-base font-bold tracking-wide ${
                  isDark ? 'text-[#F8FAFC]' : 'text-[#1C3334]'
                }`}>
                  PhishShield Chrome Extension
                </h3>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  isDark
                    ? 'bg-[#2E151B] border-[#DA7B93]/40 text-[#DA7B93]'
                    : 'bg-[#FFFFFF] border-[#DA7B93]/60 text-[#B83A5D]'
                }`}>
                  v1.0.0
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${
                isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
              }`}>
                Real-time inspection for WhatsApp, Gmail & Screen URLs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ml-2 ${
              isDark
                ? 'border-transparent text-[#CBD5E1] hover:text-[#DA7B93] hover:bg-[#2E151B]'
                : 'border-transparent text-[#64748B] hover:text-[#B83A5D] hover:bg-[#FFFFFF]'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${
              isDark
                ? 'bg-[#2E151B]/60 border-[#376E6F]/30 text-[#F8FAFC]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1C3334]'
            }`}>
              <span className="text-sm">💬</span>
              <span className="font-medium text-[11px] sm:text-xs">WhatsApp Selection Scan</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${
              isDark
                ? 'bg-[#2E151B]/60 border-[#376E6F]/30 text-[#F8FAFC]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1C3334]'
            }`}>
              <span className="text-sm">✉️</span>
              <span className="font-medium text-[11px] sm:text-xs">Gmail Phishing Inspector</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${
              isDark
                ? 'bg-[#2E151B]/60 border-[#376E6F]/30 text-[#F8FAFC]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1C3334]'
            }`}>
              <span className="text-sm">✈️</span>
              <span className="font-medium text-[11px] sm:text-xs">Telegram Active Scanner</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${
              isDark
                ? 'bg-[#2E151B]/60 border-[#376E6F]/30 text-[#F8FAFC]'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1C3334]'
            }`}>
              <span className="text-sm">🌐</span>
              <span className="font-medium text-[11px] sm:text-xs">Screen URL Active Shield</span>
            </div>
          </div>

          {/* 3-Step Setup Guide */}
          <div className="space-y-2.5">
            <div className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isDark ? 'text-[#DA7B93]' : 'text-[#B83A5D]'
            }`}>
              Quick Installation (3 Steps)
            </div>

            <div className="space-y-2 text-xs">
              {/* Step 1 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-[#152728] border-[#376E6F]/30'
                  : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <span className={`w-5 h-5 rounded-full border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  isDark
                    ? 'bg-[#2E151B] border-[#DA7B93]/40 text-[#DA7B93]'
                    : 'bg-[#FDF2F4] border-[#DA7B93] text-[#B83A5D]'
                }`}>
                  1
                </span>
                <div>
                  <strong className={isDark ? 'text-[#F8FAFC]' : 'text-[#1C3334]'}>
                    Download & Extract ZIP:
                  </strong>
                  <p className={`text-[11px] mt-0.5 ${
                    isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                  }`}>
                    Click the button below to download{' '}
                    <code className={`font-mono font-bold px-1 py-0.5 rounded ${
                      isDark ? 'text-[#DA7B93] bg-[#2E151B]' : 'text-[#B83A5D] bg-[#FDF2F4]'
                    }`}>
                      phishshield-extension.zip
                    </code>{' '}
                    and unzip it to any folder on your PC.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-[#152728] border-[#376E6F]/30'
                  : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <span className={`w-5 h-5 rounded-full border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  isDark
                    ? 'bg-[#2E151B] border-[#DA7B93]/40 text-[#DA7B93]'
                    : 'bg-[#FDF2F4] border-[#DA7B93] text-[#B83A5D]'
                }`}>
                  2
                </span>
                <div className="flex-1 min-w-0">
                  <strong className={isDark ? 'text-[#F8FAFC]' : 'text-[#1C3334]'}>
                    Open Chrome Extensions:
                  </strong>
                  <p className={`text-[11px] mt-0.5 ${
                    isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                  }`}>
                    In Chrome, navigate to{' '}
                    <code className={`font-mono font-bold px-1 py-0.5 rounded ${
                      isDark ? 'text-[#DA7B93] bg-[#2E151B]' : 'text-[#B83A5D] bg-[#FDF2F4]'
                    }`}>
                      chrome://extensions
                    </code>{' '}
                    and turn ON <strong className={isDark ? 'text-[#DA7B93]' : 'text-[#B83A5D]'}>Developer mode</strong> (toggle at top-right).
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={copyChromeUrl}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#2E151B] border-[#376E6F]/40 hover:border-[#DA7B93] text-[#CBD5E1] hover:text-[#DA7B93]'
                          : 'bg-[#FFFFFF] border-[#CBD5E1] hover:border-[#B83A5D] text-[#475569] hover:text-[#B83A5D]'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied URL to Clipboard!' : 'Copy chrome://extensions'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-[#152728] border-[#376E6F]/30'
                  : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <span className={`w-5 h-5 rounded-full border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  isDark
                    ? 'bg-[#2E151B] border-[#DA7B93]/40 text-[#DA7B93]'
                    : 'bg-[#FDF2F4] border-[#DA7B93] text-[#B83A5D]'
                }`}>
                  3
                </span>
                <div>
                  <strong className={isDark ? 'text-[#F8FAFC]' : 'text-[#1C3334]'}>
                    Load Unpacked:
                  </strong>
                  <p className={`text-[11px] mt-0.5 ${
                    isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                  }`}>
                    Click <strong className={isDark ? 'text-[#F8FAFC]' : 'text-[#1C3334]'}>Load unpacked</strong> in the top-left and select your unzipped folder. PhishShield is instantly active on WhatsApp, Gmail, Telegram & web tabs!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Modal Footer */}
        <div className={`shrink-0 flex flex-col sm:flex-row items-center gap-2.5 px-5 py-4 border-t ${
          isDark
            ? 'border-[#376E6F]/30 bg-[#152728]'
            : 'border-[#E2E8F0] bg-[#FDF2F4]'
        }`}>
          <button
            type="button"
            onClick={handleDownload}
            className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer ${
              isDark
                ? 'bg-[#DA7B93] text-[#1C3334] hover:bg-[#E899AE] shadow-[#DA7B93]/20'
                : 'bg-[#B83A5D] text-[#FFFFFF] hover:bg-[#9F2D4C] shadow-[#B83A5D]/20'
            }`}
          >
            {downloadStarted ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloading ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Extension (.zip)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#2E151B] border-[#376E6F]/40'
                : 'text-[#475569] hover:text-[#1C3334] hover:bg-[#FFFFFF] border-[#CBD5E1]'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
