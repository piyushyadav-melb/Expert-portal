"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchProfile,
  updateProfile,
  UpdateProfileData,
} from "@/service/profile.service";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  whatsapp_number: z
    .string()
    .min(10, "Phone number should be of minimum 10 digits")
    .max(15, "Phone number should be of maximum 15 digits"),
});

type FormValues = z.infer<typeof formSchema>;

export function UpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      username: "",
      whatsapp_number: "",
    },
  });

  // Fetch initial profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchProfile();
        if (response.status && response.data) {
          setInitialData(response.data);
          setValue("name", response.data.name);
          setValue("email", response.data.email);
          setValue("username", response.data.username);
          setValue("whatsapp_number", response.data.whatsapp_number);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load profile data");
      }
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const response = await updateProfile(values);
      if (response.status) {
        toast.success(response.message);
        setInitialData(values);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-lg dark:shadow-white/10 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="Enter your full name"
                {...register("name")}
                className={cn("", {
                  "border-destructive": errors.name,
                })}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={cn("", {
                  "border-destructive": errors.email,
                })}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label>Username</Label>
              <Input
                placeholder="Choose a username"
                {...register("username")}
                className={cn("", {
                  "border-destructive": errors.username,
                })}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label>WhatsApp Number</Label>
              <Input
                placeholder="Enter your WhatsApp number"
                {...register("whatsapp_number")}
                className={cn("", {
                  "border-destructive": errors.whatsapp_number,
                })}
                disabled={isLoading}
              />
              {errors.whatsapp_number && (
                <p className="text-sm text-destructive mt-1">
                  {errors.whatsapp_number.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
