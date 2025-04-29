import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Linkedin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
});

export default function LoginForm() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      const user = await login({
        username: data.identifier, // The backend will handle if this is email or username
        password: data.password,
        rememberMe: data.rememberMe,
      });
      
      toast({
        title: "Logged in successfully!",
        description: `Welcome back, ${user.username}!`,
      });
      
      // Check for redirect parameter
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      
      if (redirect) {
        // Redirect to the requested page after login
        setLocation(redirect);
      } else {
        // Default redirects based on user type
        if (user.isAdmin) {
          setLocation("/admin/dashboard");
        } else if (user.userType === "professional") {
          setLocation("/professional-dashboard");
        } else {
          setLocation("/company-dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username or Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username or email" {...field} />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                You can login with either your username or email address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Remember me
                </FormLabel>
                <FormDescription className="text-xs">
                  Keep me signed in on this device
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.location.href = '/api/auth/google'} 
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12.545 12.151L12.542 12.156 12.545 12.151zM10.879 7.655l-1.388-.6407-2.236-3.421-1.766 7.48.058.0464c.1154 1.4097 1.6492 4.57 5.162 4.57 3.513 0 5.162-2.911 5.302-4.006L10.877 7.655h.002z" fill="#FF4131" />
              <path d="M13.548 8.746l1.6-.6714.869-1.2806h-6.232l3.763 1.952z" fill="#FDBA12" />
              <path d="M15.211 10.437c-.167-.9087-1.064-1.6913-2.047-1.6913h-4.05c.0774 2.9486 2.428 3.4893 3.282 3.4893 0 0 1.6927-.211 2.8154-1.798z" fill="#517CBD" />
              </svg>
            Google
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.location.href = '/api/auth/linkedin'} 
            className="w-full"
          >
            <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
            LinkedIn
          </Button>
        </div>
      </form>
    </Form>
  );
}
