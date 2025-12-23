// src/lib/sounds/SoundEngine.ts

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _isMuted: boolean = false;
  private currentAmbienceNodes: AudioNode[] = []; 
  private birdInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContext();
      }
    }
  }

  public init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public get isMuted(): boolean {
    return this._isMuted;
  }

  public setMute(muted: boolean) {
    this._isMuted = muted;
    if (this.ctx) {
      if (muted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
  }

  // --- 基本波形生成 ---
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.3) {
    if (!this.ctx || this._isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // --- ノイズ生成 (摩擦音や打撃音用) ---
  private playNoise(duration: number, vol: number = 0.3) {
    if (!this.ctx || this._isMuted) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.ctx.createGain();
    // フィルタで少しこもらせる（柔らかい音に）
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // --- SEプリセット ---

  public playMerge() {
    this.init();
    this.playTone(880, 'sine', 0.1, 0, 0.2); 
    this.playTone(440, 'triangle', 0.1, 0.05, 0.2); 
  }

  public playGoal() {
    this.init();
    this.playTone(523.25, 'sine', 0.6, 0, 0.2); // Do
    this.playTone(659.25, 'sine', 0.6, 0.1, 0.2); // Mi
    this.playTone(783.99, 'sine', 0.8, 0.2, 0.2); // So
  }

  public playStamp() {
    this.init();
    // 低いドンッ
    this.playTone(120, 'triangle', 0.1, 0, 0.6);
    this.playTone(800, 'square', 0.05, 0, 0.05);
  }

  public playSelect() {
    this.init();
    // コッ (木のような音)
    this.playTone(800, 'sine', 0.05, 0, 0.3);
    this.playNoise(0.02, 0.2);
  }

  // ★追加: 無効操作音（不快感のない「カッ」という乾いた音）
  public playInvalid() {
    this.init();
    // 短く、少しピッチのあるクリック音
    this.playTone(300, 'square', 0.05, 0, 0.2);
    this.playTone(150, 'sawtooth', 0.05, 0, 0.2);
  }

  public playClear() {
    this.init();
    const now = this.ctx?.currentTime || 0;
    
    // アルペジオ
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major
    notes.forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.4, i * 0.08, 0.4);
    });

    // 仕上げの和音
    setTimeout(() => {
      this.playTone(523.25, 'triangle', 0.8, 0, 0.2);
      this.playTone(1046.50, 'sine', 0.8, 0, 0.2);
    }, 400);
  }
}

export const soundEngine = new SoundEngine();