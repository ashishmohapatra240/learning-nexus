import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        // In production, the token would be sent via email, but for demonstration we'll store it
        // This is for development/demo only
        if (result.token) {
          setResetToken(result.token);
        }
        
        toast({
          title: "Recovery Email Sent",
          description: "Check your email for instructions to reset your password.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Password Recovery</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-green-600 font-medium">
              If your email exists in our system, you will receive a password reset link.
            </p>
            {resetToken && (
              <div className="p-3 bg-gray-100 rounded-md mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Demo mode: In a production environment, this token would be sent via email.
                </p>
                <Link href={`/reset-password?token=${resetToken}`} className="text-primary hover:underline">
                  Click here to reset your password
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email address" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Recovery Email"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
          {" • "}
          <Link href="/recover-username" className="text-primary hover:underline">
            Forgot username?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}