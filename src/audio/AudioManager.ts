export class AudioManager {
  private ctx?: AudioContext;
  private masterVolume = 1;
  private musicVolume = 0.4;
  private sfxVolume = 0.7;
  private musicGain?: GainNode;
  private musicInterval?: number;
  private initialized = false;

  public init(): void {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.initialized = true;
  }

  public setMasterVolume(v: number): void { this.masterVolume = Math.max(0, Math.min(1, v)); }
  public setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume * this.masterVolume;
  }
  public setSfxVolume(v: number): void { this.sfxVolume = Math.max(0, Math.min(1, v)); }

  public playSfx(type: SfxType): void {
    if (!this.initialized) this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);
    gain.gain.value = this.sfxVolume * this.masterVolume;

    switch (type) {
      case 'build':
        this.playTone(440, 0.1, 'sine', gain, t);
        this.playTone(554, 0.1, 'sine', gain, t + 0.05);
        break;
      case 'shoot':
        this.playTone(880, 0.05, 'square', gain, t, 0.08);
        break;
      case 'cannon':
        this.playTone(150, 0.2, 'sawtooth', gain, t, 0.3);
        break;
      case 'hit':
        this.playTone(220, 0.05, 'square', gain, t, 0.05);
        break;
      case 'enemyDeath':
        this.playTone(330, 0.1, 'sawtooth', gain, t, 0.15);
        this.playTone(220, 0.1, 'sawtooth', gain, t + 0.1, 0.1);
        break;
      case 'error':
        this.playTone(150, 0.15, 'sawtooth', gain, t, 0.1);
        break;
      case 'waveStart':
        this.playTone(523, 0.2, 'sine', gain, t);
        this.playTone(659, 0.2, 'sine', gain, t + 0.2);
        this.playTone(784, 0.3, 'sine', gain, t + 0.4);
        break;
      case 'victory':
        this.playTone(523, 0.2, 'sine', gain, t);
        this.playTone(659, 0.2, 'sine', gain, t + 0.2);
        this.playTone(784, 0.2, 'sine', gain, t + 0.4);
        this.playTone(1047, 0.5, 'sine', gain, t + 0.6);
        break;
      case 'defeat':
        this.playTone(392, 0.3, 'sawtooth', gain, t);
        this.playTone(330, 0.3, 'sawtooth', gain, t + 0.3);
        this.playTone(262, 0.6, 'sawtooth', gain, t + 0.6);
        break;
    }
  }

  public startMusic(): void {
    if (!this.initialized) this.init();
    if (!this.ctx || this.musicInterval) return;

    const notes = [196, 220, 247, 262, 294, 262, 247, 220]; // 简单的低音旋律
    let index = 0;

    const playNext = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = notes[index];
      gain.gain.value = this.musicVolume * this.masterVolume * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
      index = (index + 1) % notes.length;
    };

    this.musicInterval = window.setInterval(playNext, 500);
    playNext();
  }

  public stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = undefined;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    gainNode: GainNode,
    startTime: number,
    attack = 0.05,
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(1, startTime + attack);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(env);
    env.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export type SfxType =
  | 'build'
  | 'shoot'
  | 'cannon'
  | 'hit'
  | 'enemyDeath'
  | 'error'
  | 'waveStart'
  | 'victory'
  | 'defeat';
