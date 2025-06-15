// public/script.js

// Top-level stand-alone loader for modules. Uses type="module".
// Make sure these 3 scripts are loaded before this one in index.html:
//   - brewing-recipes.js
//   - brewing-ui.js
//   - brewing-timer.js

// --- Screen Wake Lock + Audio Fallback Support ---

let wakeLock = null;

// --- Audio fallback variables ---
let audioFallback = null;
let isAudioPlaying = false;

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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
  // On first play, must be triggered by user interaction (handled by brewing start button)
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

  // If mobile, and wake lock didn't work, use fallback!
  if (isMobile() && !wakeLockWorked) {
    startAudioFallback();
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
  // Always stop the audio fallback, if running
  stopAudioFallback();
}

// Expose core functions for React, but no more toast/wake lock state
window.WhisperBrew = {
  showScreen,
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
