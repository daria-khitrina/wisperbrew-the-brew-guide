
import React, { useRef, useEffect } from "react";
import BrewStepCard from "./BrewStepCard";

interface Step {
  step: number;
  instruction: string;
  description: string;
  duration: number;
  totalWater: number;
}

interface BrewCarouselProps {
  steps: Step[];
  currentStepIndex: number;
  timerString: string;
  onReset: () => void;
  stepProgress: number;
}

const BrewCarousel: React.FC<BrewCarouselProps> = ({
  steps,
  currentStepIndex,
  timerString,
  onReset,
  stepProgress,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll to active step card when currentStepIndex changes
  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      const active = el.children[currentStepIndex] as HTMLElement;
      if (active && active.scrollIntoView) {
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentStepIndex]);

  return (
    <div className="relative">
      <div
        className="flex flex-row overflow-x-auto pb-2 snap-x snap-mandatory gap-4"
        ref={carouselRef}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {steps.map((step, i) => (
          <div key={step.step} className="snap-center flex-shrink-0">
            <BrewStepCard
              stepNumber={step.step}
              totalSteps={steps.length}
              instruction={step.instruction}
              description={step.description}
              totalWater={step.totalWater}
              isActive={i === currentStepIndex}
              timer={i === currentStepIndex ? timerString : "--:--"}
              stepProgress={i === currentStepIndex ? stepProgress : 0}
            />
          </div>
        ))}
      </div>
      <div className="w-full flex justify-center mt-6">
        <button
          className="btn btn-secondary text-blue-700 border-blue-400 font-bold px-8 rounded-full"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BrewCarousel;
