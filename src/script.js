// New 12-step brewing recipe data
const BREWING_RECIPES = {
  oneCup: [
    { step: 1, instruction: "☕ Pour to Bloom", description: "Pour 50ml of water (20%)", duration: 10, totalWater: 50 },
    { step: 2, instruction: "Gently Swirl", description: "Gently swirl the brewer", duration: 5, totalWater: 50 },
    { step: 3, instruction: "Wait for Bloom", description: "Let the coffee bloom and degas", duration: 30, totalWater: 50 },
    { step: 4, instruction: "Second Pour", description: "Pour water slowly to 100ml (40%)", duration: 15, totalWater: 100 },
    { step: 5, instruction: "Pause", description: "Let the water drip through", duration: 10, totalWater: 100 },
    { step: 6, instruction: "Third Pour", description: "Pour water to 150ml (60%)", duration: 10, totalWater: 150 },
    { step: 7, instruction: "Pause", description: "Allow for even extraction", duration: 10, totalWater: 150 },
    { step: 8, instruction: "Fourth Pour", description: "Pour water to 200ml (80%)", duration: 10, totalWater: 200 },
    { step: 9, instruction: "Pause", description: "Wait for the drip", duration: 10, totalWater: 200 },
    { step: 10, instruction: "Final Pour", description: "Pour remaining water to 250ml (100%)", duration: 10, totalWater: 250 },
    { step: 11, instruction: "2:00 - 2:05 Gently swirl", description: "Gently swirl for an even bed", duration: 5, totalWater: 250 },
  ],
  twoCup: [
    { step: 1, instruction: "☕ Pour to Bloom", description: "Pour 100ml of water (20%)", duration: 10, totalWater: 100 },
    { step: 2, instruction: "Gently Swirl", description: "Gently swirl the brewer", duration: 5, totalWater: 100 },
    { step: 3, instruction: "Wait for Bloom", description: "Let the coffee bloom and degas", duration: 30, totalWater: 100 },
    { step: 4, instruction: "Second Pour", description: "Pour water slowly to 200ml (40%)", duration: 15, totalWater: 200 },
    { step: 5, instruction: "Pause", description: "Let the water drip through", duration: 10, totalWater: 200 },
    { step: 6, instruction: "Third Pour", description: "Pour water to 300ml (60%)", duration: 10, totalWater: 300 },
    { step: 7, instruction: "Pause", description: "Allow for even extraction", duration: 10, totalWater: 300 },
    { step: 8, instruction: "Fourth Pour", description: "Pour water to 400ml (80%)", duration: 10, totalWater: 400 },
    { step: 9, instruction: "Pause", description: "Wait for the drip", duration: 10, totalWater: 400 },
    { step: 10, instruction: "Final Pour", description: "Pour remaining water to 500ml (100%)", duration: 10, totalWater: 500 },
    { step: 11, instruction: "2:00 - 2:05 Gently swirl", description: "Gently swirl for an even bed", duration: 5, totalWater: 500 },
  ]
};

// Enhanced global state with drift correction
let currentRecipe = [];
let currentStepIndex = 0;
let timerInterval = null;
let remainingTime = 0;
let totalTime = 0;
let isTimerRunning = false;
let currentScreen = 'home';
let stepStartTime = 0;
let expectedEndTime = 0;

// Add debug: Log recipes loaded when script starts
console.log(
  'WhisperBrew: Loaded Brew Recipes:',
  { oneCup: BREWING_RECIPES.oneCup.length, twoCup: BREWING_RECIPES.twoCup.length },
  BREWING_RECIPES.oneCup.slice(0,3),
  BREWING_RECIPES.twoCup.slice(0,3)
);

// Screen management functions
function showScreen(screenId) {
  console.log(`Switching to screen: ${screenId}`);
  
  // Hide all screens first
  const screens = ['home', 'brewing', 'complete'];
  screens.forEach(screen => {
    const element = document.getElementById(`${screen}-screen`);
    if (element) {
      element.style.display = 'none';
      element.classList.remove('fade-in');
      element.classList.add('fade-out');
    }
  });
  
  // Show target screen with animation
  setTimeout(() => {
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
      targetScreen.style.display = 'block';
      targetScreen.classList.remove('fade-out');
      targetScreen.classList.add('fade-in');
    }
    currentScreen = screenId;
  }, 300);
}

