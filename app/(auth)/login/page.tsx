"use client";
import { AuthLayout } from "@/components/layout";
import Login from "@/components/auth/login";

const LoginPage = () => {
  return (
    <AuthLayout>
      <Login />
    </AuthLayout>
  );
};

export default LoginPage;
