/**
 * 簡易シンセサイザーエンジン (Enhanced)
 * MP3ファイルなしで、BGMや環境音も生成します。
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentAmbience: AudioNode[] = []; // 再生中の環境音ノード

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

  // --- 基本波形生成 ---
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.3) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // --- ノイズ生成 (環境音用) ---
  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2秒分
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- アンビエンス再生 ---
  
  public stopAmbience() {
    this.currentAmbience.forEach(node => {
      try { (node as any).stop(); } catch(e) {}
      node.disconnect();
    });
    this.currentAmbience = [];
  }

  // 風の音 (森・山エリア用)
  public playWindAmbience() {
    if (!this.ctx || this.isMuted) return;
    this.stopAmbience();

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    noise.loop = true;

    // フィルタで風のようなゴォーという音にする
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    // 音量揺らぎ (LFO)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // ゆったり
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300; // フィルタ周波数を揺らす

    const mainGain = this.ctx.createGain();
    mainGain.gain.value = 0.05; // かなり小さく

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    noise.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    noise.start();
    lfo.start();

    this.currentAmbience.push(noise, lfo);
  }

  // 川のせせらぎ (里エリア用)
  public playRiverAmbience() {
    if (!this.ctx || this.isMuted) return;
    this.stopAmbience();

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    noise.loop = true;

    // ハイパスフィルタでシャワシャワ感
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    const mainGain = this.ctx.createGain();
    mainGain.gain.value = 0.03;

    noise.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    noise.start();
    this.currentAmbience.push(noise);
  }

  // 宇宙の静寂 (天空エリア用)
  public playSpaceAmbience() {
    if (!this.ctx || this.isMuted) return;
    this.stopAmbience();

    // 低いドローン音
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 50; // 超低音

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 10; 

    const mainGain = this.ctx.createGain();
    mainGain.gain.value = 0.1;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    osc.start();
    lfo.start();
    this.currentAmbience.push(osc, lfo);
  }

  // --- SEプリセット ---

  public playMerge() {
    this.init();
    this.playTone(880, 'square', 0.1); 
    this.playTone(440, 'triangle', 0.1); 
  }

  public playGoal() {
    this.init();
    this.playTone(1200, 'sine', 0.3);
    this.playTone(1800, 'sine', 0.3, 0.1); 
  }

  public playStamp() {
    this.init();
    // 低いドンッという音
    this.playTone(150, 'triangle', 0.15, 0, 0.8);
    // 紙の摩擦音っぽいノイズ（簡易）
    this.playTone(800, 'square', 0.05, 0, 0.1);
  }

  public playClear() {
    this.init();
    const now = 0;
    this.playTone(523.25, 'triangle', 0.5, now);       // ド
    this.playTone(659.25, 'triangle', 0.5, now + 0.1); // ミ
    this.playTone(783.99, 'triangle', 0.5, now + 0.2); // ソ
    this.playTone(1046.50, 'sine', 0.8, now + 0.3);    // 高いド
  }

  public playSelect() {
    this.init();
    // 短く高い音で「コッ」という感じ
    this.playTone(800, 'square', 0.05, 0, 0.1);
  }
}

export const soundEngine = new SoundEngine();