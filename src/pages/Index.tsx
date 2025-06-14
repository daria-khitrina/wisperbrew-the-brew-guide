import React, { useState, useEffect, useRef } from 'react';
import BrewCarousel from "../components/BrewCarousel";

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
  // State for brewing steps and active index
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState("00:00");
  const [stepProgress, setStepProgress] = useState(0);
  const [brewing, setBrewing] = useState(false);
  const brewingPollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load script.js with bust param, only once
    const timestamp = Date.now();
    const script = document.createElement('script');
    script.src = `/src/script.js?t=${timestamp}`;
    script.async = false;
    script.onload = () => {
      // Force reload script.js with a cache-busting query param
      console.log("script.js loaded with cache buster", script.src);
      // Verify Brew recipes in loaded script
      if (window.WhisperBrew) {
        console.log("WhisperBrew is loaded (from Index.tsx Effect)");
        // Optionally log recipe info for the dev
        if (window.WhisperBrew.getCurrentStep) {
          const stepInfo = window.WhisperBrew.getCurrentStep();
          console.log("Initial step info:", stepInfo);
        }
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

  // Subscribe to recipe/step changes
  useEffect(() => {
    if (!(window.WhisperBrew && window.WhisperBrew.getCurrentStep)) return;

    // Poll the state every 200ms to get brewing info for carousel
    function pollBrew() {
      const state = window.WhisperBrew!.getTimerState();
      const currStep = window.WhisperBrew!.getCurrentStep();
      // Programmatically extract recipe for carousel
      let recipe: any[] = [];
      if (currStep) {
        // Recipe for the current brew is the array containing this step as reference
        // We'll try to access the whole recipe by backtracing step numbers
        // NOTE: As script.js holds a private recipe, we infer it from step counts
        // So we'll synthesize step items for the carousel (mirroring script.js arrays)
        // Since currentStep.step reports the real number, always 1-indexed
        // We'll build dummy placeholder steps if not present
        const maxSteps = 12;
        for (let k = 1; k <= maxSteps; k++) {
          if (currStep.step === k) {
            recipe.push(currStep);
          } else {
            // Placeholder -- actual step content for carousel visual
            recipe.push({
              step: k,
              instruction: k === currStep.step ? currStep.instruction : `Step ${k}`,
              description: k === currStep.step ? currStep.description : "",
              duration: k === currStep.step ? currStep.duration : 0,
              totalWater: k === currStep.step ? currStep.totalWater : "",
            });
          }
        }
        setSteps(recipe);
        setCurrentStepIndex(currStep.step ? currStep.step - 1 : 0);
      } else {
        setSteps([]);
        setCurrentStepIndex(0);
      }
      // Timer and progress
      if (typeof state.remainingTime === "number" && currStep?.duration) {
        const remaining = Math.max(0, state.remainingTime);
        const timerString = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(Math.floor(remaining % 60)).padStart(2, '0')}`;
        setTimer(timerString);
        const progress = 100 - (remaining / currStep.duration) * 100;
        setStepProgress(progress);
      } else {
        setTimer("--:--");
        setStepProgress(0);
      }
      // Update brewing status
      setBrewing(state.isTimerRunning);
    }

    if (brewingPollRef.current) clearInterval(brewingPollRef.current);
    brewingPollRef.current = setInterval(pollBrew, 200);

    // Initial call to seed UI
    pollBrew();

    return () => {
      if (brewingPollRef.current) clearInterval(brewingPollRef.current);
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

        {/* Brewing Screen */}
        <div id="brewing-screen" className="text-center space-y-8 p-0" style={{ display: 'none' }}>
          <div className="pt-6 pb-4 px-1 max-w-2xl mx-auto">
            <BrewCarousel
              steps={steps}
              currentStepIndex={currentStepIndex}
              timerString={timer}
              onReset={handleReset}
              stepProgress={stepProgress}
            />
          </div>
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
