import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Briefcase, MapPin, Clock, Building, CalendarClock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { JobPosting, CompanyProfile } from "@shared/schema";

// Extended JobPosting type with additional properties for display
interface EnhancedJobPosting extends JobPosting {
  companyName?: string;
  contractType?: string;
  skills?: string[];
}

type MatchResult = {
  job: EnhancedJobPosting;
  score: number;
};

export default function ProfessionalJobMatches() {
  const { user } = useAuth();
  
  // Fetch professional profile
  const { 
    data: profile, 
    isLoading: isLoadingProfile 
  } = useQuery({
    queryKey: ["/api/professionals/me"],
    enabled: !!user,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (response.status === 401) {
          // Return null for unauthorized
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/professionals/me:", error);
        return null;
      }
    },
  });
  
  // Fetch matched jobs - allow fetching without authentication for development/testing
  const { 
    data: matches, 
    isLoading: isLoadingMatches,
    error: matchError 
  } = useQuery<MatchResult[]>({
    queryKey: ["/api/professionals/me/matches"],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (response.status === 401) {
          // Return empty array for unauthorized
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch job matches: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/professionals/me/matches:", error);
        return [];
      }
    },
    // Enable even without profile for testing
    enabled: true,
  });
  
  // Fetch company profiles to get company names
  const {
    data: companies
  } = useQuery<CompanyProfile[]>({
    queryKey: ["/api/company-profiles"],
    enabled: !!matches && matches.length > 0,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching company profiles: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/company-profiles:", error);
        return [];
      }
    },
  });
  
  // Format the match score as a percentage
  const formatMatchScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };
  
  // Helper to get company name for a job
  const getCompanyName = (companyId: number) => {
    if (!companies) return "Company";
    const company = companies.find(c => c.id === companyId);
    return company?.companyName || "Company";
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="mr-2 h-5 w-5" /> AI Job Matches
        </CardTitle>
        <CardDescription>
          Jobs that match your skills and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!profile && user ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">Create a profile to see job matches</p>
            <Link href="/edit-profile">
              <Button>Complete Your Profile</Button>
            </Link>
          </div>
        ) : matchError ? (
          <div className="text-center py-6">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Error Loading Matches</h3>
            <p className="text-gray-500 mb-4">There was a problem retrieving your job matches</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : isLoadingMatches ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center mt-2">
                      <Skeleton className="h-4 w-24 mr-3" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map(({ job, score }) => (
              <div key={job.id} className="border rounded-md p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{job.title}</h3>
                    <p className="text-gray-500">{job.companyName || getCompanyName(job.companyId)}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      {job.remote && (
                        <Badge variant="outline" className="bg-blue-50">Remote</Badge>
                      )}
                      
                      {job.contractType ? (
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-1" />
                          <span>{job.contractType}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-1" />
                          <span>{job.jobType}</span>
                        </div>
                      )}
                      
                      {job.createdAt && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Badge className="mb-2 bg-emerald-100 text-emerald-800">
                      {formatMatchScore(score)} Match
                    </Badge>
                    <Link href={`/jobs/${job.id}`}>
                      <Button size="sm" className="flex items-center">
                        View Job <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {job.description && (
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {job.description}
                  </p>
                )}
                
                {job.skills && job.skills.length > 0 ? (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="bg-gray-100">
                        {job.jobType}
                      </Badge>
                      {job.compensationUnit && (
                        <Badge variant="secondary" className="bg-gray-100">
                          {job.compensationUnit} pay
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium mb-1">No Matches Found</h3>
            <p className="text-gray-500 mb-4">We couldn't find any jobs matching your profile</p>
            <Link href="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}