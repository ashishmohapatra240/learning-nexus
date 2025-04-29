import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  X,
  Trash2,
  ImagePlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GalleryUpload from "./gallery-upload";
import { Badge } from "@/components/ui/badge";

interface ImageGalleryProps {
  professionalId: number;
  editable?: boolean;
}

type GalleryImage = {
  id: number;
  path: string;
  caption?: string;
  uploadedAt: string;
};

export default function ImageGallery({ professionalId, editable = false }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading, error } = useQuery<GalleryImage[]>({
    queryKey: [`/api/professionals/${professionalId}/gallery`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/professionals/${professionalId}/gallery`);
      return res.json();
    },
    enabled: !!professionalId
  });

  // Reset current index when images change
  useEffect(() => {
    if (images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images, currentIndex]);

  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/professionals/me/gallery/${imageId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted from gallery",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}/gallery`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete image: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Set as profile picture mutation
  const setAsProfilePictureMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const res = await apiRequest(
        "POST", 
        `/api/professionals/me/set-profile-image-from-gallery/${imageId}`
      );
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to set profile picture");
      }
      
      return imageId;
    },
    onSuccess: () => {
      // Invalidate both gallery and profile data
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}/gallery`] });
      queryClient.invalidateQueries({ queryKey: ["/api/professionals/me"] });
      
      toast({
        title: "Profile picture updated",
        description: "Gallery image has been set as your profile picture",
      });
      
      // Close fullscreen view if open
      if (fullscreenImage) {
        setFullscreenImage(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to set profile picture: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteImage = (imageId: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(imageId);
    }
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    if (images.length === 0) return;
    
    if (direction === 'prev') {
      setCurrentIndex((prev) => {
        if (prev === null) return 0;
        return prev === 0 ? images.length - 1 : prev - 1;
      });
    } else {
      setCurrentIndex((prev) => {
        if (prev === null) return 0;
        return prev === images.length - 1 ? 0 : prev + 1;
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      navigateGallery('prev');
    } else if (e.key === 'ArrowRight') {
      navigateGallery('next');
    } else if (e.key === 'Escape' && fullscreenImage) {
      setFullscreenImage(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenImage, images]);

  // Handle gallery upload success
  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="h-60 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="h-40 flex items-center justify-center text-destructive">
            Error loading gallery images
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no images and not editable, don't show anything
  if (images.length === 0 && !editable) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio Gallery</h3>
        {editable && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ImagePlus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Gallery Image</DialogTitle>
                <DialogDescription>
                  Add a new image to your professional portfolio gallery.
                </DialogDescription>
              </DialogHeader>
              <GalleryUpload 
                professionalId={professionalId} 
                onUploadSuccess={handleUploadSuccess} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <ImagePlus className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No gallery images yet</p>
            {editable && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setUploadDialogOpen(true)}
              >
                Add your first image
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 relative" ref={galleryRef}>
            <div className="relative aspect-video overflow-hidden">
              <img
                src={`/${images[currentIndex]?.path}`}
                alt={images[currentIndex]?.caption || "Gallery image"}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
              
              {/* Navigation controls */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                onClick={() => navigateGallery('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                onClick={() => navigateGallery('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/30 text-white hover:bg-black/50"
                onClick={() => setFullscreenImage(`/${images[currentIndex]?.path}`)}
              >
                <Maximize className="h-4 w-4" />
              </Button>
              
              {/* Delete button (only for editable) */}
              {editable && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-black/30 text-white hover:bg-red-500"
                    onClick={() => handleDeleteImage(images[currentIndex]?.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Set as profile picture button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-12 left-2 bg-black/30 text-white hover:bg-primary"
                    onClick={() => setAsProfilePictureMutation.mutate(images[currentIndex]?.id)}
                    disabled={setAsProfilePictureMutation.isPending}
                  >
                    {setAsProfilePictureMutation.isPending ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-1">⏳</span> Setting...
                      </span>
                    ) : (
                      <span>📷 Set as Profile Picture</span>
                    )}
                  </Button>
                </>
              )}
              
              {/* Caption if exists */}
              {images[currentIndex]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  {images[currentIndex]?.caption}
                </div>
              )}
            </div>
            
            {/* Thumbnail navigation */}
            {images.length > 1 && (
              <div className="flex overflow-x-auto py-2 px-1 gap-2 bg-muted/20">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative shrink-0 cursor-pointer transition-all ${
                      index === currentIndex
                        ? "ring-2 ring-primary scale-105"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img
                      src={`/${image.path}`}
                      alt={image.caption || `Thumbnail ${index + 1}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Image counter badge */}
            <Badge variant="secondary" className="absolute top-4 right-4">
              {currentIndex + 1} / {images.length}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen view */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}