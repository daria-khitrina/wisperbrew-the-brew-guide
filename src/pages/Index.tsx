
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground mb-2">☕</h1>
          <h1 className="text-4xl font-bold text-coffee-dark">WhisperBrew</h1>
          <p className="text-xl text-coffee-medium font-medium">Perfect pour-over coffee timing</p>
        </div>
        
        <div className="coffee-gradient p-6 rounded-xl shadow-lg max-w-md">
          <p className="text-cream text-lg font-medium">
            Choose your cup size to begin the perfect brewing experience
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <div className="bg-card border-2 border-coffee-light rounded-lg p-4 shadow-sm">
            <p className="text-coffee-dark font-semibold">1 Cup</p>
            <p className="text-coffee-medium text-sm">15g coffee • 250ml water</p>
          </div>
          <div className="bg-card border-2 border-coffee-light rounded-lg p-4 shadow-sm">
            <p className="text-coffee-dark font-semibold">2 Cups</p>
            <p className="text-coffee-medium text-sm">30g coffee • 500ml water</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
