import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

// Admin login form schema
const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
  totpCode: z.string().optional(),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      totpCode: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/admin/auth/login", values);
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        
        // Store the admin token in localStorage
        localStorage.setItem("adminToken", data.accessToken);
        localStorage.setItem("adminRefreshToken", data.refreshToken);
        
        // Redirect to admin dashboard
        setLocation("/admin");
      } else {
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorData.message || "Invalid credentials",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: error.message || "An error occurred during login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Admin Login
          </CardTitle>
          <CardDescription>
            Secure access for system administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="admin@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
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
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="totpCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two-Factor Code (if enabled)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        {...field}
                        disabled={isLoading}
                      />
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
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="px-4 text-center text-sm text-muted-foreground">
            This area is restricted to authorized administrators only.
          </p>
          <Button
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => setLocation("/")}
          >
            Return to Main Site
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}