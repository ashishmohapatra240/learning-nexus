import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import CompanyDashboardContent from "@/components/dashboard/company-dashboard";

export default function CompanyDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect if not logged in or not a company
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login?redirect=/company-dashboard");
    } else if (!isLoading && user && user.userType !== "company") {
      setLocation("/professional-dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.userType !== "company") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <CompanyDashboardContent />
    </div>
  );
}