// Enhanced brewing logic with drift correction
function startBrewing(cupSize) {
  console.log(`Starting brewing for ${cupSize} cup(s)`);
  
  // Set the recipe based on cup size
  currentRecipe = cupSize === '1-cup' ? BREWING_RECIPES.oneCup : BREWING_RECIPES.twoCup;
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
  showScreen('brewing');
  
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
    updateProgress(Math.min(overallProgress, 100));
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
  displayStep(currentStep);
  
  // Start high-precision timer interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(updateTimer, 100);
  
  updateTimer();
}

function stepComplete() {
  console.log(`Step ${currentStepIndex + 1} complete (of total ${currentRecipe.length})`);
  
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
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  updateProgress(100);

  const completeTimerDisplay = document.getElementById('complete-timer-display');
  if (completeTimerDisplay) {
    completeTimerDisplay.textContent = 'Done';
  }
  
  showScreen('complete');
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
  
  updateProgress(0);

  const homeTimer = document.getElementById('home-timer-display');
  if (homeTimer) homeTimer.textContent = '00:00';
  
  const brewingTimer = document.getElementById('brewing-timer-display');
  if (brewingTimer) brewingTimer.textContent = '--:--';
  
  const completeTimer = document.getElementById('complete-timer-display');
  if (completeTimer) completeTimer.textContent = 'Done';
  
  showScreen('home');
}

function updateProgress(percentage) {
  let progressFill = null;
  
  if (currentScreen === 'brewing') {
    progressFill = document.querySelector('#brewing-screen .progress-fill');
  } else if (currentScreen === 'complete') {
    progressFill = document.querySelector('#complete-screen .progress-fill');
  } else {
    progressFill = document.querySelector('#home-screen .progress-fill');
  }
  
  if (progressFill) {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    progressFill.style.width = `${clampedPercentage}%`;
    // Log for debugging
    if (clampedPercentage > 0) {
      console.log(`Progress updated: ${clampedPercentage.toFixed(1)}%`);
    }
  }
}

function displayStep(stepData) {
  // Main action goes in <h2>, combining instruction + water amount (if applicable)
  let mainAction = '';

  if (
    stepData.instruction &&
    /pour/i.test(stepData.instruction) &&
    stepData.totalWater &&
    stepData.instruction.toLowerCase().includes('bloom')
  ) {
    // Special phrasing for bloom pour step
    mainAction = `Pour ${stepData.totalWater}ml of water to bloom`;
  } else if (
    stepData.instruction &&
    /pour/i.test(stepData.instruction) &&
    stepData.totalWater
  ) {
    // General pour
    mainAction = `Pour to ${stepData.totalWater}ml`;
  } else if (stepData.instruction) {
    // Other steps: just show the instruction (e.g. Pauses, Swirls, Complete)
    mainAction = stepData.instruction;
  }

  const stepInstruction = document.querySelector('#brewing-screen #step-instruction');
  if (stepInstruction && mainAction) {
    stepInstruction.textContent = mainAction;
  } else if (stepInstruction) {
    // fallback
    stepInstruction.textContent = stepData.instruction || '';
  }

  // The <p> no longer exists so don't set step-description

  const waterAmount = document.querySelector('#brewing-screen #water-amount');
  if (waterAmount) {
    waterAmount.textContent = `${stepData.totalWater}ml`;
  }

  const timerDisplay = document.getElementById('brewing-timer-display');
  if (timerDisplay) {
    const minutes = Math.floor(stepData.duration / 60);
    const seconds = stepData.duration % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // ... log statements unchanged
  console.log(
    `[displayStep] Main action: ${mainAction} | Step: ${stepData.step} of ${currentRecipe.length}`
  );
}

// Log immediately at script load
console.log('WhisperBrew Enhanced Timer System initializing...');

// Export enhanced functions for external use and React integration
window.WhisperBrew = {
  showScreen,
  startBrewing,
  updateTimer,
  nextStep,
  updateProgress,
  displayStep,
  resetBrewing,
  getCurrentStep: () => currentRecipe[currentStepIndex],
  getTimerState: () => ({ remainingTime, isTimerRunning, currentStepIndex }),
  getTotalProgress: () => (currentStepIndex / currentRecipe.length) * 100
};

console.log('WhisperBrew functions available globally:', Object.keys(window.WhisperBrew));

// Initialize home screen immediately
showScreen('home');
