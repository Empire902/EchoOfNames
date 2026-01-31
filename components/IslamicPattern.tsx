
import React from 'react';

export const IslamicPattern: React.FC<{ opacity?: number; fullScreen?: boolean }> = ({ opacity = 0.1, fullScreen = false }) => {
  return (
    <div 
      className={`pointer-events-none overflow-hidden ${fullScreen ? 'fixed inset-0 z-0' : 'absolute inset-0'}`} 
      style={{ opacity }}
    >
      <style>
        {`
          @keyframes pattern-drift {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(2deg) scale(1.05); }
            100% { transform: rotate(0deg) scale(1); }
          }
          .pattern-complex-animate {
            animation: pattern-drift 40s ease-in-out infinite;
            transform-origin: center center;
          }
        `}
      </style>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="pattern-complex-animate">
        <defs>
          <pattern id="islamic-pattern-detailed" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Main 8-pointed star (Rub el Hizb style) */}
            <g fill="none" stroke="#d4af37" strokeWidth="0.8">
              {/* Outer boundary star */}
              <path d="M60 0 L78 42 L120 60 L78 78 L60 120 L42 78 L0 60 L42 42 Z" />
              {/* Overlapping squares for the classic 8-pointed star effect */}
              <rect x="25" y="25" width="70" height="70" transform="rotate(0 60 60)" strokeWidth="0.5" opacity="0.6" />
              <rect x="25" y="25" width="70" height="70" transform="rotate(45 60 60)" strokeWidth="0.5" opacity="0.6" />
              
              {/* Internal geometric details */}
              <circle cx="60" cy="60" r="12" strokeWidth="0.4" />
              <circle cx="60" cy="60" r="25" strokeWidth="0.2" strokeDasharray="2 2" />
              
              {/* Corner accents to connect pattern */}
              <path d="M0 0 L20 20 M120 0 L100 20 M0 120 L20 100 M120 120 L100 100" strokeWidth="0.3" opacity="0.4" />
              
              {/* Connecting lines for seamless flow */}
              <line x1="60" y1="0" x2="60" y2="20" strokeWidth="0.5" />
              <line x1="60" y1="100" x2="60" y2="120" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="20" y2="60" strokeWidth="0.5" />
              <line x1="100" y1="60" x2="120" y2="60" strokeWidth="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern-detailed)" />
      </svg>
    </div>
  );
};
