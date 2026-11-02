import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Shield, Terminal, Cpu } from 'lucide-react';

export default function ScanHUD({ mode = 'auto' }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Payload Normalization & Protocol Inspection', detail: 'De-obfuscating unicode, defanging, parsing tokens' },
    { label: 'Indian Domestic Vector & Hinglish Rules', detail: 'Evaluating KYC, FASTag, Digital Arrest, Bijli patterns' },
    { label: 'Combosquatting & Typosquatting Analysis', detail: 'Comparing against 50+ official Indian banking/gov domains' },
    { label: 'Tri-Engine Multi-Signal Verdict Synthesis', detail: 'Synthesizing final risk score & plain-language reasons' },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 180);
    const timer2 = setTimeout(() => setCurrentStep(2), 380);
    const timer3 = setTimeout(() => setCurrentStep(3), 580);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-[#1C3334]/95 border border-[#DA7B93]/40 p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-[#DA7B93]/10 space-y-4">
      {/* Top HUD Header */}
      <div className="flex items-center justify-between border-b border-[#376E6F]/30 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DA7B93] animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-[#DA7B93] relative" />
          </div>
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F8FAFC] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#DA7B93]" />
            ACTIVE SCANNING HUD // {mode.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#DA7B93] bg-[#2E151B] border border-[#DA7B93]/40 px-2.5 py-0.5 rounded-full animate-pulse font-semibold">
            LIVE FORENSIC RUN
          </span>
        </div>
      </div>

      {/* Animated Haus Progress Bar */}
      <div className="w-full bg-[#0F1D1E] rounded-full h-1.5 overflow-hidden border border-[#376E6F]/40">
        <motion.div
          initial={{ width: '8%' }}
          animate={{ width: '96%' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="h-full bg-gradient-to-r from-[#376E6F] via-[#DA7B93] to-[#376E6F] rounded-full shadow-[0_0_12px_#DA7B93]"
        />
      </div>

      {/* Step checklist */}
      <div className="space-y-2.5 pt-1">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-start gap-3 p-2 rounded-[10px] transition-all text-xs font-mono ${
                isCurrent
                  ? 'bg-[#2E151B] border border-[#DA7B93]/40 text-[#F8FAFC]'
                  : isDone
                  ? 'text-[#B8C5D6]'
                  : 'text-[#B8C5D6]/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#376E6F]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#DA7B93] animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#376E6F]/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${isCurrent ? 'text-[#DA7B93]' : ''}`}>
                  {step.label}
                </div>
                <div className="text-[10px] text-[#B8C5D6] truncate">
                  {step.detail}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between pt-2 border-t border-[#376E6F]/30 text-[10px] font-mono text-[#B8C5D6]">
        <span>Engine: Tri-Engine Parallel Dispatch</span>
        <span className="text-[#376E6F] font-semibold">Lat: &lt;35ms Target</span>
      </div>
    </div>
  );
}
