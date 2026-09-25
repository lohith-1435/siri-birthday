import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { type TimelineEntry } from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
  timelineEntries: TimelineEntry[];
}

export const Scene09HundredOneYears: React.FC<SceneProps> = ({ isActive, timelineEntries }) => {
  const publishedCount = timelineEntries.filter((e) => e.isPublished).length;

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-obsidian-950">
      {/* Concentric Cosmic Rings */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isActive ? { scale: [0.5, 1.1, 1], opacity: [0, 0.8, 0.4] } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 3.5, ease: 'easeOut' }}
        className="absolute w-[600px] h-[600px] rounded-full border border-gold-400/30 pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={isActive ? { scale: [0.3, 1.3, 1], opacity: [0, 0.6, 0.25] } : { scale: 0.3, opacity: 0 }}
        transition={{ duration: 4.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute w-[850px] h-[850px] rounded-full border border-gold-500/20 border-dashed animate-spin-slow pointer-events-none"
      />

      {/* Atmospheric center aura */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gold-500/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center flex flex-col items-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1.8, delay: 0.5 }}
          className="flex items-center gap-2 mb-4"
        >
          <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
          <span className="font-cinzel text-xs md:text-sm tracking-[0.55em] text-gold-300 uppercase">
            A Centennial of Divine Grace
          </span>
          <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
        </motion.div>

        {/* Monumental 101 Numeral */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: 'blur(12px)' }}
          animate={isActive ? { scale: 1, opacity: 1, filter: 'blur(0px)' } : { scale: 0.8, opacity: 0 }}
          transition={{ duration: 2.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative select-none my-2"
        >
          <span className="font-cinzel text-8xl sm:text-9xl md:text-[13rem] lg:text-[16rem] font-bold leading-none tracking-tight gold-text drop-shadow-[0_20px_60px_rgba(212,175,55,0.4)]">
            101
          </span>
        </motion.div>

        {/* Years of a Beautiful Journey */}
        <motion.h2
          initial={{ opacity: 0, letterSpacing: '0.1em' }}
          animate={isActive ? { opacity: 1, letterSpacing: '0.35em' } : { opacity: 0 }}
          transition={{ duration: 2.2, delay: 2.4, ease: 'easeOut' }}
          className="font-cinzel text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white uppercase mt-2 mb-6"
        >
          YEARS OF A <span className="gold-text">BEAUTIFUL JOURNEY</span>
        </motion.h2>

        {/* 2003 — 2103 Span Plaque */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 2.0, delay: 3.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-6 px-10 py-3.5 rounded-full bg-gold-950/40 border border-gold-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          <span className="font-cinzel text-lg sm:text-2xl font-bold gold-text tracking-widest">
            2003
          </span>
          <span className="w-8 h-[1px] bg-gold-400" />
          <span className="font-cinzel text-lg sm:text-2xl font-bold gold-text tracking-widest">
            2103
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.7 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 4.0 }}
          className="font-outfit text-xs text-gold-300/80 mt-4 tracking-wider"
        >
          {publishedCount} verified dates published · Living timeline updating periodically
        </motion.p>
      </div>
    </section>
  );
};
