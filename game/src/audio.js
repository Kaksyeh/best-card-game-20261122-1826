// Synthesized WebAudio sounds only — no audio files. One job: make noise.
export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
    if (this.muted) return;
    const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  deal() { this.tone(520, 0.07, 'triangle', 0.08); }
  play() { this.tone(330, 0.09, 'square', 0.07); this.tone(495, 0.1, 'square', 0.06, 0.05); }
  hit() { this.tone(140, 0.22, 'sawtooth', 0.14); this.tone(70, 0.25, 'sine', 0.16); }
  block() { this.tone(880, 0.12, 'triangle', 0.1); this.tone(1320, 0.14, 'triangle', 0.07, 0.04); }
  heal() { this.tone(523, 0.14, 'sine', 0.09); this.tone(659, 0.16, 'sine', 0.09, 0.08); }
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.12, i * 0.12)); }
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.32, 'sawtooth', 0.09, i * 0.14)); }
  toggleMute() { this.muted = !this.muted; return this.muted; }
}
