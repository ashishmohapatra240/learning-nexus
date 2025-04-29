import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowRight, 
  FileText, 
  BookOpen, 
  Video, 
  MessageSquare 
} from "lucide-react";
import ResourceCard from "./resource-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Resource } from "@shared/schema";

export default function ResourceHub() {
  const { data: resources, isLoading, error } = useQuery<Resource[]>({
    queryKey: ["/api/resources/featured?limit=3"],
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-4">Resource Hub</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
          Access curated learning materials, templates, and articles from the L&D community.
        </p>
        
        {/* Resource Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Link href="/resources?type=templates" className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 text-primary p-4 rounded-full mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-medium text-center">Templates</h3>
          </Link>
          
          <Link href="/resources?type=articles" className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-teal-100 text-teal-600 p-4 rounded-full mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-medium text-center">Articles</h3>
          </Link>
          
          <Link href="/resources?type=videos" className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-amber-100 text-amber-600 p-4 rounded-full mb-3">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-medium text-center">Videos</h3>
          </Link>
          
          <Link href="/forum" className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 text-primary p-4 rounded-full mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-medium text-center">Community</h3>
          </Link>
        </div>
        
        {/* Featured Resources */}
        <h3 className="text-2xl font-heading font-bold mb-6">Featured Resources</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load resources. Please try again later.</p>
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No featured resources yet. Check back soon!</p>
          </div>
        )}
        
        <div className="text-center mt-10">
          <Button className="inline-flex items-center" asChild>
            <Link href="/resources">
              Explore All Resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
