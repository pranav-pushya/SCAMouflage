import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import CyberBackground from './components/CyberBackground';
import HomePage from './pages/HomePage';
import EmailPage from './pages/EmailPage';
import SmsPage from './pages/SmsPage';
import UrlPage from './pages/UrlPage';
import FootprintPage from './pages/FootprintPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/sms" element={<SmsPage />} />
          <Route path="/url" element={<UrlPage />} />
          <Route path="/footprint" element={<FootprintPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col selection:bg-[#DA7B93]/20 selection:text-[#DA7B93] transition-colors duration-200 relative overflow-x-hidden">
          {/* Ambient Cyber Canvas Particle Network */}
          <CyberBackground />

          {/* Persistent Navigation */}
          <TopNav />

          {/* Page Content with Framer Motion transitions */}
          <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 pt-[76px] pb-8 flex-1 relative z-10">
            <AnimatedRoutes />
          </main>

          {/* Comprehensive Footer */}
          <Footer />
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}
