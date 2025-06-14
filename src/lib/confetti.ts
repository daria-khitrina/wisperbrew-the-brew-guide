
import confetti from 'canvas-confetti';

const count = 200;
const defaults = {
  origin: { y: 0.7 },
  colors: ['#7B3F00', '#A52A2A', '#D2B48C', '#3B82F6', '#F5DEB3'],
};

function fire(particleRatio: number, opts: object) {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
}

export const runConfetti = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
