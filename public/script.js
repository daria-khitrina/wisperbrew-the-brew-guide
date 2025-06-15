
// public/script.js

// Top-level stand-alone loader for modules. Uses type="module".
// Make sure these 3 scripts are loaded before this one in index.html:
//   - brewing-recipes.js
//   - brewing-ui.js
//   - brewing-timer.js

import "./brewing-recipes.js";
import { showScreen, updateProgress, displayStep } from "./brewing-ui.js";
import {
  startBrewing,
  updateTimer,
  nextStep,
  resetBrewing,
  getCurrentStep,
  getTimerState,
  getTotalProgress
} from "./brewing-timer.js";

// Export enhanced functions for external use and React integration
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
  getTotalProgress
};

// Initialization logs and kick-off
console.log(
  "WhisperBrew functions available globally:",
  Object.keys(window.WhisperBrew)
);

showScreen("home");
