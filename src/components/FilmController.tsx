import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mail,
  SkipForward,
  SkipBack,
  Compass,
  SlidersHorizontal,
  Lock,
  X,
  Check,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface FilmControllerProps {
  currentScene: number;
  totalScenes: number;
  isPlayingFilm: boolean;
  onTogglePlay: () => void;
  onSelectScene: (index: number) => void;
  onOpenEmailModal: () => void;
  onOpenAdminPanel: () => void;
}

const SCENE_NAMES = [
  '01 · The Void',
  '02 · The Birth Moment',
  '03 · The Name Reveal',
  '04 · Astrological Alignment',
  '05 · Sharan Navaratri',
  '06 · Two Dates Concept',
  '07 · Current Year Reveal',
  '08 · 2003–2103 Living Timeline',
  '09 · Centennial Journey Reveal',
  '10 · Return of Tithi',
  '11 · Birthday Wish',
  '12 · Final Horizon',
];

export const FilmController: React.FC<FilmControllerProps> = ({
  currentScene,
  totalScenes,
  isPlayingFilm,
  onTogglePlay,
  onSelectScene,
  onOpenEmailModal,
  onOpenAdminPanel,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSceneDrawerOpen, setIsSceneDrawerOpen] = useState(false);
  const [isControlVisible, setIsControlVisible] = useState(true);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMuted(audioEngine.getIsMuted());
  }, []);

  // Auto-hide utility button after 3.5 seconds of inactivity
  useEffect(() => {
    const handleActivity = () => {
      setIsControlVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      // If menu is open, do not auto-hide
      if (!isMenuOpen && !isSceneDrawerOpen) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsControlVisible(false);
        }, 3500);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Initial timeout
    hideTimeoutRef.current = setTimeout(() => {
      setIsControlVisible(false);
    }, 3500);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isMenuOpen, isSceneDrawerOpen]);

  const handleToggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handlePrev = () => {
    if (currentScene > 0) {
      onSelectScene(currentScene - 1);
    }
  };

  const handleNext = () => {
    if (currentScene < totalScenes - 1) {
      onSelectScene(currentScene + 1);
    }
  };

  return (
    <>
      {/* Top Floating Luxury Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* Brand Monogram */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto select-none">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-gold-400/50 bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.25)] shrink-0">
            <span className="font-cinzel text-[10px] sm:text-xs font-bold gold-text">S</span>
          </div>
          <div>
            <span className="font-cinzel text-[11px] sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-white block">
              SIRI
            </span>
            <span className="font-outfit text-[8px] sm:text-[9px] text-gold-400/70 tracking-widest uppercase hidden sm:block">
              Written in the Stars
            </span>
          </div>
        </div>

        {/* Floating Utility Controls Trigger (Auto-Hides on Inactivity) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: isControlVisible || isMenuOpen ? 1 : 0.25,
              scale: isControlVisible || isMenuOpen ? 1 : 0.92,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex items-center gap-2"
          >
            {/* Single Floating Champagne-Gold Utility Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Controls & Navigation"
              className={`p-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)] ${
                isMenuOpen
                  ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 border-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.4)] rotate-90'
                  : 'bg-obsidian-950/80 hover:bg-gold-500/15 text-gold-300 hover:text-white border-gold-500/30 hover:border-gold-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* COMPACT GLASSMORPISM UTILITY POPUP PANEL */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Click-outside backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsMenuOpen(false);
                setIsSceneDrawerOpen(false);
              }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Utility Panel Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 right-4 sm:right-8 z-50 w-72 p-4 rounded-3xl bg-obsidian-950/95 border border-gold-500/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_25px_rgba(212,175,55,0.15)] select-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gold-500/20">
                <span className="font-cinzel text-xs text-gold-300 font-bold uppercase tracking-widest">
                  Experience Controls
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Utility Action Buttons List */}
              <div className="space-y-2">
                {/* 1. Celestial Audio Toggle */}
                <button
                  onClick={handleToggleSound}
                  className="w-full p-3 rounded-2xl bg-obsidian-900/90 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-400/50 flex items-center justify-between transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gold-500/10 text-gold-300 group-hover:bg-gold-500/20 transition-colors">
                      {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-gold-300 animate-pulse" />}
                    </div>
                    <div>
                      <span className="font-cinzel text-xs font-semibold text-white block">
                        Celestial Sound
                      </span>
                      <span className="text-[10px] text-gray-400 font-outfit">
                        {isMuted ? 'Muted (Tap to unmute)' : 'Harmonic 528Hz Ambient'}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full ${
                      isMuted ? 'text-gray-400 bg-gray-800/50' : 'text-emerald-300 bg-emerald-500/20'
                    }`}
                  >
                    {isMuted ? 'OFF' : 'ON'}
                  </span>
                </button>

                {/* 2. Scenes Drawer Trigger */}
                <button
                  onClick={() => setIsSceneDrawerOpen(!isSceneDrawerOpen)}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all duration-200 group text-left ${
                    isSceneDrawerOpen
                      ? 'bg-gold-500/15 border-gold-400/60'
                      : 'bg-obsidian-900/90 hover:bg-gold-500/10 border-gold-500/20 hover:border-gold-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gold-500/10 text-gold-300 group-hover:bg-gold-500/20 transition-colors">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-cinzel text-xs font-semibold text-white block">
                        Story Scenes
                      </span>
                      <span className="text-[10px] text-gray-400 font-outfit">
                        Scene {currentScene + 1} of {totalScenes}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gold-400 font-cinzel">
                    {isSceneDrawerOpen ? '▲' : '▼'}
                  </span>
                </button>

                {/* Scene list dropdown when opened */}
                {isSceneDrawerOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-1.5 rounded-2xl bg-obsidian-950 border border-gold-500/25 max-h-48 overflow-y-auto scrollbar-thin space-y-1"
                  >
                    {SCENE_NAMES.map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectScene(idx);
                          setIsMenuOpen(false);
                          setIsSceneDrawerOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-cinzel transition-all flex items-center justify-between ${
                          currentScene === idx
                            ? 'bg-gold-500/20 border border-gold-400/60 text-gold-200 font-bold'
                            : 'text-gray-300 hover:text-gold-200 hover:bg-gold-500/10'
                        }`}
                      >
                        <span>{name}</span>
                        {currentScene === idx && <Check className="w-3.5 h-3.5 text-gold-300" />}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* 3. Email Automation Hub */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenEmailModal();
                  }}
                  className="w-full p-3 rounded-2xl bg-obsidian-900/90 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-400/50 flex items-center justify-between transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gold-500/10 text-gold-300 group-hover:bg-gold-500/20 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-cinzel text-xs font-semibold text-white block">
                        Email Automation
                      </span>
                      <span className="text-[10px] text-gray-400 font-outfit">
                        Dual Birthday & Tithi Wishes
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gold-400 font-cinzel">➔</span>
                </button>

                {/* 4. Admin Portal */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAdminPanel();
                  }}
                  className="w-full p-3 rounded-2xl bg-obsidian-900/90 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-400/50 flex items-center justify-between transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gold-500/10 text-gold-300 group-hover:bg-gold-500/20 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-cinzel text-xs font-semibold text-white block">
                        Admin Portal
                      </span>
                      <span className="text-[10px] text-gray-400 font-outfit">
                        Manage Living Tithi Dates
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gold-400 font-cinzel">➔</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Floating Luxury Film Control Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 sm:px-6 py-3 rounded-full bg-obsidian-950/90 border border-gold-500/35 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.15)] max-w-[94vw]">
        {/* Prev Scene */}
        <button
          onClick={handlePrev}
          disabled={currentScene === 0}
          className="p-2 rounded-full text-gold-400 hover:text-white hover:bg-gold-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Previous Scene"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Play / Pause Film Mode */}
        <button
          onClick={onTogglePlay}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-bold text-xs font-cinzel tracking-wider uppercase transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
        >
          {isPlayingFilm ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Film</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Film</span>
            </>
          )}
        </button>

        {/* Next Scene */}
        <button
          onClick={handleNext}
          disabled={currentScene === totalScenes - 1}
          className="p-2 rounded-full text-gold-400 hover:text-white hover:bg-gold-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Next Scene"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Scene Indicator Dots */}
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-gold-500/25">
          {Array.from({ length: totalScenes }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSelectScene(idx)}
              title={SCENE_NAMES[idx]}
              className={`transition-all duration-300 rounded-full ${
                currentScene === idx
                  ? 'w-6 h-2 bg-gradient-to-r from-gold-300 to-amber-500 shadow-[0_0_10px_#D4AF37]'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gold-400/50'
              }`}
            />
          ))}
        </div>

        {/* Active Scene Counter */}
        <span className="font-cinzel text-[11px] text-gold-300 font-semibold tracking-wider pl-1">
          {String(currentScene + 1).padStart(2, '0')}/{String(totalScenes).padStart(2, '0')}
        </span>
      </nav>
    </>
  );
};
