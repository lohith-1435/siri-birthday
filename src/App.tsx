import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CelestialBackground } from './components/CelestialBackground';
import { FilmController } from './components/FilmController';
import { EmailDashboardModal } from './components/EmailDashboardModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { CountdownLockScreen } from './components/CountdownLockScreen';
import { WelcomeAgeModal } from './components/WelcomeAgeModal';
import { TimeSinceBirthCounter } from './components/TimeSinceBirthCounter';
import { audioEngine } from './utils/audioEngine';
import { tithiService } from './services/tithiService';
import { buildCompleteTimeline, type TimelineEntry } from './data/timelineData';
import { calculateUnlockCountdown } from './utils/timeCalculations';

// 12 Cinematic Story Scenes
import { Scene01TheVoid } from './components/scenes/Scene01TheVoid';
import { Scene02BirthMoment } from './components/scenes/Scene02BirthMoment';
import { Scene03NameReveal } from './components/scenes/Scene03NameReveal';
import { Scene04AstrologyDetails } from './components/scenes/Scene04AstrologyDetails';
import { Scene05DivineBlessing } from './components/scenes/Scene05DivineBlessing';
import { Scene06TwoDatesConcept } from './components/scenes/Scene06TwoDatesConcept';
import { Scene07CurrentYearReveal } from './components/scenes/Scene07CurrentYearReveal';
import { Scene08TimelineJourney } from './components/scenes/Scene08TimelineJourney';
import { Scene09HundredOneYears } from './components/scenes/Scene09HundredOneYears';
import { Scene10ReturnOfTithi } from './components/scenes/Scene10ReturnOfTithi';
import { Scene11BirthdayWish } from './components/scenes/Scene11BirthdayWish';
import { Scene12FinalEnding } from './components/scenes/Scene12FinalEnding';

