import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface SoundPermissionModalProps {
  isOpen: boolean;
  onEnableSound: () => void;
  onContinueSilently: () => void;
}

export const SoundPermissionModal: React.FC<SoundPermissionModalProps> = ({
  isOpen,
  onEnableSound,
  onContinueSilently,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Ambient Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

          {/* Luxury Obsidian Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[#09080E]/90 border border-gold-500/40 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] text-center overflow-hidden"
          >
            {/* Top Subtle Om Symbol & Celestial Icon */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-16 h-16 rounded-full border border-gold-400/40 bg-gold-500/10 flex items-center justify-center text-gold-300 shadow-[0_0_25px_rgba(212,175,55,0.25)] mb-3">
                <span className="font-cormorant text-2xl font-bold select-none text-gold-200">ॐ</span>
                <Sparkles className="w-3.5 h-3.5 text-gold-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.35em] text-gold-400 uppercase font-semibold">
                Sacred Celestial Symphony
              </p>
            </div>

            {/* Title */}
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-widest text-gold-100 uppercase mb-4 drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">
              ENTER THE EXPERIENCE
            </h3>

            {/* Poetic Description */}
            <p className="font-outfit text-xs sm:text-sm text-gold-100/75 leading-relaxed mb-8 max-w-xs mx-auto font-light">
              This journey was created with sound. For the best experience, allow the music to accompany your story.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3.5">
              <button
                onClick={onEnableSound}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 text-obsidian-950 font-cinzel text-xs font-bold tracking-widest uppercase shadow-[0_10px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-obsidian-950" />
                <span>ENABLE SOUND</span>
              </button>

              <button
                onClick={onContinueSilently}
                className="w-full py-3 px-6 rounded-full bg-obsidian-900/60 border border-gold-500/20 text-gold-300/70 hover:text-gold-200 hover:border-gold-500/40 font-cinzel text-[11px] font-medium tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gold-500/5"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>CONTINUE SILENTLY</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
