import SharedAnalyzer from '../components/SharedAnalyzer';

const EMAIL_SAMPLES = [
  {
    label: 'Fake HR mail',
    content: `Authentication-Results: mx.example.com;
 spf=fail smtp.mailfrom=payroll-update[.]xyz;
 dkim=none; dmarc=fail
From: "HR Payroll" <hr@payroll-update[.]xyz>
Reply-To: collect@mail-box[.]top
Subject: Salary revision, action needed`,
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    label: 'Legit Amazon mail',
    content: `Received: from mail.amazon.in
From: Amazon.in <auto-confirm@amazon.in>
Authentication-Results: mx.google.com; spf=pass; dkim=pass; dmarc=pass
Subject: Your Amazon.in order has been dispatched`,
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function EmailPage() {
  return (
    <SharedAnalyzer
      mode="email"
      title="Email check"
      subtitle="Raw headers paste karo ya .eml upload karo. Hum sender ki authenticity jaanch kar bataenge."
      placeholder={`Authentication-Results: mx.example.com;
 spf=fail smtp.mailfrom=payroll-update[.]xyz;
 dkim=none; dmarc=fail
From: "HR Payroll" <hr@payroll-update[.]xyz>
Reply-To: collect@mail-box[.]top
Subject: Salary revision, action needed`}
      samples={EMAIL_SAMPLES}
      inputKind="textarea"
    />
  );
}
