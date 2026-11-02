import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Eye, ExternalLink, Phone } from 'lucide-react';

const PRECAUTIONS_DATA = {
  email: [
    {
      icon: AlertTriangle,
      title: 'Reply-To alag ho to ruko',
      desc: 'Reply dene se pehle From header aur Reply-To ka domain match karo.',
    },
    {
      icon: Lock,
      title: 'Link portal se kholo',
      desc: 'Payroll ya HR ka link email se nahi, browser bookmark ya company internal portal se kholo.',
    },
    {
      icon: Eye,
      title: 'Alag channel se confirm karo',
      desc: 'Kisi suspicious salary ya password reset email par HR ya IT team se direct phone ya Slack/Teams par confirm karein.',
    },
  ],
  sms: [
    {
      icon: Lock,
      title: 'Bank SMS se KYC nahi karta',
      desc: 'RBI rules ke mutabiq bank SMS ya WhatsApp link bhejkar KYC update nahi maangte. KYC branch ya official app se karein.',
    },
    {
      icon: AlertTriangle,
      title: 'Link ya number par tap mat karo',
      desc: 'Sender ID (jaise VM-SBIINB) spoof ki ja sakti hai. SMS mein aane wale kisi bhi unverified phone number par call na karein.',
    },
    {
      icon: Shield,
      title: 'OTP, PIN, Password mat batao',
      desc: 'Bank, CBI, ya Police officer kabhi phone par OTP ya UPI PIN nahi maangte. Paise lene ke liye kabhi PIN nahi lagta.',
    },
  ],
  url: [
    {
      icon: Eye,
      title: 'Short link preview karo',
      desc: 'bit.ly, tinyurl jaise short links ko direct kholne se pehle unshortener se asli destination domain check karein.',
    },
    {
      icon: AlertTriangle,
      title: 'Spelling aur Hyphen check karo',
      desc: 'sbi-kyc, onlinesbi-update jaise hyphenated combosquatting domains ko dekhte hi alert ho jayein.',
    },
    {
      icon: Lock,
      title: 'Naya domain plus login form',
      desc: 'Agar domain 30 din se kam purana hai aur bank ka login page dikhata hai, to 100% phishing trap hai.',
    },
  ],
};

export default function PrecautionsCard({ mode = 'sms' }) {
  const tips = PRECAUTIONS_DATA[mode] || PRECAUTIONS_DATA.sms;

  return (
    <section className="w-full bg-[#1C3334]/80 border border-[#376E6F]/30 rounded-[18px] p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#376E6F]/30 pb-3">
        <h3 className="text-xs uppercase font-mono tracking-widest text-[#B8C5D6] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#DA7B93]" />
          <span>AGLI BAAR KE LIYE SAVDHAANI // DEFENSIVE MEASURES</span>
        </h3>
        <span className="text-[10px] font-mono text-[#376E6F] bg-[#1C3334] px-2 py-0.5 rounded border border-[#376E6F]/50 font-semibold">
          Cyber Vigilance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-[12px] bg-[#0F1D1E]/80 border border-[#376E6F]/30 space-y-2 hover:border-[#DA7B93]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#2E151B] border border-[#DA7B93]/40 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-[#DA7B93]" />
                </div>
                <h4 className="text-xs font-mono font-bold text-[#F8FAFC]">
                  {tip.title}
                </h4>
              </div>
              <p className="text-[11px] text-[#B8C5D6] leading-relaxed">
                {tip.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-[#376E6F]/30 text-xs font-mono text-[#B8C5D6] flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-2">
          <span>Official Helpline:</span>
          <a
            href="tel:1930"
            className="text-[#DA7B93] font-bold hover:underline flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>1930</span>
          </a>
          <span className="text-[#376E6F]">|</span>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-[#376E6F] hover:text-[#DA7B93] hover:underline flex items-center gap-1"
          >
            <span>cybercrime.gov.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </span>
        <span className="text-[10px] text-[#B8C5D6]/60">Ministry of Home Affairs (MHA) · I4C</span>
      </div>
    </section>
  );
}
