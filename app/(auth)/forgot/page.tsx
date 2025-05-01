"use client";
import { AuthLayout } from "@/components/layout";
import ForgotPassword from "@/components/auth/forgot-password";

const ForgotPasswordPage = () => {
  return (
    <AuthLayout>
      <ForgotPassword />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
