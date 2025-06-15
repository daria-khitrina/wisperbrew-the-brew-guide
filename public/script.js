
// public/script.js

// Top-level stand-alone loader for modules. Uses type="module".
// Make sure these 3 scripts are loaded before this one in index.html:
//   - brewing-recipes.js
//   - brewing-ui.js
//   - brewing-timer.js

// --- Screen Wake Lock Support ---

let wakeLock = null;

export async function requestWakeLock() {
  if ('wakeLock' in navigator && navigator.wakeLock.request) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log("Wake lock active!");
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock was released');
      });
    } catch (err) {
      console.error("Wake lock failed:", err);
    }
  } else {
    console.warn("Wake Lock API not supported");
  }
}

export async function releaseWakeLock() {
  if (wakeLock && wakeLock.release) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (err) {
      console.error("Wake lock release failed:", err);
    }
  }
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
