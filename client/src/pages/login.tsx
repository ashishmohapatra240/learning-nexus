import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Get redirect from query parameters
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (redirect) {
        setLocation(redirect);
      } else if (user.isAdmin) {
        setLocation("/admin");
      } else if (user.userType === "professional") {
        setLocation("/professional-dashboard");
      } else {
        setLocation("/company-dashboard");
      }
    }
  }, [user, redirect, setLocation]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            Sign in to your L&D Nexus account
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create Account
              </Link>
            </p>
            <div className="mt-2 text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
              {" • "}
              <Link href="/recover-username" className="text-primary hover:underline">
                Forgot username?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
