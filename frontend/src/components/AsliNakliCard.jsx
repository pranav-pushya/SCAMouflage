import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Check, X, ExternalLink, ArrowRight } from 'lucide-react';
import { defangDomain } from '../utils/defang';

export default function AsliNakliCard({
  brand = 'State Bank of India',
  officialDomain = 'sbi.co.in',
  fakeDomain = 'sbi-kyc-update.top',
  similarity = 88,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[16px] bg-[#1C3334]/90 border border-[#DA7B93]/40 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4"
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#376E6F]/30 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-[#DA7B93] animate-pulse" />
          <h3 className="text-sm sm:text-base font-bold font-mono tracking-tight text-[#F8FAFC]">
            ASLI vs NAKLI // Brand Impersonation Visualizer
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#2E151B] border border-[#DA7B93]/60 text-[#DA7B93] flex items-center gap-1.5 font-bold">
          <span>Typosquatting Risk:</span>
          <span>{similarity}% Match</span>
        </div>
      </div>

      <p className="text-xs text-[#B8C5D6] leading-relaxed">
        Yeh domain <strong className="text-[#F8FAFC]">{brand}</strong> ke official portal ka roop dhar kar user ko dhoka dene ke liye banaya gaya hai.
      </p>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* ASLI (Official) Card in Haus Teal */}
        <div className="relative rounded-[12px] bg-[#1C3334] border border-[#376E6F] p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#376E6F]/20 text-[#376E6F] border border-[#376E6F]/60">
              <Check className="w-3.5 h-3.5" /> ASLI (Official)
            </span>
            <ShieldCheck className="w-5 h-5 text-[#376E6F]" />
          </div>
          <div>
            <div className="text-xs text-[#B8C5D6] mb-1 font-mono">Legitimate Domain:</div>
            <div className="text-base font-mono font-bold text-[#376E6F] tracking-wide break-all">
              https://{officialDomain}
            </div>
          </div>
          <div className="text-[11px] text-[#B8C5D6] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#376E6F]" />
            Verified Indian Banking & Telecom Registry
          </div>
        </div>

        {/* NAKLI (Fraud Imposter) Card in Haus Rose / Plum */}
        <div className="relative rounded-[12px] bg-[#2E151B] border border-[#DA7B93] p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#DA7B93]/20 text-[#DA7B93] border border-[#DA7B93]/60">
              <X className="w-3.5 h-3.5" /> NAKLI (Fraud Imposter)
            </span>
            <ShieldAlert className="w-5 h-5 text-[#DA7B93]" />
          </div>
          <div>
            <div className="text-xs text-[#B8C5D6] mb-1 font-mono">Detected Imposter:</div>
            <div className="text-base font-mono font-bold text-[#DA7B93] tracking-wide break-all font-mono">
              hxxps://{defangDomain(fakeDomain)}
            </div>
          </div>
          <div className="text-[11px] text-[#DA7B93] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DA7B93]" />
            Combosquatting / Unauthorized Third-Party Host
          </div>
        </div>
      </div>
    </motion.div>
  );
}
