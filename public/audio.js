
// Audio functionality for WhisperBrew
let audioContext = null;

// Initialize audio context
function initAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.log('Audio context not supported:', error);
    }
  }
}

// Play soft audio tick
function playTick(isComplete = false) {
  try {
    if (!audioContext) {
      initAudio();
    }
    
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for step vs completion
      oscillator.frequency.setValueAtTime(isComplete ? 300 : 200, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Soft volume and quick fade
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (isComplete ? 0.08 : 0.05));
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + (isComplete ? 0.08 : 0.05));
    }
  } catch (error) {
    console.log('Audio tick failed:', error);
  }
}

// Export for use in other modules
window.WhisperBrewAudio = {
  initAudio,
  playTick
};
