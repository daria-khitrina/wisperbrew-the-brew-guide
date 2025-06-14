
import { useEffect, useRef, useState } from 'react';
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

const WHISPER_BREW_MAX_WAIT_MS = 5000; // 5 seconds for max wait

const Index = () => {
  // --- New state for loading and error
  const [isBrewingReady, setIsBrewingReady] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [loadingAttempt, setLoadingAttempt] = useState(1);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Script loader and WhisperBrew poller
  const loadWhisperBrewScript = () => {
    setIsBrewingReady(false);
    setLoadingError(false);
    // Remove old scripts
    const oldScript = document.getElementById('brew-script');
    if (oldScript && oldScript.parentNode) {
      oldScript.parentNode.removeChild(oldScript);
    }
    // Remove any old WhisperBrew references
    if ('WhisperBrew' in window) {
      window.WhisperBrew = undefined;
    }
    // Load new script
    const timestamp = Date.now();
    const script = document.createElement('script');
    script.id = 'brew-script';
    script.src = `/src/script.js?t=${timestamp}`;
    script.async = false;
    script.onload = () => {
      // We wait for polling to confirm it works
      // console.log('script.js onload called');
    };
    script.onerror = () => {
      setLoadingError(true);
      setIsBrewingReady(false);
    };
    document.head.appendChild(script);

    // Set up polling for WhisperBrew object/function
    let waited = 0;
    const pollEach = 100;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(() => {
      waited += pollEach;
      if (
        window.WhisperBrew &&
        typeof window.WhisperBrew.startBrewing === 'function' &&
        typeof window.WhisperBrew.resetBrewing === 'function'
      ) {
        setIsBrewingReady(true);
        setLoadingError(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    }, pollEach);

    // Set up overall timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoadingError(true);
      setIsBrewingReady(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }, WHISPER_BREW_MAX_WAIT_MS);
  };

  useEffect(() => {
    loadWhisperBrewScript();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loadingAttempt]); // each attempt re-runs the loader

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

  // --- Updated handlers use the new ready state
  const handleCupSelection = (cupSize: string) => {
    if (!isBrewingReady || loadingError) return;
    if (window.WhisperBrew && window.WhisperBrew.startBrewing) {
      window.WhisperBrew.startBrewing(cupSize);
    }
  };

  const handleReset = () => {
    if (!isBrewingReady || loadingError) return;
    if (window.WhisperBrew && window.WhisperBrew.resetBrewing) {
      window.WhisperBrew.resetBrewing();
    }
  };

  // --- Retry handler
  const handleRetry = () => {
    setLoadingAttempt(attempt => attempt + 1);
  };

  // --- UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container">

        {/* Loading or Error Overlay */}
        {(!isBrewingReady || loadingError) && (
          <div className="fixed z-50 top-0 left-0 w-full h-full bg-white/80 flex flex-col justify-center items-center gap-6">
            {loadingError ? (
              <>
                <span className="text-red-600 text-lg font-bold">Failed to load brewing system. Try again.</span>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded font-semibold transition-all"
                  type="button"
                  onClick={handleRetry}
                  disabled={isBrewingReady === false && !loadingError ? true : false}
                >
                  Try again
                </button>
              </>
            ) : (
              <span className="text-coffee-dark text-lg font-bold animate-pulse">Loading brewing system...</span>
            )}
          </div>
        )}

        {/* Home Screen */}
        <div id="home-screen" className="text-center space-y-12 p-8 fade-in max-w-md mx-auto py-0 px-0">
          <div className="flex flex-col w-full">
            <h1 className="text-5xl md:text-6xl font-bold text-coffee-dark text-center">Wisperbrew</h1>
            <p className="text-lg md:text-xl text-coffee-medium">Perfect pour-over coffee timing</p>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <button
              className="w-full py-6 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 disabled:opacity-50"
              onClick={() => handleCupSelection('1-cup')}
              disabled={!isBrewingReady || loadingError}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">1 cup</span>
                <span className="text-sm text-coffee-medium">15g beans + 250ml</span>
              </div>
            </button>
            <button
              className="w-full py-6 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 disabled:opacity-50"
              onClick={() => handleCupSelection('2-cup')}
              disabled={!isBrewingReady || loadingError}
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
          <button
            onClick={handleReset}
            className="brew-reset-btn w-full py-3 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 disabled:opacity-50"
            disabled={!isBrewingReady || loadingError}
          >
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
            <button
              className="w-full max-w-xs py-4 px-8 bg-background border border-gray-200 text-coffee-dark font-bold rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300 text-lg mt-2 disabled:opacity-50"
              onClick={handleReset}
              disabled={!isBrewingReady || loadingError}
            >
              Brew one more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

