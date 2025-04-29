import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminPage from "../admin-page";
import { useToast } from "@/hooks/use-toast";

export default function AdminIndex() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for admin token
    const adminToken = localStorage.getItem("adminToken");
    
    if (!adminToken) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to access the admin panel"
      });
      setLocation("/admin-login");
      return;
    }
    
    // Verify token validity by making a request to the backend
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/admin/auth/verify-token", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${adminToken}`
          }
        });
        
        if (!response.ok) {
          // If token is invalid, clear it and redirect to login
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminRefreshToken");
          
          throw new Error("Admin session expired or invalid");
        }
        
        // Token is valid, continue to admin page
        setIsLoading(false);
      } catch (error) {
        console.error("Admin authentication error:", error);
        
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "Your admin session has expired. Please login again."
        });
        
        setLocation("/admin-login");
      }
    };
    
    verifyToken();
  }, [setLocation, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <AdminPage />;
}