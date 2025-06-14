
import { useEffect } from 'react';

declare global {
  interface Window {
    WhisperBrew?: {
      showScreen: (screen: string) => void;
      startBrewing: (cupSize: string) => void;
      updateTimer: () => void;
      nextStep: () => void;
      updateProgress: (percentage: number) => void;
      displayStep: (stepData: any) => void;
      resetBrewing: () => void;
      getCurrentStep: () => any;
      getTimerState: () => { remainingTime: number; isTimerRunning: boolean; currentStepIndex: number };
      getTotalProgress: () => number;
    };
  }
}

const Index = () => {
  useEffect(() => {
    // Force reload script.js with a cache-busting query param
    const timestamp = Date.now();
    const script = document.createElement('script');
    script.src = `/src/script.js?t=${timestamp}`;
    script.async = false;
    script.onload = () => {
      console.log("script.js loaded with cache buster", script.src);
      // Optionally log recipe info for the dev
      if (window.WhisperBrew) {
        console.log("WhisperBrew is loaded (from Index.tsx Effect)");
      } else {
        console.error("WhisperBrew not loaded after injecting script.js");
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleCupSelection = (cupSize: string) => {
    console.log(`Button clicked for ${cupSize}`);
    if (window.WhisperBrew && window.WhisperBrew.startBrewing) {
      window.WhisperBrew.startBrewing(cupSize);
    } else {
      console.error('WhisperBrew not available');
    }
  };

  const handleReset = () => {
    console.log('Reset button clicked');
    if (window.WhisperBrew && window.WhisperBrew.resetBrewing) {
      window.WhisperBrew.resetBrewing();
    } else {
      console.error('WhisperBrew not available');
    }
  };

  // UI: We'll move timer/progress logic to the window.WhisperBrew-managed DOM updates.
  // Nothing to change in state here.

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container">
        {/* Home Screen */}
        <div id="home-screen" className="text-center space-y-12 p-8 fade-in max-w-md mx-auto">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-coffee-dark">Wisperbrew</h1>
            <p className="text-lg md:text-xl text-coffee-medium">Perfect pour-over coffee timing</p>
          </div>
          
          <div className="flex flex-col gap-6 w-full">
            <button 
              className="w-full py-6 px-8 bg-background border border-input rounded-full hover:border-coffee-medium transition-all duration-300"
              onClick={() => handleCupSelection('1-cup')}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">1 cup</span>
                <span className="text-sm text-coffee-medium">15g beans + 250ml</span>
              </div>
            </button>
            <button 
              className="w-full py-6 px-8 bg-background border border-input rounded-full hover:border-coffee-medium transition-all duration-300"
              onClick={() => handleCupSelection('2-cup')}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">2 cups</span>
                <span className="text-sm text-coffee-medium">30g beans + 500ml</span>
              </div>
            </button>
          </div>
        </div>

        {/* Brewing Screen - SIMPLIFIED */}
        <div id="brewing-screen" className="text-center flex flex-col space-y-8 py-12 max-w-md mx-auto fade-in brewing-redesign-v2" style={{ display: 'none' }}>
          {/* Step instruction will be set by script.js */}
          <div className="mb-2">
            <h2 id="step-instruction" className="brew-instruction">
              {/* "☕ Pour to Bloom" */}
              Step
            </h2>
          </div>
          {/* Blue progress bar */}
          <div className="blue-progress-bar mb-6">
            <div className="blue-progress-fill" style={{ width: '0%' }} id="brewing-progress-bar"></div>
          </div>
          {/* Timer */}
          <div className="brew-timer-ui flex-1 flex flex-col items-center justify-center">
            <span id="brewing-timer-display" className="brew-timer">00:10</span>
          </div>
          {/* Reset button */}
          <button
            className="brew-reset-btn"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        {/* Complete Screen */}
        <div id="complete-screen" className="text-center space-y-8 p-8" style={{ display: 'none' }}>
          <div className="space-y-4 mb-8">
            <h1 className="text-hero mb-2">🎉</h1>
            <h1 className="text-hero text-coffee-dark">Perfect!</h1>
            <p className="text-xl text-coffee-medium">Your coffee is ready to enjoy</p>
          </div>
          
          <div className="coffee-gradient p-6 rounded-xl shadow-lg max-w-md mx-auto card">
            <p className="text-cream text-lg">
              Your pour-over coffee has been brewed to perfection. Enjoy your cup!
            </p>
          </div>
          
          <div className="mt-8">
            <div className="progress-bar max-w-sm mx-auto mb-4">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
            <div id="complete-timer-display" className="timer-display">Done</div>
          </div>
          
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleReset}
          >
            Brew Another Cup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
