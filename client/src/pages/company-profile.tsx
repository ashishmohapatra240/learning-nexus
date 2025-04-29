import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building, 
  Calendar, 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  Star, 
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  ExternalLink,
  FileText,
  LinkedinIcon,
  Bookmark
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function CompanyProfilePage() {
  const [, params] = useRoute("/company-profile/:id");
  const companyId = params?.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch company profile data
  const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: [`/api/company-profiles/${companyId}`],
    enabled: !!companyId,
  });
  
  // Fetch company reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/reviews`],
    enabled: !!companyId,
  });
  
  // Fetch active job postings by this company
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: [`/api/company-profiles/${companyId}/job-postings`],
    enabled: !!companyId,
  });
  
  // Loading state
  if (companyLoading || !company) {
    return (
      <div className="container py-10">
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
          <div className="w-full h-32 bg-muted/30 animate-pulse rounded-lg"></div>
          <div className="flex gap-8">
            <div className="w-1/3">
              <div className="w-full h-72 bg-muted/30 animate-pulse rounded-lg"></div>
            </div>
            <div className="w-2/3">
              <div className="w-full h-96 bg-muted/30 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (companyError) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Company Profile</CardTitle>
            <CardDescription>
              We encountered a problem while loading this company profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{companyError instanceof Error ? companyError.message : "Unknown error"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/companies")}>
              Back to Companies
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Calculate average rating
  const averageRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "N/A";
  
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        {/* Profile header with hero section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg"></div>
          <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={company.logoUrl || ""} alt={company.companyName} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {company.companyName?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{company.companyName}</h1>
                {company.verified && (
                  <Badge variant="secondary" className="ml-0 sm:ml-2 flex items-center gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="text-xl text-muted-foreground mb-3">{company.industry || "Learning & Development"}</div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
                {company.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {company.location}
                  </div>
                )}
                
                {company.employeeCount && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    {company.employeeCount} Employees
                  </div>
                )}
                
                {company.foundedYear && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    Est. {company.foundedYear}
                  </div>
                )}
                
                {reviews.length > 0 && (
                  <div className="flex items-center text-sm text-amber-600">
                    <Star className="mr-1 h-4 w-4 fill-amber-500" />
                    {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {company.tags && company.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button>Contact</Button>
              <Button variant="outline">View Jobs</Button>
            </div>
          </div>
        </div>
        
        {/* Tabs for different profile sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">
              Job Postings
              {jobPostings.length > 0 && ` (${jobPostings.length})`}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews
              {reviews.length > 0 && ` (${reviews.length})`}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 order-1">
              <Card>
                <CardHeader>
                  <CardTitle>About {company.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {company.description ? (
                      <div dangerouslySetInnerHTML={{ __html: company.description }}></div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No company description provided.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {company.ldPhilosophy && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Learning & Development Philosophy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: company.ldPhilosophy }}></div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {company.trainingNeeds && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Training Needs & Priorities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: company.trainingNeeds }}></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="w-full lg:w-1/3 order-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${company.email}`} className="text-sm hover:underline">
                        {company.email}
                      </a>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${company.phone}`} className="text-sm hover:underline">
                        {company.phone}
                      </a>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  {company.linkedinProfile && (
                    <div className="flex items-center">
                      <LinkedinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={company.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Building className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{company.foundedYear || "N/A"}</div>
                    <div className="text-xs text-muted-foreground text-center">Founded</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Users className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{company.employeeCount || "N/A"}</div>
                    <div className="text-xs text-muted-foreground text-center">Employees</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Briefcase className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{jobPostings.length}</div>
                    <div className="text-xs text-muted-foreground text-center">Active Jobs</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Star className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{averageRating}</div>
                    <div className="text-xs text-muted-foreground text-center">Rating</div>
                  </div>
                </CardContent>
              </Card>
              
              {company.benefitsOffered && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Benefits & Perks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: company.benefitsOffered }}></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Jobs tab */}
          <TabsContent value="jobs">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Job Postings</CardTitle>
                  <CardDescription>
                    {jobPostings.length > 0 
                      ? `${jobPostings.length} active ${jobPostings.length === 1 ? 'job' : 'jobs'} at ${company.companyName}`
                      : `No active jobs at ${company.companyName}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : jobPostings.length > 0 ? (
                    <div className="space-y-4">
                      {jobPostings.map((job) => (
                        <div key={job.id} className="relative border rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1" />
                                  {job.location || "Remote"}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="w-3.5 h-3.5 mr-1" />
                                  {job.employmentType || "Full-time"}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1" />
                                  Posted: {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                                {job.budget && (
                                  <div className="flex items-center font-medium">
                                    ${job.budget}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 sm:flex-col md:flex-row">
                              <Button size="sm" asChild>
                                <Link to={`/job-detail/${job.id}`}>View Details</Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Bookmark className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-muted-foreground line-clamp-2 text-sm">
                              {job.description?.replace(/<[^>]*>?/gm, '').substring(0, 180)}...
                            </p>
                          </div>
                          
                          {job.skills && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {job.skills.split(',').map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Active Job Postings</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {company.companyName} doesn't have any active job postings at the moment. Check back later or contact them directly for opportunities.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reviews tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Company Reviews</CardTitle>
                  <CardDescription>
                    Feedback from L&D professionals who have worked with {company.companyName}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-6 w-6 ${
                          averageRating !== "N/A" && star <= parseFloat(averageRating) 
                            ? "text-amber-500 fill-amber-500" 
                            : "text-muted-foreground"
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {averageRating} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <div className="flex items-center gap-2 mb-2 sm:mb-0">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10">
                                {review.professionalName?.charAt(0) || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.professionalName || "Anonymous Professional"}</div>
                              <div className="text-xs text-muted-foreground">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= review.rating 
                                    ? "text-amber-500 fill-amber-500" 
                                    : "text-muted-foreground"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: review.content }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Be the first to review your experience working with {company.companyName} and help other professionals make informed decisions.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline">Write a Review</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}