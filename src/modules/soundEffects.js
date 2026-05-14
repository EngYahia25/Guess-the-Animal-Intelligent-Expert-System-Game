/**
 * Sound Effects Module
 * Generates procedural audio using the Web Audio API.
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  getContext() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.enabled = false;
      }
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  play(type) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      switch (type) {
        case 'click': this._playClick(ctx); break;
        case 'yes': this._playYes(ctx); break;
        case 'no': this._playNo(ctx); break;
        case 'correct': this._playCorrect(ctx); break;
        case 'wrong': this._playWrong(ctx); break;
        case 'start': this._playStart(ctx); break;
        case 'reveal': this._playReveal(ctx); break;
        case 'learn': this._playLearn(ctx); break;
        default: this._playClick(ctx);
      }
    } catch {
      // Silent fail
    }
  }

  _playClick(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.05);
  }

  _playYes(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }

  _playNo(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }

  _playCorrect(ctx) {
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
  }

  _playWrong(ctx) {
    [400, 350].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.2);
    });
  }

  _playStart(ctx) {
    [330, 440, 550, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  }

  _playReveal(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  }

  _playLearn(ctx) {
    [440, 550, 660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.25);
    });
  }

  // ── Background Music ─────────────────────────────────
  initBackgroundMusic() {
    if (this.bgAudio) return;
    this.bgAudio = new Audio('/background_music.mp3');
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.3; // 30% volume for background
  }

  playBackground() {
    if (!this.enabled) return;
    this.initBackgroundMusic();
    this.bgAudio.play().catch(() => {
      // Browsers often block auto-play until interaction
      console.log('Background music autoplay blocked. Waiting for interaction.');
    });
  }

  stopBackground() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playBackground();
    } else {
      this.stopBackground();
    }
    return this.enabled;
  }
}

const sfx = new SoundEffects();
export default sfx;
