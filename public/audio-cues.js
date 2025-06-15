
/**
 * audio-cues.js
 * All functions for managing beep and chime using Web Audio API
 */

let audioCtx = null;

export function ensureAudioContext() {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = null;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.info("[AudioCue] AudioContext created.");
    } catch (e) {
      console.warn("[AudioCue] Web Audio API not available.");
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().then(() => {
      console.info("[AudioCue] AudioContext resumed, state:", audioCtx.state);
    }).catch(err => {
      console.warn("[AudioCue] Failed to resume AudioContext:", err);
    });
  }
  return audioCtx;
}

export function unlockAudioContextOnGesture() {
  const ctx = ensureAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      console.info("[AudioCue] AudioContext unlocked on user gesture.");
    });
  }
}

/**
 * Play a soft audio cue for step and completion
 * @param {"tick" | "chime"} type
 */
export function playSoftAudioCue(type = "tick") {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') {
    console.warn("[AudioCue] Can't play cue: AudioContext not running!", ctx ? ctx.state : "no context");
    return;
  }
  console.log(`[AudioCue] Playing cue: ${type}`);

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  let freq, dur, vol, decay;

  if (type === "tick") {
    freq = 900;
    dur = 0.17;
    vol = 0.35;
    decay = 0.13;
  } else if (type === "chime") {
    freq = 1200;
    dur = 0.36;
    vol = 0.4;
    decay = 0.25;
  } else {
    freq = 900;
    dur = 0.17;
    vol = 0.35;
    decay = 0.13;
  }

  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = vol;

  o.connect(g);
  g.connect(ctx.destination);

  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur - decay);

  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + dur);

  o.onended = () => {
    o.disconnect();
    g.disconnect();
    console.debug("[AudioCue] Cue played and cleaned up.");
  };
}
