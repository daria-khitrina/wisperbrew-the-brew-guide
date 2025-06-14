// Enhanced brewing recipe data with 11 detailed steps
const BREWING_RECIPES = {
  oneCup: [
    { step: 1, instruction: "☕ Pre-wet Filter", description: "Rinse paper filter with hot water", duration: 10, totalWater: 0, action: "Pre-wet filter", volume: null },
    { step: 2, instruction: "Add Coffee", description: "Add 15g ground coffee to filter", duration: 10, totalWater: 0, action: "Add coffee grounds", volume: null },
    { step: 3, instruction: "Bloom Pour", description: "Pour 30ml hot water in slow circular motion", duration: 30, totalWater: 30, action: "Pour to bloom", volume: "30ml" },
    { step: 4, instruction: "Bloom Rest", description: "Let coffee bloom and degas", duration: 15, totalWater: 30, action: "Wait for bloom", volume: null },
    { step: 5, instruction: "First Pour", description: "Pour water slowly to 100ml total", duration: 20, totalWater: 100, action: "Pour slowly", volume: "70ml" },
    { step: 6, instruction: "First Rest", description: "Let water drip through", duration: 10, totalWater: 100, action: "Let drip", volume: null },
    { step: 7, instruction: "Second Pour", description: "Pour water to 170ml total", duration: 20, totalWater: 170, action: "Pour in center", volume: "70ml" },
    { step: 8, instruction: "Second Rest", description: "Allow even extraction", duration: 10, totalWater: 170, action: "Wait for drip", volume: null },
    { step: 9, instruction: "Final Pour", description: "Pour remaining water to 250ml", duration: 20, totalWater: 250, action: "Final pour", volume: "80ml" },
    { step: 10, instruction: "Final Drip", description: "Let all water drip through", duration: 30, totalWater: 250, action: "Complete drip", volume: null },
    { step: 11, instruction: "Complete", description: "Remove filter and enjoy!", duration: 5, totalWater: 250, action: "Finish brewing", volume: null }
  ],
  twoCup: [
    { step: 1, instruction: "☕ Pre-wet Filter", description: "Rinse paper filter with hot water", duration: 10, totalWater: 0, action: "Pre-wet filter", volume: null },
    { step: 2, instruction: "Add Coffee", description: "Add 30g ground coffee to filter", duration: 10, totalWater: 0, action: "Add coffee grounds", volume: null },
    { step: 3, instruction: "Bloom Pour", description: "Pour 60ml hot water in slow circular motion", duration: 30, totalWater: 60, action: "Pour to bloom", volume: "60ml" },
    { step: 4, instruction: "Bloom Rest", description: "Let coffee bloom and degas", duration: 15, totalWater: 60, action: "Wait for bloom", volume: null },
    { step: 5, instruction: "First Pour", description: "Pour water slowly to 200ml total", duration: 25, totalWater: 200, action: "Pour slowly", volume: "140ml" },
    { step: 6, instruction: "First Rest", description: "Let water drip through", duration: 15, totalWater: 200, action: "Let drip", volume: null },
    { step: 7, instruction: "Second Pour", description: "Pour water to 340ml total", duration: 25, totalWater: 340, action: "Pour in center", volume: "140ml" },
    { step: 8, instruction: "Second Rest", description: "Allow even extraction", duration: 15, totalWater: 340, action: "Wait for drip", volume: null },
    { step: 9, instruction: "Final Pour", description: "Pour remaining water to 500ml", duration: 25, totalWater: 500, action: "Final pour", volume: "160ml" },
    { step: 10, instruction: "Final Drip", description: "Let all water drip through", duration: 45, totalWater: 500, action: "Complete drip", volume: null },
    { step: 11, instruction: "Complete", description: "Remove filter and enjoy!", duration: 5, totalWater: 500, action: "Finish brewing", volume: null }
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
    const timerDisplay = document.querySelector('#brewing-screen .timer-display');
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
  const completeTimerDisplay = document.querySelector('#complete-screen .timer-display');
  if (completeTimerDisplay) {
    completeTimerDisplay.textContent = 'Done';
  }
  
  // Show completion screen
  showScreen('complete');
  
  // Reset state after longer delay for completion appreciation
  setTimeout(() => {
    resetBrewing();
  }, 10000); // Auto-return to home after 10 seconds
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
