import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import JobCard from "./job-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobPosting } from "@shared/schema";

export default function FeaturedJobs() {
  const { data: jobs, isLoading, error } = useQuery<JobPosting[]>({
    queryKey: ["/api/job-postings/latest?limit=2"],
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-heading font-bold">Latest L&D Opportunities</h2>
          <Link href="/jobs" className="text-primary hover:text-primary-dark flex items-center">
            View all jobs
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load job postings. Please try again later.</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No job postings available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
