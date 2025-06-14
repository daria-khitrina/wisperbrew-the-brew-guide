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
    { step: 11, instruction: "Final Swirl", description: "Gently swirl for an even bed", duration: 5, totalWater: 250 },
    { step: 12, instruction: "Complete", description: "Remove filter and enjoy!", duration: 1, totalWater: 250 }
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
    { step: 11, instruction: "Final Swirl", description: "Gently swirl for an even bed", duration: 5, totalWater: 500 },
    { step: 12, instruction: "Complete", description: "Remove filter and enjoy!", duration: 1, totalWater: 500 }
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
  
  // Calculate actual time elapsed with drift correction
  const now = Date.now();
  const actualElapsed = Math.floor((now - stepStartTime) / 1000);
  const currentStep = currentRecipe[currentStepIndex];
  
  if (currentStep) {
    remainingTime = Math.max(0, currentStep.duration - actualElapsed);
    
    // Update timer display with drift-corrected time - target brewing screen specifically
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timerDisplay = document.getElementById('brewing-timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      console.log(`Timer updated: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      console.log('Timer display element not found in brewing screen');
    }
    
    // Calculate and update progress - target brewing screen specifically
    const stepProgress = ((currentStep.duration - remainingTime) / currentStep.duration) * 100;
    const completedSteps = currentStepIndex;
    const overallProgress = ((completedSteps / currentRecipe.length) + (stepProgress / 100 / currentRecipe.length)) * 100;
    updateProgress(Math.min(overallProgress, 100));
    
    console.log(`Step ${currentStepIndex + 1}/${currentRecipe.length}: ${remainingTime}s remaining, Progress: ${overallProgress.toFixed(1)}%`);
  }
  
  // Check if step is complete
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
  console.log(`Starting Step ${currentStep.step}/${currentRecipe.length}: ${currentStep.instruction}`);
  
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
  timerInterval = setInterval(updateTimer, 100); // Update every 100ms for smoother display
  
  // Initial timer update
  updateTimer();
}

function stepComplete() {
  console.log(`Step ${currentStepIndex + 1} complete`);
  
  // Stop timer
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Move to next step
  currentStepIndex++;
  
  // Auto-progress to next step after brief pause
  setTimeout(() => {
    nextStep();
  }, 800);
}

function brewingComplete() {
  console.log('Brewing complete! Total steps completed:', currentRecipe.length);
  
  // Stop any running timers
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Update final progress
  updateProgress(100);
  
  // Update complete screen timer display
  const completeTimerDisplay = document.getElementById('complete-timer-display');
  if (completeTimerDisplay) {
    completeTimerDisplay.textContent = 'Done';
  }
  
  // Show completion screen
  showScreen('complete');
  
  // Reset state after longer delay for completion appreciation
  // setTimeout(() => {
  //   resetBrewing();
  // }, 10000); // Auto-return to home after 10 seconds
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
  
  // Reset progress bar
  updateProgress(0);

  // Reset timer displays
  const homeTimer = document.getElementById('home-timer-display');
  if (homeTimer) homeTimer.textContent = '00:00';
  
  const brewingTimer = document.getElementById('brewing-timer-display');
  if (brewingTimer) brewingTimer.textContent = '--:--';
  
  const completeTimer = document.getElementById('complete-timer-display');
  if (completeTimer) completeTimer.textContent = 'Done';
  
  showScreen('home');
}

// Enhanced UI update functions
function updateProgress(percentage) {
  // Target progress bar in the currently active screen
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
    console.log(`Progress updated: ${clampedPercentage.toFixed(1)}%`);
  } else {
    console.log(`Progress bar not found in ${currentScreen} screen`);
  }
}

function displayStep(stepData) {
  console.log(`Displaying step: ${stepData.instruction} - ${stepData.description}`);
  
  // Update step instruction - target brewing screen specifically
  const stepInstruction = document.querySelector('#brewing-screen #step-instruction');
  if (stepInstruction) {
    stepInstruction.textContent = stepData.instruction;
  } else {
    console.log('Step instruction element not found');
  }
  
  // Update step description with action and volume info - target brewing screen specifically
  const stepDescription = document.querySelector('#brewing-screen #step-description');
  if (stepDescription) {
    let description = stepData.description;
    if (stepData.volume) {
      description += ` (${stepData.volume})`;
    }
    stepDescription.textContent = description;
  } else {
    console.log('Step description element not found');
  }
  
  // Update water amount display - target brewing screen specifically
  const waterAmount = document.querySelector('#brewing-screen #water-amount');
  if (waterAmount) {
    waterAmount.textContent = `${stepData.totalWater}ml`;
  } else {
    console.log('Water amount element not found');
  }
  
  // Update step counter - target brewing screen specifically
  const stepCounter = document.querySelector('#brewing-screen #step-counter');
  if (stepCounter) {
    stepCounter.textContent = `Step ${stepData.step} of ${currentRecipe.length}`;
  } else {
    console.log('Step counter element not found');
  }

  // Set initial timer display for the current step
  const timerDisplay = document.getElementById('brewing-timer-display');
  if (timerDisplay) {
    const minutes = Math.floor(stepData.duration / 60);
    const seconds = stepData.duration % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Initialize immediately when script loads
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
  // Enhanced debugging functions
  getCurrentStep: () => currentRecipe[currentStepIndex],
  getTimerState: () => ({ remainingTime, isTimerRunning, currentStepIndex }),
  getTotalProgress: () => (currentStepIndex / currentRecipe.length) * 100
};

console.log('WhisperBrew functions available globally:', Object.keys(window.WhisperBrew));

// Initialize home screen immediately
showScreen('home');
