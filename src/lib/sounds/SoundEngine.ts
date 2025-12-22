// src/lib/sounds/SoundEngine.ts

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _isMuted: boolean = false; // 内部状態
  private currentAmbienceNodes: AudioNode[] = []; 
  private birdInterval: NodeJS.Timeout | null = null; // 鳥の定期実行用

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

  // ミュート状態のゲッター
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

  // --- 基本波形生成 (SE用) ---
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.3) {
    if (!this.ctx || this._isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + startTime + 0.02); // アタックを少し柔らかく
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // --- ノイズ生成 (環境音用) ---
  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    // 5秒分のバッファ（ループ時の違和感を減らすため長めに）
    const bufferSize = this.ctx.sampleRate * 5; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // ピンクノイズ風の生成（高音を抑える）
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 簡易的なフィルタリング
      const brown = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brown;
      data[i] = brown * 3.5; // 音量補正
    }
    return buffer;
  }

  // --- アンビエンス制御 ---
  
  public stopAmbience() {
    // ノードの停止
    this.currentAmbienceNodes.forEach(node => {
      try { (node as any).stop(); } catch(e) {}
      try { node.disconnect(); } catch(e) {}
    });
    this.currentAmbienceNodes = [];

    // 鳥のさえずり停止
    if (this.birdInterval) {
      clearInterval(this.birdInterval);
      this.birdInterval = null;
    }
  }

  // ★改良版: 里の環境音（優しいせせらぎ + 鳥）
  public playNatureAmbience() {
    if (!this.ctx || this._isMuted) return;
    this.stopAmbience();

    // 1. 川の音 (ベース)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    noise.loop = true;

    // ローパスフィルタで「ザー」を「サー...」に変える
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // かなり低くして「こもり感」を出す
    filter.Q.value = 1;

    // 音量のゆらぎ (LFO) で水の流れを表現
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // 非常にゆっくり
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 100; // フィルタを開閉させる

    const mainGain = this.ctx.createGain();
    mainGain.gain.value = 0.08; // 控えめな音量

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    noise.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    noise.start();
    lfo.start();

    this.currentAmbienceNodes.push(noise, lfo, mainGain);

    // 2. 鳥のさえずり (定期実行)
    // 3〜8秒おきにランダムで鳴く
    const scheduleBird = () => {
      if (this._isMuted) return;
      const delay = 3000 + Math.random() * 5000;
      this.playBirdOneShot();
      this.birdInterval = setTimeout(scheduleBird, delay);
    };
    scheduleBird();
  }

  // 単発の鳥の声生成
  private playBirdOneShot() {
    if (!this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    
    // ピッチ: 高めの音から少し下がる、または上がる (さえずり感)
    const startFreq = 2000 + Math.random() * 1000;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(startFreq + (Math.random() * 400 - 200), t + 0.1);

    // エンベロープ: 短く鋭く
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);

    // 確率で「2回鳴く」 (ピピっ)
    if (Math.random() > 0.5) {
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      const t2 = t + 0.15; // 少し遅らせる

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(startFreq, t2);
      osc2.frequency.linearRampToValueAtTime(startFreq - 100, t2 + 0.1);

      gain2.gain.setValueAtTime(0, t2);
      gain2.gain.linearRampToValueAtTime(0.08, t2 + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.15);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(t2);
      osc2.stop(t2 + 0.2);
    }
  }

  // --- SEプリセット (既存維持) ---

  public playMerge() {
    this.init();
    this.playTone(880, 'sine', 0.1, 0, 0.2); 
    this.playTone(440, 'triangle', 0.1, 0.05, 0.2); 
  }

  public playGoal() {
    this.init();
    // 和音っぽい響き
    this.playTone(523.25, 'sine', 0.6, 0, 0.2); // Do
    this.playTone(659.25, 'sine', 0.6, 0.1, 0.2); // Mi
    this.playTone(783.99, 'sine', 0.8, 0.2, 0.2); // So
  }

  public playStamp() {
    this.init();
    // 低いドンッ (Triangel波で打撃感)
    this.playTone(120, 'triangle', 0.1, 0, 0.6);
    // 紙の摩擦音っぽさ (高周波の短いノイズの代わりに矩形波を一瞬)
    this.playTone(800, 'square', 0.05, 0, 0.05);
  }

  public playSelect() {
    this.init();
    // コッ という短い木のような音
    this.playTone(800, 'sine', 0.03, 0, 0.1);
  }
  
  // 既存の互換性のため残すが中身はplayNatureAmbienceへ誘導
  public playRiverAmbience() {
    this.playNatureAmbience();
  }
}

export const soundEngine = new SoundEngine();