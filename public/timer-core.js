/**
 * timer-core.js
 * Main timer orchestrator: imports state, audio, UI, and handles timer logic
 */

import { showScreen, updateProgress, displayStep, showCountdown, hideCountdown } from './brewing-ui.js';
import {
  currentRecipe, currentStepIndex, timerInterval, remainingTime, totalTime, isTimerRunning, stepStartTime, expectedEndTime,
  setRecipe, setStepIndex, setTimerInterval, setRemainingTime, setTotalTime, setIsTimerRunning, setStepStartTime, setExpectedEndTime,
  getCurrentStep, getTimerState, getTotalProgress
} from './timer-state.js';
import { unlockAudioContextOnGesture, playSoftAudioCue } from './audio-cues.js';

// Exports for external (script.js) consumption:
export { getCurrentStep, getTimerState, getTotalProgress };

export function startBrewing(cupSize) {
  unlockAudioContextOnGesture();

  let recipe =
    cupSize === "1-cup"
      ? window.BREWING_RECIPES.oneCup
      : window.BREWING_RECIPES.twoCup;
  setRecipe(recipe);
  setStepIndex(0);

  let theTotalTime = recipe.reduce((sum, step) => sum + step.duration, 0);
  setTotalTime(theTotalTime);

  showScreen("brewing");

  // Start countdown before brewing
  setTimeout(() => {
    startCountdown();
  }, 500);
}

function startCountdown() {
  let countdownValue = 3;
  
  function displayCountdownNumber() {
    if (countdownValue > 0) {
      showCountdown(countdownValue);
      countdownValue--;
      setTimeout(displayCountdownNumber, 1000);
    } else {
      // Hide countdown and start brewing
      hideCountdown();
      setTimeout(() => {
        nextStep();
      }, 300);
    }
  }
  
  displayCountdownNumber();
}

export function updateTimer() {
  if (!isTimerRunning || remainingTime <= 0) return;
  const now = Date.now();
  const actualElapsed = Math.floor((now - stepStartTime) / 1000);
  const currentStep = currentRecipe[currentStepIndex];
  if (currentStep) {
    const newRemaining = Math.max(0, currentStep.duration - actualElapsed);
    setRemainingTime(newRemaining);

    const minutes = Math.floor(newRemaining / 60);
    const seconds = newRemaining % 60;
    const timerDisplay = document.getElementById("brewing-timer-display");
    if (timerDisplay) {
      timerDisplay.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      if (newRemaining <= 10) {
        console.log(
          `[Countdown] Brewing: ${minutes}:${seconds} | Step ${currentStepIndex + 1}`
        );
      }
    }
    const stepProgress =
      ((currentStep.duration - newRemaining) / currentStep.duration) * 100;
    const completedSteps = currentStepIndex;
    const overallProgress =
      ((completedSteps / currentRecipe.length) +
        stepProgress / 100 / currentRecipe.length) *
      100;
    updateProgress(Math.min(overallProgress, 100));
  }
  if (remainingTime <= 0) {
    stepComplete();
  }
}

export function nextStep() {
  if (currentStepIndex >= currentRecipe.length) {
    brewingComplete();
    return;
  }
  const currentStep = currentRecipe[currentStepIndex];
  const now = Date.now();
  setStepStartTime(now);
  setExpectedEndTime(now + currentStep.duration * 1000);
  setRemainingTime(currentStep.duration);
  setIsTimerRunning(true);

  displayStep(currentStep, currentStepIndex, currentRecipe.length);

  if (timerInterval) clearInterval(timerInterval);
  const interval = setInterval(updateTimer, 100);
  setTimerInterval(interval);
  updateTimer();
}

function stepComplete() {
  setIsTimerRunning(false);
  if (timerInterval) {
    clearInterval(timerInterval);
    setTimerInterval(null);
  }
  playSoftAudioCue("tick");
  setStepIndex(currentStepIndex + 1);
  setTimeout(() => {
    nextStep();
  }, 800);
}

function brewingComplete() {
  setIsTimerRunning(false);
  if (timerInterval) {
    clearInterval(timerInterval);
    setTimerInterval(null);
  }
  updateProgress(100);
  const completeTimerDisplay = document.getElementById("complete-timer-display");
  if (completeTimerDisplay) completeTimerDisplay.textContent = "Done";
  playSoftAudioCue("chime");
  showScreen("complete");
}

export function resetBrewing() {
  setRecipe([]);
  setStepIndex(0);
  setRemainingTime(0);
  setTotalTime(0);
  setIsTimerRunning(false);
  setStepStartTime(0);
  setExpectedEndTime(0);
  if (timerInterval) {
    clearInterval(timerInterval);
    setTimerInterval(null);
  }
  updateProgress(0);
  const homeTimer = document.getElementById("home-timer-display");
  if (homeTimer) homeTimer.textContent = "00:00";
  const brewingTimer = document.getElementById("brewing-timer-display");
  if (brewingTimer) brewingTimer.textContent = "--:--";
  const completeTimer = document.getElementById("complete-timer-display");
  if (completeTimer) completeTimer.textContent = "Done";
  hideCountdown();
  showScreen("home");
}

// Attach methods for non-module consumers if needed
window.__BREWING_TIMER_INTERNAL__ = {
  startBrewing,
  updateTimer,
  nextStep,
  resetBrewing,
  getCurrentStep,
  getTimerState,
  getTotalProgress
};
