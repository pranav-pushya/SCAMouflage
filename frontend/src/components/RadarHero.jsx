import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, ShieldAlert, Zap, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function RadarHero() {
  const { isDark } = useTheme();
  const [activeTarget, setActiveTarget] = useState(0);
  const containerRef = useRef(null);
  const [radarSize, setRadarSize] = useState(480);

  // Targets on radar (Haus Palette: Rose #DA7B93, Teal #376E6F, Slate #2F4454)
  const targets = [
    { id: 1, label: 'Digital Arrest Scam', angle: 42, dist: 145, color: '#DA7B93', type: 'high' },
    { id: 2, label: 'Fake SBI YONO KYC', angle: 138, dist: 175, color: '#E0A96D', type: 'medium' },
    { id: 3, label: 'FASTag Blacklist Phish', angle: 222, dist: 135, color: '#DA7B93', type: 'high' },
    { id: 4, label: 'Official Gov Portal (Clean)', angle: 312, dist: 165, color: '#376E6F', type: 'safe' },
  ];

  // Dynamically observe radar container width
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setRadarSize(containerRef.current.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Rotate active target highlight every 2.4s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTarget((prev) => (prev + 1) % targets.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [targets.length]);

  // Subtle 3D mouse parallax tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const radiusScale = Math.max(0.65, Math.min(radarSize / 480, 1.25));

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px] aspect-square flex flex-col items-center justify-center select-none perspective-[1000px] mx-auto lg:ml-auto"
      aria-label="Cyber Defense Radar Matrix"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Outer Ring with degree ticks */}
        <div className="absolute inset-2 sm:inset-4 rounded-full border border-[#376E6F]/35 flex items-center justify-center">
          {/* Compass labels */}
          <span className="absolute top-1 text-[10px] font-mono tracking-widest text-[#DA7B93] font-semibold">000° N</span>
          <span className="absolute right-1 text-[10px] font-mono tracking-widest text-[#376E6F] font-semibold">090° E</span>
          <span className="absolute bottom-1 text-[10px] font-mono tracking-widest text-[#DA7B93] font-semibold">180° S</span>
          <span className="absolute left-1 text-[10px] font-mono tracking-widest text-[#376E6F] font-semibold">270° W</span>
        </div>

        {/* Outer dashed spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-7 sm:inset-9 rounded-full border border-dashed border-[#DA7B93]/35"
        />

        {/* Inner concentric ring 2 */}
        <div className="absolute inset-14 sm:inset-18 rounded-full border border-[#2F4454]/60" />

        {/* Inner concentric ring 3 */}
        <div className={`absolute inset-24 sm:inset-28 rounded-full border backdrop-blur-sm ${
          isDark ? 'border-[#376E6F]/25 bg-[#1C3334]/50' : 'border-[#376E6F]/20 bg-white/75 shadow-sm'
        }`} />

        {/* Crosshair coordinate axes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#DA7B93]/25 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-[#376E6F]/25 to-transparent" />
        </div>

        {/* Rotating Radar Sweep Cone with Haus Rose/Teal gradient */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-8 rounded-full pointer-events-none overflow-hidden"
          style={{
            background: isDark
              ? 'conic-gradient(from 0deg, rgba(218, 123, 147, 0.35) 0deg, rgba(55, 110, 111, 0.12) 35deg, transparent 65deg, transparent 360deg)'
              : 'conic-gradient(from 0deg, rgba(194, 76, 109, 0.25) 0deg, rgba(55, 110, 111, 0.10) 35deg, transparent 65deg, transparent 360deg)',
          }}
        />

        {/* Target Threat Pings */}
        {targets.map((target, idx) => {
          const rad = (target.angle * Math.PI) / 180;
          const xPos = Math.cos(rad) * (target.dist * radiusScale);
          const yPos = Math.sin(rad) * (target.dist * radiusScale);
          const isActive = idx === activeTarget;

          return (
            <div
              key={target.id}
              className="absolute z-20 pointer-events-auto group cursor-pointer"
              style={{
                transform: `translate(${xPos}px, ${yPos}px)`,
              }}
            >
              {/* Outer pulsing sonar wave */}
              <span
                className="absolute -inset-2.5 rounded-full animate-ping opacity-60 pointer-events-none"
                style={{ backgroundColor: target.color }}
              />

              {/* Core beacon dot */}
              <div
                className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isDark ? 'border-[#1C3334]' : 'border-white'
                } ${isActive ? 'scale-125 ring-4' : 'scale-100'}`}
                style={{
                  backgroundColor: target.color,
                  boxShadow: `0 0 16px ${target.color}`,
                }}
              />

              {/* Tooltip / Threat Label */}
              <div
                className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide border backdrop-blur-md transition-all duration-300 pointer-events-none ${
                  isActive
                    ? isDark
                      ? 'opacity-100 translate-x-0 bg-[#2E151B]/95 border-[#DA7B93]/70 text-[#F8FAFC] shadow-xl'
                      : 'opacity-100 translate-x-0 bg-white/95 border-[#DA7B93] text-[#1C3334] shadow-lg font-semibold'
                    : isDark
                    ? 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-[#1C3334]/90 border-[#376E6F]/50 text-[#B8C5D6]'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white/95 border-[#CBD5E1] text-[#475569] shadow-md'
                }`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: target.color }} />
                {target.label}
              </div>
            </div>
          );
        })}

        {/* Central Holographic Shield Core in Haus Palette */}
        <div className={`relative z-10 w-22 h-22 sm:w-26 sm:h-26 lg:w-28 lg:h-28 rounded-full border flex items-center justify-center ${
          isDark
            ? 'bg-gradient-to-tr from-[#2E151B] to-[#1C3334] border-[#DA7B93]/60 shadow-[0_0_35px_rgba(218,123,147,0.35)]'
            : 'bg-gradient-to-tr from-[#FDF2F4] to-white border-[#DA7B93]/70 shadow-[0_4px_24px_rgba(218,123,147,0.22)]'
        }`}>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Shield className={`w-11 h-11 sm:w-13 sm:h-13 ${
              isDark ? 'text-[#DA7B93] drop-shadow-[0_0_14px_rgba(218,123,147,0.6)]' : 'text-[#C24C6D] drop-shadow-[0_2px_8px_rgba(194,76,109,0.4)]'
            }`} />
          </motion.div>

          {/* Central status badge */}
          <div className={`absolute -bottom-2.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono flex items-center gap-1 shadow-md ${
            isDark ? 'bg-[#1C3334] border-[#DA7B93]/60 text-[#DA7B93]' : 'bg-white border-[#DA7B93]/60 text-[#B83A5D]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#376E6F] animate-pulse" />
            HAUS·DEFENSE
          </div>
        </div>
      </motion.div>

      {/* Telemetry live status pill */}
      <div className={`mt-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs font-mono shadow-sm ${
        isDark ? 'bg-[#1C3334]/90 border-[#376E6F]/40 text-[#B8C5D6]' : 'bg-white/95 border-[#CBD5E1] text-[#475569]'
      }`}>
        <Radio className="w-3.5 h-3.5 text-[#DA7B93] animate-pulse" />
        <span>RADAR SCAN: <strong className={isDark ? 'text-[#DA7B93]' : 'text-[#C24C6D]'}>ACTIVE</strong></span>
        <span className="text-[#376E6F]">|</span>
        <span className={isDark ? 'text-[#F8FAFC]' : 'text-[#1C3334]'}>1930 Integration</span>
      </div>
    </div>
  );
}
