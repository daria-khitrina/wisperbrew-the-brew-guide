// public/brewing-timer.js

import { showScreen, updateProgress, displayStep, showCountdown, hideCountdown } from './brewing-ui.js';

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
let audioJustResumed = false;

function ensureAudioContext() {
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
      audioJustResumed = true;
      console.info("[AudioCue] AudioContext resumed, state:", audioCtx.state);
    }).catch(err => {
      console.warn("[AudioCue] Failed to resume AudioContext:", err);
    });
  }
  if (audioCtx) {
    console.debug("[AudioCue] AudioContext state:", audioCtx.state);
  }
  return audioCtx;
}

function unlockAudioContextOnGesture() {
  const ctx = ensureAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      console.info("[AudioCue] AudioContext unlocked on user gesture.");
    });
  }
}

function playSoftAudioCue(type = "tick") {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') {
    console.warn("[AudioCue] Can't play cue: AudioContext not running!", ctx ? ctx.state : "no context");
    return;
  }
  console.log(`[AudioCue] Playing cue: ${type}`);

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  // Tuning for "tick" and "chime" -- boosted for audibility
  let freq, dur, vol, decay;

  if (type === "tick") {
    freq = 900;
    dur = 0.17;    // longer
    vol = 0.35;    // louder for debugging
    decay = 0.13;
  } else if (type === "chime") {
    freq = 1200;
    dur = 0.36;    // longer
    vol = 0.4;     // louder
    decay = 0.25;
  } else {
    // fallback
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

  // Envelope fade
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

export function startCountdown(cupSize) {
  unlockAudioContextOnGesture(); // Unlock context ASAP!
  
  // Store cup size for after countdown
  window.__BREWING_CUP_SIZE__ = cupSize;
  
  // Properly show countdown screen (this will hide other screens)
  showScreen("countdown");
  
  // Wait for screen transition to complete before showing first countdown number
  setTimeout(() => {
    showCountdown(3);
  }, 350); // Wait slightly longer than the 300ms screen transition
  
  let count = 3;
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      showCountdown(count);
    } else {
      clearInterval(countdownInterval);
      hideCountdown();
      // Start actual brewing after countdown
      startBrewingAfterCountdown(window.__BREWING_CUP_SIZE__);
    }
  }, 1000);
}

function startBrewingAfterCountdown(cupSize) {
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

export function startBrewing(cupSize) {
  // This function now just calls startCountdown
  startCountdown(cupSize);
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
  startCountdown,
  updateTimer,
  nextStep,
  resetBrewing,
  getCurrentStep,
  getTimerState,
  getTotalProgress
};

// NOTE: files that include this module MUST call unlockAudioContextOnGesture (directly or indirectly) on some user gesture to allow sounds to play per browser policy.
