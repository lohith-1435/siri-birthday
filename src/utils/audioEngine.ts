/**
 * Luxury Cinematic Web Audio Engine for Siri's Birthday Journey
 * Creates rich, warm celestial ambient drones, singing bowl chimes, and subtle transition whooshes.
 * Muted by default.
 */

class LuxuryAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private ambientNodes: OscillatorNode[] = [];
  private ambientGains: GainNode[] = [];
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    if (!this.masterGain || !this.ctx) return this.isMuted;

    this.isMuted = !this.isMuted;

    if (!this.isPlaying && !this.isMuted) {
      this.startAmbient();
    }

    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    } else {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 1.5);
      this.playChime(432, 2.5); // Warm harmonic welcome chime
    }

    return this.isMuted;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public startAmbient() {
    if (this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = true;

    // Harmonic celestial drone frequencies (F major / D minor celestial scale: 108Hz, 216Hz, 324Hz, 432Hz, 540Hz)
    const frequencies = [108, 162, 216, 324, 432, 648];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter for soft luxury warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + idx * 80, this.ctx.currentTime);

      // Subtle LFO modulation for breathing celestial feeling
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      const baseLevel = 0.02 / (idx + 1);
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(baseLevel, this.ctx.currentTime + 3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.ambientNodes.push(osc);
      this.ambientGains.push(gain);
    });
  }

  public playChime(freq: number = 528, duration: number = 3.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.setValueAtTime(4, now);

    // Exponential decay bell envelope
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    // Add higher octave harmonic overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.02, now); // subtle shimmer beating
    gain2.gain.setValueAtTime(0.05, now);
    gain2.gain.exponentialRampToValueAtTime(0.00001, now + duration * 0.8);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now);
    osc2.stop(now + duration);
  }

  public playSceneTransitionSound(sceneIndex: number) {
    if (this.isMuted) return;
    // Harmonic notes aligned with 12 scenes
    const scale = [216, 270, 324, 432, 486, 540, 648, 720, 864, 972, 1080, 1296];
    const freq = scale[sceneIndex % scale.length];
    this.playChime(freq, 2.2);
  }

  public playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(850, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.8);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.85);
    } catch {
      // Audio fallback
    }
  }
}

export const audioEngine = new LuxuryAudioEngine();
