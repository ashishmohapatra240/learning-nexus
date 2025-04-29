import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import JobPostForm from "@/components/job/job-post-form";

export default function PostJob() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect if not logged in or not a company
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login?redirect=/post-job");
    } else if (!isLoading && user && user.userType !== "company") {
      setLocation("/jobs");
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
          <p className="text-gray-500">
            Find the perfect L&D professional for your training needs
          </p>
        </div>
        
        <JobPostForm />
      </div>
    </div>
  );
}
