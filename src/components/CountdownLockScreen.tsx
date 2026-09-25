import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { calculateUnlockCountdown, SECRET_PREVIEW_CODE, type CountdownRemaining } from '../utils/timeCalculations';
import { SacredMandala } from './SacredMandala';
import { audioEngine } from '../utils/audioEngine';

interface CountdownLockScreenProps {
  onUnlock: (isPreview: boolean) => void;
}

export const CountdownLockScreen: React.FC<CountdownLockScreenProps> = ({ onUnlock }) => {
  const [countdown, setCountdown] = useState<CountdownRemaining>(() => calculateUnlockCountdown());
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorCode, setErrorCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateUnlockCountdown();
      setCountdown(remaining);

      // Automatic unlock when countdown hits ZERO
      if (remaining.isUnlocked) {
        clearInterval(timer);
        audioEngine.playChime(528, 3.5);
        onUnlock(false); // Live auto-unlock
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onUnlock]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === SECRET_PREVIEW_CODE.toLowerCase()) {
      audioEngine.playChime(648, 2.5);
      onUnlock(true); // Preview mode unlock
    } else {
      setErrorCode(true);
      setTimeout(() => setErrorCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950 flex flex-col items-center justify-center px-4 overflow-hidden select-none">
      {/* Background Sacred Blooming Mandala & Ambient Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35">
        <SacredMandala size={700} glowIntensity={0.8} />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-3xl">
        {/* Monogram / Header Spark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="w-12 h-12 rounded-full border border-gold-400/60 bg-gold-500/10 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)] mb-6"
        >
          <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
        </motion.div>

        {/* Name Title */}
        <motion.p
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="font-cinzel text-xs sm:text-sm tracking-[0.55em] text-gold-300 uppercase mb-2"
        >
          A Journey Written in the Stars
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, delay: 0.6 }}
          className="font-cinzel text-6xl sm:text-8xl md:text-9xl font-bold gold-text tracking-wider my-1 drop-shadow-[0_20px_50px_rgba(212,175,55,0.35)]"
        >
          SIRI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.8, delay: 1.0 }}
          className="font-cormorant italic text-sm sm:text-base md:text-lg text-gold-100 font-light tracking-wide mb-10"
        >
          Born under the divine blessings of <span className="text-gold-300 not-italic font-cinzel">Sharan Navaratri</span>
        </motion.p>

        {/* Live Countdown Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.0, delay: 1.3 }}
          className="flex items-center justify-center gap-3 sm:gap-6 my-4"
        >
          {[
            { label: 'DAYS', value: countdown.days },
            { label: 'HOURS', value: countdown.hours },
            { label: 'MINUTES', value: countdown.minutes },
            { label: 'SECONDS', value: countdown.seconds },
          ].map((unit, idx) => (
            <div
              key={idx}
              className="gold-card px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-gold-500/30 flex flex-col items-center min-w-[70px] sm:min-w-[95px] shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            >
              <span className="font-cinzel text-3xl sm:text-5xl font-bold gold-text">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="font-outfit text-[9px] sm:text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Target Milestone Marker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 1.8, delay: 1.8 }}
          className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-obsidian-900/80 border border-gold-500/25 text-gold-300 font-cinzel text-xs tracking-widest uppercase"
        >
          <Lock className="w-3.5 h-3.5 text-gold-400" />
          <span>Unlocks Automatically on 28 September 2026</span>
        </motion.div>

        {/* Secret Preview Access Toggle */}
        <div className="mt-12">
          {!showCodeInput ? (
            <button
              onClick={() => setShowCodeInput(true)}
              className="text-[11px] font-cinzel text-gold-400/60 hover:text-gold-200 transition-colors tracking-widest uppercase flex items-center gap-1.5"
            >
              <Key className="w-3 h-3" /> Preview Access
            </button>
          ) : (
            <AnimatePresence>
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handlePasscodeSubmit}
                className="flex items-center gap-2 p-1.5 rounded-full bg-obsidian-900 border border-gold-500/40 shadow-xl"
              >
                <input
                  type="password"
                  placeholder="Enter preview code..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="bg-transparent pl-4 pr-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none font-outfit w-44"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 font-cinzel font-bold text-xs flex items-center gap-1 hover:from-gold-400 hover:to-amber-500 transition-all shadow-md"
                >
                  <span>Unlock</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </motion.form>
            </AnimatePresence>
          )}

          {errorCode && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs font-outfit mt-2 flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" /> Incorrect preview code.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};
