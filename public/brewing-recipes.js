
// public/brewing-recipes.js

export const oneCup = [
  { step: 1, instruction: "☕ Pour to Bloom", description: "Pour 50ml of water (20%)", duration: 10, totalWater: 50 },
  { step: 2, instruction: "Gently Swirl", description: "Gently swirl the brewer", duration: 5, totalWater: 50 },
  { step: 3, instruction: "Wait for Bloom", description: "Let the coffee bloom and degas", duration: 30, totalWater: 50 },
  { step: 4, instruction: "Second Pour", description: "Pour water slowly to 100ml (40%)", duration: 15, totalWater: 100 },
  { step: 5, instruction: "Pause", description: "Let the water drip through", duration: 10, totalWater: 100 },
  { step: 6, instruction: "Third Pour", description: "Pour water to 150ml (60%)", duration: 10, totalWater: 150 },
  { step: 7, instruction: "Pause", description: "Allow for even extraction", duration: 10, totalWater: 150 },
  { step: 8, instruction: "Fourth Pour", description: "Pour water to 200ml (80%)", duration: 10, totalWater: 200 },
  { step: 9, instruction: "Pause", description: "Wait for the drip", duration: 10, totalWater: 200 },
  { step: 10, instruction: "Final Pour", description: "Pour remaining water to 250ml (100%)", duration: 10, totalWater: 250 },
  { step: 11, instruction: "Gently swirl", description: "Gently swirl for an even bed", duration: 5, totalWater: 250 },
];

export const twoCup = [
  { step: 1, instruction: "☕ Pour to Bloom", description: "Pour 100ml of water (20%)", duration: 10, totalWater: 100 },
  { step: 2, instruction: "Gently Swirl", description: "Gently swirl the brewer", duration: 5, totalWater: 100 },
  { step: 3, instruction: "Wait for Bloom", description: "Let the coffee bloom and degas", duration: 30, totalWater: 100 },
  { step: 4, instruction: "Second Pour", description: "Pour water slowly to 200ml (40%)", duration: 15, totalWater: 200 },
  { step: 5, instruction: "Pause", description: "Let the water drip through", duration: 10, totalWater: 200 },
  { step: 6, instruction: "Third Pour", description: "Pour water to 300ml (60%)", duration: 10, totalWater: 300 },
  { step: 7, instruction: "Pause", description: "Allow for even extraction", duration: 10, totalWater: 300 },
  { step: 8, instruction: "Fourth Pour", description: "Pour water to 400ml (80%)", duration: 10, totalWater: 400 },
  { step: 9, instruction: "Pause", description: "Wait for the drip", duration: 10, totalWater: 400 },
  { step: 10, instruction: "Final Pour", description: "Pour remaining water to 500ml (100%)", duration: 10, totalWater: 500 },
  { step: 11, instruction: "Gently swirl", description: "Gently swirl for an even bed", duration: 5, totalWater: 500 },
];

// Retain window for legacy/compat users/scripts
window.BREWING_RECIPES = { oneCup, twoCup };

// Optional: Log recipes
console.log(
  "WhisperBrew: Loaded Brew Recipes:",
  { oneCup: oneCup.length, twoCup: twoCup.length }
);