export const App: React.FC = () => {
  // Navigation & View Routing ('film' | 'admin')
  const [currentView, setCurrentView] = useState<'film' | 'admin'>('film');
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlayingFilm, setIsPlayingFilm] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const totalScenes = 12;
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lock Screen & Preview Access State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => calculateUnlockCountdown().isUnlocked);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);

  // Living Database Published Records (2003–2103 Span)
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);

  // Fetch Published Tithi Dates on mount & when updated
  const fetchPublishedTimeline = useCallback(async () => {
    try {
      const records = await tithiService.getPublishedDates();
      const complete101Years = buildCompleteTimeline(records);
      setTimelineEntries(complete101Years);
    } catch (err) {
      console.error('Error fetching published timeline:', err);
    }
  }, []);

  useEffect(() => {
    fetchPublishedTimeline();

    // Check URL path or hash for /admin
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('film');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, [fetchPublishedTimeline]);

  // Handle countdown unlock (real or preview)
  const handleUnlockExperience = (isPreview: boolean) => {
    setIsPreviewMode(isPreview);
    setShowWelcomeScreen(true);
    setIsUnlocked(true);
  };

  const handleFinishWelcome = () => {
    setShowWelcomeScreen(false);
    handleSelectScene(0); // Start at Scene 1
  };

  // Scene pacing for automatic film playback (in seconds per scene)
  const sceneDurations = [7, 6.5, 7.5, 8, 8, 7.5, 8, 9, 6.5, 7, 8, 8];

  const handleSelectScene = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalScenes - 1, index));
    setCurrentScene(clampedIndex);
    audioEngine.playSceneTransitionSound(clampedIndex);

    // Smooth scroll into view
    const targetEl = sectionRefs.current[clampedIndex];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalScenes]);

  // Handle automatic film autoplay timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlayingFilm && currentView === 'film' && isUnlocked && !showWelcomeScreen) {
      const durationMs = (sceneDurations[currentScene] || 7) * 1000;
      timer = setTimeout(() => {
        if (currentScene < totalScenes - 1) {
          handleSelectScene(currentScene + 1);
        } else {
          setIsPlayingFilm(false);
        }
      }, durationMs);
    }
    return () => clearTimeout(timer);
  }, [isPlayingFilm, currentScene, totalScenes, sceneDurations, handleSelectScene, currentView, isUnlocked, showWelcomeScreen]);

  // Handle Keyboard Navigation (Arrow Keys / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEmailModalOpen || currentView === 'admin' || !isUnlocked || showWelcomeScreen) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleSelectScene(currentScene + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSelectScene(currentScene - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, isEmailModalOpen, handleSelectScene, currentView, isUnlocked, showWelcomeScreen]);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    if (currentView !== 'film' || !isUnlocked || showWelcomeScreen) return;

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-scene-index'));
          if (!isNaN(index) && !isPlayingFilm) {
            setCurrentScene(index);
          }
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isPlayingFilm, currentView, timelineEntries, isUnlocked, showWelcomeScreen]);

  // Navigate to Admin View
  const handleOpenAdmin = () => {
    window.history.pushState(null, '', '#/admin');
    setCurrentView('admin');
  };

  // Navigate back to Film View
  const handleBackToFilm = () => {
    window.history.pushState(null, '', '#/');
    setCurrentView('film');
    fetchPublishedTimeline();
  };

  // 1. Admin Panel View
  if (currentView === 'admin') {
    return (
      <AdminPanel
        onBackToFilm={handleBackToFilm}
        onDataUpdated={fetchPublishedTimeline}
      />
    );
  }

  // 2. Locked Countdown Screen (before 28 Sep 2026 unless unlocked via countdown or preview code 'mendu')
  if (!isUnlocked) {
    return <CountdownLockScreen onUnlock={handleUnlockExperience} />;
  }

  // 3. Welcome Age Screen (after unlock: "WELCOME TO 23", "A new chapter begins.", "SIRI")
  if (showWelcomeScreen) {
    return <WelcomeAgeModal onContinue={handleFinishWelcome} />;
  }

  // 4. Main Unlocked Cinematic Birthday Film
  return (
    <div className="relative min-h-screen bg-obsidian-950 text-[#FAF8F5] overflow-x-hidden selection:bg-gold-500/30 selection:text-gold-100">
      {/* 60fps Celestial Canvas & Particle Engine */}
      <CelestialBackground sceneIndex={currentScene} />

      {/* Subtle Top-Right Live HUD Counter: Time Since Birth */}
      <TimeSinceBirthCounter isPreviewMode={isPreviewMode} />

      {/* Floating Film Navigation Controls & Header */}
      <FilmController
        currentScene={currentScene}
        totalScenes={totalScenes}
        isPlayingFilm={isPlayingFilm}
        onTogglePlay={() => setIsPlayingFilm(!isPlayingFilm)}
        onSelectScene={handleSelectScene}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenAdminPanel={handleOpenAdmin}
      />

      {/* 12 Cinematic Story Scenes */}
      <main className="relative z-10">
        {/* Scene 01: The Void */}
        <div
          ref={(el) => { sectionRefs.current[0] = el; }}
          data-scene-index="0"
          className="min-h-screen"
        >
          <Scene01TheVoid isActive={currentScene === 0} onNext={() => handleSelectScene(1)} />
        </div>

        {/* Scene 02: The Birth Moment */}
        <div
          ref={(el) => { sectionRefs.current[1] = el; }}
          data-scene-index="1"
          className="min-h-screen"
        >
          <Scene02BirthMoment isActive={currentScene === 1} />
        </div>

        {/* Scene 03: The Name Reveal */}
        <div
          ref={(el) => { sectionRefs.current[2] = el; }}
          data-scene-index="2"
          className="min-h-screen"
        >
          <Scene03NameReveal isActive={currentScene === 2} />
        </div>

        {/* Scene 04: Astrological Details */}
        <div
          ref={(el) => { sectionRefs.current[3] = el; }}
          data-scene-index="3"
          className="min-h-screen"
        >
          <Scene04AstrologyDetails isActive={currentScene === 3} />
        </div>

        {/* Scene 05: Divine Blessing (Sharan Navaratri) */}
        <div
          ref={(el) => { sectionRefs.current[4] = el; }}
          data-scene-index="4"
          className="min-h-screen"
        >
          <Scene05DivineBlessing isActive={currentScene === 4} />
        </div>

        {/* Scene 06: Two Dates Concept */}
        <div
          ref={(el) => { sectionRefs.current[5] = el; }}
          data-scene-index="5"
          className="min-h-screen"
        >
          <Scene06TwoDatesConcept isActive={currentScene === 5} />
        </div>

        {/* Scene 07: Current Year Reveal (Dynamic Living Database) */}
        <div
          ref={(el) => { sectionRefs.current[6] = el; }}
          data-scene-index="6"
          className="min-h-screen"
        >
          <Scene07CurrentYearReveal
            isActive={currentScene === 6}
            timelineEntries={timelineEntries}
          />
        </div>

        {/* Scene 08: Dynamic 2003–2103 Living Timeline Journey */}
        <div
          ref={(el) => { sectionRefs.current[7] = el; }}
          data-scene-index="7"
          className="min-h-screen"
        >
          <Scene08TimelineJourney
            isActive={currentScene === 7}
            timelineEntries={timelineEntries}
          />
        </div>

        {/* Scene 09: 101 Years Milestone Reveal */}
        <div
          ref={(el) => { sectionRefs.current[8] = el; }}
          data-scene-index="8"
          className="min-h-screen"
        >
          <Scene09HundredOneYears
            isActive={currentScene === 8}
            timelineEntries={timelineEntries}
          />
        </div>

        {/* Scene 10: Return of the Tithi (Dynamic Living Database) */}
        <div
          ref={(el) => { sectionRefs.current[9] = el; }}
          data-scene-index="9"
          className="min-h-screen"
        >
          <Scene10ReturnOfTithi
            isActive={currentScene === 9}
            timelineEntries={timelineEntries}
          />
        </div>

        {/* Scene 11: Birthday Wish */}
        <div
          ref={(el) => { sectionRefs.current[10] = el; }}
          data-scene-index="10"
          className="min-h-screen"
        >
          <Scene11BirthdayWish isActive={currentScene === 10} />
        </div>

        {/* Scene 12: Final Cinematic Ending */}
        <div
          ref={(el) => { sectionRefs.current[11] = el; }}
          data-scene-index="11"
          className="min-h-screen"
        >
          <Scene12FinalEnding
            isActive={currentScene === 11}
            onReplay={() => handleSelectScene(0)}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
          />
        </div>
      </main>

      {/* Email Automation System & Live Preview Modal */}
      <EmailDashboardModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        timelineEntries={timelineEntries}
      />
    </div>
  );
};
export default App;
