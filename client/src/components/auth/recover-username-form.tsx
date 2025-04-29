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
const recoverUsernameSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type RecoverUsernameFormValues = z.infer<typeof recoverUsernameSchema>;

export default function RecoverUsernameForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<RecoverUsernameFormValues>({
    resolver: zodResolver(recoverUsernameSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: RecoverUsernameFormValues) {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/recover-username", data);
      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        // In production, the username would be sent via email, but for demonstration we'll store it
        // This is for development/demo only
        if (result.username) {
          setUsername(result.username);
        }
        
        toast({
          title: "Recovery Email Sent",
          description: "Check your email for your username.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Username recovery error:", error);
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
        <CardTitle className="text-2xl font-bold text-center">Username Recovery</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you your username
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-green-600 font-medium">
              If your email exists in our system, you will receive your username via email.
            </p>
            {username && (
              <div className="p-3 bg-gray-100 rounded-md mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Demo mode: In a production environment, this would be sent via email.
                </p>
                <p className="font-medium">Your username is: <span className="text-primary">{username}</span></p>
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
                {isLoading ? "Sending..." : "Recover Username"}
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
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}