import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import HomePage from './pages/HomePage';
import EmailPage from './pages/EmailPage';
import SmsPage from './pages/SmsPage';
import UrlPage from './pages/UrlPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#070B12] text-[#E6EDF5] flex flex-col selection:bg-[#22D3EE]/20 selection:text-[#22D3EE]">
        {/* Persistent Navigation */}
        <TopNav />

        {/* Page Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/sms" element={<SmsPage />} />
            <Route path="/url" element={<UrlPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Minimal Footer */}
        <footer className="w-full border-t border-[#0E1622] py-6 text-center text-xs text-[#93A1B5] font-mono">
          PhishShield India · Hackathon PS 02 · Prototype
        </footer>
      </div>
    </HashRouter>
  );
}
