// Tiny dependency-free sound effects synthesized via Web Audio API, so no
// audio asset files are needed. Lazily creates a single shared AudioContext
// (browsers require a user gesture before audio can play, which every call
// site here is — a click/tap/keypress).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, peakGain: number) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = audioCtx.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCorrectSound() {
  tone(880, 0, 0.12, "sine", 0.2);
  tone(1318.5, 0.1, 0.2, "sine", 0.2);
}

export function playWrongSound() {
  tone(220, 0, 0.22, "sawtooth", 0.15);
}
