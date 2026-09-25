import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Moon, Sun } from 'lucide-react';
import { BIRTH_DETAILS } from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
}

export const Scene04AstrologyDetails: React.FC<SceneProps> = ({ isActive }) => {
  const details = [
    {
      label: 'RASHI (ZODIAC)',
      value: BIRTH_DETAILS.rashi,
      sanskrit: BIRTH_DETAILS.rashiSanskrit,
      description: 'The celestial scales of harmony, balance, beauty and diplomacy',
      icon: Compass,
      gradient: 'from-amber-500/20 to-yellow-600/10',
    },
    {
      label: 'NAKSHATRA (LUNAR MANSION)',
      value: BIRTH_DETAILS.nakshatra,
      sanskrit: BIRTH_DETAILS.nakshatraSanskrit,
      description: 'The divine self-luminous pearl of independence and wisdom',
      icon: Sparkles,
      gradient: 'from-gold-500/20 to-amber-700/10',
    },
    {
      label: 'SACRED TITHI',
      value: BIRTH_DETAILS.tithi,
      sanskrit: BIRTH_DETAILS.tithiSanskrit,
      description: '3rd Lunar Waxing Phase under Sharan Navaratri auspiciousness',
      icon: Moon,
      gradient: 'from-orange-500/20 to-amber-900/10',
    },
    {
      label: 'RASHI LORD (PLANETARY RULER)',
      value: BIRTH_DETAILS.rashiLord,
      sanskrit: BIRTH_DETAILS.rashiLordSanskrit,
      description: 'Goddess of grace, arts, elegance, love and boundless prosperity',
      icon: Sun,
      gradient: 'from-yellow-400/20 to-gold-600/10',
    },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-obsidian-950">
      {/* Subtle Celestial Ring */}
      <div className="absolute w-[800px] h-[800px] rounded-full border border-gold-500/10 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-gold-500/15 border-dashed animate-spin-slow pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -25 }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="text-center mb-4"
        >
          <span className="font-cinzel text-xs md:text-sm tracking-[0.5em] text-gold-300 uppercase block mb-2">
            Astrological & Divine Alignment
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#FAF8F5] uppercase tracking-wider">
            THE DAY YOU WERE <span className="gold-text">BORN</span>
          </h2>
        </motion.div>

        {/* Date Plaque */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.8, delay: 0.9 }}
          className="inline-flex items-center gap-3 px-8 py-2.5 rounded-full border border-gold-500/40 bg-gold-950/30 backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.15)] mb-12"
        >
          <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
          <span className="font-cinzel text-sm sm:text-base md:text-lg font-medium tracking-[0.25em] text-gold-100">
            {BIRTH_DETAILS.birthDate.toUpperCase()}
          </span>
          <Sparkles className="w-4 h-4 text-gold-300 animate-pulse" />
        </motion.div>

        {/* 4 Sacred Astro Cards Revealed One by One */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {details.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40 }}
                transition={{
                  duration: 1.8,
                  delay: 1.5 + index * 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="gold-card p-6 sm:p-7 rounded-2xl relative group overflow-hidden transition-all duration-500 hover:border-gold-400/60"
              >
                {/* Glow accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700`} />

                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 shadow-inner group-hover:bg-gold-500/20 group-hover:border-gold-400 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <span className="font-outfit text-[11px] uppercase tracking-[0.3em] text-gold-400/80 block mb-1">
                      {item.label}
                    </span>
                    <h3 className="font-cinzel text-lg sm:text-xl font-semibold text-white group-hover:text-gold-100 transition-colors">
                      {item.value}
                    </h3>
                    <p className="font-cormorant italic text-xs sm:text-sm text-gold-300/70 mt-0.5">
                      {item.sanskrit}
                    </p>
                    <p className="font-outfit text-xs text-gray-300/80 mt-2.5 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Subtle bottom golden shine border */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
