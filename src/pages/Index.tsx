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
        <div id="home-screen" className="text-center space-y-8 p-8 fade-in">
          <div className="space-y-4 mb-8">
            <h1 className="text-hero mb-2">☕</h1>
            <h1 className="text-hero text-coffee-dark">WhisperBrew</h1>
            <p className="text-xl text-coffee-medium">Perfect pour-over coffee timing</p>
          </div>
          
          <div className="coffee-gradient p-6 rounded-xl shadow-lg max-w-md mx-auto card">
            <p className="text-cream text-lg">
              Choose your cup size to begin the perfect brewing experience
            </p>
          </div>
          
          <div className="flex flex-col gap-4 justify-center items-center md:flex-row">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => handleCupSelection('1-cup')}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">1 Cup</div>
                <div className="text-sm opacity-90">15g coffee • 250ml water</div>
              </div>
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => handleCupSelection('2-cup')}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">2 Cups</div>
                <div className="text-sm">30g coffee • 500ml water</div>
              </div>
            </button>
          </div>
          
          <div className="mt-8">
            <div className="progress-bar max-w-sm mx-auto mb-4">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div id="home-timer-display" className="timer-display">00:00</div>
          </div>
        </div>

        {/* Brewing Screen */}
        <div id="brewing-screen" className="text-center space-y-8 p-8" style={{ display: 'none' }}>
          <div className="space-y-4 mb-8">
            <h1 className="text-hero text-coffee-dark">Brewing</h1>
            <div id="step-counter" className="text-xl text-coffee-medium">Step 1 of 5</div>
          </div>
          
          <div className="coffee-gradient p-6 rounded-xl shadow-lg max-w-md mx-auto card">
            <h2 id="step-instruction" className="text-cream text-xl font-semibold mb-2">☕ Bloom</h2>
            <p id="step-description" className="text-cream text-lg mb-4">Pour 30ml hot water in circular motion</p>
            <div className="text-cream text-sm">
              Total water: <span id="water-amount" className="font-semibold">30ml</span>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="progress-bar max-w-sm mx-auto mb-4">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div id="brewing-timer-display" className="timer-display">--:--</div>
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
