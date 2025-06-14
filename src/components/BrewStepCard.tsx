
import React from "react";

interface BrewStepCardProps {
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  description: string;
  totalWater: number;
  isActive: boolean;
  timer: string;
  stepProgress: number; // 0-100
}

export const BrewStepCard: React.FC<BrewStepCardProps> = ({
  stepNumber,
  totalSteps,
  instruction,
  description,
  totalWater,
  isActive,
  timer,
  stepProgress,
}) => (
  <div
    className={`relative flex flex-col items-center justify-center min-w-[320px] max-w-xs w-full mx-2 px-6 py-8 bg-white rounded-2xl shadow-md border transition-all ${
      isActive ? "ring-2 ring-primary scale-105 z-10" : "opacity-70"
    }`}
  >
    <div className="text-xs font-semibold text-blue-600 mb-2 tracking-wide">{`Step ${stepNumber} of ${totalSteps}`}</div>
    <h2 className="text-2xl font-bold mb-2 text-coffee-dark text-center">{instruction}</h2>
    <p className="text-base text-coffee-medium mb-4 text-center">{description}</p>
    <div className="w-full flex justify-center mb-4">
      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-full text-sm shadow">
        {totalWater}ml
      </span>
    </div>
    <div className="mb-4 w-full">
      <div className="progress-bar progress-bar-blue max-w-[200px] mx-auto mb-2">
        <div
          className="progress-fill progress-fill-blue"
          style={{ width: `${stepProgress}%` }}
        ></div>
      </div>
      <div className="timer-display text-center text-blue-700 text-4xl font-bold">{timer}</div>
    </div>
  </div>
);

export default BrewStepCard;
