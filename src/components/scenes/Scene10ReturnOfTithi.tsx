import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Moon, Sparkles, Hourglass } from 'lucide-react';
import { getCurrentYearDetails, BIRTH_DETAILS, type TimelineEntry } from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
  timelineEntries: TimelineEntry[];
}

export const Scene10ReturnOfTithi: React.FC<SceneProps> = ({ isActive, timelineEntries }) => {
  const currentDetails = getCurrentYearDetails(timelineEntries);
  const { currentYear, isRevealed, tithiDate } = currentDetails;

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-obsidian-950">
      {/* Background celestial ring */}
      <div className="absolute w-[700px] h-[700px] rounded-full border border-gold-500/10 pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="mb-8"
        >
          <span className="font-cinzel text-xs md:text-sm tracking-[0.5em] text-gold-300 uppercase block mb-3">
            The Eternal Dual Cycle
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white uppercase tracking-wider">
            EVERY YEAR, THE <span className="gold-text">DATE RETURNS</span>
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Dual Date Combination Formula */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 w-full my-6">
          {/* Box 1: 28 September */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 1.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="gold-card p-6 sm:p-8 rounded-2xl flex-1 max-w-sm w-full text-center border-gold-500/30"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-outfit text-gold-400 uppercase tracking-widest mb-3">
              <Calendar className="w-4 h-4" /> Solar Fixed Birthday
            </div>
            <h3 className="font-cinzel text-3xl sm:text-4xl font-bold text-white gold-text">
              28 SEPTEMBER
            </h3>
            <p className="font-cormorant italic text-sm text-gold-200/80 mt-2">
              Your fixed birth date
            </p>
          </motion.div>

          {/* Plus Sign with Glowing Ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 1.2, delay: 1.5 }}
            className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-400/50 flex items-center justify-center text-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] shrink-0"
          >
            <Plus className="w-6 h-6" />
          </motion.div>

          {/* Box 2: Tithi Date for this year */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 1.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="burgundy-card p-6 sm:p-8 rounded-2xl flex-1 max-w-sm w-full text-center border-gold-400/50 shadow-[0_0_25px_rgba(212,175,55,0.15)]"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-outfit text-gold-300 uppercase tracking-widest mb-3">
              <Moon className="w-4 h-4" /> {currentYear} Tithi Date
            </div>
            {isRevealed ? (
              <>
                <h3 className="font-cinzel text-3xl sm:text-4xl font-bold text-white gold-text">
                  {tithiDate.toUpperCase()}
                </h3>
                <p className="font-cormorant italic text-sm text-gold-200/80 mt-2">
                  The corresponding yearly Tithi date
                </p>
              </>
            ) : (
              <>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200">
                  YET TO BE REVEALED
                </h3>
                <p className="font-cormorant italic text-xs text-gold-200/70 mt-2 flex items-center justify-center gap-1">
                  <Hourglass className="w-3 h-3" /> Awaiting publication
                </p>
              </>
            )}
          </motion.div>
        </div>

        {/* Sacred Tithi Title Bottom Plaque */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 2.0, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 inline-flex items-center gap-3 px-8 py-3 rounded-full bg-obsidian-900 border border-gold-500/30"
        >
          <Sparkles className="w-4 h-4 text-gold-300" />
          <span className="font-cinzel text-sm sm:text-base font-semibold tracking-widest gold-text uppercase">
            {BIRTH_DETAILS.tithi}
          </span>
          <Sparkles className="w-4 h-4 text-gold-300" />
        </motion.div>
      </div>
    </section>
  );
};
