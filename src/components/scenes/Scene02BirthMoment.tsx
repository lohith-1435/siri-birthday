import React from 'react';
import { motion } from 'framer-motion';

interface SceneProps {
  isActive: boolean;
}

export const Scene02BirthMoment: React.FC<SceneProps> = ({ isActive }) => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-obsidian-950">
      {/* Sweeping Golden Light Ray */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={isActive ? { x: '200%', opacity: [0, 0.8, 0] } : { x: '-100%', opacity: 0 }}
        transition={{ duration: 3.2, delay: 0.3, ease: 'easeInOut' }}
        className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#FFF8E7] to-transparent top-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_20px_#D4AF37]"
      />

      {/* Atmospheric Background Glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gold-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 0.7, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="font-cinzel text-xs md:text-sm tracking-[0.5em] text-gold-200/70 uppercase mb-4"
        >
          The Genesis of Time
        </motion.p>

        {/* Monumental Metallic Gold 28 */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, filter: 'blur(10px)' }}
          animate={isActive ? { scale: 1, opacity: 1, filter: 'blur(0px)' } : { scale: 0.85, opacity: 0 }}
          transition={{ duration: 2.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative select-none"
        >
          <span className="font-cinzel text-8xl sm:text-9xl md:text-[14rem] lg:text-[16rem] font-bold leading-none tracking-tight gold-text drop-shadow-[0_20px_50px_rgba(212,175,55,0.3)]">
            28
          </span>
          <div className="absolute -inset-4 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-40 pointer-events-none" />
        </motion.div>

        {/* Month & Year Reveal */}
        <motion.h2
          initial={{ opacity: 0, letterSpacing: '0.1em' }}
          animate={isActive ? { opacity: 1, letterSpacing: '0.4em' } : { opacity: 0 }}
          transition={{ duration: 2.2, delay: 2.4, ease: 'easeOut' }}
          className="font-cinzel text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#FAF8F5] uppercase mt-2 mb-6"
        >
          SEPTEMBER <span className="gold-text">2003</span>
        </motion.h2>

        {/* The Day a Beautiful Journey Began */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 2.2, delay: 3.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-12 h-[1px] bg-gold-500/50" />
          <p className="font-cormorant italic text-lg sm:text-xl md:text-2xl text-gold-100/90 tracking-widest">
            The day a beautiful journey began
          </p>
          <div className="w-12 h-[1px] bg-gold-500/50" />
        </motion.div>
      </div>
    </section>
  );
};
