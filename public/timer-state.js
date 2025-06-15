
/**
 * timer-state.js
 * All state variables and getters for brewing timer
 */

export let currentRecipe = [];
export let currentStepIndex = 0;
export let timerInterval = null;
export let remainingTime = 0;
export let totalTime = 0;
export let isTimerRunning = false;
export let stepStartTime = 0;
export let expectedEndTime = 0;

// re-exporting for external updates
export function setRecipe(recipeArr) {
  currentRecipe = recipeArr;
}
export function setStepIndex(idx) {
  currentStepIndex = idx;
}
export function setTimerInterval(interval) {
  timerInterval = interval;
}
export function setRemainingTime(sec) {
  remainingTime = sec;
}
export function setTotalTime(sec) {
  totalTime = sec;
}
export function setIsTimerRunning(b) {
  isTimerRunning = b;
}
export function setStepStartTime(ts) {
  stepStartTime = ts;
}
export function setExpectedEndTime(ts) {
  expectedEndTime = ts;
}

// Getters
export function getCurrentStep() {
  return currentRecipe[currentStepIndex];
}
export function getTimerState() {
  return { remainingTime, isTimerRunning, currentStepIndex };
}
export function getTotalProgress() {
  return (currentStepIndex / currentRecipe.length) * 100;
}
