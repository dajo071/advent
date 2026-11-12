// Voliteľný tichý zvuk horiacej sviece. Vytvára sa priamo v prehliadači (Web Audio),
// nič sa nesťahuje. Predvolene je vypnutý a zapína sa iba vedomým kliknutím.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | undefined;

function noiseBuffer(c: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buf;
}

function crackle(c: AudioContext, out: AudioNode, white: AudioBuffer) {
  const src = c.createBufferSource();
  src.buffer = white;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200 + Math.random() * 3200;
  filter.Q.value = 1.5;
  const g = c.createGain();
  const now = c.currentTime;
  const peak = 0.03 + Math.random() * 0.09;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03 + Math.random() * 0.06);
  src.connect(filter).connect(g).connect(out);
  src.start(now, Math.random() * 0.5, 0.12);
}

export function isPlaying() {
  return ctx !== null;
}

export function startSound() {
  if (ctx) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const c = new AC();
  ctx = c;
  master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.gain.linearRampToValueAtTime(0.5, c.currentTime + 2);
  master.connect(c.destination);

  const hum = c.createBufferSource();
  hum.buffer = noiseBuffer(c, 4, true);
  hum.loop = true;
  const low = c.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 420;
  const humGain = c.createGain();
  humGain.gain.value = 0.22;
  hum.connect(low).connect(humGain).connect(master);
  hum.start();

  const white = noiseBuffer(c, 1, false);
  const loop = () => {
    if (!ctx || !master) return;
    const burst = Math.random() < 0.25 ? 3 : 1;
    for (let i = 0; i < burst; i++) window.setTimeout(() => ctx && master && crackle(ctx, master, white), i * 40);
    timer = window.setTimeout(loop, 250 + Math.random() * 1400);
  };
  loop();
}

export function stopSound() {
  if (!ctx || !master) return;
  const c = ctx;
  window.clearTimeout(timer);
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setTargetAtTime(0, c.currentTime, 0.25);
  ctx = null;
  master = null;
  window.setTimeout(() => void c.close(), 1200);
}
