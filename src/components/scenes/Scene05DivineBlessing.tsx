import React from 'react';
import { motion } from 'framer-motion';
import { SacredMandala } from '../SacredMandala';

interface SceneProps {
  isActive: boolean;
}

export const Scene05DivineBlessing: React.FC<SceneProps> = ({ isActive }) => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-obsidian-950 via-burgundy-950 to-obsidian-950">
      {/* Radiant Burgundy & Gold Radial Aura */}
      <div className="absolute inset-0 bg-burgundy-radial opacity-60 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-burgundy-700/20 blur-[140px] pointer-events-none" />

      {/* Floating Sacred Golden Blooming Mandala */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
        animate={isActive ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.7, opacity: 0 }}
        transition={{ duration: 3.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-0"
      >
        <SacredMandala size={640} glowIntensity={1.2} bloomProgress={1} />
      </motion.div>

      {/* Foreground Sacred Typography */}
      <div className="relative z-10 text-center flex flex-col items-center max-w-3xl px-4">
        {/* Subtle Sanskrit mantra invocation */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 0.7, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1.8, delay: 0.8 }}
          className="font-cormorant italic text-sm sm:text-base md:text-lg text-gold-200/80 tracking-[0.3em] mb-4"
        >
          ॐ सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 2.0, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-xs sm:text-sm md:text-base tracking-[0.45em] text-gold-300 uppercase mb-4"
        >
          Born Under The Divine Blessings
        </motion.p>

        {/* Grand Title: SHARAN NAVARATRI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          animate={isActive ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 2.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="my-2"
        >
          <h2 className="font-cinzel text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight gold-text drop-shadow-[0_15px_40px_rgba(212,175,55,0.35)]">
            SHARAN NAVARATRI
          </h2>
        </motion.div>

        {/* Divine blessing description */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 2.2, delay: 3.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-center flex flex-col items-center gap-3"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <p className="font-outfit text-xs sm:text-sm md:text-base text-gray-300/90 font-light leading-relaxed">
            The sacred nine nights celebrating the victory of light, auspiciousness, wisdom, and the eternal grace of the divine feminine.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};
