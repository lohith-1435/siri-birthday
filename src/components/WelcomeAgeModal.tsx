import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getUnlockedWelcomeAge } from '../utils/timeCalculations';
import { audioEngine } from '../utils/audioEngine';

interface WelcomeAgeModalProps {
  onContinue: () => void;
}

export const WelcomeAgeModal: React.FC<WelcomeAgeModalProps> = ({ onContinue }) => {
  const dynamicAge = getUnlockedWelcomeAge();

  useEffect(() => {
    audioEngine.playChime(528, 3.0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-obsidian-950 flex flex-col items-center justify-center px-4 select-none overflow-hidden"
    >
      {/* Radiant Background Aura */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gold-500/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="w-10 h-10 rounded-full border border-gold-400 bg-gold-500/10 flex items-center justify-center text-gold-300 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
        </motion.div>

        {/* WELCOME TO [AGE] */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 2.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-5xl sm:text-7xl md:text-8xl font-bold gold-text tracking-wider uppercase drop-shadow-[0_15px_40px_rgba(212,175,55,0.4)]"
        >
          WELCOME TO {dynamicAge}
        </motion.h1>

        {/* A new chapter begins */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 1.2 }}
          className="font-cinzel text-xs sm:text-sm tracking-[0.45em] text-gold-300 uppercase mt-4 mb-8"
        >
          A new chapter begins.
        </motion.p>

        {/* Poetic Stanza */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.0, delay: 1.8 }}
          className="space-y-2 text-center my-4 py-4 px-6 border-y border-gold-500/20 max-w-lg"
        >
          <p className="font-cormorant italic text-lg sm:text-2xl text-gold-100 font-light">
            A new chapter.
          </p>
          <p className="font-cormorant italic text-lg sm:text-2xl text-gold-100 font-light">
            A new journey.
          </p>
          <p className="font-cormorant italic text-lg sm:text-2xl text-gold-200 font-medium">
            A story still being written.
          </p>
        </motion.div>

        {/* SIRI */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, delay: 2.6 }}
          className="font-cinzel text-4xl sm:text-6xl font-bold tracking-widest text-white mt-4 mb-8"
        >
          SIRI
        </motion.h2>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 3.2 }}
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)]"
        >
          <span>Begin the Journey</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
