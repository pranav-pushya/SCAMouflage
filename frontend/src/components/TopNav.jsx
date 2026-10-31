import { NavLink, Link } from 'react-router-dom';

export default function TopNav() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Email', path: '/email' },
    { name: 'SMS', path: '/sms' },
    { name: 'URL', path: '/url' },
  ];

  return (
    <header className="w-full border-b border-[#0E1622] bg-[#070B12]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Slim top status & helpline bar */}
      <div className="w-full border-b border-[#0E1622] px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between text-xs text-[#93A1B5] gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#34D399] animate-pulse" aria-hidden="true" />
          <span className="font-medium text-[#E6EDF5]">PhishShield India - Hackathon PS 02</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#0A111C] border border-[#243247] text-[#93A1B5]">
            Prototype
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span>Helpline: <strong className="text-[#FBBF24]">1930</strong></span>
          <span className="text-[#243247]">|</span>
          <span>
            Portal: <a 
              href="https://cybercrime.gov.in" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#22D3EE] hover:underline"
            >
              cybercrime.gov.in
            </a>
          </span>
        </div>
      </div>

      {/* Main Brand & Route Nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="font-mono text-sm tracking-widest font-bold text-[#E6EDF5] hover:text-[#22D3EE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22D3EE] rounded px-1"
        >
          PHISHSHIELD//INDIA
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-[10px] border transition-colors focus:outline-none focus:ring-2 focus:ring-[#22D3EE] ${
                  isActive
                    ? 'bg-[#0F1A2A] border-[#1E3A4C] text-[#22D3EE]'
                    : 'bg-transparent border-transparent text-[#93A1B5] hover:text-[#E6EDF5] hover:bg-[#0A111C]'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
