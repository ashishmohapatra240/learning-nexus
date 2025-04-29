import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Resource } from '@shared/schema';
import { Link } from 'wouter';
import { Eye, ExternalLink, BookOpen, FileText, Video, HeadphonesIcon } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Helper to get resource type icon
  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
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
  
  // Helper for resource type badge color
  const getResourceTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "article":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      case "template":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "video":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "webinar":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge className={`flex items-center ${getResourceTypeBadgeClass(resource.resourceType)}`}>
              {getResourceTypeIcon(resource.resourceType)}
              <span className="ml-1">{resource.resourceType}</span>
            </Badge>
            {resource.featured && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Featured
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl line-clamp-2">{resource.title}</CardTitle>
          <CardDescription className="text-sm">
            Added {format(new Date(resource.createdAt), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {resource.description}
          </p>
        </CardContent>
        
        <CardFooter className="pt-0 flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Link href={`/resources/${resource.id}`} className="flex-1">
            <Button variant="default" className="w-full">View Details</Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{resource.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-2 mb-4">
                <Badge className={`flex items-center ${getResourceTypeBadgeClass(resource.resourceType)}`}>
                  {getResourceTypeIcon(resource.resourceType)}
                  <span className="ml-1">{resource.resourceType}</span>
                </Badge>
                <span className="text-gray-500 text-sm ml-4">
                  Added {format(new Date(resource.createdAt), "MMMM d, yyyy")}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <ImageWithFallback
              src={resource.imageUrl}
              alt={resource.title}
              className="w-full rounded-lg object-cover max-h-60"
              fallbackClassName="w-full h-40 rounded-lg flex items-center justify-center bg-gray-100"
            />
          </div>
          
          <div className="mt-2">
            <h3 className="font-medium text-lg mb-2">Description</h3>
            <p className="text-gray-600">{resource.description}</p>
          </div>
          
          {resource.content && resource.content.startsWith('http') && (
            <div className="mt-6">
              <Button className="w-full" onClick={() => window.open(resource.content, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Access Resource
              </Button>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Link href={`/resources/${resource.id}`}>
              <Button variant="default">
                View Full Details
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}