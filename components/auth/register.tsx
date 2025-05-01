"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/validations";
import { register as registerUser } from "@/service/auth.service";
import Image from "next/image";
import FavIcon from "@/public/images/all-img/fav-icon.png";

const Register = () => {
  const navigation = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const [confirmPasswordType, setConfirmPasswordType] =
    React.useState("password");
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "text" ? "password" : "text"));
  };

  const toggleConfirmPasswordType = () => {
    setConfirmPasswordType((prev) => (prev === "text" ? "password" : "text"));
  };

  const onSubmit = (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    startTransition(async () => {
      try {
        const registerPayload = {
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
        };
        const response: any = await registerUser(registerPayload);
        if (response?.status === true) {
          toast.success(response?.message);
          navigation.replace("onboarding/step-1");
        } else {
          toast.error(response?.message);
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    });
  };

  return (
    <div className="w-full py-10">
      <Link href="/" className="flex gap-2 items-center">
        <Image
          src={FavIcon}
          alt="Company Fav icon"
          className="w-[50px] object-cover"
          priority={true}
        />
        <div className="flex-1  text-2xl">
          <span className="text-primary font-extrabold">Calling</span>{" "}
          <span className="text-gray-700 font-light">Expert</span>
        </div>
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Create an Account 👋
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="name"
                className="mb-2 font-medium text-default-600"
              >
                Full Name
              </Label>
              <Input
                disabled={isPending}
                {...register("name")}
                type="text"
                id="name"
                className={cn("", {
                  "border-destructive": errors.name,
                })}
                size={!isDesktop2xl ? "xl" : "lg"}
              />
              {errors.name && (
                <div className="text-destructive mt-2">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div>
              <Label
                htmlFor="username"
                className="mb-2 font-medium text-default-600"
              >
                Username
              </Label>
              <Input
                disabled={isPending}
                {...register("username")}
                type="text"
                id="username"
                className={cn("", {
                  "border-destructive": errors.username,
                })}
                size={!isDesktop2xl ? "xl" : "lg"}
              />
              {errors.username && (
                <div className="text-destructive mt-2">
                  {errors.username.message}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="email"
              className="mb-2 font-medium text-default-600"
            >
              Email
            </Label>
            <Input
              disabled={isPending}
              {...register("email")}
              type="email"
              id="email"
              className={cn("", {
                "border-destructive": errors.email,
              })}
              size={!isDesktop2xl ? "xl" : "lg"}
            />
            {errors.email && (
              <div className="text-destructive mt-2">
                {errors.email.message}
              </div>
            )}
          </div>

          <div>
            <Label
              htmlFor="password"
              className="mb-2 font-medium text-default-600"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                disabled={isPending}
                {...register("password")}
                type={passwordType}
                id="password"
                className={cn("peer", {
                  "border-destructive": errors.password,
                })}
                size={!isDesktop2xl ? "xl" : "lg"}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
                onClick={togglePasswordType}
              >
                {passwordType === "password" ? (
                  <Icon
                    icon="heroicons:eye"
                    className="w-5 h-5 text-default-400"
                  />
                ) : (
                  <Icon
                    icon="heroicons:eye-slash"
                    className="w-5 h-5 text-default-400"
                  />
                )}
              </div>
            </div>
            {errors.password && (
              <div className="text-destructive mt-2">
                {errors.password.message}
              </div>
            )}
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="mb-2 font-medium text-default-600"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                disabled={isPending}
                {...register("confirmPassword")}
                type={confirmPasswordType}
                id="confirmPassword"
                className={cn("peer", {
                  "border-destructive": errors.confirmPassword,
                })}
                size={!isDesktop2xl ? "xl" : "lg"}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
                onClick={toggleConfirmPasswordType}
              >
                {confirmPasswordType === "password" ? (
                  <Icon
                    icon="heroicons:eye"
                    className="w-5 h-5 text-default-400"
                  />
                ) : (
                  <Icon
                    icon="heroicons:eye-slash"
                    className="w-5 h-5 text-default-400"
                  />
                )}
              </div>
            </div>
            {errors.confirmPassword && (
              <div className="text-destructive mt-2">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-full mt-8"
          disabled={isPending}
          size={!isDesktop2xl ? "lg" : "md"}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Creating Account..." : "Create Account"}
        </Button>

        <div className="mt-5 text-center text-base text-default-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
