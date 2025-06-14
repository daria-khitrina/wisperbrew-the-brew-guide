// UI and screen management for WhisperBrew
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

function updateProgress(percentage) {
  let progressFill = null;
  
  if (currentScreen === 'brewing') {
    // Fix: use the correct class '.brew-progress-fill'
    progressFill = document.querySelector('#brewing-screen .brew-progress-fill');
  } else if (currentScreen === 'complete') {
    progressFill = document.querySelector('#complete-screen .brew-progress-fill');
  } else {
    progressFill = document.querySelector('#home-screen .brew-progress-fill');
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

  console.log(
    `[displayStep] Main action: ${mainAction} | Step: ${stepData.step} of ${window.WhisperBrewTimer.getCurrentRecipe().length}`
  );
}

// Export for use in other modules
window.WhisperBrewUI = {
  showScreen,
  updateProgress,
  displayStep,
  getCurrentScreen: () => currentScreen
};
