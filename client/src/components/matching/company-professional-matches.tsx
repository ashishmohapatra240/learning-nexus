import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Users, MapPin, Star, Award, Lightbulb, ChevronRight, Mail } from "lucide-react";
import type { ProfessionalProfile, JobPosting } from "@shared/schema";

// Define an extended professional profile type for the match results
// to account for additional properties used in the component
interface ExtendedProfessionalProfile extends ProfessionalProfile {
  yearsOfExperience?: number | null; // Additional property used in the component
  industries?: string[] | null; // Additional property used in the component
  expertise?: string[] | null; // Additional property used in the component
}

type MatchResult = {
  professional: ExtendedProfessionalProfile;
  score: number;
};

export default function CompanyProfessionalMatches({ jobId }: { jobId: number }) {
  const { user } = useAuth();
  
  // Fetch company profile
  const { 
    data: company,
    isLoading: isLoadingCompany
  } = useQuery({
    queryKey: ["/api/companies/me"],
    enabled: !!user,
  });
  
  // Fetch matched professionals for a specific job - allow fetching without authentication for development/testing
  const { 
    data: matches, 
    isLoading: isLoadingMatches,
    error: matchError
  } = useQuery<MatchResult[]>({
    queryKey: [`/api/jobs/${jobId}/matches`],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/matches`);
      if (!response.ok) {
        throw new Error('Failed to fetch professional matches');
      }
      return response.json();
    },
    // Enable for testing without requiring company profile
    enabled: !!jobId,
  });
  
  // Fetch the job details
  const {
    data: job,
    isLoading: isLoadingJob
  } = useQuery<JobPosting>({
    queryKey: ["/api/job-postings", jobId],
    enabled: !!jobId,
  });
  
  // Format the match score as a percentage
  const formatMatchScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" /> AI Professional Matches
        </CardTitle>
        <CardDescription>
          {job ? (
            <>Professionals that match your "{job.title}" job requirements</>
          ) : (
            <>Finding the best professionals for your job</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!company && user ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">Complete your company profile to see matches</p>
            <Link href="/company/edit-profile">
              <Button>Complete Company Profile</Button>
            </Link>
          </div>
        ) : matchError ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Error Loading Matches</h3>
            <p className="text-gray-500 mb-4">There was a problem retrieving professional matches</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : isLoadingMatches || isLoadingJob ? (
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
            {matches.map(({ professional, score }) => (
              <div key={professional.id} className="border rounded-md p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mr-3">
                        {professional.profileImageUrl ? (
                          <img
                            src={professional.profileImageUrl}
                            alt={professional.title || 'Profile'}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{professional.title || `${professional.firstName} ${professional.lastName}`}</h3>
                        <div className="flex items-center text-gray-500">
                          {professional.location && (
                            <div className="flex items-center mr-3">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="text-sm">{professional.location}</span>
                            </div>
                          )}
                          {typeof professional.rating === 'number' && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              <span className="text-sm">{(professional.rating / 20).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      {professional.yearsOfExperience && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          {professional.yearsOfExperience}+ years experience
                        </Badge>
                      )}
                      
                      {professional.industries && professional.industries.length > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {professional.industries[0]}
                        </Badge>
                      )}
                      
                      {professional.ratePerHour && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ${professional.ratePerHour}/hr
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Badge className="mb-2 bg-emerald-100 text-emerald-800">
                      {formatMatchScore(score)} Match
                    </Badge>
                    <div className="flex space-x-2">
                      <Link href={`/messages?user=${professional.userId}`}>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" /> Contact
                        </Button>
                      </Link>
                      <Link href={`/professionals/${professional.id}`}>
                        <Button size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {professional.bio && (
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {professional.bio}
                  </p>
                )}
                
                {professional.expertise && professional.expertise.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center mb-1">
                      <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                      <span className="text-sm font-medium">Key Expertise</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {professional.expertise.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium mb-1">No Matches Found</h3>
            <p className="text-gray-500 mb-4">We couldn't find professionals matching your job requirements</p>
            <Link href="/professionals">
              <Button>Browse All Professionals</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}