import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Calendar, Moon, Compass, Hourglass, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TIMELINE_ERAS,
  getCurrentYearDetails,
  BIRTH_DETAILS,
  type TimelineEntry,
} from '../../data/timelineData';

interface SceneProps {
  isActive: boolean;
  timelineEntries: TimelineEntry[];
}

export const Scene08TimelineJourney: React.FC<SceneProps> = ({ isActive, timelineEntries }) => {
  const currentDetails = getCurrentYearDetails(timelineEntries);
  const { currentYear } = currentDetails;

  const [selectedEraIndex, setSelectedEraIndex] = useState(1); // Default to 2021-2040 where 2026 resides
  const [selectedYear, setSelectedYear] = useState<TimelineEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-select current year or active entry
  useEffect(() => {
    if (timelineEntries.length > 0) {
      const matchCurrent = timelineEntries.find((item) => item.year === currentYear);
      if (matchCurrent) {
        setSelectedYear(matchCurrent);
        const eraIdx = TIMELINE_ERAS.findIndex((e) => currentYear >= e.start && currentYear <= e.end);
        if (eraIdx >= 0) setSelectedEraIndex(eraIdx);
      } else {
        setSelectedYear(timelineEntries[0]);
      }
    }
  }, [timelineEntries, currentYear]);

  const currentEra = TIMELINE_ERAS[selectedEraIndex] || TIMELINE_ERAS[0];
  const eraYears = timelineEntries.filter(
    (item) => item.year >= currentEra.start && item.year <= currentEra.end
  );

  const filteredYears = searchQuery
    ? timelineEntries.filter((item) => item.year.toString().includes(searchQuery.trim()))
    : eraYears;

  const publishedCount = timelineEntries.filter((e) => e.isPublished).length;

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden bg-obsidian-950">
      {/* Background Time Portal Visuals */}
      <div className="absolute w-[900px] h-[900px] rounded-full border border-gold-500/10 pointer-events-none" />
      <div className="absolute w-[1100px] h-[1100px] rounded-full border border-gold-500/5 border-dashed animate-spin-slow pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -25 }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="text-center mb-8"
        >
          <span className="font-cinzel text-xs md:text-sm tracking-[0.5em] text-gold-300 uppercase block mb-2">
            The Centennial River of Time
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#FAF8F5] uppercase tracking-wider">
            THE JOURNEY THROUGH <span className="gold-text">TIME</span>
          </h2>
          <p className="font-cormorant italic text-base sm:text-xl text-gold-200/80 mt-2">
            101 Years of Sacred Tithi Returns (2003 – 2103) · {publishedCount} Verified Years Published
          </p>
        </motion.div>

        {/* Search & Era Navigation Controls */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Era Tabs (6 Eras: 2003-2020, 2021-2040, 2041-2060, 2061-2080, 2081-2100, 2101-2103) */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-obsidian-900/90 border border-gold-500/25 overflow-x-auto max-w-full scrollbar-none">
            {TIMELINE_ERAS.map((era, idx) => {
              const isSelected = selectedEraIndex === idx && !searchQuery;
              return (
                <button
                  key={era.label}
                  onClick={() => {
                    setSelectedEraIndex(idx);
                    setSearchQuery('');
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-cinzel tracking-wider whitespace-nowrap transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'text-gray-300 hover:text-gold-200 hover:bg-gold-500/10'
                  }`}
                >
                  {era.label}
                </button>
              );
            })}
          </div>

          {/* Quick Year Search across 101 years */}
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
            <input
              type="text"
              placeholder="Search year (2003-2103)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-obsidian-900/80 border border-gold-500/25 text-xs text-gold-100 placeholder-gray-500 focus:outline-none focus:border-gold-400 font-outfit"
            />
          </div>
        </div>

        {/* Interactive Selected Year Showcase Plaque */}
        <AnimatePresence mode="wait">
          {selectedYear && (
            <motion.div
              key={selectedYear.year}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4 }}
              className={`w-full max-w-4xl p-6 sm:p-8 rounded-3xl mb-10 shadow-[0_0_40px_rgba(212,175,55,0.2)] flex flex-col md:flex-row items-center justify-between gap-6 border ${
                selectedYear.isPublished
                  ? 'burgundy-card border-gold-400/50'
                  : 'gold-card border-gold-500/30'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="font-outfit text-xs text-gold-300 uppercase tracking-widest">
                      Year Milestone
                    </span>
                    {selectedYear.year === currentYear && (
                      <span className="px-2 py-0.5 rounded-full bg-gold-500/20 border border-gold-400/50 text-[10px] text-gold-300 font-cinzel font-bold">
                        ★ THIS YEAR
                      </span>
                    )}
                    {selectedYear.year === 2003 && (
                      <span className="px-2 py-0.5 rounded-full bg-gold-500/20 border border-gold-400/50 text-[10px] text-gold-300 font-cinzel">
                        ✦ Birth Year
                      </span>
                    )}
                    {!selectedYear.isPublished && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10px] text-amber-300 font-cinzel">
                        Pending Reveal
                      </span>
                    )}
                  </div>
                  <h3 className="font-cinzel text-4xl sm:text-5xl md:text-6xl font-bold gold-text">
                    {selectedYear.year}
                  </h3>
                  <p className="font-cormorant italic text-sm sm:text-base text-gold-200/80 mt-1">
                    {selectedYear.year === 2003
                      ? 'The Grand Beginning'
                      : `Age / Year ${selectedYear.year - BIRTH_DETAILS.birthYear} of Life Journey`}
                  </p>
                </div>
              </div>

              {/* Dual Dates for Selected Year */}
              <div className="flex items-center gap-4 sm:gap-6 bg-obsidian-950/60 p-4 sm:p-5 rounded-2xl border border-gold-500/20">
                <div className="text-center">
                  <span className="font-outfit text-[10px] text-gray-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-gold-400" /> Solar Date
                  </span>
                  <span className="font-cinzel text-sm sm:text-base font-semibold text-white mt-1 block">
                    28 September
                  </span>
                </div>

                <div className="w-[1px] h-10 bg-gold-500/20" />

                <div className="text-center">
                  <span className="font-outfit text-[10px] text-gold-300 uppercase tracking-wider block flex items-center justify-center gap-1 font-medium">
                    <Moon className="w-3 h-3 text-gold-300" /> Tithi Return
                  </span>
                  <span
                    className={`font-cinzel text-sm sm:text-base font-bold mt-1 block ${
                      selectedYear.isPublished ? 'gold-text' : 'text-amber-200'
                    }`}
                  >
                    {selectedYear.isPublished ? selectedYear.tithiDate : 'Date Yet to be Revealed'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Dynamic Year Grid / Reel across 101 years */}
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between text-xs text-gold-400/80 font-cinzel mb-3 px-2">
            <span>{searchQuery ? `Search Results (${filteredYears.length})` : currentEra.subtitle}</span>
            <span className="text-gray-400 font-outfit">{currentEra.label}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredYears.map((item) => {
              const isCurrent = item.year === currentYear;
              const isSelected = selectedYear?.year === item.year;
              const isBirth = item.year === 2003;

              return (
                <button
                  key={item.year}
                  onClick={() => setSelectedYear(item)}
                  className={`p-3.5 rounded-xl text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-gradient-to-b from-burgundy-900 to-obsidian-900 border-gold-400 shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02]'
                      : isCurrent
                      ? 'bg-gold-950/40 border-gold-500/60 shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:border-gold-300'
                      : item.isPublished
                      ? 'gold-card hover:border-gold-500/50 hover:bg-obsidian-900'
                      : 'bg-obsidian-950/60 border-gold-500/15 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-cinzel text-base sm:text-lg font-bold ${
                        isSelected || isCurrent ? 'gold-text' : item.isPublished ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {item.year}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-gold-300 shadow-[0_0_8px_#FFF]" />
                    )}
                    {isBirth && !isCurrent && (
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-gold-500/15 flex items-center justify-between">
                    <span
                      className={`font-outfit text-xs font-medium ${
                        item.isPublished ? 'text-gold-200/90' : 'text-gray-400 text-[11px]'
                      }`}
                    >
                      {item.isPublished ? item.tithiDate : 'Yet to be revealed'}
                    </span>
                    <span className="font-outfit text-[10px] text-gray-400">
                      {item.year === 2003 ? 'Birth' : `+${item.year - 2003}y`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Era Navigation Footer */}
        <div className="flex items-center justify-between w-full max-w-4xl mt-6 pt-3 border-t border-gold-500/20 text-xs text-gray-400">
          <button
            disabled={selectedEraIndex === 0}
            onClick={() => {
              setSelectedEraIndex((prev) => Math.max(0, prev - 1));
              setSearchQuery('');
            }}
            className="flex items-center gap-1 hover:text-gold-300 disabled:opacity-30 disabled:pointer-events-none transition-colors font-cinzel"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Era
          </button>

          <span className="font-cinzel text-gold-300/80">
            Era {selectedEraIndex + 1} of {TIMELINE_ERAS.length} (2003 – 2103)
          </span>

          <button
            disabled={selectedEraIndex === TIMELINE_ERAS.length - 1}
            onClick={() => {
              setSelectedEraIndex((prev) => Math.min(TIMELINE_ERAS.length - 1, prev + 1));
              setSearchQuery('');
            }}
            className="flex items-center gap-1 hover:text-gold-300 disabled:opacity-30 disabled:pointer-events-none transition-colors font-cinzel"
          >
            Next Era <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* FUTURE COMING SOON CINEMATIC HORIZON */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 2.0, delay: 1.5 }}
          className="mt-10 w-full max-w-4xl p-6 rounded-3xl bg-gradient-to-r from-gold-950/30 via-obsidian-900/90 to-gold-950/30 border border-gold-500/30 text-center flex flex-col items-center gap-3 relative overflow-hidden"
        >
          <div className="flex items-center gap-2 text-gold-300 text-xs font-cinzel tracking-[0.4em] uppercase">
            <Compass className="w-4 h-4 animate-spin-slow" />
            The Journey Continues...
            <Compass className="w-4 h-4 animate-spin-reverse" />
          </div>

          <p className="font-cormorant italic text-base sm:text-lg text-gold-100/90 max-w-xl">
            “Future Tithi dates will be revealed periodically as the celestial calendar unfolds.”
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-200 font-cinzel text-xs font-semibold tracking-widest uppercase mt-1">
            <Hourglass className="w-3.5 h-3.5 text-gold-300 animate-pulse" />
            2003 → 2103 Living Starlight Frame
          </div>
        </motion.div>
      </div>
    </section>
  );
};
