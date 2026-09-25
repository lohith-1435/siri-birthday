import React from 'react';
import { motion } from 'framer-motion';

interface SceneProps {
  isActive: boolean;
}

export const Scene03NameReveal: React.FC<SceneProps> = ({ isActive }) => {
  const nameLetters = ['S', 'I', 'R', 'I'];

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-obsidian-950">
      {/* Central expanding cosmic ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? { scale: [0, 1.8, 2.2], opacity: [0, 0.7, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 4.0, delay: 0.5, ease: 'easeOut' }}
        className="absolute w-72 h-72 rounded-full border border-gold-400/40 pointer-events-none"
      />

      <div className="relative z-10 text-center flex flex-col items-center max-w-3xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.6 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="font-cinzel text-xs md:text-sm tracking-[0.55em] text-gold-300 uppercase mb-8"
        >
          A Celestial Name
        </motion.p>

        {/* Letter by letter reveal: S I R I */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12 my-4">
          {nameLetters.map((letter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 35, filter: 'blur(12px)', scale: 0.8 }}
              animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 } : { opacity: 0, y: 35 }}
              transition={{
                duration: 2.2,
                delay: 1.4 + index * 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative group"
            >
              <span className="font-cinzel text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold tracking-wider gold-text block drop-shadow-[0_15px_40px_rgba(212,175,55,0.4)] transition-all duration-700">
                {letter}
              </span>
              {/* Subtle underline spark for each letter */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.2, delay: 2.4 + index * 0.7 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent w-full mt-2"
              />
            </motion.div>
          ))}
        </div>

        {/* Supporting Divine Line */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 2.5, delay: 5.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-transparent via-gold-950/20 to-transparent border-y border-gold-500/20"
        >
          <span className="font-cormorant italic text-base sm:text-xl md:text-2xl text-gold-100 font-light tracking-wide text-center">
            Born under the divine blessings of <span className="gold-text not-italic font-cinzel font-medium">Sharan Navaratri</span>
          </span>
          <span className="font-outfit text-xs text-gold-400/60 uppercase tracking-[0.3em]">
            A sacred beginning written in the stars
          </span>
        </motion.div>
      </div>
    </section>
  );
};
