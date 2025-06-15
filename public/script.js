// public/script.js

// Top-level stand-alone loader for modules. Uses type="module".
// Make sure these 3 scripts are loaded before this one in index.html:
//   - brewing-recipes.js
//   - brewing-ui.js
//   - brewing-timer.js

// --- Screen Wake Lock Support ---

let wakeLock = null;
let onWakeLockChange = typeof window !== "undefined" ? () => {} : undefined;

export async function requestWakeLock() {
  if ('wakeLock' in navigator && navigator.wakeLock.request) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log("Wake lock active!");
      if (onWakeLockChange) onWakeLockChange({ acquired: true, supported: true });
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock was released');
        if (onWakeLockChange) onWakeLockChange({ acquired: false, supported: true });
      });
    } catch (err) {
      console.error("Wake lock failed:", err);
      if (onWakeLockChange) onWakeLockChange({ acquired: false, supported: true, error: err });
    }
  } else {
    console.warn("Wake Lock API not supported");
    if (onWakeLockChange) onWakeLockChange({ acquired: false, supported: false });
  }
}

export async function releaseWakeLock() {
  if (wakeLock && wakeLock.release) {
    try {
      await wakeLock.release();
      wakeLock = null;
      if (onWakeLockChange) onWakeLockChange({ acquired: false, supported: true });
    } catch (err) {
      console.error("Wake lock release failed:", err);
    }
  }
}

// allow react to subscribe to wake lock changes
window.WhisperBrew = {
  showScreen,
  startBrewing,
  updateTimer,
  nextStep,
  updateProgress,
  displayStep,
  resetBrewing,
  getCurrentStep,
  getTimerState,
  getTotalProgress,
  requestWakeLock,
  releaseWakeLock,
};

window.setWhisperBrewOnWakeLockChange = fn => {
  onWakeLockChange = fn;
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

// Wrap brewing start/reset for wake lock control
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
