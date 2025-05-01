"use client";

import { StepThree } from "@/components/onboarding/step-three";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProfile } from "@/service/profile.service";

export default function OnboardingStep3() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await fetchProfile();
        setInitialData(data?.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const handleBack = () => {
    router.push("/onboarding/step-2");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StepThree
      onComplete={handleComplete}
      onBack={handleBack}
      initialData={initialData}
    />
  );
}
