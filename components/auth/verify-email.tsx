"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FavIcon from "@/public/images/all-img/fav-icon.png";
import { motion } from "framer-motion";
import { verifyEmail } from "@/service/auth.service";
import { toast } from "sonner";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const hasVerified = useRef(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    status: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      // Prevent multiple verifications
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        if (!token) {
          setVerificationStatus({
            status: false,
            message: "Invalid verification link",
          });
          return;
        }

        const payload = {
          token: token,
        };

        const response = await verifyEmail(payload);
        if (response.status == true) {
          setVerificationStatus({
            status: true,
            message: "Email verified successfully!",
          });
          toast.success("Email verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        } else {
          setVerificationStatus({
            status: false,
            message: response.message || "Verification failed",
          });
          toast.error(response.message || "Verification failed");
        }
      } catch (error: any) {
        setVerificationStatus({
          status: false,
          message: error.message || "Verification failed",
        });
        toast.error(error.message || "Verification failed");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]); // Remove router from dependencies as it's stable

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center space-y-6">
            <Link href="/" className="flex gap-2 items-center justify-center">
              <Image
                src={FavIcon}
                alt="Company Fav icon"
                className="w-[50px] object-cover"
                priority={true}
              />
              <div className="flex-1 text-2xl">
                <span className="text-primary font-extrabold">Calling</span>{" "}
                <span className="text-foreground font-light">Expert</span>
              </div>
            </Link>

            {isLoading ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <h2 className="text-xl font-semibold text-foreground">
                  Verifying your email...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address.
                </p>
              </div>
            ) : verificationStatus?.status ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="space-y-4 py-8"
              >
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-success">
                  Email Verified Successfully
                </h2>
                <p className="text-muted-foreground">
                  Your email has been successfully verified. Redirecting to
                  login...
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="space-y-4 py-8"
              >
                <div className="flex justify-center">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-destructive">
                  Verification Failed
                </h2>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full mt-4"
                >
                  Return to Login
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
