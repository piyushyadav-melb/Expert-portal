"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StepOne } from "@/components/onboarding/step-one";
import { StepTwo } from "@/components/onboarding/step-two";
import { StepThree } from "@/components/onboarding/step-three";
import { UpdateProfile } from "@/components/profile/update-profile";
import { useEffect, useState } from "react";
import { fetchProfile } from "@/service/profile.service";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Profile Settings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your profile information and preferences
          </p>
        </div>

        <Card className="p-4">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="w-full grid grid-cols-2 md:flex md:flex-row gap-2 p-1 h-auto">
              <TabsTrigger value="basic" className="px-3 py-2 h-auto text-sm">
                Basic Details
              </TabsTrigger>
              <TabsTrigger
                value="personal"
                className="px-3 py-2 h-auto text-sm"
              >
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="px-3 py-2 h-auto text-sm"
              >
                Professional Info
              </TabsTrigger>
              <TabsTrigger
                value="verification"
                className="px-3 py-2 h-auto text-sm"
              >
                Verification
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <UpdateProfile />
            </TabsContent>

            <TabsContent value="personal">
              <StepOne onComplete={() => {}} />
            </TabsContent>

            <TabsContent value="professional">
              <StepTwo
                onComplete={() => {}}
                onBack={() => {}}
                initialData={initialData}
              />
            </TabsContent>

            <TabsContent value="verification">
              <StepThree
                onComplete={() => {}}
                onBack={() => {}}
                initialData={initialData}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
