
// Main initialization and global state for WhisperBrew
// Prevent redeclaration by checking for existing WhisperBrew
if (!window.WhisperBrew) {
  console.log('WhisperBrew Enhanced Timer System initializing...');

  // Initialize home screen immediately
  setTimeout(() => {
    if (window.WhisperBrewUI) {
      window.WhisperBrewUI.showScreen('home');
    }
  }, 100);

  // Export enhanced functions for external use and React integration
  window.WhisperBrew = {
    showScreen: (screen) => window.WhisperBrewUI.showScreen(screen),
    startBrewing: (cupSize) => window.WhisperBrewTimer.startBrewing(cupSize),
    updateTimer: () => window.WhisperBrewTimer.updateTimer(),
    nextStep: () => window.WhisperBrewTimer.nextStep(),
    updateProgress: (percentage) => window.WhisperBrewUI.updateProgress(percentage),
    displayStep: (stepData) => window.WhisperBrewUI.displayStep(stepData),
    resetBrewing: () => window.WhisperBrewTimer.resetBrewing(),
    getCurrentStep: () => window.WhisperBrewTimer.getCurrentStep(),
    getTimerState: () => window.WhisperBrewTimer.getTimerState(),
    getTotalProgress: () => window.WhisperBrewTimer.getTotalProgress()
  };

  console.log('WhisperBrew functions available globally:', Object.keys(window.WhisperBrew));
}
