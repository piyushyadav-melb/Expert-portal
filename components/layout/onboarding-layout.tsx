"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { fetchProfile } from "@/service/profile.service";
import toast from "react-hot-toast";
import LayoutLoader from "@/components/layout-loader";
import { useMounted } from "@/hooks/use-mounted";

interface IOnboardingLayoutProps {
  children: ReactNode;
}

const LayoutWrapper = ({
  children,
  location,
}: {
  children: React.ReactNode;
  location: any;
}) => {
  return (
    <motion.div
      key={location}
      initial="pageInitial"
      animate="pageAnimate"
      exit="pageExit"
      variants={{
        pageInitial: {
          opacity: 0,
          y: 50,
        },
        pageAnimate: {
          opacity: 1,
          y: 0,
        },
        pageExit: {
          opacity: 0,
          y: -50,
        },
      }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.5,
      }}
    >
      <main>{children}</main>
    </motion.div>
  );
};

const OnboardingLayout: React.FC<IOnboardingLayoutProps> = ({ children }) => {
  const location = usePathname();
  const mounted = useMounted();
  const navigation = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allowedStep, setAllowedStep] = useState(0);

  // Update currentStep when URL changes
  useEffect(() => {
    if (!isLoading) {
      const pathStep = parseInt(
        location.split("/").pop()?.split("-")[1] || "1"
      );
      setCurrentStep(pathStep - 1); // Subtract 1 because our steps are 0-based
      setAllowedStep(allowedStep + 1);
    }
  }, [location, isLoading]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response: any = await fetchProfile();
        console.log("response", response?.data?.is_profile_completed);
        if (response?.data?.is_profile_completed) {
          console.log("redirecting to dashboard");
          navigation.replace("/dashboard");
          return;
        }

        // Set current step based on step_completed
        const step = parseInt(response?.data?.step_completed || "0");
        setCurrentStep(step);
        setAllowedStep(step + 1);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [navigation]);

  // Validate step access based on URL
  useEffect(() => {
    if (!isLoading) {
      const pathStep = parseInt(
        location.split("/").pop()?.split("-")[1] || "1"
      );

      // if (pathStep > allowedStep && allowedStep !== 0) {
      //   toast.error("Please complete the previous steps first");
      //   navigation.replace(`/onboarding/step-${allowedStep}`);
      //   return;
      // }
    }
  }, [location, allowedStep, isLoading, navigation]);

  if (!mounted || isLoading) {
    return <LayoutLoader />;
  }

  const progress: any = Number((currentStep / 3) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  currentStep == 1 || currentStep == 2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted-foreground"
                )}
              >
                1
              </div>
              <div className="flex-1 h-[2px] bg-muted-foreground/20" />
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  currentStep == 2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted-foreground"
                )}
              >
                2
              </div>
              <div className="flex-1 h-[2px] bg-muted-foreground/20" />
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  currentStep == 3
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted-foreground"
                )}
              >
                3
              </div>
            </div>
            <div className="text-sm text-muted-foreground ml-4">
              Step {currentStep + 1} of 3
            </div>
          </div>
          <Progress
            value={progress}
            className="h-6 bg-muted"
            showValue={true}
            isAnimate={true}
          />
        </div>
        <LayoutWrapper location={location}>{children}</LayoutWrapper>
      </div>
    </div>
  );
};

export default OnboardingLayout;
