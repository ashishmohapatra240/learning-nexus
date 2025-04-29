import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// Helper functions to convert various video URLs to embed format
function getYoutubeEmbedUrl(url: string): string {
  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Handle youtube.com format
  if (url.includes('youtube.com/watch')) {
    // Extract video ID from URL parameters
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // If URL is already in embed format or cannot be parsed, return as is
  return url;
}

// Convert Vimeo URLs to embed format
function getVimeoEmbedUrl(url: string): string {
  // Regular Vimeo URLs: https://vimeo.com/123456789
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const match = url.match(vimeoRegex);

  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }

  // If URL is already in embed format or cannot be parsed, return as is
  return url;
}

// Handle LinkedIn video URLs
function getLinkedInEmbedUrl(url: string): string {
  // LinkedIn doesn't offer a direct embed code through URL transformation
  // Instead, we return the original URL and will provide a link to view it
  return url;
}

// Check if URL is a supported video platform
function isVideoEmbeddable(url: string): boolean {
  const supportedPlatforms = [
    'youtube.com', 
    'youtu.be', 
    'vimeo.com', 
    'player.vimeo.com'
  ];

  return supportedPlatforms.some(platform => url.includes(platform));
}

// Get video platform name from URL
function getVideoPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube';
  } else if (url.includes('vimeo.com')) {
    return 'Vimeo';
  } else if (url.includes('linkedin.com')) {
    return 'LinkedIn';
  } else if (url.includes('instagram.com')) {
    return 'Instagram';
  } else if (url.includes('facebook.com')) {
    return 'Facebook';
  } else {
    return 'Video';
  }
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Video, 
  MessageSquare, 
  Briefcase, 
  CheckCircle,
  Lightbulb,
  ImageIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import SkillRecommendations from "@/components/profile/skill-recommendations";
import ImageGallery from "@/components/profile/image-gallery";
import type { 
  ProfessionalProfile, 
  Expertise, 
  Certification, 
  Resource 
} from "@shared/schema";

interface ProfessionalProfileProps {
  professionalId: number;
}

