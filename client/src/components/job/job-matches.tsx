import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ProfessionalProfile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface JobMatchesProps {
  jobId: number;
  companyId?: number;
}

interface MatchResult {
  profile: ProfessionalProfile;
  score: number;
}

export default function JobMatches({ jobId, companyId }: JobMatchesProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Only fetch matches if the current user is a company user that owns the job posting
  // or if they're an admin
  const shouldFetch = user && (
    (user.userType === "company" && companyId && user.id === companyId) || 
    user.isAdmin
  );
  
  const { 
    data: matches, 
    isLoading, 
    error 
  } = useQuery<MatchResult[]>({
    queryKey: [`/api/jobs/${jobId}/matches`],
    enabled: !!shouldFetch && !!jobId,
  });

  const handleMessageProfessional = (professionalId: number) => {
    setLocation(`/messages?professional=${professionalId}`);
  };

  if (!shouldFetch) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500">Could not load professional matches. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matches?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">No matching professionals found for this position.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Recommended Professionals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map(({ profile, score }) => (
            <div key={profile.id} className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.profileImageUrl || ""} alt={profile.title || ""} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <Link href={`/professionals/${profile.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                      {profile.title}
                    </h3>
                  </Link>
                  <div className="text-sm text-gray-500">
                    {profile.yearsExperience} years experience
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Match score:</span>
                  <Progress value={score * 100} className="h-2 w-24" />
                  <span className="text-sm font-medium">{Math.round(score * 100)}%</span>
                </div>
                
                {profile.interests && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.interests.split(',').slice(0, 3).map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="ml-auto"
                onClick={() => handleMessageProfessional(profile.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}