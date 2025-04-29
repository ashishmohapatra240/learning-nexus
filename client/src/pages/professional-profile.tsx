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
import { Calendar, Mail, MapPin, Phone, Star, Briefcase, Clock, CheckCircle2, Award, LinkedinIcon, BookOpen, FileText, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ProfessionalProfilePage() {
  const [, params] = useRoute("/professional-profile/:id");
  const professionalId = params?.id ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch professional profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: [`/api/professional-profiles/${professionalId}`],
    enabled: !!professionalId,
  });
  
  // Fetch expertise areas
  const { data: expertise = [], isLoading: expertiseLoading } = useQuery({
    queryKey: [`/api/professional-profiles/${professionalId}/expertise`],
    enabled: !!professionalId,
  });
  
  // Fetch certifications
  const { data: certifications = [], isLoading: certificationsLoading } = useQuery({
    queryKey: [`/api/professional-profiles/${professionalId}/certifications`],
    enabled: !!professionalId,
  });
  
  // Fetch resources created by this professional
  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: [`/api/professional-profiles/${professionalId}/resources`],
    enabled: !!professionalId,
  });
  
  // Fetch reviews for this professional
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/professionals/${professionalId}/reviews`],
    enabled: !!professionalId,
  });
  
  // Loading state
  if (profileLoading || !profile) {
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
  if (profileError) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
            <CardDescription>
              We encountered a problem while loading this professional profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{profileError instanceof Error ? profileError.message : "Unknown error"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/professionals")}>
              Back to Professionals
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Format years of experience as string
  const formatExperience = (years: number) => {
    if (!years) return "Not specified";
    return years === 1 ? "1 year" : `${years} years`;
  };
  
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
              <AvatarImage src={profile.profileImageUrl || ""} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile.firstName?.charAt(0) || ""}{profile.lastName?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
                {profile.verified && (
                  <Badge variant="secondary" className="ml-0 sm:ml-2 flex items-center gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="text-xl text-muted-foreground mb-2">{profile.title || "Learning & Development Professional"}</div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
                {profile.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {formatExperience(profile.yearsExperience)}
                </div>
                
                {reviews.length > 0 && (
                  <div className="flex items-center text-sm text-amber-600">
                    <Star className="mr-1 h-4 w-4 fill-amber-500" />
                    {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {expertise.slice(0, 5).map((exp) => (
                  <Badge key={exp.id} variant="outline">
                    {exp.name}
                  </Badge>
                ))}
                {expertise.length > 5 && (
                  <Badge variant="outline">+{expertise.length - 5} more</Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button>Contact</Button>
              <Button variant="outline">Book Consultation</Button>
            </div>
          </div>
        </div>
        
        {/* Tabs for different profile sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expertise">Expertise & Skills</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews 
              {reviews.length > 0 && ` (${reviews.length})`}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${profile.email}`} className="text-sm hover:underline">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${profile.phone}`} className="text-sm hover:underline">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  
                  {profile.linkedinProfile && (
                    <div className="flex items-center">
                      <LinkedinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {certifications.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {certifications.map((cert) => (
                        <li key={cert.id} className="border-l-2 border-primary pl-3 py-1">
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">{cert.issuingOrganization}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(cert.issueDate).toLocaleDateString()} 
                            {cert.expiryDate && ` - ${new Date(cert.expiryDate).toLocaleDateString()}`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Briefcase className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{profile.yearsExperience || 0}</div>
                    <div className="text-xs text-muted-foreground text-center">Years Experience</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Users className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{profile.clientsCount || 0}</div>
                    <div className="text-xs text-muted-foreground text-center">Clients Served</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <FileText className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{resources.length}</div>
                    <div className="text-xs text-muted-foreground text-center">Resources</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                    <Star className="h-8 w-8 text-primary mb-1" />
                    <div className="text-2xl font-bold">{averageRating}</div>
                    <div className="text-xs text-muted-foreground text-center">Avg. Rating</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full lg:w-2/3 order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {profile.bio ? (
                      <div dangerouslySetInnerHTML={{ __html: profile.bio }}></div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No bio information provided.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {expertise.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Areas of Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {expertise.map((exp) => (
                        <Badge key={exp.id} className="px-3 py-1 text-sm">
                          {exp.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {profile.focusAreas && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: profile.focusAreas }}></div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {profile.approach && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Approach to Learning & Development</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: profile.approach }}></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Expertise tab */}
          <TabsContent value="expertise">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Areas of Expertise</CardTitle>
                  <CardDescription>
                    Specialized knowledge and professional focus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expertise.length > 0 ? (
                    <div className="space-y-4">
                      {expertise.map((exp) => (
                        <div key={exp.id} className="p-4 border rounded-lg bg-muted/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{exp.name}</h3>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No expertise areas specified.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Qualifications</CardTitle>
                  <CardDescription>
                    Professional credentials and educational background
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certifications.length > 0 ? (
                    <div className="space-y-4">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="p-4 border rounded-lg bg-muted/20">
                          <h3 className="font-semibold">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                            {cert.expiryDate && ` · Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                          </div>
                          {cert.credentialUrl && (
                            <div className="mt-2">
                              <a 
                                href={cert.credentialUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View Credential
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No certifications added.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Professional Experience</CardTitle>
                  <CardDescription>
                    Work history and industry experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.experience ? (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: profile.experience }}></div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No professional experience details provided.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Teaching Methodology</CardTitle>
                  <CardDescription>
                    Approach to training and development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.approach ? (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: profile.approach }}></div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No methodology information provided.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Resources tab */}
          <TabsContent value="resources">
            {resourcesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-muted/30 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden">
                    {resource.imageUrl && (
                      <div className="h-32 bg-muted/20 overflow-hidden">
                        <img 
                          src={resource.imageUrl} 
                          alt={resource.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className={!resource.imageUrl ? "pt-6" : "pt-4"}>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>
                        {resource.description?.length > 80 
                          ? `${resource.description.substring(0, 80)}...` 
                          : resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="inline-block h-3.5 w-3.5 mr-1" />
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/resource-detail/${resource.id}`}>
                          View Resource
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Resources Available</CardTitle>
                  <CardDescription>
                    This professional hasn't published any resources yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Check back later for learning materials, articles, and other resources from this professional.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Reviews tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Reviews</CardTitle>
                  <CardDescription>
                    Feedback from clients and companies
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
                                {review.companyName?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.companyName || "Anonymous Company"}</div>
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
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This professional hasn't received any reviews yet. Be the first to work with them and share your experience!
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