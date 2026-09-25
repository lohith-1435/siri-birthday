import React from 'react';
import { motion } from 'framer-motion';

interface SacredMandalaProps {
  size?: number;
  glowIntensity?: number;
  bloomProgress?: number; // 0 to 1
  isRotating?: boolean;
  className?: string;
  theme?: 'gold' | 'burgundy-gold';
}

export const SacredMandala: React.FC<SacredMandalaProps> = ({
  size = 500,
  glowIntensity = 1,
  bloomProgress = 1,
  isRotating = true,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Golden Glow Core */}
      <div
        className="absolute rounded-full pointer-events-none blur-3xl transition-opacity duration-1000"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, rgba(140, 109, 55, 0.15) 50%, transparent 70%)',
          opacity: glowIntensity,
        }}
      />

      {/* Outer Rotating Sacred Ring */}
      <motion.svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="absolute inset-0"
        animate={isRotating ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <linearGradient id="mandalaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8E7" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#AA822A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F3E5AB" stopOpacity="0.85" />
          </linearGradient>

          <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Astral Ring */}
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="none"
          stroke="url(#mandalaGoldGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 8"
          opacity={0.6 * bloomProgress}
        />
        <circle
          cx="200"
          cy="200"
          r="175"
          fill="none"
          stroke="url(#mandalaGoldGrad)"
          strokeWidth="0.8"
          opacity={0.5 * bloomProgress}
        />

        {/* 24 Rays of Celestial Light */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <line
              key={`ray-${i}`}
              x1="200"
              y1="200"
              x2="200"
              y2="30"
              stroke="url(#mandalaGoldGrad)"
              strokeWidth="0.6"
              opacity={0.35 * bloomProgress}
              transform={`rotate(${angle} 200 200)`}
            />
          );
        })}

        {/* 12 Outer Lotus Petals */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <path
              key={`outer-petal-${i}`}
              d="M 200,60 C 218,100 225,140 200,165 C 175,140 182,100 200,60 Z"
              fill="none"
              stroke="url(#mandalaGoldGrad)"
              strokeWidth="1.2"
              opacity={0.75 * bloomProgress}
              transform={`rotate(${angle} 200 200)`}
              filter="url(#goldGlowFilter)"
            />
          );
        })}
      </motion.svg>

      {/* Middle Counter-Rotating Lotus Petals */}
      <motion.svg
        viewBox="0 0 400 400"
        width={size * 0.82}
        height={size * 0.82}
        className="absolute"
        animate={isRotating ? { rotate: -360 } : { rotate: 0 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
      >
        {/* 8 Sacred Inner Blooming Lotus Petals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <g key={`inner-petal-${i}`} transform={`rotate(${angle} 200 200)`}>
              <path
                d="M 200,90 C 215,130 220,160 200,180 C 180,160 185,130 200,90 Z"
                fill="rgba(212, 175, 55, 0.08)"
                stroke="url(#mandalaGoldGrad)"
                strokeWidth="1.5"
                opacity={0.85 * bloomProgress}
              />
              <circle cx="200" cy="90" r="3" fill="#FFF8E7" opacity={0.9 * bloomProgress} />
            </g>
          );
        })}

        {/* Sacred Geometry Triangles (Sri Yantra motif) */}
        <polygon
          points="200,120 265,245 135,245"
          fill="none"
          stroke="url(#mandalaGoldGrad)"
          strokeWidth="1"
          opacity={0.6 * bloomProgress}
        />
        <polygon
          points="200,260 265,135 135,135"
          fill="none"
          stroke="url(#mandalaGoldGrad)"
          strokeWidth="1"
          opacity={0.6 * bloomProgress}
        />
      </motion.svg>

      {/* Innermost Core Bindu & Luminous Center */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size * 0.22,
          height: size * 0.22,
          border: '1.5px solid rgba(212, 175, 55, 0.7)',
          background: 'radial-gradient(circle, rgba(255, 248, 220, 0.3) 0%, rgba(212, 175, 55, 0.1) 70%, transparent 100%)',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.5), inset 0 0 15px rgba(212, 175, 55, 0.3)',
        }}
      >
        <div
          className="w-3 h-3 rounded-full bg-gold-200 animate-pulse"
          style={{ boxShadow: '0 0 15px #FFF8E7, 0 0 30px #D4AF37' }}
        />
      </div>
    </div>
  );
};
