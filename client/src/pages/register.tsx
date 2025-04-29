import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Get type from query parameters
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.userType === "professional") {
        setLocation("/professional-dashboard");
      } else {
        setLocation("/company-dashboard");
      }
    }
  }, [user, setLocation]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
          <p className="text-gray-600">
            Join L&D Nexus to connect with professionals or find expert trainers
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <RegisterForm initialUserType={type || undefined} />
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
