"use client";

import { StepOne } from "@/components/onboarding/step-one";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProfile } from "@/service/profile.service";

export default function OnboardingStep1() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await fetchProfile();
        console.log("data", data);

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
    router.push("/onboarding/step-2");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <StepOne onComplete={handleComplete} />;
}
