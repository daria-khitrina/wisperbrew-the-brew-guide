
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container">
        <div className="text-center space-y-8 p-8 fade-in">
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
            <button className="btn btn-primary btn-large">
              <div className="text-center">
                <div className="text-lg font-semibold">1 Cup</div>
                <div className="text-sm opacity-90">15g coffee • 250ml water</div>
              </div>
            </button>
            <button className="btn btn-secondary btn-large">
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
            <div className="timer-display">00:00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
