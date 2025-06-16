
/**
 * audio-cues.js
 * All functions for managing beep and chime using chime.mp3 file
 */

let audioCtx = null;
let chimeAudio = null;

// Preload the chime audio file
function preloadChimeAudio() {
  if (!chimeAudio) {
    chimeAudio = new Audio('/chime.mp3');
    chimeAudio.preload = 'auto';
    chimeAudio.volume = 0.7;
    
    chimeAudio.addEventListener('error', (e) => {
      console.warn("[AudioCue] Failed to load chime.mp3:", e);
      chimeAudio = null;
    });
    
    chimeAudio.addEventListener('canplaythrough', () => {
      console.info("[AudioCue] chime.mp3 loaded successfully");
    });
  }
  return chimeAudio;
}

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
  
  // Also unlock HTML5 audio on user gesture
  const audio = preloadChimeAudio();
  if (audio) {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      console.info("[AudioCue] HTML5 Audio unlocked on user gesture.");
    }).catch(() => {
      // Silent fail - this is expected on first gesture
    });
  }
}

/**
 * Play chime.mp3 audio file
 */
function playChimeAudio() {
  const audio = preloadChimeAudio();
  if (!audio) {
    console.warn("[AudioCue] chime.mp3 not available, falling back to Web Audio API");
    return false;
  }
  
  try {
    audio.currentTime = 0;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.debug("[AudioCue] chime.mp3 played successfully");
      }).catch(error => {
        console.warn("[AudioCue] Failed to play chime.mp3:", error);
      });
    }
    return true;
  } catch (error) {
    console.warn("[AudioCue] Error playing chime.mp3:", error);
    return false;
  }
}

/**
 * Fallback Web Audio API sound (same as before)
 */
function playWebAudioFallback(type = "tick") {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') {
    console.warn("[AudioCue] Can't play fallback: AudioContext not running!", ctx ? ctx.state : "no context");
    return;
  }

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
    console.debug("[AudioCue] Fallback cue played and cleaned up.");
  };
}

/**
 * Play a soft audio cue for step and completion
 * @param {"tick" | "chime"} type
 */
export function playSoftAudioCue(type = "tick") {
  console.log(`[AudioCue] Playing cue: ${type}`);
  
  // Try to play chime.mp3 first
  const success = playChimeAudio();
  
  // If chime.mp3 fails, fallback to Web Audio API
  if (!success) {
    console.log(`[AudioCue] Falling back to Web Audio API for ${type}`);
    playWebAudioFallback(type);
  }
}

// Initialize audio on module load
preloadChimeAudio();
