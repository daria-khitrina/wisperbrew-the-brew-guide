import { useEffect, useState } from 'react';
import { runConfetti } from '../lib/confetti';

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
      getTimerState: () => {
        remainingTime: number;
        isTimerRunning: boolean;
        currentStepIndex: number;
      };
      getTotalProgress: () => number;
    };
  }
}

const Index = () => {
  const [isBrewingReady, setIsBrewingReady] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    // Clear any existing WhisperBrew to prevent conflicts
    if (window.WhisperBrew) {
      console.log("WhisperBrew already exists, clearing it");
      delete window.WhisperBrew;
    }

    // Remove any existing script tags to prevent duplicates
    const existingScripts = document.querySelectorAll('script[src*="script.js"]');
    existingScripts.forEach(script => script.remove());

    const timestamp = Date.now();
    const script = document.createElement('script');
    script.src = `/src/script.js?t=${timestamp}`;
    script.async = true;

    let intervalId: number | undefined;
    let timeoutId: number | undefined;
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds of polling

    const checkForWhisperBrew = () => {
      attempts++;
      console.log(`Checking for WhisperBrew, attempt ${attempts}`);
      
      if (window.WhisperBrew && typeof window.WhisperBrew.startBrewing === 'function') {
        console.log("WhisperBrew is loaded and ready with all functions!");
        setIsBrewingReady(true);
        setLoadingError(false);
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error("WhisperBrew failed to load after maximum attempts");
        setLoadingError(true);
        if (intervalId) clearInterval(intervalId);
      }
    };

    script.onload = () => {
      console.log("script.js loaded successfully, starting WhisperBrew detection...");
      // Start checking immediately and then every 100ms
      checkForWhisperBrew();
      intervalId = window.setInterval(checkForWhisperBrew, 100);
    };

    script.onerror = (error) => {
      console.error("Failed to load script.js:", error);
      setLoadingError(true);
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };

    document.head.appendChild(script);

    // Overall timeout for the loading process
    timeoutId = window.setTimeout(() => {
      if (!isBrewingReady) {
        console.error("WhisperBrew did not load within 5 seconds, setting error state");
        setLoadingError(true);
        if (intervalId) clearInterval(intervalId);
      }
    }, 5000);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const completeScreen = document.getElementById('complete-screen');
    if (!completeScreen) return;
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          if (target.style.display !== 'none') {
            runConfetti();
          }
        }
      }
    });
    observer.observe(completeScreen, {
      attributes: true
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCupSelection = (cupSize: string) => {
    console.log(`Button clicked for ${cupSize}, isBrewingReady: ${isBrewingReady}`);
    if (window.WhisperBrew && window.WhisperBrew.startBrewing) {
      console.log("Calling WhisperBrew.startBrewing");
      window.WhisperBrew.startBrewing(cupSize);
    } else {
      console.error('WhisperBrew not available or startBrewing function missing');
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

  const handleRetryLoad = () => {
    console.log('Retrying script load...');
    setLoadingError(false);
    setIsBrewingReady(false);
    // Trigger a re-render to reload the script
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container">
        {/* Home Screen */}
        <div id="home-screen" className="text-center space-y-12 p-8 fade-in max-w-md mx-auto py-0 px-0">
          <div className="flex flex-col w-full">
            <h1 className="text-5xl md:text-6xl font-bold text-coffee-dark text-center">Wisperbrew</h1>
            <p className="text-lg md:text-xl text-coffee-medium">Perfect pour-over coffee timing</p>
          </div>

          {loadingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm mb-2">Failed to load brewing system</p>
              <button 
                onClick={handleRetryLoad}
                className="text-red-600 underline text-sm hover:text-red-800"
              >
                Try again
              </button>
            </div>
          )}

          {!isBrewingReady && !loadingError && (
            <div className="text-center">
              <p className="text-coffee-medium text-sm">Loading brewing system...</p>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            <button 
              className="w-full py-6 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => handleCupSelection('1-cup')} 
              disabled={!isBrewingReady}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">1 cup</span>
                <span className="text-sm text-coffee-medium">15g beans + 250ml</span>
              </div>
            </button>
            <button 
              className="w-full py-6 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => handleCupSelection('2-cup')} 
              disabled={!isBrewingReady}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">2 cups</span>
                <span className="text-sm text-coffee-medium">30g beans + 500ml</span>
              </div>
            </button>
          </div>
        </div>

        {/* Brewing Screen */}
        <div id="brewing-screen" style={{
        display: 'none'
      }} className="flex flex-col max-w-md mx-auto py-6 px-0 md:bg-white md:rounded-3xl md:shadow-md md:px-6">
          {/* Progress bar at the top */}
          <div className="w-full">
            <div className="brew-progress-bar bg-[#e5eaf2] rounded-full h-3 w-full relative overflow-hidden shadow-xs">
              <div className="brew-progress-fill absolute left-0 top-0 h-3 bg-[#3B82F6] transition-all duration-300" style={{
              width: '0%'
            }}></div>
            </div>
          </div>

          {/* Grouped instruction (h2) and timer, 40px gap */}
          <div className="flex flex-col items-center justify-center gap-3 py-[200px]">
            <h2 id="step-instruction" className="font-bold text-2xl text-black text-center tracking-tight">
              Pour 50ml of water to bloom
            </h2>
            <div id="brewing-timer-display" style={{
            letterSpacing: '0.01em'
          }} className="brew-timer text-black font-bold tracking-tight text-[3rem] leading-none tabular-nums leading-none ">
              00:10
            </div>
          </div>

          {/* Button at the bottom */}
          <button onClick={handleReset} className="brew-reset-btn w-full py-3 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300">
            Reset
          </button>
        </div>

        {/* Complete Screen */}
        <div id="complete-screen" style={{
        display: 'none'
      }} className="flex flex-col items-center justify-center fade-in min-h-[50vh] p-8 px-0">
          <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto pt-6 pb-10 py-0">
            <h1 style={{
            letterSpacing: '-0.02em'
          }} className="font-bold md:text-5xl text-coffee-dark text-center text-5xl">
              Brew is complete
            </h1>
            <p className="text-coffee-medium text-lg md:text-xl mt-6 mb-12">
              enjoy your cup
            </p>
            <button className="w-full max-w-xs py-4 px-8 bg-background border border-gray-200 text-coffee-dark font-bold rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 text-lg mt-2" onClick={handleReset}>Brew one more</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
