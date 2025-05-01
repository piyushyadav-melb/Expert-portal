"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gender,
  OnboardingStep1Data,
  submitStep1,
} from "@/service/onboarding.service";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fetchProfile } from "@/service/profile.service";
import { cities, countries, states } from "@/utils/locations";
import { usePathname } from "next/navigation";

const formSchema = z.object({
  gender: z.string(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  whatsappNumber: z
    .string()
    .min(10, "Phone no should be of minimum 10 digits")
    .max(15, "Phone no should be of maximum 15 digits"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
});

interface StepOneProps {
  onComplete: () => void;
  initialData?: any;
}

export function StepOne({ onComplete }: StepOneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile" ? true : false;
  const [initialData, setInitialData] = useState<any>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      gender: "",
      dateOfBirth: "",
      whatsappNumber: "",
      addressLine1: "",
      addressLine2: "",
      country: "",
      state: "",
      city: "",
    },
  });

  // Watch for state changes and reset city if needed
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "state" && !initialData?.city) {
        setValue("city", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, initialData?.city]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await fetchProfile();
        const profileData = data?.data;
        if (profileData) {
          setInitialData(profileData);

          // Set form values
          setValue("gender", profileData.gender || "");
          if (profileData.date_of_birth) {
            const date = new Date(profileData.date_of_birth);
            const formattedDate = date.toISOString().split("T")[0];
            setValue("dateOfBirth", formattedDate);
          }
          setValue("whatsappNumber", profileData.whatsapp_number || "");
          setValue("addressLine1", profileData.address_line_1 || "");
          setValue("addressLine2", profileData.address_line_2 || "");
          setValue("country", profileData.country || "");
          setValue("state", profileData.state || "");
          setValue("city", profileData.city || "");

          if (profileData.profile_picture_url) {
            setPreviewUrl(profileData.profile_picture_url);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfileData();
  }, [setValue]);

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const onSubmit = async (values: any) => {
    try {
      if (!values.gender) {
        toast.error("Please select gender");
        return;
      }

      if (!values.country) {
        toast.error("Please select date of birth");
        return;
      }

      if (!values.state) {
        toast.error("Please select state");
        return;
      }

      if (!values.city) {
        toast.error("Please select city");
        return;
      }
      setIsLoading(true);

      const dateParts = values.dateOfBirth.split("-");
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      // Create FormData to handle file upload
      const formData: any = new FormData();
      formData.append("gender", values.gender);
      formData.append("dateOfBirth", formattedDate);
      formData.append("whatsappNumber", values.whatsappNumber);
      formData.append("addressLine1", values.addressLine1);
      formData.append("addressLine2", values.addressLine2 || "");
      formData.append("country", values.country);
      formData.append("state", values.state);
      formData.append("city", values.city);
      formData.append("isProfilePage", isProfilePage);

      // Append profile picture if it exists
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      await submitStep1(formData);
      toast.success("Personal information saved successfully");
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Personal Information
        </h2>
        <p className="text-muted-foreground mt-2">
          Tell us about yourself to get started
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-lg dark:shadow-white/10 p-6">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary mb-4">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
              id="profile-picture"
            />
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                document.getElementById("profile-picture")?.click()
              }
            >
              Upload Profile Picture
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Gender</Label>
              <select
                {...register("gender")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.gender,
                  }
                )}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-destructive mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                {...register("dateOfBirth")}
                className={cn("", {
                  "border-destructive": errors.dateOfBirth,
                })}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <Label>WhatsApp Number</Label>
              <Input
                placeholder="Enter your WhatsApp number"
                {...register("whatsappNumber")}
                className={cn("", {
                  "border-destructive": errors.whatsappNumber,
                })}
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.whatsappNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label>Address Line 1</Label>
              <Input
                placeholder="Enter your address"
                {...register("addressLine1")}
                className={cn("", {
                  "border-destructive": errors.addressLine1,
                })}
              />
              {errors.addressLine1 && (
                <p className="text-sm text-destructive mt-1">
                  {errors.addressLine1.message}
                </p>
              )}
            </div>

            <div>
              <Label>Country</Label>
              <select
                {...register("country")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.country,
                  }
                )}
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm text-destructive mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div>
              <Label>State</Label>
              <select
                {...register("state")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.state,
                  }
                )}
              >
                <option value="">Select state</option>
                {states.India.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-sm text-destructive mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <Label>City</Label>
              <select
                {...register("city")}
                disabled={!watch("state")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.city,
                  }
                )}
              >
                <option value="">Select city</option>
                {cities[watch("state") as keyof typeof cities]?.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-sm text-destructive mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
