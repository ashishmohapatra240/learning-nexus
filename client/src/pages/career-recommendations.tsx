
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BookOpen, DollarSign } from "lucide-react";

interface CareerRecommendation {
  role: string;
  description: string;
  requiredSkills: string[];
  courses: Array<{
    name: string;
    provider: string;
    description: string;
  }>;
  marketDemand: string;
  estimatedSalary: string;
}

export default function CareerRecommendations() {
  const { user } = useAuth();

  const { data: recommendations, isLoading } = useQuery<CareerRecommendation[]>({
    queryKey: ["/api/career-recommendations"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Please log in to view career recommendations</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Career Recommendations</h1>
      <p className="text-gray-600 mb-8">
        Based on your skills and current market trends, here are personalized career recommendations.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{rec.role}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{rec.description}</p>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {rec.requiredSkills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Recommended Courses</h3>
                  {rec.courses.map((course, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium">{course.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{course.provider}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{rec.marketDemand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>{rec.estimatedSalary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No recommendations available</p>
      )}
    </div>
  );
}
