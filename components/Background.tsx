
import React, { useEffect, useState } from 'react';
import { IslamicPattern } from './IslamicPattern';

const Star: React.FC = () => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setStyle({
      top: `${Math.random() * 70}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2}px`,
      height: `${Math.random() * 2}px`,
      '--duration': `${2 + Math.random() * 4}s`,
    } as React.CSSProperties);
  }, []);

  return <div className="star" style={style} />;
};

const ShootingStar: React.FC = () => {
  const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' });

  useEffect(() => {
    const triggerStar = () => {
      if (Math.random() > 0.4) return;

      const top = Math.random() * 40;
      const left = 20 + Math.random() * 80;
      const duration = 0.2 + Math.random() * 0.3;

      setStyle({
        top: `${top}%`,
        left: `${left}%`,
        '--duration': `${duration}s`,
        display: 'block',
      } as React.CSSProperties);

      setTimeout(() => {
        setStyle({ display: 'none' });
      }, duration * 1000);
    };

    const interval = setInterval(triggerStar, 800 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="shooting-star" style={style} />;
};

const WindParticle: React.FC = () => {
  const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' });

  useEffect(() => {
    const trigger = () => {
      const top = Math.random() * 100;
      const duration = 5 + Math.random() * 5;
      setStyle({
        top: `${top}%`,
        left: '-10%',
        '--duration': `${duration}s`,
        display: 'block',
      } as React.CSSProperties);
      
      setTimeout(() => setStyle({ display: 'none' }), duration * 1000);
    };
    const interval = setInterval(trigger, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return <div className="wind-particle" style={style} />;
};

export const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stars = Array.from({ length: 60 });
  const shootingStars = Array.from({ length: 12 });
  const windParticles = Array.from({ length: 10 });

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center desert-gradient overflow-hidden">
      <style>
        {`
          @keyframes wind-drift {
            0% { transform: translateX(0) scale(1); opacity: 0; }
            20% { opacity: 0.3; }
            80% { opacity: 0.3; }
            100% { transform: translateX(110vw) scale(1.5); opacity: 0; }
          }
          .wind-particle {
            position: absolute;
            height: 1px;
            width: 40px;
            background: linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.2), transparent);
            animation: wind-drift var(--duration) linear forwards;
            pointer-events: none;
            z-index: 5;
          }
          @keyframes dune-sway-up-down {
            0%, 100% { transform: translateY(0) scaleX(1); }
            25% { transform: translateY(-10px) scaleX(1.01); }
            75% { transform: translateY(10px) scaleX(0.99); }
          }
          
          @keyframes dune-sway-down-up {
            0%, 100% { transform: translateY(0) scaleX(1); }
            25% { transform: translateY(10px) scaleX(0.99); }
            75% { transform: translateY(-10px) scaleX(1.01); }
          }

          @keyframes moon-glow {
            0%, 100% { opacity: 0.8; filter: blur(35px); transform: scale(1); }
            50% { opacity: 1; filter: blur(45px); transform: scale(1.1); }
          }

          @keyframes moon-float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(5px, -10px); }
          }

          @keyframes text-from-sand {
            0% { transform: translateY(60px); opacity: 0; }
            40% { opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }

          @keyframes shooting-star-anim {
            0% {
              transform: translateX(0) translateY(0) rotate(-40deg) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
              scale: 1.2;
            }
            100% {
              transform: translateX(-500px) translateY(400px) rotate(-40deg) scale(0.8);
              opacity: 0;
            }
          }

          .animate-dune-bright {
            animation: dune-sway-up-down 10s ease-in-out infinite;
          }
          .animate-dune-dark {
            animation: dune-sway-down-up 10s ease-in-out infinite;
          }
          .reveal-text {
            animation: text-from-sand 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: 0.8s;
          }

          .shooting-star {
            position: absolute;
            width: 3px;
            height: 3px;
            background: #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 1), 0 0 20px 5px rgba(255, 255, 255, 0.4);
            animation: shooting-star-anim var(--duration) linear forwards;
            z-index: 1;
            pointer-events: none;
          }

          .shooting-star::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            width: 120px;
            height: 2px;
            background: linear-gradient(90deg, #ffffff, transparent);
            border-radius: 999px;
          }
        `}
      </style>
      
      {/* Background Islamic Detailed Watermark */}
      <IslamicPattern opacity={0.03} fullScreen={true} />
      
      {/* Background layer for stars and elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map((_, i) => <Star key={i} />)}
        {shootingStars.map((_, i) => <ShootingStar key={i} />)}
        {windParticles.map((_, i) => <WindParticle key={i} />)}
      </div>
      
      {/* Full Moon (Badr) */}
      <div className="absolute top-10 left-10 w-24 h-24 z-20 pointer-events-none" style={{ animation: 'moon-float 20s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_35px_rgba(255,253,208,0.8)]">
          <defs>
            <radialGradient id="moon-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#fefce8" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#moon-gradient)" />
          <circle cx="35" cy="40" r="6" fill="#000" fillOpacity="0.03" />
          <circle cx="60" cy="35" r="8" fill="#000" fillOpacity="0.04" />
          <circle cx="55" cy="65" r="5" fill="#000" fillOpacity="0.03" />
          <circle cx="30" cy="60" r="4" fill="#000" fillOpacity="0.02" />
        </svg>
      </div>
      <div 
        className="absolute top-8 left-8 w-28 h-28 rounded-full bg-yellow-100/15 pointer-events-none" 
        style={{ animation: 'moon-glow 8s ease-in-out infinite, moon-float 20s ease-in-out infinite' }}
      ></div>

      {/* Desert Dunes */}
      <div className="absolute bottom-0 w-full z-10 h-48 sm:h-64 pointer-events-none">
        <svg viewBox="0 0 1440 400" className="absolute -bottom-10 w-[102%] -left-[1%] h-[120%]" preserveAspectRatio="none">
          <path 
            className="animate-dune-bright"
            fill="#8b6239" 
            fillOpacity="1" 
            d="M0,224L80,202.7C160,181,320,139,480,144C640,149,800,203,960,197.3C1120,192,1280,128,1360,96L1440,64V400H0Z"
          ></path>
          <path 
            className="animate-dune-dark"
            fill="#5d4037" 
            fillOpacity="1" 
            d="M0,256L60,240C120,224,240,192,360,197.3C480,203,600,245,720,245.3C840,245,960,203,1080,181.3C1200,160,1320,160,1380,160L1440,160V400H0Z"
          ></path>
        </svg>
      </div>

      <div className="relative z-20 w-full h-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};
