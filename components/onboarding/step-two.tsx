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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JobType,
  OnboardingStep2Data,
  submitStep2,
} from "@/service/onboarding.service";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { categories } from "@/utils/categories";

const formSchema = z.object({
  introVideoTitle: z.string().min(1, "Video title is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  achievements: z.string().min(1, "Achievements are required"),
  description: z.string().min(1, "Introduction is required"),
  consultationLanguage: z.string().min(1, "Consultation language is required"),
  consultationCharge: z.string().min(1, "Consultation charge is required"),
  jobType: z.string(),
  category: z.string(),
});

interface StepTwoProps {
  onComplete: () => void;
  onBack: () => void;
  initialData?: any;
}

export function StepTwo({ onComplete, onBack, initialData }: StepTwoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile";
  const [introVideo, setIntroVideo] = useState<any>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      introVideoTitle: "",
      jobTitle: "",
      achievements: "",
      description: "",
      consultationLanguage: "",
      consultationCharge: "",
      jobType: "",
      category: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("introVideoTitle", initialData?.intro_video_title);
      setValue("jobTitle", initialData?.job_title);
      setValue("achievements", initialData?.achievements);
      setValue("description", initialData?.description);
      setValue("consultationLanguage", initialData?.consultation_language);
      setValue("consultationCharge", initialData?.consultation_charge);
      setValue("jobType", initialData?.job_type || "");

      if (initialData.keywords) {
        setKeywords(initialData.keywords);
      }

      if (initialData.intro_video_url) {
        setVideoPreviewUrl(initialData.intro_video_url);
      }
    }
  }, [initialData, setValue]);

  console.log("initialData Job Type", initialData?.job_type);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a video element to check duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          toast.error("Video duration must be less than 1 minute");
          event.target.value = ""; // Clear the file input
          return;
        }
        setIntroVideo(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
      };
      video.src = URL.createObjectURL(file);
    }
  };

  // Cleanup video preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Search") && newKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(newKeyword.trim())) {
        setKeywords([...keywords, newKeyword.trim()]);
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.jobType) {
      toast.error("Please select job type");
      return;
    }
    if (!introVideo && !initialData?.intro_video_url) {
      toast.error("Please upload an intro video");
      return;
    }

    if (keywords.length === 0) {
      toast.error("Please add at least one keyword");
      return;
    }

    try {
      setIsLoading(true);
      await submitStep2({
        ...values,
        keywords: JSON.stringify(keywords),
        introVideo: introVideo || undefined,
        isProfilePage: isProfilePage,
      });
      toast.success("Professional information saved successfully");
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
          Professional Information
        </h2>
        <p className="text-muted-foreground mt-2">
          Tell us about your expertise and services
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-lg dark:shadow-white/10 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="p-6 border border-dashed rounded-lg">
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="intro-video"
              />
              <label
                htmlFor="intro-video"
                className="cursor-pointer block w-full"
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground max-w-full truncate text-center">
                    {introVideo?.name || "Upload your intro video"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum duration: 1 minute
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum size: 100 MB
                  </p>
                </div>
              </label>
            </div>

            {videoPreviewUrl && (
              <div className="mt-4">
                <video
                  controls
                  className="w-full rounded-lg border"
                  src={videoPreviewUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Video Title</Label>
              <Input
                placeholder="Enter a title for your intro video"
                {...register("introVideoTitle")}
                className={cn("", {
                  "border-destructive": errors.introVideoTitle,
                })}
                disabled={isLoading}
              />
              {errors.introVideoTitle && (
                <p className="text-sm text-destructive mt-1">
                  {errors.introVideoTitle.message}
                </p>
              )}
            </div>

            <div>
              <Label>Job Title</Label>
              <Input
                placeholder="e.g. Senior Psychologist"
                {...register("jobTitle")}
                className={cn("", {
                  "border-destructive": errors.jobTitle,
                })}
                disabled={isLoading}
              />
              {errors.jobTitle && (
                <p className="text-sm text-destructive mt-1">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            <div>
              <Label>Employment Type</Label>
              <select
                {...register("jobType")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.jobType,
                  }
                )}
              >
                <option value="">Select employment type</option>
                <option value={JobType.EMPLOYED}>Employed</option>
                <option value={JobType.SELF_EMPLOYED}>Self Employed</option>
                <option value={JobType.BUSINESS}>Business</option>
              </select>
              {errors.jobType && (
                <p className="text-sm text-destructive mt-1">
                  {errors.jobType.message}
                </p>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <select
                {...register("category")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-destructive": errors.category,
                  }
                )}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label>Consultation Language</Label>
              <Input
                placeholder="e.g. English, Hindi"
                {...register("consultationLanguage")}
                className={cn("", {
                  "border-destructive": errors.consultationLanguage,
                })}
                disabled={isLoading}
              />
              {errors.consultationLanguage && (
                <p className="text-sm text-destructive mt-1">
                  {errors.consultationLanguage.message}
                </p>
              )}
            </div>

            <div>
              <Label>Consultation Charge (per hour)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                {...register("consultationCharge")}
                className={cn("", {
                  "border-destructive": errors.consultationCharge,
                })}
                disabled={isLoading}
              />
              {errors.consultationCharge && (
                <p className="text-sm text-destructive mt-1">
                  {errors.consultationCharge.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map((keyword: any) => (
                <Badge key={keyword} variant="soft">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type keywords and press Enter"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleAddKeyword}
                disabled={isLoading}
                type="search"
              />
              <Button
                type="button"
                onClick={() => {
                  if (
                    newKeyword.trim() &&
                    !keywords.includes(newKeyword.trim())
                  ) {
                    setKeywords([...keywords, newKeyword.trim()]);
                    setNewKeyword("");
                  }
                }}
                disabled={isLoading || !newKeyword.trim()}
                variant="outline"
              >
                Add
              </Button>
            </div>
          </div>

          <div>
            <Label>Introduction</Label>
            <Textarea
              placeholder="Introduce yourself and your services"
              className={cn("min-h-[100px]", {
                "border-destructive": errors.description,
              })}
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label>Achievements</Label>
            <Textarea
              placeholder="Tell us about your achievements and experience"
              className={cn("min-h-[100px]", {
                "border-destructive": errors.achievements,
              })}
              {...register("achievements")}
              disabled={isLoading}
            />
            {errors.achievements && (
              <p className="text-sm text-destructive mt-1">
                {errors.achievements.message}
              </p>
            )}
          </div>

          <div className="flex justify-between gap-4">
            {!isProfilePage && (
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(isProfilePage && "w-full")}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
