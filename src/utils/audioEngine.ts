/**
 * Luxury Cinematic Sacred Om / Aum Audio Engine for Siri's Birthday Journey
 *
 * Provides:
 * - Continuous, peaceful, spiritual ambient Om / Aum soundscape.
 * - Supports configured MP3 asset (/audio/om.mp3 or /audio/aum.mp3) with seamless looping.
 * - Automatic harmonic synthetic Om (136.1 Hz Earth-year fundamental + 272.2 Hz, 408.3 Hz harmonics + 432 Hz resonance) if MP3 is absent.
 * - Smooth scene-by-scene volume atmosphere adjustments without restarting between scenes:
 *   - Scene 0 (The Void): Subtle gentle fade-in
 *   - Scene 4 (Divine Blessing / Sharan Navaratri): Slightly more present
 *   - Scene 7–9 (Timeline): Continuous smooth flow
 *   - Scene 10 (Birthday Wish): Gentle fade down
 *   - Scene 11 (Final Ending): Fades into complete silence for 2-3 seconds
 */

class SacredOmAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = true;
  private currentBaseVolume: number = 0.35;
  private targetSceneVolume: number = 0.35;

  // HTML5 Audio element for custom MP3 asset (/audio/om.mp3)
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  // Synthetic Om drone nodes (fallback / harmonic layer)
  private synthOscillators: OscillatorNode[] = [];
  private synthGains: GainNode[] = [];

  constructor() {
    // Check initial preference from localStorage
    if (typeof window !== 'undefined') {
      const pref = localStorage.getItem('siri_sound_preference');
      this.isMuted = pref !== 'enabled';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : this.currentBaseVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupMp3OrSynth();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupMp3OrSynth() {
    if (!this.ctx || !this.masterGain) return;

    // Try loading configured Om MP3 asset from /audio/om.mp3
    try {
      this.audioElement = new Audio('/audio/om.mp3');
      this.audioElement.loop = true;
      this.audioElement.crossOrigin = 'anonymous';

      // Connect to Web Audio graph for smooth master volume control & ramping
      this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.audioSourceNode.connect(this.masterGain);
    } catch {
      // Gracefully fallback to synthetic Om harmonics
    }
  }

  public getSoundPreference(): 'enabled' | 'silent' | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('siri_sound_preference') as 'enabled' | 'silent' | null;
  }

  public enableSound() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('siri_sound_preference', 'enabled');
    }
    this.initContext();
    this.isMuted = false;
    this.startAmbient();

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetSceneVolume, now + 2.5);
    }
  }

  public continueSilently() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('siri_sound_preference', 'silent');
    }
    this.isMuted = true;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    if (!this.masterGain || !this.ctx) return this.isMuted;

    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('siri_sound_preference', this.isMuted ? 'silent' : 'enabled');
    }

    if (!this.isPlaying && !this.isMuted) {
      this.startAmbient();
    }

    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    } else {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetSceneVolume, now + 1.8);
      this.playSacredChime(432, 2.5);
    }

    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public startAmbient() {
    if (this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = true;

    // 1. Play MP3 asset if available
    if (this.audioElement) {
      this.audioElement.play().catch(() => {
        // Fallback to synth if autoplay prevented or file missing
        this.startSyntheticOmDrone();
      });
    }

    // 2. Always maintain synthetic sacred Om harmonics layer for rich spiritual depth
    this.startSyntheticOmDrone();
  }

  private startSyntheticOmDrone() {
    if (!this.ctx || !this.masterGain || this.synthOscillators.length > 0) return;

    // Sacred Cosmic Om Tuning:
    // Fundamental: 136.10 Hz (Earth year OM frequency / C#3 harmonic)
    // 2nd Harmonic: 272.20 Hz
    // 3rd Harmonic: 408.30 Hz
    // Resonant Octaves: 68.05 Hz, 432.00 Hz, 544.40 Hz
    const omHarmonics = [
      { freq: 68.05, type: 'sine' as OscillatorType, gain: 0.08, filterFreq: 180 },
      { freq: 136.10, type: 'sine' as OscillatorType, gain: 0.12, filterFreq: 320 },
      { freq: 272.20, type: 'triangle' as OscillatorType, gain: 0.06, filterFreq: 500 },
      { freq: 408.30, type: 'sine' as OscillatorType, gain: 0.03, filterFreq: 650 },
      { freq: 432.00, type: 'sine' as OscillatorType, gain: 0.02, filterFreq: 800 },
    ];

    omHarmonics.forEach((h, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = h.type;
      osc.frequency.setValueAtTime(h.freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(h.filterFreq, this.ctx.currentTime);

      // Subtle breathing LFO modulation (0.08 Hz binaural breathing cycle)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.06 + idx * 0.02, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(h.gain, this.ctx.currentTime + 3.5);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start();

      this.synthOscillators.push(osc);
      this.synthGains.push(gainNode);
    });
  }

  /**
   * Adjusts volume atmosphere per cinematic scene without interrupting or restarting sound:
   * - Scene 0 (The Void): 0.20
   * - Scene 4 (Divine Blessing / Sharan Navaratri): 0.45
   * - Scenes 1–3, 5–9 (Story & Timeline): 0.30–0.35
   * - Scene 10 (Birthday Wish): 0.18
   * - Scene 11 (Final Ending): Fades into complete silence (0.0001) for 2-3s
   */
  public adjustSceneAtmosphere(sceneIndex: number) {
    let targetVol = 0.32;

    switch (sceneIndex) {
      case 0: // Scene 01: The Void
        targetVol = 0.22;
        break;
      case 1: // Scene 02: Birth Moment
      case 2: // Scene 03: Name Reveal
      case 3: // Scene 04: Astrology
        targetVol = 0.32;
        break;
      case 4: // Scene 05: Divine Blessing (Sharan Navaratri)
        targetVol = 0.45;
        break;
      case 5: // Scene 06: Two Dates
      case 6: // Scene 07: Current Year
      case 7: // Scene 08: Timeline
      case 8: // Scene 09: 101 Years
      case 9: // Scene 10: Return of Tithi
        targetVol = 0.32;
        break;
      case 10: // Scene 11: Birthday Wish
        targetVol = 0.18;
        break;
      case 11: // Scene 12: Final Ending (fade to silence)
        targetVol = 0.0001;
        break;
      default:
        targetVol = 0.30;
    }

    this.targetSceneVolume = targetVol;

    if (this.ctx && this.masterGain && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(targetVol, now + 2.0);
    }
  }

  public playSceneTransitionSound(sceneIndex: number) {
    if (this.isMuted) return;
    this.adjustSceneAtmosphere(sceneIndex);

    if (!this.ctx || !this.masterGain) return;

    // Subtle singing bowl chime for spiritual transitions
    const frequencies = [432, 540, 648, 720, 864, 432, 540, 648, 720, 864, 540, 432];
    const freq = frequencies[sceneIndex % frequencies.length] || 432;
    this.playSacredChime(freq, 2.8);
  }

  public playSacredChime(freq: number = 432, duration: number = 2.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    chimeOsc.start(now);
    chimeOsc.stop(now + duration);
  }

  public playChime(freq: number = 432, duration: number = 2.5) {
    this.playSacredChime(freq, duration);
  }
}

export const audioEngine = new SacredOmAudioEngine();
