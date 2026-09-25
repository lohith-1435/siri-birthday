import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Moon, Sparkles, ArrowRightLeft } from 'lucide-react';
import { BIRTH_DETAILS } from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
}

export const Scene06TwoDatesConcept: React.FC<SceneProps> = ({ isActive }) => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-obsidian-950">
      {/* Background glow */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-gold-500/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -25 }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="text-center mb-12"
        >
          <span className="font-cinzel text-xs md:text-sm tracking-[0.5em] text-gold-300 uppercase block mb-2">
            The Cosmic Harmony of Time
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#FAF8F5] uppercase tracking-wider">
            TWO DATES, <span className="gold-text">ONE BIRTHDAY</span>
          </h2>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Dual Cards Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl relative items-stretch">
          {/* Card 1: Solar Fixed Birthday */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 2.0, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gold-card p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-gold-500/30"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Calendar className="w-28 h-28 text-gold-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-outfit uppercase tracking-widest mb-4">
                <Calendar className="w-3.5 h-3.5" /> Solar Gregorian Date
              </div>
              <h3 className="font-cinzel text-xs sm:text-sm text-gold-300/80 tracking-[0.3em] uppercase">
                Your Fixed Birth Date
              </h3>
              <p className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 gold-text">
                {BIRTH_DETAILS.fixedDayMonth}
              </p>
              <p className="font-cormorant italic text-base sm:text-lg text-gold-200/90 mt-2">
                The solar anniversary of the day you were born.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gold-500/20 flex items-center justify-between text-xs text-gray-400 font-outfit">
              <span>Constant every solar year</span>
              <span className="text-gold-300 font-medium">Fixed Calendar Marker</span>
            </div>
          </motion.div>

          {/* Connection Symbol (Desktop Center Floating Badge) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-obsidian-900 border border-gold-400 items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <ArrowRightLeft className="w-5 h-5 text-gold-300" />
          </div>

          {/* Card 2: Lunar Tithi Return */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 2.0, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="burgundy-card p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-gold-500/40"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Moon className="w-28 h-28 text-gold-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/40 text-gold-200 text-xs font-outfit uppercase tracking-widest mb-4">
                <Moon className="w-3.5 h-3.5" /> Lunar Hindu Tithi
              </div>
              <h3 className="font-cinzel text-xs sm:text-sm text-gold-300/80 tracking-[0.3em] uppercase">
                The Sacred Tithi Return
              </h3>
              <p className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-3 gold-text">
                {BIRTH_DETAILS.tithi}
              </p>
              <p className="font-cormorant italic text-base sm:text-lg text-gold-200/90 mt-2">
                Returns every year on a sacred lunar date according to the Hindu calendar.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gold-500/20 flex items-center justify-between text-xs text-gray-400 font-outfit">
              <span>Dynamic lunar alignment</span>
              <span className="text-gold-300 font-medium">Navaratri Tithi Blessing</span>
            </div>
          </motion.div>
        </div>

        {/* Explanatory Narrative Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 2.0, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 text-center max-w-2xl px-6 py-5 rounded-2xl bg-gold-950/20 border border-gold-500/20 flex items-center gap-4"
        >
          <Sparkles className="w-6 h-6 text-gold-400 shrink-0 hidden sm:block" />
          <p className="font-outfit text-xs sm:text-sm md:text-base text-gray-300 font-light leading-relaxed text-center sm:text-left">
            According to the Hindu lunar calendar, the corresponding <strong className="text-gold-200 font-medium">Tithi date changes from year to year</strong>, gifting you two sacred moments to celebrate in every turn of the sun.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
