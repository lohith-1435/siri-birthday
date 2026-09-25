import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../../utils/audioEngine';

interface SceneProps {
  isActive: boolean;
}

export const Scene11BirthdayWish: React.FC<SceneProps> = ({ isActive }) => {
  const [isDiyaLit, setIsDiyaLit] = useState(false);

  const handleLightDiya = () => {
    setIsDiyaLit(true);
    audioEngine.playChime(528, 4.0); // 528Hz love/miracle frequency

    // Fire subtle champagne gold stardust confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFF8E7', '#F3E5AB', '#AA822A'],
      shapes: ['circle'],
      scalar: 0.7,
      disableForReducedMotion: true,
    });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-obsidian-950">
      {/* Golden Diya / Sacred Flame Ambient Glow */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={isActive ? { scale: isDiyaLit ? [1, 1.4, 1.2] : [0.8, 1.1, 0.9], opacity: [0, 0.8, 0.6] } : { scale: 0.3, opacity: 0 }}
        transition={{ duration: 4.0, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-t from-amber-600/20 via-gold-500/15 to-transparent blur-[110px] pointer-events-none"
      />

      <div className="relative z-10 text-center flex flex-col items-center max-w-3xl px-4">
        {/* Sacred Golden Diya / Light Centerpiece */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 2.5, delay: 0.4, ease: 'easeOut' }}
          className="relative mb-10 flex flex-col items-center"
        >
          {/* Flame aura */}
          <div className="relative w-16 h-20 flex items-center justify-center">
            <div className="absolute w-12 h-16 rounded-full bg-amber-500/40 blur-lg animate-pulse" />
            <div className="w-8 h-12 rounded-[50%_50%_35%_35%] bg-gradient-to-t from-amber-600 via-gold-400 to-[#FFFDF0] shadow-[0_0_20px_#FFF9E6,0_0_40px_#D4AF37] animate-pulse-glow" />
          </div>

          {/* Diya Base */}
          <div className="w-20 h-4 rounded-b-full bg-gradient-to-r from-[#604618] via-[#D4AF37] to-[#604618] border-t border-gold-300/40 shadow-[0_4px_15px_rgba(0,0,0,0.8)]" />
        </motion.div>

        {/* HAPPY BIRTHDAY */}
        <motion.p
          initial={{ opacity: 0, y: -20, letterSpacing: '0.2em' }}
          animate={isActive ? { opacity: 1, y: 0, letterSpacing: '0.45em' } : { opacity: 0, y: -20 }}
          transition={{ duration: 2.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white uppercase tracking-[0.4em] mb-3"
        >
          HAPPY BIRTHDAY
        </motion.p>

        {/* SIRI */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
          animate={isActive ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.85 }}
          transition={{ duration: 2.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold tracking-wider gold-text my-2 drop-shadow-[0_20px_50px_rgba(212,175,55,0.4)]"
        >
          SIRI
        </motion.h1>

        {/* Personalized Warm Cinematic Blessing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 2.4, delay: 3.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-2xl text-center flex flex-col items-center gap-4"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <p className="font-cormorant italic text-lg sm:text-2xl md:text-3xl text-gold-100/95 font-light leading-relaxed">
            “May every year ahead be filled with happiness, peace, prosperity, love and divine blessings.”
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        </motion.div>

        {/* Interactive Diya Blessing Spark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 4.5 }}
          className="mt-10"
        >
          <button
            onClick={handleLightDiya}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gold-500/10 hover:bg-gold-500/20 border border-gold-400/40 text-gold-200 hover:text-white text-xs sm:text-sm font-cinzel tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)]"
          >
            <Flame className="w-4 h-4 text-gold-300" />
            <span>{isDiyaLit ? 'Blessings Offered ✨' : 'Offer Divine Blessings'}</span>
            <Sparkles className="w-4 h-4 text-gold-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
