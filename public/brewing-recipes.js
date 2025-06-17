// public/brewing-recipes.js

// Attach to window
window.BREWING_RECIPES = {
  oneCup: [
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
  ],
  twoCup: [
    { step: 1, instruction: "Pour 60g water", description: "Initial pour for blooming", duration: 10, totalWater: 60 },
    { step: 2, instruction: "Gently swirl", description: "Gently swirl the brewer", duration: 10, totalWater: 60 },
    { step: 3, instruction: "Wait (bloom rest)", description: "Let the coffee bloom and degas", duration: 25, totalWater: 60 },
    { step: 4, instruction: "Pour up to 300g total", description: "Pour water slowly to 300g", duration: 30, totalWater: 300 },
    { step: 5, instruction: "Slow pour up to 500g total", description: "Pour remaining water slowly to 500g", duration: 30, totalWater: 500 },
    { step: 6, instruction: "Stir with spoon, both directions", description: "Stir gently in both directions", duration: 10, totalWater: 500 },
    { step: 7, instruction: "Pause", description: "Let the coffee settle", duration: 15, totalWater: 500 },
    { step: 8, instruction: "Gently swirl", description: "Final gentle swirl", duration: 10, totalWater: 500 },
  ]
};
// Optional: Log recipes
console.log(
  "WhisperBrew: Loaded Brew Recipes:",
  { oneCup: window.BREWING_RECIPES.oneCup.length, twoCup: window.BREWING_RECIPES.twoCup.length }
);
