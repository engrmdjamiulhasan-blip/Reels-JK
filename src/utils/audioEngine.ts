/**
 * Web Audio API Beat & Music Synthesizer Engine
 * Generates rhythmic beat patterns, bass drops, and harmonic pads for trending reels
 */

export class BeatAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string = 'track-phonk-velocity';
  private bpm: number = 135;
  private volume: number = 0.85;
  private timerId: number | null = null;
  private nextBeatTime: number = 0;
  private beatIndex: number = 0;
  private customAudioElement: HTMLAudioElement | null = null;
  private customAudioSourceNode: MediaElementAudioSourceNode | null = null;
  private voiceoverAudioElement: HTMLAudioElement | null = null;
  private voiceoverSourceNode: MediaElementAudioSourceNode | null = null;
  private customMusicUrl: string | null = null;
  private voiceoverUrl: string | null = null;
  private voiceoverVolume: number = 1.0;
  private sfxVolume: number = 0.8;
  private sfxGainNode: GainNode | null = null;
  private tapTimestamps: number[] = [];
  private analyser: AnalyserNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      this.destinationNode = this.ctx.createMediaStreamDestination();

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
      this.sfxGainNode.connect(this.destinationNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setTrack(trackId: string, bpm: number, customUrl?: string) {
    this.currentTrackId = trackId;
    this.bpm = bpm;
    if (customUrl && customUrl !== this.customMusicUrl) {
      this.customMusicUrl = customUrl;
      this.setupCustomAudio(customUrl);
    } else if (!customUrl) {
      this.customMusicUrl = null;
    }
  }

  public setVoiceover(url?: string, volume: number = 1.0) {
    this.voiceoverVolume = volume;
    if (url && url !== this.voiceoverUrl) {
      this.voiceoverUrl = url;
      this.setupVoiceoverAudio(url);
    } else if (!url) {
      this.voiceoverUrl = null;
      if (this.voiceoverAudioElement) {
        this.voiceoverAudioElement.pause();
      }
    }
    if (this.voiceoverAudioElement) {
      this.voiceoverAudioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  private setupCustomAudio(url: string) {
    this.init();
    if (!this.ctx) return;
    if (!this.customAudioElement) {
      this.customAudioElement = document.createElement('audio');
      this.customAudioElement.crossOrigin = 'anonymous';
      this.customAudioElement.preload = 'auto';
      try {
        this.customAudioSourceNode = this.ctx.createMediaElementSource(this.customAudioElement);
        this.customAudioSourceNode.connect(this.ctx.destination);
        if (this.analyser) this.customAudioSourceNode.connect(this.analyser);
        if (this.destinationNode) this.customAudioSourceNode.connect(this.destinationNode);
      } catch (err) {
        console.warn('Audio source node connect fallback:', err);
      }
    }
    this.customAudioElement.src = url;
    this.customAudioElement.volume = this.volume;
  }

  private setupVoiceoverAudio(url: string) {
    this.init();
    if (!this.ctx) return;
    if (!this.voiceoverAudioElement) {
      this.voiceoverAudioElement = document.createElement('audio');
      this.voiceoverAudioElement.crossOrigin = 'anonymous';
      this.voiceoverAudioElement.preload = 'auto';
      try {
        this.voiceoverSourceNode = this.ctx.createMediaElementSource(this.voiceoverAudioElement);
        this.voiceoverSourceNode.connect(this.ctx.destination);
        if (this.destinationNode) this.voiceoverSourceNode.connect(this.destinationNode);
      } catch (err) {
        console.warn('Voiceover source node connect:', err);
      }
    }
    this.voiceoverAudioElement.src = url;
    this.voiceoverAudioElement.volume = this.voiceoverVolume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.volume;
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getAudioDestinationStream(): MediaStream | null {
    this.init();
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public play(startOffsetSeconds: number = 0) {
    this.init();
    if (!this.ctx) return;
    this.isPlaying = true;

    // 1. Play custom audio if provided
    if (this.customMusicUrl && this.customAudioElement) {
      this.customAudioElement.currentTime = startOffsetSeconds % (this.customAudioElement.duration || 1);
      this.customAudioElement.play().catch(() => {});
    }

    // 2. Play voiceover if provided
    if (this.voiceoverUrl && this.voiceoverAudioElement) {
      if (startOffsetSeconds < (this.voiceoverAudioElement.duration || 100)) {
        this.voiceoverAudioElement.currentTime = startOffsetSeconds;
        this.voiceoverAudioElement.play().catch(() => {});
      }
    }

    // 3. Play synth beat generator if not using custom audio or as an accompaniment
    if (!this.customMusicUrl) {
      this.nextBeatTime = this.ctx.currentTime;
      this.beatIndex = Math.floor((startOffsetSeconds * this.bpm) / 60);

      const secondsPerBeat = 60 / this.bpm;
      const scheduleAheadTime = 0.1;

      const scheduler = () => {
        if (!this.isPlaying || !this.ctx) return;
        while (this.nextBeatTime < this.ctx.currentTime + scheduleAheadTime) {
          this.scheduleBeat(this.beatIndex, this.nextBeatTime);
          this.nextBeatTime += secondsPerBeat;
          this.beatIndex++;
        }
        this.timerId = window.setTimeout(scheduler, 25);
      };

      scheduler();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    if (this.voiceoverAudioElement) {
      this.voiceoverAudioElement.pause();
    }
  }

  public stop() {
    this.pause();
    this.beatIndex = 0;
  }

  // Tap-tempo beat detector
  public recordTap(): number | null {
    const now = performance.now();
    this.tapTimestamps.push(now);

    // Keep only last 6 taps within 3 seconds
    this.tapTimestamps = this.tapTimestamps.filter((t) => now - t < 3000);
    if (this.tapTimestamps.length >= 3) {
      const intervals: number[] = [];
      for (let i = 1; i < this.tapTimestamps.length; i++) {
        intervals.push(this.tapTimestamps[i] - this.tapTimestamps[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgMs > 0) {
        const bpm = Math.round(60000 / avgMs);
        if (bpm >= 60 && bpm <= 180) {
          this.bpm = bpm;
          return bpm;
        }
      }
    }
    return null;
  }

  // Transition Sound FX: Shutter, Whoosh, Bass Boom, Glitch
  public playTransitionSfx(type: string) {
    this.init();
    if (!this.ctx || !this.sfxGainNode || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'flash': {
        // Camera Shutter Snap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'highpass' as unknown as OscillatorType;
        // White noise burst
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        gain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(gain);
        gain.connect(this.sfxGainNode);
        noise.start(now);
        break;
      }
      case 'beat_shake': {
        // Bass drop boom
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

        gain.gain.setValueAtTime(0.8 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.36);
        break;
      }
      case 'glitch': {
        // Cyber glitch chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(320, now + 0.04);
        osc.frequency.setValueAtTime(1400, now + 0.08);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }
      default: {
        // Smooth whoosh
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGainNode);
        noise.start(now);
      }
    }
  }

  public getBassEnergy(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    // Average first 4 frequency bins for bass
    const bass = (this.dataArray[0] + this.dataArray[1] + this.dataArray[2] + this.dataArray[3]) / (4 * 255);
    return bass;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser || !this.dataArray) return new Uint8Array(16);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  private scheduleBeat(step: number, time: number) {
    if (!this.ctx) return;
    const barStep = step % 16;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, time);

    // Route to speaker and destination (for export recording)
    masterGain.connect(this.ctx.destination);
    if (this.analyser) {
      masterGain.connect(this.analyser);
    }
    if (this.destinationNode) {
      masterGain.connect(this.destinationNode);
    }

    // 1. Kick Drum (Strong on 0, 4, 8, 12 or syncopated for phonk/trap)
    if (barStep === 0 || barStep === 4 || barStep === 8 || barStep === 12 || (barStep === 10 && this.bpm > 130)) {
      this.playKick(time, masterGain);
    }

    // 2. Snare / Clap (On 4 and 12, or 8 in half-time trap)
    if (barStep === 4 || barStep === 12 || barStep === 8) {
      this.playSnare(time, masterGain);
    }

    // 3. Hi-Hats (every step with velocity accent)
    const isAccent = barStep % 2 === 0;
    this.playHiHat(time, masterGain, isAccent);

    // 4. Bass synth note (Phonk / Trap / Synthwave 808 note)
    this.playSynthNote(time, masterGain, barStep);
  }

  private playKick(time: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(target);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playSnare(time: number, target: GainNode) {
    if (!this.ctx) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(target);

    noise.start(time);
    noise.stop(time + 0.15);

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(target);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playHiHat(time: number, target: GainNode, isAccent: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8500, time);

    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const vol = isAccent ? 0.18 : 0.08;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private playSynthNote(time: number, target: GainNode, barStep: number) {
    if (!this.ctx) return;
    // Melody notes based on track
    const scale = [55, 58.27, 61.74, 65.41, 73.42, 82.41]; // A1, C2, D2, E2, F2, G2
    const noteFreq = scale[barStep % scale.length];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (this.currentTrackId.includes('phonk') || this.currentTrackId.includes('drift')) {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, time);
      filter.frequency.exponentialRampToValueAtTime(160, time + 0.25);
    } else if (this.currentTrackId.includes('afro')) {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, time);
      filter.frequency.exponentialRampToValueAtTime(220, time + 0.2);
    } else if (this.currentTrackId.includes('synthwave')) {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.value = 900;
    } else {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.value = 400;
    }

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    osc.frequency.setValueAtTime(noteFreq, time);
    osc.start(time);
    osc.stop(time + 0.36);
  }
}

export const globalBeatEngine = new BeatAudioEngine();
