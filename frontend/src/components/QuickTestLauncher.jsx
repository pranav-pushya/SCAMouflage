import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, Zap, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

export default function QuickTestLauncher({ onSelectSample }) {
  const samples = [
    {
      id: 'sbi-kyc',
      title: 'SBI YONO KYC Block',
      category: 'Banking / SMS',
      icon: ShieldAlert,
      badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]/80',
      text: 'SBI Alert: Dear customer, your YONO account has been suspended due to overdue KYC. Please update your PAN & Aadhaar immediately at http://sbi-kyc-pan.top to avoid permanent deactivation.',
    },
    {
      id: 'digital-arrest',
      title: 'Digital Arrest Summon',
      category: 'Extortion / Ext',
      icon: Scale,
      badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]/80',
      text: 'CBI & Cyber Crime Notice: Digital arrest warrant #CR-8829 issued against your Aadhaar for illegal money laundering. Connect with ACP Sharma on WhatsApp video immediately to avoid immediate physical arrest.',
    },
    {
      id: 'bijli-cut',
      title: 'Electricity Bill Cut',
      category: 'Utility / Hinglish',
      icon: Zap,
      badgeColor: 'border-[#E0A96D]/40 text-[#E0A96D] bg-[#2E151B]/80',
      text: 'Bijli Vibhag Suchna: Priye grahak aapka pichla mahine ka electricity bill update nahi hua hai. Aaj raat 9:30 baje connection kaat diya jayega. Turant call karein electricity officer: 9812345678',
    },
    {
      id: 'fastag-scam',
      title: 'FASTag Blacklist Phish',
      category: 'Transport / URL',
      icon: AlertTriangle,
      badgeColor: 'border-[#DA7B93]/40 text-[#DA7B93] bg-[#2E151B]/80',
      text: 'http://nhai-fastag-recharge.xyz/verify?vehicle=DL10CB4920',
    },
    {
      id: 'official-safe',
      title: 'Official Bank (Safe)',
      category: 'Legitimate Safe',
      icon: CheckCircle,
      badgeColor: 'border-[#376E6F]/40 text-[#376E6F] bg-[#1C3334]/80',
      text: 'State Bank of India: Your account ending in 4102 has been credited with Rs 15,000.00 via UPI. Visit our official internet banking portal at https://www.sbi.co.in or call 18001234.',
    },
  ];

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between text-xs font-mono text-[#B8C5D6]">
        <span className="flex items-center gap-1.5 text-[#DA7B93]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant 1-Click Test Scenarios (Try These):</span>
        </span>
        <span className="text-[10px] hidden sm:inline text-[#B8C5D6]/60">Click to auto-populate</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {samples.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectSample(s.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#1C3334]/90 hover:bg-[#2E151B] border border-[#376E6F]/40 hover:border-[#DA7B93]/60 transition-all text-left text-xs font-mono group cursor-pointer shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-[#DA7B93] group-hover:scale-110 transition-transform" />
              <span className="text-[#F8FAFC] font-medium group-hover:text-[#DA7B93] transition-colors">
                {s.title}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded border ${s.badgeColor}`}>
                {s.category}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
