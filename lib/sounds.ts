let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  return ctx;
}

function play(freq: number, type: OscillatorType, ms: number, vol = 0.08) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + ms / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + ms / 1000);
}

export function playLike() { play(800, 'sine', 50); }
export function playBookmark() { play(400, 'square', 30, 0.04); }
export function playShare() { play(600, 'triangle', 40, 0.06); }
export function playTab() { play(300, 'sine', 25, 0.03); }
