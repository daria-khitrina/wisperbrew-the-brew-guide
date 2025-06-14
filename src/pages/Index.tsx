
import { useEffect } from 'react';

declare global {
  interface Window {
    WhisperBrew?: {
      startBrewing: (cupSize: string) => void;
      resetBrewing: () => void;
    };
  }
}

const Index = () => {
  useEffect(() => {
    // Load the script synchronously
    const script = document.createElement('script');
    script.src = '/src/script.js';
    script.async = false; // Changed to synchronous loading
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
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
        <div id="brewing-screen" className="text-center space-y-8 p-8" style={{ display: 'none' }}>
          <div className="space-y-4 mb-8">
            <h1 className="text-hero text-coffee-dark">Brewing</h1>
            <div id="step-counter" className="text-xl text-coffee-medium">Step 1 of 12</div>
          </div>
          
          <div className="coffee-gradient p-6 rounded-xl shadow-lg max-w-md mx-auto card">
            <h2 id="step-instruction" className="text-cream text-xl font-semibold mb-2">☕ Pour to Bloom</h2>
            <p id="step-description" className="text-cream text-lg mb-4">Pour 50ml of water (20%)</p>
            <div className="text-cream text-sm">
              Total water: <span id="water-amount" className="font-semibold">50ml</span>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="progress-bar max-w-sm mx-auto mb-4">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div id="brewing-timer-display" className="timer-display">00:10</div>
          </div>
          
          <button 
            className="btn btn-secondary reset-btn" 
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
