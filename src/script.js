
// Brewing recipe data
const BREWING_RECIPES = {
  oneCup: [
    { step: 1, instruction: "☕ Bloom", description: "Pour 30ml hot water in circular motion", duration: 30, totalWater: 30 },
    { step: 2, instruction: "First Pour", description: "Pour water to 100ml total", duration: 30, totalWater: 100 },
    { step: 3, instruction: "Second Pour", description: "Pour water to 170ml total", duration: 30, totalWater: 170 },
    { step: 4, instruction: "Final Pour", description: "Pour water to 250ml total", duration: 30, totalWater: 250 },
    { step: 5, instruction: "Finish", description: "Let coffee drip completely", duration: 60, totalWater: 250 }
  ],
  twoCup: [
    { step: 1, instruction: "☕ Bloom", description: "Pour 60ml hot water in circular motion", duration: 30, totalWater: 60 },
    { step: 2, instruction: "First Pour", description: "Pour water to 200ml total", duration: 30, totalWater: 200 },
    { step: 3, instruction: "Second Pour", description: "Pour water to 340ml total", duration: 30, totalWater: 340 },
    { step: 4, instruction: "Final Pour", description: "Pour water to 500ml total", duration: 30, totalWater: 500 },
    { step: 5, instruction: "Finish", description: "Let coffee drip completely", duration: 60, totalWater: 500 }
  ]
};

// Global state
let currentRecipe = [];
let currentStepIndex = 0;
let timerInterval = null;
let remainingTime = 0;
let totalTime = 0;
let isTimerRunning = false;
let currentScreen = 'home';

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

// Brewing logic functions
function startBrewing(cupSize) {
  console.log(`Starting brewing for ${cupSize} cup(s)`);
  
  // Set the recipe based on cup size
  currentRecipe = cupSize === '1-cup' ? BREWING_RECIPES.oneCup : BREWING_RECIPES.twoCup;
  currentStepIndex = 0;
  
  // Calculate total time
  totalTime = currentRecipe.reduce((sum, step) => sum + step.duration, 0);
  
  // Show brewing screen
  showScreen('brewing');
  
  // Start first step
  setTimeout(() => {
    nextStep();
  }, 500);
}

function updateTimer() {
  if (!isTimerRunning || remainingTime <= 0) {
    return;
  }
  
  remainingTime--;
  
  // Update timer display
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const timerDisplay = document.querySelector('.timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Update progress
  const currentStep = currentRecipe[currentStepIndex];
  if (currentStep) {
    const stepProgress = ((currentStep.duration - remainingTime) / currentStep.duration) * 100;
    const overallProgress = ((currentStepIndex / currentRecipe.length) + (stepProgress / 100 / currentRecipe.length)) * 100;
    updateProgress(Math.min(overallProgress, 100));
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
  console.log(`Step ${currentStep.step}: ${currentStep.instruction}`);
  
  // Display current step
  displayStep(currentStep);
  
  // Set timer for this step
  remainingTime = currentStep.duration;
  isTimerRunning = true;
  
  // Start timer interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(updateTimer, 1000);
  
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
  }, 1000);
}

function brewingComplete() {
  console.log('Brewing complete!');
  
  // Stop any running timers
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Show completion screen
  showScreen('complete');
  
  // Reset state
  setTimeout(() => {
    resetBrewing();
  }, 5000); // Auto-return to home after 5 seconds
}

function resetBrewing() {
  currentRecipe = [];
  currentStepIndex = 0;
  remainingTime = 0;
  totalTime = 0;
  isTimerRunning = false;
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  showScreen('home');
}

// UI update functions
function updateProgress(percentage) {
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
  }
  console.log(`Progress updated: ${percentage.toFixed(1)}%`);
}

function displayStep(stepData) {
  console.log(`Displaying step: ${stepData.instruction} - ${stepData.description}`);
  
  // Update step instruction
  const stepInstruction = document.getElementById('step-instruction');
  if (stepInstruction) {
    stepInstruction.textContent = stepData.instruction;
  }
  
  // Update step description
  const stepDescription = document.getElementById('step-description');
  if (stepDescription) {
    stepDescription.textContent = stepData.description;
  }
  
  // Update water amount if element exists
  const waterAmount = document.getElementById('water-amount');
  if (waterAmount) {
    waterAmount.textContent = `${stepData.totalWater}ml`;
  }
  
  // Update step counter
  const stepCounter = document.getElementById('step-counter');
  if (stepCounter) {
    stepCounter.textContent = `Step ${stepData.step} of ${currentRecipe.length}`;
  }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('WhisperBrew initialized');
  
  // Add event listeners for cup size buttons
  const oneCupBtn = document.querySelector('.btn-primary');
  const twoCupBtn = document.querySelector('.btn-secondary');
  
  if (oneCupBtn) {
    oneCupBtn.addEventListener('click', () => startBrewing('1-cup'));
  }
  
  if (twoCupBtn) {
    twoCupBtn.addEventListener('click', () => startBrewing('2-cup'));
  }
  
  // Add reset button functionality
  document.addEventListener('click', function(e) {
    if (e.target.matches('.reset-btn') || e.target.matches('[data-action="reset"]')) {
      resetBrewing();
    }
  });
  
  // Initialize home screen
  showScreen('home');
});

// Export functions for external use
window.WhisperBrew = {
  showScreen,
  startBrewing,
  updateTimer,
  nextStep,
  updateProgress,
  displayStep,
  resetBrewing
};
