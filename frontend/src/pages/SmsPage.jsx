import SharedAnalyzer from '../components/SharedAnalyzer';

const SMS_SAMPLES = [
  {
    label: 'Fake KYC',
    content: 'Priye grahak, aapka SBI account block ho gaya hai. Turant KYC update karein nahi to account band ho jayega: http://sbi-kyc-update.xyz',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    label: 'FASTag',
    content: 'Dear customer, your FASTag is blacklisted due to low balance, recharge fastag now at hxxp://fastag-refill.xyz',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Digital arrest',
    content: 'CBI Cyber Crime Cell: A courier parcel containing illegal contraband and narcotics was seized under your Aadhaar. Digital arrest warrant issued. Join video call immediately.',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Legit OTP',
    content: 'Your a/c no. XX1234 is debited for Rs 450.00 on 30-Oct-26 by UPI. Bal: Rs 15400. Info: amazon. If not you, SMS BLOCK to 9223008333. SBI',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function SmsPage() {
  return (
    <SharedAnalyzer
      mode="sms"
      title="SMS check"
      subtitle="Koi bhi suspicious SMS ya WhatsApp message paste karo. Hinglish bhi chalega."
      placeholder="SBI: Aapka account aaj block ho jayega. KYC update karein: hxxp://bit[.]ly/sbi-kyc-1x"
      samples={SMS_SAMPLES}
      inputKind="textarea"
    />
  );
}
