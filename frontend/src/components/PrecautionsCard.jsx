const PRECAUTIONS_DATA = {
  email: [
    {
      title: 'Reply-To alag ho to ruko',
      desc: 'Reply dene se pehle sender ka domain match karo.',
    },
    {
      title: 'Link portal se kholo',
      desc: 'Payroll ya HR ka link email se nahi, company portal se kholo.',
    },
    {
      title: 'Alag channel se confirm karo',
      desc: 'HR ya IT ko phone ya chat par poochho.',
    },
  ],
  sms: [
    {
      title: 'Bank SMS se KYC nahi karta',
      desc: 'KYC branch ya official app se hi karo.',
    },
    {
      title: 'Link ya number par tap mat karo',
      desc: 'Sender ID asli lage tab bhi.',
    },
    {
      title: 'OTP, PIN, CVV mat batao',
      desc: 'Bank ye kabhi nahi maangta.',
    },
  ],
  url: [
    {
      title: 'Short link preview karo',
      desc: 'Kholne se pehle asli destination dekho.',
    },
    {
      title: 'Spelling check karo',
      desc: 'Domain mein extra shabd ya hyphen ruko.',
    },
    {
      title: 'Naya domain plus login form',
      desc: 'Ye combination mile to turant band karo.',
    },
  ],
};

export default function PrecautionsCard({ mode = 'sms' }) {
  const tips = PRECAUTIONS_DATA[mode] || PRECAUTIONS_DATA.sms;

  return (
    <section className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] p-5 sm:p-6 backdrop-blur-md space-y-4">
      <h3 className="text-xs uppercase font-mono tracking-widest text-[#93A1B5]">
        AGLI BAAR KE LIYE SAVDHAANI
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-sm font-semibold text-[#E6EDF5]">
              {tip.title}
            </h4>
            <p className="text-xs text-[#93A1B5] leading-relaxed">
              {tip.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1B2433] text-xs text-[#93A1B5] flex items-center justify-between flex-wrap gap-2">
        <span>
          Report karo:{' '}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-[#22D3EE] hover:underline"
          >
            cybercrime.gov.in
          </a>{' '}
          ya helpline{' '}
          <a
            href="tel:1930"
            className="text-[#FBBF24] font-semibold hover:underline"
          >
            1930
          </a>
        </span>
      </div>
    </section>
  );
}
