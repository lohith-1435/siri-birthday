import React, { useState, useEffect } from 'react';
import { calculateTimeSinceBirth, type TimeSinceBirth } from '../utils/timeCalculations';

interface TimeSinceBirthCounterProps {
  isPreviewMode?: boolean;
}

export const TimeSinceBirthCounter: React.FC<TimeSinceBirthCounterProps> = ({ isPreviewMode = false }) => {
  const [time, setTime] = useState<TimeSinceBirth>(() => calculateTimeSinceBirth());

  useEffect(() => {
    // Isolated 1-second interval to update only this small HUD component
    const interval = setInterval(() => {
      setTime(calculateTimeSinceBirth());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-3.5 sm:top-4 right-16 sm:right-20 z-40 pointer-events-none select-none">
      <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-obsidian-950/85 backdrop-blur-md border border-gold-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.1)] flex flex-col items-end text-right transition-all duration-300">
        {/* Top Tag & Preview Mode Indicator */}
        <div className="flex items-center gap-2 mb-0.5">
          {isPreviewMode && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/50 text-[9px] font-cinzel text-amber-300 font-bold tracking-widest uppercase">
              ✦ Preview Mode
            </span>
          )}
          <span className="font-outfit text-[9px] sm:text-[10px] tracking-[0.2em] text-gold-400/80 uppercase font-medium">
            Since 28 Sep 2003 · 08:00 AM
          </span>
        </div>

        {/* Total Hours with Gold Shimmer */}
        <div className="flex items-baseline gap-1.5 my-0.5">
          <span className="font-cinzel text-sm sm:text-base md:text-lg font-bold gold-text tracking-wider">
            {time.formattedTotalHours}
          </span>
          <span className="font-cinzel text-[10px] sm:text-xs text-gold-300/70 uppercase tracking-widest">
            Hours
          </span>
        </div>

        {/* Thin Gold Separator */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent my-0.5" />

        {/* Years · Days · Hours · Mins · Secs */}
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-300 font-outfit tracking-wide">
          <span className="text-white font-semibold">{time.years}y</span>
          <span className="text-gold-500/50">·</span>
          <span>{time.days}d</span>
          <span className="text-gold-500/50">·</span>
          <span>{String(time.hours).padStart(2, '0')}h</span>
          <span className="text-gold-500/50">·</span>
          <span>{String(time.minutes).padStart(2, '0')}m</span>
          <span className="text-gold-500/50">·</span>
          <span className="text-gold-300 font-mono">{String(time.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
};
