"use client";

import { useEffect, useState } from "react";
import { StepOne } from "@/components/onboarding/step-one";
import { StepTwo } from "@/components/onboarding/step-two";
import { StepThree } from "@/components/onboarding/step-three";
import { ProgressSteps } from "@/components/onboarding/progress-steps";
import { Card } from "@/components/ui/card";
import { fetchProfile } from "@/service/profile.service";

const steps = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Professional Details" },
  { id: 3, title: "Identity Verification" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<any>([]);
  const [initialData, setInitialData] = useState<any>(null);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const res: any = await fetchProfile();
    if (res?.status === true) {
      const completedStep = res?.data?.step_completed || 0;
      const stepsArray = Array.from({ length: completedStep }, (_, i) => i + 1);
      setCompletedSteps(stepsArray);
      setInitialData(res?.data);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne onComplete={handleNext} initialData={initialData} />;
      case 2:
        return (
          <StepTwo
            onComplete={handleNext}
            onBack={handleBack}
            initialData={initialData}
          />
        );
      case 3:
        return <StepThree onComplete={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 mb-8">
          <ProgressSteps
            steps={steps}
            currentStep={currentStep}
            completedSteps={[]}
          />
        </Card>
        {renderStep()}
      </div>
    </div>
  );
}
