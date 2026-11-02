import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function CyberBackground() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for cyber constellation (Haus Palette: Rose #DA7B93, Teal #376E6F, Slate #2F4454)
    const particleCount = Math.min(Math.floor((width * height) / 20000), 65);
    const particles = [];

    const colors = isDark
      ? ['rgba(218, 123, 147, ', 'rgba(55, 110, 111, ', 'rgba(47, 68, 84, ']
      : ['rgba(194, 76, 109, ', 'rgba(55, 110, 111, ', 'rgba(47, 68, 84, '];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.35 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Mouse proximity interaction
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let lastTime = performance.now();

    const render = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      const maxDist = 130;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx * (delta * 60);
        p1.y += p1.vy * (delta * 60);

        // Wrap edges
        if (p1.x < 0) p1.x = width;
        else if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        else if (p1.y > height) p1.y = 0;

        // Mouse gentle repel
        const dxMouse = p1.x - mouse.x;
        const dyMouse = p1.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 110 && distMouse > 0) {
          p1.x += (dxMouse / distMouse) * 1.3;
          p1.y += (dyMouse / distMouse) * 1.3;
        }

        // Draw node
        p1.pulsePhase += p1.pulseSpeed;
        const currentAlpha = p1.baseAlpha + Math.sin(p1.pulsePhase) * 0.12;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p1.colorPrefix}${Math.max(0.06, currentAlpha)})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (isDark ? 0.16 : 0.10);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = i % 2 === 0
              ? `rgba(218, 123, 147, ${lineAlpha})`
              : `rgba(55, 110, 111, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Dynamic ambient glowing Haus orbs (Rose #DA7B93, Plum #2E151B, Teal #376E6F) */}
      <div
        className={`absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full blur-[140px] transition-opacity duration-700 pointer-events-none ${
          isDark ? 'bg-[#DA7B93]/14' : 'bg-[#DA7B93]/10'
        }`}
      />
      <div
        className={`absolute top-1/4 -right-40 w-[34rem] h-[34rem] rounded-full blur-[150px] transition-opacity duration-700 pointer-events-none ${
          isDark ? 'bg-[#2E151B]/60' : 'bg-[#DA7B93]/8'
        }`}
      />
      <div
        className={`absolute -bottom-40 left-1/4 w-[36rem] h-[36rem] rounded-full blur-[150px] transition-opacity duration-700 pointer-events-none ${
          isDark ? 'bg-[#376E6F]/20' : 'bg-[#376E6F]/10'
        }`}
      />

      {/* Cyber Canvas Particle Network */}
      <canvas ref={canvasRef} className="w-full h-full opacity-80" />
    </div>
  );
}
