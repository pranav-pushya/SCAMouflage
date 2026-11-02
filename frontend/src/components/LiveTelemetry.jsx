import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Zap, Lock } from 'lucide-react';

export default function LiveTelemetry() {
  const [threatCount, setThreatCount] = useState(14892);

  // Slowly increment live count to simulate live scanning traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatCount((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: ShieldCheck,
      value: threatCount.toLocaleString() + '+',
      label: 'Scam Attacks Analyzed',
      subtext: 'Domestic SMS, WhatsApp, URLs',
      color: 'text-[#DA7B93]',
      glow: 'shadow-[0_0_20px_rgba(218,123,147,0.12)]',
    },
    {
      icon: Cpu,
      value: '50+ Rules',
      label: 'Hinglish & Domestic Vectors',
      subtext: 'FASTag, Digital Arrest, KYC, Bills',
      color: 'text-[#376E6F]',
      glow: 'shadow-[0_0_20px_rgba(55,110,111,0.15)]',
    },
    {
      icon: Zap,
      value: '<35ms',
      label: 'Detection Latency',
      subtext: 'Client-side zero-latency engine',
      color: 'text-[#E0A96D]',
      glow: 'shadow-[0_0_20px_rgba(224,169,109,0.15)]',
    },
    {
      icon: Lock,
      value: '100% Private',
      label: 'Zero Data Retention',
      subtext: 'Inspect without leaking PII',
      color: 'text-[#DA7B93]',
      glow: 'shadow-[0_0_20px_rgba(218,123,147,0.12)]',
    },
  ];

  return (
    <div className="w-full pt-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-[14px] bg-[#1C3334]/70 border border-[#376E6F]/30 p-3.5 sm:p-4 backdrop-blur-md transition-all ${stat.glow} group hover:border-[#DA7B93]/50`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#B8C5D6]">
                  Telemetry // 0{i + 1}
                </span>
                <Icon className={`w-4 h-4 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#F8FAFC] mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-[#F8FAFC]/90 mb-0.5">
                {stat.label}
              </div>
              <div className="text-[10px] text-[#B8C5D6] leading-tight">
                {stat.subtext}
              </div>

              {/* Subtle Haus corner accent in Rose */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#DA7B93]/40" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
