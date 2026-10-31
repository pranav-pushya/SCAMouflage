import { useState } from 'react';
import { Download, ShieldCheck, Check, Copy, ExternalLink, X } from 'lucide-react';

export default function ExtensionModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-[#243247] bg-[#0A111C] p-6 shadow-2xl text-[#E6EDF5] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#1B2433] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A2A] border border-[#1E3A4C] flex items-center justify-center text-[#22D3EE]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold tracking-wide text-[#E6EDF5]">
                  PhishShield Chrome Extension
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F1A2A] border border-[#1E3A4C] text-[#34D399]">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-[#93A1B5] mt-0.5">
                Real-time scanning for WhatsApp, Gmail, Telegram & Screen URLs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#93A1B5] hover:text-[#E6EDF5] hover:bg-[#0F1A2A] p-1.5 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433] flex items-center gap-2">
            <span className="text-sm">💬</span>
            <span className="text-[#CBD5E1]">WhatsApp Real-time Selection</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433] flex items-center gap-2">
            <span className="text-sm">✉️</span>
            <span className="text-[#CBD5E1]">Gmail Phishing Inspector</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433] flex items-center gap-2">
            <span className="text-sm">✈️</span>
            <span className="text-[#CBD5E1]">Telegram Channel & DM Scan</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433] flex items-center gap-2">
            <span className="text-sm">🌐</span>
            <span className="text-[#CBD5E1]">Screen URL Active Shield</span>
          </div>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#93A1B5]">
            Quick Installation (3 Steps)
          </div>

          <div className="space-y-2 text-xs">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433]">
              <span className="w-5 h-5 rounded-full bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE] font-mono text-[11px] flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <strong className="text-[#E6EDF5]">Download & Extract ZIP:</strong>
                <p className="text-[#93A1B5] text-[11px] mt-0.5">
                  Click the button below to download <code className="text-[#22D3EE] font-mono">phishshield-extension.zip</code> and unzip it to any folder on your PC.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433]">
              <span className="w-5 h-5 rounded-full bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE] font-mono text-[11px] flex items-center justify-center shrink-0">
                2
              </span>
              <div className="flex-1">
                <strong className="text-[#E6EDF5]">Open Chrome Extensions:</strong>
                <p className="text-[#93A1B5] text-[11px] mt-0.5">
                  In Chrome, go to <code className="text-[#22D3EE] font-mono">chrome://extensions</code> and turn ON <strong className="text-[#FBBF24]">Developer mode</strong> (top right toggle).
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={copyChromeUrl}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0A111C] border border-[#243247] hover:border-[#22D3EE] text-[10px] font-mono text-[#93A1B5] hover:text-[#22D3EE] transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied URL!' : 'Copy chrome://extensions'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#070B12] border border-[#1B2433]">
              <span className="w-5 h-5 rounded-full bg-[#0F1A2A] border border-[#1E3A4C] text-[#22D3EE] font-mono text-[11px] flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <strong className="text-[#E6EDF5]">Load Unpacked:</strong>
                <p className="text-[#93A1B5] text-[11px] mt-0.5">
                  Click <strong className="text-[#E6EDF5]">Load unpacked</strong> in the top-left and select the extracted folder. PhishShield is instantly ready!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#22D3EE] text-[#070B12] hover:bg-[#38BDF8] active:scale-[0.99] transition-all shadow-lg shadow-[#22D3EE]/20 cursor-pointer"
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
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs text-[#93A1B5] hover:text-[#E6EDF5] hover:bg-[#0F1A2A] border border-[#243247] transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
