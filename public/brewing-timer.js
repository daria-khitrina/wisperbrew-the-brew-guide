// public/brewing-timer.js

import { showScreen, updateProgress, displayStep } from './brewing-ui.js';

let currentRecipe = [];
let currentStepIndex = 0;
let timerInterval = null;
let remainingTime = 0;
let totalTime = 0;
let isTimerRunning = false;
let currentScreen = 'home';
let stepStartTime = 0;
let expectedEndTime = 0;

// --- SOFT AUDIO CUE SYSTEM (Web Audio API) ---
let audioCtx = null;
function ensureAudioContext() {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = null;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not available.");
    }
  }
  // Resume if it was suspended (iOS, etc)
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playSoftAudioCue(type = "tick") {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  // Tuning for "tick" and "chime"
  let freq, dur, vol, decay;

  if (type === "tick") {
    freq = 900;
    dur = 0.11;
    vol = 0.15;
    decay = 0.1;
  } else if (type === "chime") {
    freq = 1200;
    dur = 0.27;
    vol = 0.19;
    decay = 0.19;
  } else {
    // fallback
    freq = 900;
    dur = 0.11;
    vol = 0.15;
    decay = 0.1;
  }

  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = vol;

  o.connect(g);
  g.connect(ctx.destination);

  // Envelope fade
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur - decay);

  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + dur);

  // Clean up after it finishes
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}

export function startBrewing(cupSize) {
  currentRecipe =
    cupSize === "1-cup"
      ? window.BREWING_RECIPES.oneCup
      : window.BREWING_RECIPES.twoCup;
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
  // Soft tick cue!
  playSoftAudioCue("tick");
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
  // Play brighter chime
  playSoftAudioCue("chime");
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
