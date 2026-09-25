import React from 'react';
import { motion } from 'framer-motion';

interface SceneProps {
  isActive: boolean;
  onNext?: () => void;
}

export const Scene01TheVoid: React.FC<SceneProps> = ({ isActive }) => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-obsidian-950">
      {/* Central Pulsing Golden Point of Light */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? { scale: [0, 1.2, 1], opacity: [0, 1, 0.9] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 3.5, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-12"
      >
        {/* Glow Halos */}
        <div className="absolute w-40 h-40 rounded-full bg-gold-500/20 blur-2xl animate-pulse-glow" />
        <div className="absolute w-20 h-20 rounded-full bg-gold-300/30 blur-xl animate-pulse" />
        <div className="w-3.5 h-3.5 rounded-full bg-[#FFF9E6] shadow-[0_0_25px_#FFF9E6,0_0_50px_#D4AF37]" />

        {/* Faint Sacred Mandala emerging around the spark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
          animate={isActive ? { opacity: 0.28, scale: 1, rotate: 45 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 4.5, delay: 1.2, ease: 'easeOut' }}
          className="absolute w-80 h-80 rounded-full border border-gold-500/30 border-dashed pointer-events-none"
        />
      </motion.div>

      {/* Cinematic Story Typography */}
      <div className="text-center max-w-2xl z-10 flex flex-col items-center gap-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 2.5, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-xs md:text-sm tracking-[0.45em] text-gold-300/80 uppercase"
        >
          Before a story begins...
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 3.0, delay: 3.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-cormorant italic text-3xl md:text-5xl lg:text-6xl font-light text-[#FAF8F5] tracking-wide"
        >
          There is a <span className="gold-text not-italic font-cinzel font-medium">moment.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.4 } : { opacity: 0 }}
          transition={{ duration: 2, delay: 5.0 }}
          className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mt-4"
        />
      </div>
    </section>
  );
};
