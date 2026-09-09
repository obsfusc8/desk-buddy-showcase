/**
 * Sound synthesis engine for Desk Buddy v2.0
 * Simulates passive piezo buzzer driven by ESP32 LEDC PWM engine
 */

class PiezoSoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playTone(880, 0.08, 'square');
    }
    return this.isMuted;
  }

  public playTone(freq: number, durationSec: number = 0.08, type: OscillatorType = 'square', volume: number = 0.15) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationSec);
    } catch {
      // AudioContext blocked or not allowed yet
    }
  }

  /**
   * Startup jingle: 3-note pleasant ascending arpeggio (C5 -> E5 -> G5)
   */
  public playStartupJingle() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.1, 'square', 0.12);
      }, idx * 110);
    });
  }

  /**
   * Gesture confirmation beep (when holding 2s)
   */
  public playGestureConfirm() {
    this.playTone(1800, 0.07, 'square', 0.12);
  }

  /**
   * Next screen single-tap subtle click
   */
  public playTapClick() {
    this.playTone(950, 0.03, 'triangle', 0.08);
  }

  /**
   * Double tap chirp
   */
  public playDoubleTapChirp() {
    this.playTone(1200, 0.04, 'square', 0.1);
    setTimeout(() => {
      this.playTone(1600, 0.05, 'square', 0.1);
    }, 60);
  }

  /**
   * Menu open hold 5s jingle
   */
  public playMenuOpen() {
    this.playTone(440, 0.08, 'square');
    setTimeout(() => this.playTone(660, 0.08, 'square'), 90);
    setTimeout(() => this.playTone(880, 0.14, 'square'), 180);
  }

  /**
   * Alarm tone (escalating)
   */
  public playAlarmTone() {
    this.playTone(2200, 0.12, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(2800, 0.12, 'sawtooth', 0.2), 140);
  }

  /**
   * Pet purring sound (harmonic warm buzz)
   */
  public playPetPurr() {
    const tones = [220, 246, 261, 330];
    tones.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 0.08, 'triangle', 0.14);
      }, i * 70);
    });
  }

  /**
   * Game jump sound
   */
  public playJumpSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  /**
   * Game hit / Game Over
   */
  public playHitSound() {
    this.playTone(180, 0.25, 'sawtooth', 0.2);
  }

  /**
   * Reaction test ready ding
   */
  public playReactionReady() {
    this.playTone(1400, 0.15, 'sine', 0.2);
  }

  /**
   * Dice roll shuffle clicks
   */
  public playDiceRoll() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(400 + Math.random() * 500, 0.03, 'square', 0.08);
      }, i * 50);
    }
  }

  /**
   * Hourly chime
   */
  public playHourlyChime() {
    this.playTone(880, 0.3, 'sine', 0.15);
    setTimeout(() => this.playTone(1320, 0.5, 'sine', 0.18), 320);
  }
}

export const soundEngine = new PiezoSoundEngine();
