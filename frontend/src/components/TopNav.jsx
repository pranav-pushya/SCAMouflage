import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Download, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ExtensionModal from './ExtensionModal';

export default function TopNav() {
  const { toggleTheme, isDark } = useTheme();
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Email', path: '/email' },
    { name: 'SMS', path: '/sms' },
    { name: 'URL', path: '/url' },
    { name: 'Footprint', path: '/footprint' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full border-b border-[#376E6F]/30 bg-[#1C3334]/90 backdrop-blur-xl z-50 transition-colors">
      {/* Main Brand & Route Nav */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Glowing Haus Rose Shield */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#DA7B93] rounded-lg px-1.5 py-1"
        >
          <div className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
            isDark
              ? 'bg-gradient-to-tr from-[#2E151B] to-[#1C3334] border-[#DA7B93]/50 shadow-[0_0_18px_rgba(218,123,147,0.3)] group-hover:border-[#DA7B93] group-hover:shadow-[0_0_24px_rgba(218,123,147,0.5)]'
              : 'bg-[#FDF2F4] border-[#DA7B93] shadow-sm group-hover:bg-[#FCE7EC] group-hover:border-[#B83A5D]'
          }`}>
            <Shield className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
              isDark ? 'text-[#DA7B93]' : 'text-[#B83A5D]'
            }`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DA7B93] animate-pulse" />
          </div>
          <div>
            <span className="font-mono text-sm tracking-widest font-bold text-[#F8FAFC] group-hover:text-[#DA7B93] transition-colors">
              PHISHSHIELD
            </span>
            <span className="font-mono text-xs text-[#DA7B93] font-bold"> // INDIA</span>
          </div>
        </Link>

        {/* Navigation Tabs and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <nav className="flex items-center space-x-1 sm:space-x-1.5 relative p-1 rounded-[12px] bg-[#1C3334]/80 border border-[#376E6F]/40" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `relative text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-1.5 rounded-[9px] transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-[#DA7B93] ${
                      isActive
                        ? 'text-[#DA7B93]'
                        : 'text-[#B8C5D6] hover:text-[#DA7B93]'
                    }`
                  }
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-[#2E151B] border border-[#DA7B93]/50 rounded-[9px] shadow-sm -z-10"
                    />
                  )}
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Download Extension Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsExtensionModalOpen(true)}
            aria-label="Download PhishShield Chrome Extension"
            title="Download Real-Time Chrome Extension"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-[#DA7B93]/50 bg-[#2E151B]/80 hover:bg-[#2E151B] text-[#DA7B93] hover:border-[#DA7B93] transition-all focus:outline-none focus:ring-2 focus:ring-[#DA7B93] cursor-pointer text-xs font-mono shrink-0 shadow-sm group overflow-hidden"
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#DA7B93]/20 to-transparent pointer-events-none" />
            <Download className="w-3.5 h-3.5 text-[#DA7B93] group-hover:-translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline font-sans font-medium text-xs">Extension</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DA7B93] animate-ping" />
          </motion.button>

          {/* Light / Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] border border-[#376E6F]/40 bg-[#1C3334]/80 hover:bg-[#2F4454] text-[#B8C5D6] hover:text-[#DA7B93] transition-all focus:outline-none focus:ring-2 focus:ring-[#DA7B93] cursor-pointer text-xs font-mono shrink-0 shadow-sm"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#DA7B93] transition-transform duration-300 hover:rotate-45" />
                <span className="hidden md:inline font-sans font-medium text-xs">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#376E6F] transition-transform duration-300 hover:-rotate-12" />
                <span className="hidden md:inline font-sans font-medium text-xs">Dark</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Extension Download Guide Modal */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </header>
  );
}
