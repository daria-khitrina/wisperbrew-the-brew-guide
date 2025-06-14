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
  useEffect(() => {
    // Force reload script.js with a cache-busting query param
    const timestamp = Date.now();
    const script = document.createElement('script');
    script.src = `/src/script.js?t=${timestamp}`;
    script.async = false;
    script.onload = () => {
      console.log("script.js loaded with cache buster", script.src);
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

  // Debug: View final page button
  const handleViewFinalPage = () => {
    if (window.WhisperBrew && window.WhisperBrew.showScreen) {
      window.WhisperBrew.showScreen('complete');
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container">
        {/* Home Screen */}
        <div id="home-screen" className="text-center space-y-12 p-8 fade-in max-w-md mx-auto py-0 px-0">
          <div className="flex flex-col w-full">
            <h1 className="text-5xl md:text-6xl font-bold text-coffee-dark text-center">Wisperbrew</h1>
            <p className="text-lg md:text-xl text-coffee-medium">Perfect pour-over coffee timing</p>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <button className="w-full py-6 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300" onClick={() => handleCupSelection('1-cup')}>
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">1 cup</span>
                <span className="text-sm text-coffee-medium">15g beans + 250ml</span>
              </div>
            </button>
            <button className="w-full py-6 px-8 bg-background border border-gray-200 rounded-full shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all duration-300" onClick={() => handleCupSelection('2-cup')}>
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-coffee-dark text-xl">2 cups</span>
                <span className="text-sm text-coffee-medium">30g beans + 500ml</span>
              </div>
            </button>
          </div>
          {/* Debug button: View final page */}
          <div className="flex flex-col items-end w-full mt-2">
            <button type="button" className="py-1 px-3 text-xs rounded bg-muted text-coffee-medium border border-gray-200 shadow-xs hover:border-[#3B82F6] hover:bg-[#f6faff] transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={handleViewFinalPage} aria-label="View final page (debug)">
              View Final Page
            </button>
          </div>
        </div>

        {/* Brewing Screen */}
        <div id="brewing-screen" style={{
        display: 'none'
      }} className="flex flex-col justify-between h-screen max-w-md mx-auto py-8 px-0 md:bg-white md:rounded-3xl md:shadow-md md:px-6">
          {/* Progress bar at the top */}
          <div className="w-full">
            <div className="brew-progress-bar bg-[#e5eaf2] rounded-full h-3 w-full relative overflow-hidden shadow-xs">
              <div className="brew-progress-fill absolute left-0 top-0 h-3 bg-[#3B82F6] transition-all duration-300" style={{
              width: '0%'
            }}></div>
            </div>
          </div>

          {/* Grouped instruction (h2) and timer, 40px gap */}
          <div className="flex flex-col items-center justify-center gap-3">
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
    </div>;
};
export default Index;