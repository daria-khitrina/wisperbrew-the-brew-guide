
// public/brewing-timer.js

import { showScreen, updateProgress, displayStep } from './brewing-ui.js';
import { oneCup, twoCup } from './brewing-recipes.js';

let currentRecipe = [];
let currentStepIndex = 0;
let timerInterval = null;
let remainingTime = 0;
let totalTime = 0;
let isTimerRunning = false;
let currentScreen = 'home';
let stepStartTime = 0;
let expectedEndTime = 0;

export function startBrewing(cupSize) {
  currentRecipe =
    cupSize === "1-cup"
      ? oneCup
      : twoCup;
  currentStepIndex = 0;
  totalTime = currentRecipe.reduce((sum, step) => sum + step.duration, 0);

  showScreen("brewing");

  setTimeout(() => {
    nextStep();
  }, 500);
}

export function updateTimer() {
  if (!isTimerRunning || remainingTime <= 0) return;
  const now = Date.now();
  const actualElapsed = Math.floor((now - stepStartTime) / 1000);
  const currentStep = currentRecipe[currentStepIndex];
  if (currentStep) {
    remainingTime = Math.max(0, currentStep.duration - actualElapsed);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timerDisplay = document.getElementById("brewing-timer-display");
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      if (remainingTime <= 10) {
        console.log(
          `[Countdown] Brewing: ${minutes}:${seconds} | Step ${
            currentStepIndex + 1
          }`
        );
      }
    }
    const stepProgress =
      ((currentStep.duration - remainingTime) / currentStep.duration) * 100;
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
  stepStartTime = Date.now();
  expectedEndTime = stepStartTime + currentStep.duration * 1000;
  remainingTime = currentStep.duration;
  isTimerRunning = true;
  displayStep(currentStep, currentStepIndex, currentRecipe.length);

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 100);
  updateTimer();
}

function stepComplete() {
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentStepIndex++;
  setTimeout(() => {
    nextStep();
  }, 800);
}

function brewingComplete() {
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  updateProgress(100);
  const completeTimerDisplay = document.getElementById("complete-timer-display");
  if (completeTimerDisplay) completeTimerDisplay.textContent = "Done";
  showScreen("complete");
}

export function resetBrewing() {
  currentRecipe = [];
  currentStepIndex = 0;
  remainingTime = 0;
  totalTime = 0;
  isTimerRunning = false;
  stepStartTime = 0;
  expectedEndTime = 0;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  updateProgress(0);
  const homeTimer = document.getElementById("home-timer-display");
  if (homeTimer) homeTimer.textContent = "00:00";
  const brewingTimer = document.getElementById("brewing-timer-display");
  if (brewingTimer) brewingTimer.textContent = "--:--";
  const completeTimer = document.getElementById("complete-timer-display");
  if (completeTimer) completeTimer.textContent = "Done";
  showScreen("home");
}

export function getCurrentStep() {
  return currentRecipe[currentStepIndex];
}

export function getTimerState() {
  return { remainingTime, isTimerRunning, currentStepIndex };
}

export function getTotalProgress() {
  return (currentStepIndex / currentRecipe.length) * 100;
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