export default function ProfessionalProfileComponent({ professionalId }: ProfessionalProfileProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { 
    data: profile, 
    isLoading: isLoadingProfile 
  } = useQuery<ProfessionalProfile>({
    queryKey: [`/api/professional-profiles/${professionalId}`],
  });

  const { 
    data: expertise, 
    isLoading: isLoadingExpertise 
  } = useQuery<Expertise[]>({
    queryKey: [`/api/professional-profiles/${professionalId}/expertise`],
    enabled: !!profile,
  });

  const { 
    data: certifications, 
    isLoading: isLoadingCertifications 
  } = useQuery<Certification[]>({
    queryKey: [`/api/professional-profiles/${professionalId}/certifications`],
    enabled: !!profile,
  });

  // Type-safe resource query
  const { 
    data: resources = [] as Resource[],
    isError: isResourcesError 
  } = useQuery<Resource[], Error, Resource[]>({
    queryKey: [`/api/professional-profiles/${professionalId}/resources`],
    enabled: !!profile,
    // Add default empty array to prevent JSON parsing error when empty response is returned
    select: (data) => data || [],
    // Use retry: false to prevent excessive retries on error
    retry: false,
  });

  const handleMessageClick = () => {
    if (!user) {
      // Redirect to login if not authenticated
      setLocation("/login?redirect=/professional-profile/" + professionalId);
    } else {
      setLocation(`/messages?professional=${professionalId}`);
    }
  };

  const handleBookConsultation = () => {
    if (!user) {
      // Redirect to login if not authenticated
      setLocation("/login?redirect=/professional-profile/" + professionalId);
    } else {
      // Navigate to consultation booking page
      setLocation(`/book-consultation/${professionalId}`);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-4 md:mt-0">
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The professional profile you're looking for doesn't exist or has been removed.</p>
          <Link href="/professionals">
            <Button>Browse All Professionals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profile.profileImagePath ? (
                  <img 
                    src={`/${profile.profileImagePath}`} 
                    alt={`${profile.firstName} ${profile.lastName}`} 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      console.log("Image load error, using placeholder");
                      // Set default avatar on error using UI Avatars service with the user's name
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite error loops
                      // Create a placeholder with user's initials
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        (profile.firstName || '') + ' ' + (profile.lastName || '')
                      )}&size=150&background=6366f1&color=ffffff`;
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{profile.title}</h1>
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{((profile.rating || 0) / 20).toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">({profile.reviewCount || 0} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.featured && (
                    <Badge className="bg-amber-100 text-amber-800">Featured Professional</Badge>
                  )}
                  {profile.ratePerHour && (
                    <Badge className="bg-green-100 text-green-800">
                      ${profile.ratePerHour}/hour
                    </Badge>
                  )}
                  {isLoadingExpertise ? (
                    <>
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </>
                  ) : (
                    expertise?.slice(0, 2).map(area => (
                      <Badge key={area.id} variant="secondary" className="bg-blue-100 text-blue-800">
                        {area.name}
                      </Badge>
                    ))
                  )}
                  {expertise && expertise.length > 2 && (
                    <Badge variant="outline">+{expertise.length - 2} more</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                <Button onClick={handleMessageClick}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button onClick={handleBookConsultation} variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="about">
            <TabsList className="w-full">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="expertise">Expertise & Certifications</TabsTrigger>
              <TabsTrigger value="skill-recommendations">
                <span className="flex items-center">
                  <Lightbulb className="mr-1 h-4 w-4" />
                  Skill Recommendations
                </span>
              </TabsTrigger>
              {profile.videoIntroUrl && <TabsTrigger value="video">Video Introduction</TabsTrigger>}
              {resources && resources.length > 0 && <TabsTrigger value="resources">Resources</TabsTrigger>}
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">
                About {profile.firstName} {profile.lastName}
              </h2>

              {/* Name and title */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-medium text-gray-500">Full Name</h3>
                    <p className="text-lg font-semibold">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500">Professional Title</h3>
                    <p className="text-lg font-semibold">{profile.title}</p>
                  </div>
                  {profile.yearsExperience && profile.yearsExperience > 0 && (
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Years of Experience</h3>
                      <p className="text-lg font-semibold">{profile.yearsExperience} years</p>
                    </div>
                  )}
                  {profile.availability && profile.availability !== "false" && (
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Availability</h3>
                      <p className="text-lg font-semibold">{profile.availability}</p>
                    </div>
                  )}
                  {profile.email && (
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Email</h3>
                      <p className="text-lg font-semibold">{profile.email}</p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Phone</h3>
                      <p className="text-lg font-semibold">{profile.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold">Biography</h3>
                <p className="whitespace-pre-line text-gray-700">{profile.bio || "No biography provided."}</p>
              </div>

              {/* Services */}
              {profile.services && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Services Offered</h3>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="whitespace-pre-line text-gray-700">{profile.services}</p>
                  </div>
                </div>
              )}

              {/* Rate */}
              {profile.ratePerHour && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                    Consulting Rate
                  </h3>
                  <p className="text-gray-700 text-lg">
                    <span className="font-bold text-green-700">${profile.ratePerHour}</span> per hour
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expertise" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Areas of Expertise</h2>
                  {isLoadingExpertise ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : expertise && expertise.length > 0 ? (
                    <div className="space-y-2">
                      {expertise.map(area => (
                        <div key={area.id} className="flex items-center p-2 bg-blue-50 rounded-md">
                          <Badge className="bg-blue-100 text-blue-800 mr-2">{area.name}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No expertise areas listed</p>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                  {isLoadingCertifications ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : certifications && certifications.length > 0 ? (
                    <div className="space-y-3">
                      {certifications.map(cert => (
                        <div key={cert.id} className="p-3 border rounded-md">
                          <div className="flex items-start">
                            <CheckCircle className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-medium">{cert.name}</h3>
                              <p className="text-gray-600 text-sm">
                                {cert.issuer} • {cert.year}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No certifications listed</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {profile.videoIntroUrl && (
              <TabsContent value="video" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Video Introduction</h2>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {/* Handle different video platforms */}
                  {profile.videoIntroUrl.includes('youtube.com') || profile.videoIntroUrl.includes('youtu.be') ? (
                    /* YouTube embedding */
                    <iframe 
                      src={getYoutubeEmbedUrl(profile.videoIntroUrl)} 
                      className="w-full h-full" 
                      allowFullScreen 
                      title={`${profile.firstName} ${profile.lastName} introduction video`}
                    />
                  ) : profile.videoIntroUrl.includes('vimeo.com') ? (
                    /* Vimeo embedding */
                    <iframe 
                      src={getVimeoEmbedUrl(profile.videoIntroUrl)} 
                      className="w-full h-full" 
                      allowFullScreen 
                      title={`${profile.firstName} ${profile.lastName} introduction video`}
                    />
                  ) : profile.videoIntroUrl.includes('instagram.com') ? (
                    /* Instagram link (no embedding available) */
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-white mb-3">Instagram video available at:</p>
                      <a 
                        href={profile.videoIntroUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                      >
                        Open Instagram Video
                      </a>
                    </div>
                  ) : profile.videoIntroUrl.includes('linkedin.com') ? (
                    /* LinkedIn link (no embedding available) */
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-white mb-3">LinkedIn video available at:</p>
                      <a 
                        href={profile.videoIntroUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg hover:opacity-90"
                      >
                        Open LinkedIn Video
                      </a>
                    </div>
                  ) : profile.videoIntroUrl.includes('facebook.com') ? (
                    /* Facebook link */
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-white mb-3">Facebook video available at:</p>
                      <a 
                        href={profile.videoIntroUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:opacity-90"
                      >
                        Open Facebook Video
                      </a>
                    </div>
                  ) : (
                    /* Direct video file */
                    <video 
                      src={profile.videoIntroUrl} 
                      controls 
                      className="w-full h-full"
                      poster="/images/video-poster.jpg"
                    >
                      Your browser does not support video playback.
                    </video>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Watch {profile.firstName}'s introduction video to learn more about their expertise and services.
                </p>
              </TabsContent>
            )}

            <TabsContent value="skill-recommendations" className="mt-6">
              <SkillRecommendations 
                professionalId={professionalId} 
                isCurrentUser={user?.id === profile.userId}
              />
            </TabsContent>

            {resources && resources.length > 0 && (
              <TabsContent value="resources" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Resources & Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map(resource => (
                    <Card key={resource.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>
                          {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-gray-700 line-clamp-2 mb-3">{resource.description}</p>
                        <Link href={`/resource/${resource.id}`}>
                          <Button variant="outline" size="sm">View Resource</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Related Professionals */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Similar Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Link key={index} href="/professionals">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Similar Professional</h3>
                        <p className="text-gray-500 text-sm">View profile</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}