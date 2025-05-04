"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FavIcon from "@/public/images/all-img/fav-icon.png";
import { motion } from "framer-motion";
import { forgotPassword } from "@/service/auth.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/validations/forgot-password.validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      setIsLoading(true);
      const response = await forgotPassword(data.email);
      if (response.status) {
        toast.success(response.message);
        // Clear the form
        form.reset();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };

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
                <h1 className="text-black font-bold">MINDNAMO</h1>
              </div>
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Forgot Password
              </h2>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
