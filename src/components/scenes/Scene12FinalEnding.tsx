import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Mail } from 'lucide-react';
import { BIRTH_DETAILS } from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
  onReplay?: () => void;
  onOpenEmailModal?: () => void;
}

export const Scene12FinalEnding: React.FC<SceneProps> = ({ isActive, onReplay, onOpenEmailModal }) => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-obsidian-950">
      {/* Lone Golden Star Ascending */}
      <motion.div
        initial={{ y: 50, scale: 0, opacity: 0 }}
        animate={isActive ? { y: 0, scale: 1, opacity: 1 } : { y: 50, scale: 0, opacity: 0 }}
        transition={{ duration: 3.5, delay: 0.5, ease: 'easeOut' }}
        className="relative flex items-center justify-center mb-10"
      >
        <div className="absolute w-24 h-24 rounded-full bg-gold-400/20 blur-xl animate-pulse" />
        <div className="w-4 h-4 rounded-full bg-[#FFF9E6] shadow-[0_0_20px_#FFF9E6,0_0_40px_#D4AF37]" />
      </motion.div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl px-4">
        {/* Exact Birth Date Dots */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={isActive ? { opacity: 0.7, letterSpacing: '0.6em' } : { opacity: 0 }}
          transition={{ duration: 2.0, delay: 1.2 }}
          className="font-cinzel text-xs sm:text-sm text-gold-300 uppercase mb-4"
        >
          28 · 09 · 2003
        </motion.p>

        {/* Name */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 2.5, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-5xl sm:text-7xl md:text-8xl font-bold tracking-widest gold-text mb-6 drop-shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
        >
          {BIRTH_DETAILS.name}
        </motion.h2>

        {/* Poetic Lines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 2.2, delay: 3.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <p className="font-cormorant italic text-lg sm:text-xl md:text-2xl text-gold-100 font-light tracking-wide">
            A beginning written under divine blessings.
          </p>
          <p className="font-outfit text-xs sm:text-sm text-gold-400/80 uppercase tracking-[0.25em]">
            {BIRTH_DETAILS.blessing}
          </p>
        </motion.div>

        {/* Ending Actions: Replay Journey & Email Automation Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.8, delay: 4.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
        >
          {onReplay && (
            <button
              onClick={onReplay}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-obsidian-900 border border-gold-500/30 hover:border-gold-400 text-gold-200 text-xs font-cinzel tracking-widest uppercase transition-all duration-300 hover:bg-gold-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay Journey
            </button>
          )}

          {onOpenEmailModal && (
            <button
              onClick={onOpenEmailModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-600 to-amber-700 hover:from-gold-500 hover:to-amber-600 text-obsidian-950 font-bold text-xs font-cinzel tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <Mail className="w-3.5 h-3.5" /> Email Automation System
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
};
