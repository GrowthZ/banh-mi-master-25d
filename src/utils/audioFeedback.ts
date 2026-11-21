/**
 * Web Audio API synthesizer for instant game feedback and cheerful background music (BGM).
 * Pure browser audio synthesis without external media asset dependencies.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let bgmEnabled = true;
let isBgmRunning = false;
let bgmTimerId: number | null = null;
let bgmStep = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      // @ts-expect-error fallback for legacy webkit browsers
      window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function toggleBgm(): boolean {
  bgmEnabled = !bgmEnabled;
  if (!bgmEnabled) {
    stopCheerfulBgm();
  } else {
    startCheerfulBgm();
  }
  return bgmEnabled;
}

export function isBgmEnabled(): boolean {
  return bgmEnabled;
}

export function setBgmEnabled(enabled: boolean) {
  bgmEnabled = enabled;
  if (!bgmEnabled) {
    stopCheerfulBgm();
  }
}

/** Short crisp pop when adding or removing ingredient */
export function playIngredientPop(isAdding: boolean = true) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const startFreq = isAdding ? 420 : 560;
  const endFreq = isAdding ? 680 : 340;

  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/** Chime when bread reaches optimal crispy level */
export function playCrispyBell() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    gain.gain.setValueAtTime(0.15, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.05);
    osc.stop(now + 0.35);
  });
}

/** Sizzle/warning sound when bread is getting burnt */
export function playBurntSizzle() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.25);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

/** Joyful fanfare/chime when order delivered successfully, pitch scales with combo */
export function playOrderSuccess(combo: number) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const baseFreq = Math.min(523.25 + (combo - 1) * 35, 880);
  const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const noteTime = now + idx * 0.07;
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.15, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.28);
  });
}

/** Error / buzz when delivery fails or customer walks out */
export function playOrderError() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.22);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

/** Quick swoosh / reset sound */
export function playResetSwoosh() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

/* =========================================================================
   CHEERFUL BACKGROUND MUSIC (BGM) SYNTHESIZER
   Upbeat Vietnamese street-cart pentatonic / folk-pop loop
   ========================================================================= */

// Cheerful pentatonic melody notes (Hz)
const A4 = 440.0;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880.0;

// Bassline notes
const C3 = 130.81;
const A2 = 110.0;
const F2 = 87.31;
const G2 = 98.0;

const MELODY_SEQUENCE = [
  // Measure 1
  E5, G5, A5, G5, E5, D5, C5, D5,
  // Measure 2
  E5, E5, G5, E5, D5, C5, A4, C5,
  // Measure 3
  G5, A5, C5 * 2, A5, G5, E5, G5, A5,
  // Measure 4
  C5 * 2, A5, G5, E5, D5, E5, D5, C5,
];

const BASS_SEQUENCE = [
  C3, C3, G2, G2, A2, A2, F2, G2,
  C3, C3, G2, G2, A2, A2, F2, G2,
  A2, A2, F2, F2, C3, C3, G2, G2,
  F2, F2, G2, G2, C3, G2, C3, C3,
];

function playBgmBeat(ctx: AudioContext) {
  if (!isBgmRunning || !bgmEnabled) return;

  const now = ctx.currentTime;
  const noteDuration = 0.17; // ~175 bpm upbeat groove

  // 1. Play Lead Melody Note
  const melodyFreq = MELODY_SEQUENCE[bgmStep % MELODY_SEQUENCE.length];
  if (melodyFreq) {
    const leadOsc = ctx.createOscillator();
    const leadGain = ctx.createGain();

    leadOsc.type = 'triangle';
    leadOsc.frequency.setValueAtTime(melodyFreq, now);

    // Warm soft plucky envelope
    leadGain.gain.setValueAtTime(0.045, now);
    leadGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 0.9);

    leadOsc.connect(leadGain);
    leadGain.connect(ctx.destination);

    leadOsc.start(now);
    leadOsc.stop(now + noteDuration * 0.9);
  }

  // 2. Play Bassline Note
  const bassFreq = BASS_SEQUENCE[bgmStep % BASS_SEQUENCE.length];
  if (bassFreq) {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq, now);

    bassGain.gain.setValueAtTime(0.055, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 0.85);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);

    bassOsc.start(now);
    bassOsc.stop(now + noteDuration * 0.85);
  }

  // 3. Light rhythmic percussion (woodblock / shaker click on upbeat)
  if (bgmStep % 2 === 1) {
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();

    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(980, now);
    clickOsc.frequency.exponentialRampToValueAtTime(240, now + 0.025);

    clickGain.gain.setValueAtTime(0.015, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.025);
  }

  bgmStep = (bgmStep + 1) % (MELODY_SEQUENCE.length * 2);
}

export function startCheerfulBgm() {
  if (isBgmRunning) return;
  if (!bgmEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  isBgmRunning = true;
  bgmStep = 0;

  // Schedule loop every 175ms
  bgmTimerId = window.setInterval(() => {
    if (!isBgmRunning || !bgmEnabled) {
      stopCheerfulBgm();
      return;
    }
    playBgmBeat(ctx);
  }, 175);
}

export function stopCheerfulBgm() {
  isBgmRunning = false;
  if (bgmTimerId !== null) {
    window.clearInterval(bgmTimerId);
    bgmTimerId = null;
  }
}

export function isBgmPlaying(): boolean {
  return isBgmRunning && bgmEnabled;
}
