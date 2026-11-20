class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.08,
    delay = 0,
    slideTo?: number
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(620, 0.06, 'square', 0.06, 0, 880);
  }

  public playStep(): void {
    this.playTone(240, 0.08, 'triangle', 0.1, 0, 320);
  }

  public playTurn(): void {
    this.playTone(420, 0.07, 'square', 0.05, 0, 520);
  }

  public playGatePrompt(): void {
    this.playTone(440, 0.09, 'square', 0.07, 0);
    this.playTone(587.33, 0.12, 'square', 0.07, 0.09);
  }

  public playCorrect(): void {
    this.playTone(523.25, 0.09, 'square', 0.08, 0);
    this.playTone(659.25, 0.09, 'square', 0.08, 0.09);
    this.playTone(783.99, 0.16, 'square', 0.09, 0.18);
  }

  public playWrong(): void {
    this.playTone(260, 0.14, 'sawtooth', 0.08, 0, 170);
    this.playTone(170, 0.22, 'sawtooth', 0.09, 0.14, 95);
  }

  public playVictory(): void {
    const notes = [
      { f: 523.25, d: 0.1, t: 0 },
      { f: 659.25, d: 0.1, t: 0.1 },
      { f: 783.99, d: 0.1, t: 0.2 },
      { f: 1046.5, d: 0.28, t: 0.3 },
      { f: 783.99, d: 0.1, t: 0.6 },
      { f: 1046.5, d: 0.35, t: 0.72 },
    ];
    notes.forEach((n) => this.playTone(n.f, n.d, 'square', 0.08, n.t));
  }
}

export const soundEngine = new SoundEngine();
