import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Calendar, 
  FileText, 
  BookOpen, 
  Video, 
  HeadphonesIcon,
  Share2,
  Download,
  ThumbsUp,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import type { Resource, User as UserType, ResourceCategory } from "@shared/schema";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export default function ResourceDetail() {
  // Get the resource ID from URL parameters
  const params = useParams<{ id: string }>();
  const resourceId = params?.id ? parseInt(params.id) : 0;

  // Fetch resource details
  const { 
    data: resource, 
    isLoading: isLoadingResource,
    error: resourceError
  } = useQuery<Resource>({
    queryKey: ['/api/resources', resourceId],
    queryFn: () => 
      fetch(`/api/resources/${resourceId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch resource');
          return res.json();
        }),
    enabled: !!resourceId,
  });

  // Fetch author details
  const { 
    data: author, 
    isLoading: isLoadingAuthor,
    error: authorError 
  } = useQuery<UserType>({
    queryKey: ['/api/users', resource?.authorId],
    queryFn: () => 
      fetch(`/api/users/${resource?.authorId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch author');
          return res.json();
        }),
    enabled: !!resource?.authorId, // Only enable if authorId exists
  });

  // Fetch related resources based on type
  const { 
    data: relatedResources, 
    isLoading: isLoadingRelated,
    error: relatedResourcesError
  } = useQuery<Resource[]>({
    queryKey: ['/api/resources/related', resource?.resourceType, resourceId],
    // Use a proper URL for the query based on the array query key
    queryFn: () => 
      fetch(`/api/resources/related/${resource?.resourceType}/${resourceId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch related resources');
          return res.json();
        }),
    enabled: !!resource?.resourceType, // Only enable if resourceType exists
  });
  
  // Fetch resource categories
  const {
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery<ResourceCategory[]>({
    queryKey: ["/api/resource-categories"],
    enabled: !!resource?.categoryId,
  });

  // Helper to get resource type icon
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen className="h-5 w-5" />;
      case "template":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "webinar":
        return <HeadphonesIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Helper for resource action button
  const getResourceActionButton = (type: string) => {
    switch (type) {
      case "template":
        return (
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download Template
          </Button>
        );
      case "video":
      case "webinar":
        return (
          <Button>
            <Video className="mr-2 h-4 w-4" /> Watch Now
          </Button>
        );
      default:
        return null;
    }
  };

  if (!resourceId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Resource ID</h1>
          <p className="text-gray-600">The requested resource could not be found.</p>
        </div>
      </div>
    );
  }

  if (isLoadingResource || isLoadingAuthor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center">
              <Skeleton className="h-8 w-36 rounded-full mr-3" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (resourceError || !resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Resource Not Found</h1>
          <p className="text-gray-600">The requested resource could not be found or has been removed.</p>
          <Link href="/resources">
            <Button className="mt-4">Browse All Resources</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
  if (!resource?.filePath) return;
  
  try {
    const filename = resource.filePath.split('/').pop();
    const response = await fetch(`/api/resources/download/${filename}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'resource';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className="bg-primary text-primary-foreground">
              {getResourceTypeIcon(resource.resourceType || "")}
              <span className="ml-1">
                {resource.resourceType 
                  ? resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)
                  : "Resource"}
              </span>
            </Badge>
            
            {resource.categoryId && categories?.some(cat => cat.id === resource.categoryId) && (
              <Badge variant="outline" className="flex items-center">
                <Tag className="mr-1 h-4 w-4" />
                <span>{categories?.find(cat => cat.id === resource.categoryId)?.name || "Uncategorized"}</span>
              </Badge>
            )}
            
            <Badge variant="outline" className="text-gray-500">
              <Calendar className="mr-1 h-4 w-4" />
              {resource.createdAt 
                ? format(new Date(resource.createdAt), "MMMM d, yyyy") 
                : "Date not available"}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
          
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {author?.firstName ? (
                <span className="font-medium">
                  {author.firstName?.charAt(0) || ""}{author.lastName?.charAt(0) || ""}
                </span>
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">
                {author ? `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Unknown Author" : "Unknown Author"}
              </p>
              <p className="text-sm text-gray-500">
                {author?.userType === "professional" ? "L&D Professional" : "Company"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Resource content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <ImageWithFallback
                src={resource.imageUrl}
                alt={resource.title}
                className="w-full rounded-lg max-h-80 object-cover"
                fallbackClassName="w-full h-64 rounded-lg flex items-center justify-center bg-gray-100"
              />
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">{resource.description}</p>
              
              {/* Display content as a link if it's a URL */}
              {resource.content && (
              <div className="mt-4">
                {resource.content.startsWith('http') ? (
                  <a href={resource.content} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                    View External Content
                  </a>
                ) : (
                  <div className="prose max-w-none mt-4">
                    {resource.content}
                  </div>
                )}
              </div>
            )}
            
            {resource.filePath && (
              <Button onClick={handleDownload} className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download Resource
              </Button>
            )}
            {resource.contentUrl ? (
              <div className="mt-4">
                <a 
                  href={resource.contentUrl} 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Access Resource
                </a>
              </div>
            ) : (
              <div className="whitespace-pre-line">{resource.content || "No content available"}</div>
            )}
            </div>
            
            {resource.resourceType && getResourceActionButton(resource.resourceType) && (
              <div className="mt-8 flex justify-center">
                {getResourceActionButton(resource.resourceType)}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 p-4 flex justify-between">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ThumbsUp className="mr-2 h-4 w-4" /> Helpful
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </CardFooter>
        </Card>
        
        {/* Author info */}
        {author && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About the Author</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {author.firstName ? (
                    <span className="font-medium text-lg">
                      {author.firstName?.charAt(0) || ""}{author.lastName?.charAt(0) || ""}
                    </span>
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg">{author.firstName || ""} {author.lastName || ""}</h3>
                  <p className="text-gray-500">
                    {author.userType === "professional" ? "L&D Professional" : "Company"}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-end">
                {/* Check if author exists and has a userType before rendering the profile link */}
                {author && (
                  <Link href={author.userType === "professional" ? `/professional-profile/${author.id}` : `/company/${author.id}`}>
                    <Button variant="outline">View Profile</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Related resources */}
        {Array.isArray(relatedResources) && relatedResources.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedResources.slice(0, 3).map((relatedResource: Resource) => (
                <Link key={relatedResource.id} href={`/resource/${relatedResource.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <div className="h-24 mb-3 overflow-hidden rounded-md">
                        <ImageWithFallback
                          src={relatedResource.imageUrl}
                          alt={relatedResource.title}
                          className="w-full h-24 object-cover"
                          fallbackClassName="w-full h-24 flex items-center justify-center bg-gray-100"
                        />
                      </div>
                      <div className="flex items-center mb-2">
                        {getResourceTypeIcon(relatedResource.resourceType || "")}
                        <h3 className="ml-2 font-medium line-clamp-1">{relatedResource.title}</h3>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {relatedResource.categoryId && categories?.some(cat => cat.id === relatedResource.categoryId) && (
                          <Badge variant="outline" className="flex items-center py-0.5">
                            <Tag className="h-3 w-3 mr-1" />
                            <span className="text-xs">{categories?.find(cat => cat.id === relatedResource.categoryId)?.name}</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">{relatedResource.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
