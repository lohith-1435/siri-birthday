import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Moon, Clock, Hourglass } from 'lucide-react';
import { getCurrentYearDetails, BIRTH_DETAILS, type TimelineEntry } from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
  timelineEntries: TimelineEntry[];
}

export const Scene07CurrentYearReveal: React.FC<SceneProps> = ({ isActive, timelineEntries }) => {
  const currentDetails = getCurrentYearDetails(timelineEntries);
  const { currentYear, isRevealed, tithiDate, fullTithiDate, statusMessage } = currentDetails;

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!isRevealed) return;

    const calculateCountdown = () => {
      const now = new Date();
      const parts = tithiDate.split(" ");
      const tithiDay = parseInt(parts[0], 10) || 14;
      const tithiMonth = parts[1]?.toLowerCase().startsWith('sep') ? 8 : 9;

      const solarTarget = new Date(currentYear, 8, 28, 0, 0, 0);
      const tithiTarget = new Date(currentYear, tithiMonth, tithiDay, 0, 0, 0);

      let target = solarTarget;
      if (now > solarTarget && now < tithiTarget) {
        target = tithiTarget;
      } else if (now > tithiTarget && now > solarTarget) {
        target = new Date(currentYear + 1, 8, 28, 0, 0, 0);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentYear, isRevealed, tithiDate]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-obsidian-950">
      {/* Radiant Golden Center Glow */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-gold-500/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        {/* Header Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-gold-400/40 bg-gold-500/10 text-gold-300 text-xs sm:text-sm font-cinzel tracking-[0.3em] uppercase mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Present Year Alignment
        </motion.div>

        {/* Dynamic Current Year Display */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 2.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight gold-text text-center select-none"
        >
          {currentYear}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.8 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 1.4 }}
          className="font-cormorant italic text-lg sm:text-xl md:text-2xl text-gold-200/90 text-center mt-2 mb-10"
        >
          {isRevealed ? `Two Sacred Days in ${currentYear}` : `The Journey in ${currentYear}`}
        </motion.p>

        {/* The Two Dates of This Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          {/* 1. Fixed Birth Date */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
            transition={{ duration: 1.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="gold-card p-7 sm:p-8 rounded-2xl flex flex-col justify-between border-gold-500/30"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-outfit text-xs text-gold-400/80 uppercase tracking-widest">
                  Fixed Solar Date
                </span>
                <Calendar className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                28 SEPTEMBER <span className="gold-text">{currentYear}</span>
              </h3>
              <p className="font-outfit text-xs sm:text-sm text-gray-300 mt-2 font-light">
                → The eternal fixed anniversary of your birth
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gold-500/15 text-xs text-gold-300/70 font-cinzel">
              Anniversary of 28.09.2003
            </div>
          </motion.div>

          {/* 2. Corresponding Tithi Date (or Pending Reveal State) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
            transition={{ duration: 1.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="burgundy-card p-7 sm:p-8 rounded-2xl flex flex-col justify-between border-gold-400/60 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            {isRevealed ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-outfit text-xs text-gold-300 uppercase tracking-widest font-medium">
                    {currentYear}'s Tithi Return
                  </span>
                  <Moon className="w-5 h-5 text-gold-300" />
                </div>
                <h3 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold gold-text">
                  {fullTithiDate.toUpperCase()}
                </h3>
                <p className="font-outfit text-xs sm:text-sm text-gold-100/90 mt-2 font-light">
                  → This year's corresponding Hindu Lunar Tithi date
                </p>
                <div className="mt-6 pt-4 border-t border-gold-500/25 flex items-center justify-between text-xs text-gold-300 font-cinzel">
                  <span>{BIRTH_DETAILS.tithi}</span>
                  <span className="text-[10px] text-gold-400 uppercase tracking-wider">Navaratri Tithi</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-outfit text-xs text-amber-300 uppercase tracking-widest font-medium">
                    {currentYear}'s Tithi Horizon
                  </span>
                  <Hourglass className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200">
                  THIS YEAR'S TITHI DATE IS YET TO BE REVEALED
                </h3>
                <p className="font-outfit text-xs sm:text-sm text-gray-300 mt-3 font-light leading-relaxed">
                  {statusMessage}
                </p>
                <div className="mt-6 pt-4 border-t border-gold-500/25 text-[11px] text-gold-400/80 font-cinzel">
                  Pending Admin Verification & Publication
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Live Countdown Clock if Revealed */}
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 2.0, delay: 2.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 w-full max-w-4xl p-6 rounded-2xl bg-gradient-to-r from-gold-950/40 via-obsidian-900/80 to-gold-950/40 border border-gold-500/30 backdrop-blur-lg flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="font-cinzel text-xs text-gold-400 uppercase tracking-widest block">
                  Sacred Horizon
                </span>
                <span className="font-cinzel text-sm sm:text-base font-semibold text-white">
                  Countdown to Next Birthday Blessing
                </span>
              </div>
            </div>

            {/* Time units */}
            <div className="flex items-center gap-3 sm:gap-4">
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center px-3 py-2 rounded-xl bg-obsidian-950/80 border border-gold-500/20 min-w-[60px]">
                  <span className="font-cinzel text-lg sm:text-xl font-bold gold-text">
                    {String(unit.val).padStart(2, '0')}
                  </span>
                  <span className="font-outfit text-[9px] tracking-wider text-gray-400 uppercase mt-0.5">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
