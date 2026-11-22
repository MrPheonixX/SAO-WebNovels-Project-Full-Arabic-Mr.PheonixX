// A short, soft paper sound for turning a page. It is generated with the Web Audio
// API (filtered noise with a quick fade), so no audio file is needed.
let ctx: AudioContext | null = null;

export function playPageTurn(volume = 0.22): void {
  try {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const length = Math.floor(ctx.sampleRate * 0.24);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const attack = t < 0.06 ? t / 0.06 : 1;
      data[i] = (Math.random() * 2 - 1) * attack * Math.pow(1 - t, 2.4);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2400;
    band.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(band).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    /* no audio available: stay silent */
  }
}
