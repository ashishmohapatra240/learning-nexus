import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookOpen, RefreshCw } from "lucide-react";
import { Link } from "wouter";

interface SkillRecommendation {
  skill: string;
  relevance: number;
  description: string;
  resources: Array<{
    title: string;
    type: string;
    url?: string;
  }>;
  estimatedTimeToMaster: string;
  marketDemand: string;
  relatedJobs: string[];
}

interface SkillRecommendationsProps {
  professionalId: number;
  isCurrentUser: boolean;
}

export default function SkillRecommendations({ professionalId, isCurrentUser }: SkillRecommendationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/professionals', professionalId, 'skill-recommendations'],
    queryFn: async () => {
      const res = await fetch(`/api/professionals/${professionalId}/skill-recommendations`);
      if (!res.ok) {
        throw new Error('Failed to fetch skill recommendations');
      }
      const data = await res.json();
      return data;
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/professionals/${professionalId}/refresh-skill-recommendations`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Skill recommendations refreshed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professionals', professionalId, 'skill-recommendations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to refresh recommendations: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const toggleSkillDetails = (skill: string) => {
    setExpandedSkill(expandedSkill === skill ? null : skill);
  };

  if (isLoading) {
    return (
      <Card className="w-full mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Skill Recommendations</CardTitle>
          <CardDescription>Loading your personalized skill recommendations...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mb-1"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Skill Recommendations</CardTitle>
          <CardDescription>
            We encountered an error loading your skill recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </CardContent>
        {isCurrentUser && (
          <CardFooter>
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  if (!data || !data.recommendations) {
    return (
      <Card className="w-full mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Skill Recommendations</CardTitle>
          <CardDescription>
            No skill recommendations available yet.
          </CardDescription>
        </CardHeader>
        {isCurrentUser && (
          <CardFooter>
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              {refreshMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  let recommendations: SkillRecommendation[];
  try {
    recommendations = JSON.parse(data.recommendations);
  } catch (e) {
    return (
      <Card className="w-full mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Skill Recommendations</CardTitle>
          <CardDescription>
            There was an error processing your skill recommendations.
          </CardDescription>
        </CardHeader>
        {isCurrentUser && (
          <CardFooter>
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Recommendations
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6 shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Skill Recommendations</CardTitle>
            <CardDescription>
              AI-powered insights to help advance your career
            </CardDescription>
          </div>
          {isCurrentUser && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.map((rec) => (
          <div key={rec.skill} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2 cursor-pointer" 
                 onClick={() => toggleSkillDetails(rec.skill)}>
              <div>
                <h3 className="font-semibold text-lg">{rec.skill}</h3>
                <div className="flex space-x-2 mt-1">
                  <Badge variant={rec.marketDemand === 'High' ? 'default' : 
                               rec.marketDemand === 'Medium' ? 'outline' : 'secondary'}>
                    {rec.marketDemand} Demand
                  </Badge>
                  <Badge variant="outline">{rec.estimatedTimeToMaster}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2 min-w-24">
                <div className="text-sm font-medium">{rec.relevance}/10</div>
                <Progress value={rec.relevance * 10} className="w-16" />
              </div>
            </div>
            
            {expandedSkill === rec.skill && (
              <div className="mt-4 space-y-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">{rec.description}</p>
                
                {rec.resources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recommended Resources:</h4>
                    <ul className="space-y-2">
                      {rec.resources.map((resource, idx) => (
                        <li key={idx} className="text-sm flex items-start">
                          <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-xs text-gray-500">{resource.type}</div>
                            {resource.url && (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary inline-flex items-center mt-1 hover:underline"
                              >
                                Visit resource <ArrowRight className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {rec.relatedJobs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm">Related Job Roles:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rec.relatedJobs.map((job, idx) => (
                        <Badge key={idx} variant="secondary">{job}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          Last updated: {new Date(data.updatedAt).toLocaleDateString()}
        </div>
        <Link to="/resources">
          <Button variant="link" size="sm" className="text-primary">
            Browse all learning resources
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}