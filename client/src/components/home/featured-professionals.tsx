import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import ProfessionalCard from "./professional-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfessionalProfile } from "@shared/schema";

export default function FeaturedProfessionals() {
  const { data: professionals, isLoading, error } = useQuery<ProfessionalProfile[]>({
    queryKey: ["/api/professional-profiles/featured?limit=3"],
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-heading font-bold">Featured L&D Professionals</h2>
          <Link href="/professionals" className="text-primary hover:text-primary-dark flex items-center">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center p-6 border-b border-gray-200">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
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
            <p className="text-red-500">Failed to load professionals. Please try again later.</p>
          </div>
        ) : professionals && professionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No featured professionals yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
