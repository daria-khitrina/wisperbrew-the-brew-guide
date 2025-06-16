
// public/brewing-ui.js

export function showScreen(screenId) {
  // ... same as before: hides all, shows one
  const screens = ['home', 'brewing', 'complete'];
  screens.forEach(screen => {
    const element = document.getElementById(`${screen}-screen`);
    if (element) {
      element.style.display = 'none';
      element.classList.remove('fade-in');
      element.classList.add('fade-out');
    }
  });
  setTimeout(() => {
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
      targetScreen.style.display = 'block';
      targetScreen.classList.remove('fade-out');
      targetScreen.classList.add('fade-in');
    }
  }, 300);
}

export function updateProgress(percentage, currentScreen = "brewing") {
  let progressFill = null;
  if (currentScreen === "brewing") {
    progressFill = document.querySelector("#brewing-screen .brew-progress-fill");
  } else if (currentScreen === "complete") {
    progressFill = document.querySelector("#complete-screen .brew-progress-fill");
  } else {
    progressFill = document.querySelector("#home-screen .brew-progress-fill");
  }
  if (progressFill) {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    progressFill.style.width = `${clampedPercentage}%`;
    if (clampedPercentage > 0) {
      console.log(`Progress updated: ${clampedPercentage.toFixed(1)}%`);
    }
  }
}

export function displayStep(stepData, stepIndex, recipeLength) {
  let mainAction = "";
  if (
    stepData.instruction &&
    /pour/i.test(stepData.instruction) &&
    stepData.totalWater &&
    stepData.instruction.toLowerCase().includes('bloom')
  ) {
    mainAction = `Pour ${stepData.totalWater}ml of water to bloom`;
  } else if (
    stepData.instruction &&
    /pour/i.test(stepData.instruction) &&
    stepData.totalWater
  ) {
    mainAction = `Pour to ${stepData.totalWater}ml`;
  } else if (stepData.instruction) {
    mainAction = stepData.instruction;
  }
  const stepInstruction = document.querySelector("#brewing-screen #step-instruction");
  if (stepInstruction && mainAction) {
    stepInstruction.textContent = mainAction;
  } else if (stepInstruction) {
    stepInstruction.textContent = stepData.instruction || "";
  }
  const waterAmount = document.querySelector("#brewing-screen #water-amount");
  if (waterAmount) {
    waterAmount.textContent = `${stepData.totalWater}ml`;
  }
  const timerDisplay = document.getElementById("brewing-timer-display");
  if (timerDisplay) {
    const minutes = Math.floor(stepData.duration / 60);
    const seconds = stepData.duration % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  console.log(
    `[displayStep] Main action: ${mainAction} | Step: ${stepData.step} of ${recipeLength}`
  );
}
