"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface ProgressStepsProps {
  steps: any;
  currentStep: number;
  completedSteps: number[];
}

export function ProgressSteps({
  steps,
  currentStep,
  completedSteps,
}: ProgressStepsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative flex justify-between">
        {steps?.map((step: any, index: any) => {
          const isCompleted = completedSteps?.includes(index + 1);
          const isCurrent = currentStep === index + 1;

          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center relative z-10",
                isCurrent && "text-primary",
                isCompleted ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-current">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs mt-1 hidden md:block">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
