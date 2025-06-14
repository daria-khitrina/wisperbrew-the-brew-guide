
// Timer and step management for WhisperBrew
let currentRecipe = [];
let currentStepIndex = 0;
let timerInterval = null;
let remainingTime = 0;
let totalTime = 0;
let isTimerRunning = false;
let stepStartTime = 0;
let expectedEndTime = 0;

// Enhanced brewing logic with drift correction
function startBrewing(cupSize) {
  console.log(`Starting brewing for ${cupSize} cup(s)`);
  
  // Set the recipe based on cup size
  currentRecipe = cupSize === '1-cup' ? window.BREWING_RECIPES.oneCup : window.BREWING_RECIPES.twoCup;
  currentStepIndex = 0;

  // Debug: Confirm loaded recipe and step data
  console.log(
    'Selected Recipe steps:',
    currentRecipe.length,
    'First step:',
    currentRecipe[0]
  );
  
  // Calculate total time for all steps
  totalTime = currentRecipe.reduce((sum, step) => sum + step.duration, 0);
  console.log(`Total brewing time: ${totalTime} seconds`);
  
  // Show brewing screen
  window.WhisperBrewUI.showScreen('brewing');
  
  // Start first step
  setTimeout(() => {
    nextStep();
  }, 500);
}

// Enhanced timer with drift correction
function updateTimer() {
  if (!isTimerRunning || remainingTime <= 0) {
    return;
  }
  
  const now = Date.now();
  const actualElapsed = Math.floor((now - stepStartTime) / 1000);
  const currentStep = currentRecipe[currentStepIndex];
  
  if (currentStep) {
    remainingTime = Math.max(0, currentStep.duration - actualElapsed);
    
    // Update timer display for brewing screen
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timerDisplay = document.getElementById('brewing-timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      // Log countdown for dev check
      if (remainingTime <= 10) {
        console.log(`[Countdown] Brewing: ${minutes}:${seconds} | Step ${currentStepIndex+1}`);
      }
    }
    
    // Update progress bar
    const stepProgress = ((currentStep.duration - remainingTime) / currentStep.duration) * 100;
    const completedSteps = currentStepIndex;
    const overallProgress = ((completedSteps / currentRecipe.length) + (stepProgress / 100 / currentRecipe.length)) * 100;
    window.WhisperBrewUI.updateProgress(Math.min(overallProgress, 100));
  }
  
  if (remainingTime <= 0) {
    stepComplete();
  }
}

function nextStep() {
  if (currentStepIndex >= currentRecipe.length) {
    brewingComplete();
    return;
  }
  
  const currentStep = currentRecipe[currentStepIndex];
  // Debug: Log which step is being displayed
  console.log(
    `[nextStep] StepIndex: ${currentStepIndex} / ${currentRecipe.length}`,
    currentStep
  );
  
  // Set up drift correction timing
  stepStartTime = Date.now();
  expectedEndTime = stepStartTime + (currentStep.duration * 1000);
  remainingTime = currentStep.duration;
  isTimerRunning = true;
  
  // Display current step
  window.WhisperBrewUI.displayStep(currentStep);
  
  // Start high-precision timer interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(updateTimer, 100);
  
  updateTimer();
}

function stepComplete() {
  console.log(`Step ${currentStepIndex + 1} complete (of total ${currentRecipe.length})`);
  
  // Play soft audio tick for step completion
  window.WhisperBrewAudio.playTick(false);
  
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
  console.log('Brewing complete! Total steps completed:', currentRecipe.length);
  
  // Play completion audio tick
  window.WhisperBrewAudio.playTick(true);
  
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  window.WhisperBrewUI.updateProgress(100);

  const completeTimerDisplay = document.getElementById('complete-timer-display');
  if (completeTimerDisplay) {
    completeTimerDisplay.textContent = 'Done';
  }
  
  window.WhisperBrewUI.showScreen('complete');
}

function resetBrewing() {
  console.log('Resetting brewing state');
  
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
  
  window.WhisperBrewUI.updateProgress(0);

  const homeTimer = document.getElementById('home-timer-display');
  if (homeTimer) homeTimer.textContent = '00:00';
  
  const brewingTimer = document.getElementById('brewing-timer-display');
  if (brewingTimer) brewingTimer.textContent = '--:--';
  
  const completeTimer = document.getElementById('complete-timer-display');
  if (completeTimer) completeTimer.textContent = 'Done';
  
  window.WhisperBrewUI.showScreen('home');
}

// Export for use in other modules
window.WhisperBrewTimer = {
  startBrewing,
  updateTimer,
  nextStep,
  resetBrewing,
  getCurrentStep: () => currentRecipe[currentStepIndex],
  getCurrentRecipe: () => currentRecipe,
  getTimerState: () => ({ remainingTime, isTimerRunning, currentStepIndex }),
  getTotalProgress: () => (currentStepIndex / currentRecipe.length) * 100
};
