// public/script.js

// Top-level stand-alone loader for modules. Uses type="module".
// Make sure these 3 scripts are loaded before this one in index.html:
//   - brewing-recipes.js
//   - brewing-ui.js
//   - brewing-timer.js

// --- Screen Wake Lock + Audio Fallback Support ---

let wakeLock = null;

// --- Enhanced Wake Lock/NoSleep/Vibration System ---

let noSleepInstance = null;
let noSleepActive = false;
let vibrationInterval = null;

// Helper: Dynamically load NoSleep.js from CDN
function loadNoSleepIfNeeded() {
  return new Promise((resolve, reject) => {
    if (window.NoSleep) return resolve(window.NoSleep);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/nosleep.js@0.12.0/dist/NoSleep.min.js";
    script.onload = () => resolve(window.NoSleep);
    script.onerror = () => reject("NoSleep.js failed to load");
    document.head.appendChild(script);
  });
}

// Enable NoSleep fallback (hidden video keepalive)
async function startNoSleepFallback() {
  try {
    await loadNoSleepIfNeeded();
    if (!noSleepInstance && window.NoSleep) {
      noSleepInstance = new window.NoSleep();
    }
    if (noSleepInstance && !noSleepActive) {
      noSleepInstance.enable();
      noSleepActive = true;
      console.log("NoSleep.js fallback enabled.");
    }
  } catch (e) {
    console.warn("[WakeLock] NoSleep.js fallback failed:", e);
  }
}

function stopNoSleepFallback() {
  if (noSleepInstance && noSleepActive) {
    try {
      noSleepInstance.disable();
      console.log("NoSleep.js fallback disabled.");
    } catch {}
    noSleepActive = false;
  }
}

// Enable subtle vibration pulse as additional fallback
function startVibrationFallback() {
  if (
    navigator.vibrate &&
    typeof navigator.vibrate === "function" &&
    !vibrationInterval
  ) {
    vibrationInterval = setInterval(() => {
      // Pulse for 20ms every 24 seconds (does not annoy user, but registers activity)
      navigator.vibrate(20);
      console.log("[WakeLock] Vibrate pulse sent.");
    }, 24000);
    console.log("Vibration fallback enabled.");
  }
}
function stopVibrationFallback() {
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
    // Try to stop vibration just in case (no harm)
    navigator.vibrate(0);
    console.log("Vibration fallback disabled.");
  }
}

// --- Audio fallback variables ---
let audioFallback = null;
let isAudioPlaying = false;

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

// Creates (if needed) and plays a silent audio loop to keep device awake
function startAudioFallback() {
  if (!audioFallback) {
    audioFallback = document.createElement("audio");
    audioFallback.src = "/silent-loop.mp3";
    audioFallback.loop = true;
    audioFallback.volume = 0; // truly silent
    audioFallback.setAttribute("playsinline", ""); // for iOS
    audioFallback.setAttribute("preload", "auto");
    document.body.appendChild(audioFallback);
  }
  audioFallback.play().then(() => {
    isAudioPlaying = true;
    console.log("Audio fallback started to keep device awake.");
  }).catch((e) => {
    // ignore if blocked by browser, will try again next time user interacts
    console.warn("Audio fallback failed to play:", e);
  });
}

// Stops and removes the silent audio loop
function stopAudioFallback() {
  if (audioFallback) {
    audioFallback.pause();
    audioFallback.currentTime = 0;
    try {
      document.body.removeChild(audioFallback);
    } catch {}
    audioFallback = null;
    isAudioPlaying = false;
    console.log("Audio fallback stopped.");
  }
}

export async function requestWakeLock() {
  let wakeLockWorked = false;
  if ('wakeLock' in navigator && navigator.wakeLock.request) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log("Wake lock active!");
      wakeLockWorked = true;
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock was released');
      });
    } catch (err) {
      console.error("Wake lock failed:", err);
    }
  } else {
    console.warn("Wake Lock API not supported");
  }

  // If mobile, and wake lock didn't work, use fallback(s)!
  if (isMobile() && !wakeLockWorked) {
    // 1. Try NoSleep.js, which works well on Android webviews and Chrome
    await startNoSleepFallback();
    // 2. Try audio fallback
    startAudioFallback();
    // 3. Try vibration fallback (Android only, supported devices)
    if (isAndroid()) {
      startVibrationFallback();
    }
  }
}

export async function releaseWakeLock() {
  // Release native Wake Lock
  if (wakeLock && wakeLock.release) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (err) {
      console.error("Wake lock release failed:", err);
    }
  }
  // Always stop all fallbacks, if running
  stopAudioFallback();
  stopNoSleepFallback();
  stopVibrationFallback();
}

// Expose core functions for React, but no more toast/wake lock state
window.WhisperBrew = {
  showScreen,
  startCountdown,
  // Do NOT include startBrewing or resetBrewing directly here!
  updateTimer,
  nextStep,
  updateProgress,
  displayStep,
  getCurrentStep,
  getTimerState,
  getTotalProgress,
  requestWakeLock,
  releaseWakeLock,
};

//
// --- Brew timer integration ---
// On brewing start, acquire; on complete/reset, release
import "./brewing-recipes.js";
import { showScreen, updateProgress, displayStep } from "./brewing-ui.js";
import {
  startBrewing as oldStartBrewing,
  startCountdown,
  updateTimer,
  nextStep,
  resetBrewing as oldResetBrewing,
  getCurrentStep,
  getTimerState,
  getTotalProgress
} from "./brewing-timer.js";

// Wrap brewing start/reset for wake lock control and assign to WhisperBrew
window.WhisperBrew.startBrewing = function (cupSize) {
  requestWakeLock();
  oldStartBrewing(cupSize);
}
window.WhisperBrew.resetBrewing = function () {
  releaseWakeLock();
  oldResetBrewing();
}

console.log(
  "WhisperBrew functions available globally:",
  Object.keys(window.WhisperBrew)
);

showScreen("home");

// Removed:
//   - All React callback notification code for wake lock state
//   - window.setWhisperBrewOnWakeLockChange
