"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Thank you for your time!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The meeting has ended. You will be redirected to the home page in a
            few seconds.
          </p>
        </div>
        <div className="mt-8">
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
