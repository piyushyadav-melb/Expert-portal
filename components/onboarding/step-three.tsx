"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { submitStep3 } from "@/service/onboarding.service";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface StepThreeProps {
  onComplete: () => void;
  onBack: () => void;
  initialData?: any;
}

export function StepThree({ onComplete, onBack, initialData }: StepThreeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile";
  const [identityFront, setIdentityFront] = useState<File | null>(null);
  const [identityBack, setIdentityBack] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [license, setLicense] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(
    null
  );
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [frontUrl, setFrontUrl] = useState<any>(null);
  const [backUrl, setBackUrl] = useState<any>(null);
  const [certificateUrl, setCertificateUrl] = useState<any>(null);
  const [licenseUrl, setLicenseUrl] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      setFrontUrl(initialData.identity_front_url);
      setBackUrl(initialData.identity_back_url);
      setCertificateUrl(initialData.certificate_url);
      setLicenseUrl(initialData.license_url);
    }
  }, [initialData]);

  const handleFrontImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdentityFront(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdentityBack(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleCertificateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setCertificate(file);
      setCertificatePreview(URL.createObjectURL(file));
    }
  };

  const handleLicenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicense(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!identityFront || !identityBack) {
      toast.error("Please upload both sides of your identity document");
      return;
    }

    if (!certificate) {
      toast.error("Please upload your certificate");
      return;
    }

    if (!license) {
      toast.error("Please upload your license");
      return;
    }

    try {
      setIsLoading(true);
      await submitStep3({
        identityFront,
        identityBack,
        certificate,
        license,
      });
      toast.success("Identity verification submitted successfully");
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
          Identity Verification
        </h2>
        <p className="text-muted-foreground mt-2">
          Please upload clear images of your identity document and credentials
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-medium">Front Side</h3>
            </div>
            <div className="aspect-[3/2] relative border-2 border-dashed rounded-lg overflow-hidden mb-4">
              {frontPreview ? (
                <Image
                  src={frontPreview}
                  alt="Front ID"
                  fill
                  className="object-contain"
                />
              ) : frontUrl ? (
                <Image
                  src={frontUrl}
                  alt="Front ID"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFrontImageChange}
                className="hidden"
                id="front-id"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("front-id")?.click()}
            >
              Upload Front ID
            </Button>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-medium">Back Side</h3>
            </div>
            <div className="aspect-[3/2] relative border-2 border-dashed rounded-lg overflow-hidden mb-4">
              {backPreview ? (
                <Image
                  src={backPreview}
                  alt="Back ID"
                  fill
                  className="object-contain"
                />
              ) : backUrl ? (
                <Image
                  src={backUrl}
                  alt="Back ID"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleBackImageChange}
                className="hidden"
                id="back-id"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("back-id")?.click()}
            >
              Upload Back ID
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-medium">Certificate</h3>
            </div>
            <div className="aspect-[3/2] relative border-2 border-dashed rounded-lg overflow-hidden mb-4">
              {certificatePreview ? (
                <Image
                  src={certificatePreview}
                  alt="Certificate"
                  fill
                  className="object-contain"
                />
              ) : certificateUrl ? (
                <Image
                  src={certificateUrl}
                  alt="Certificate"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleCertificateChange}
                className="hidden"
                id="certificate"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("certificate")?.click()}
            >
              Upload Certificate
            </Button>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-medium">License</h3>
            </div>
            <div className="aspect-[3/2] relative border-2 border-dashed rounded-lg overflow-hidden mb-4">
              {licensePreview ? (
                <Image
                  src={licensePreview}
                  alt="License"
                  fill
                  className="object-contain"
                />
              ) : licenseUrl ? (
                <Image
                  src={licenseUrl}
                  alt="License"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleLicenseChange}
                className="hidden"
                id="license"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("license")?.click()}
            >
              Upload License
            </Button>
          </Card>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        {!isProfilePage && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className={cn(isProfilePage && "w-full")}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Complete"
          )}
        </Button>
      </div>
    </div>
  );
}
