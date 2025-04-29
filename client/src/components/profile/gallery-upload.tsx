import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { apiRequest, secureFileUpload } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface GalleryUploadProps {
  professionalId: number;
  onUploadSuccess?: (uploadedImage: {id: number, path: string, caption?: string}) => void;
}

export default function GalleryUpload({ professionalId, onUploadSuccess }: GalleryUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("No file selected");
      }

      const formData = new FormData();
      formData.append("galleryImage", selectedFile);
      if (caption) {
        formData.append("caption", caption);
      }

      const response = await secureFileUpload(
        "/api/professionals/me/gallery",
        formData,
        true
      );
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Image uploaded to gallery",
      });
      
      // Invalidate gallery images query
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}/gallery`] });
      
      // Call success callback with the newly uploaded image
      if (onUploadSuccess && data.image) {
        onUploadSuccess(data.image);
        
        // Clear form after passing the data
        setSelectedFile(null);
        setPreview(null);
        setCaption("");
      } else {
        // Still clear the form if no callback/data
        setSelectedFile(null);
        setPreview(null);
        setCaption("");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="galleryImage">Upload Image for Gallery</Label>
            <div className="flex items-center gap-2">
              <Input
                id="galleryImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="max-h-60 rounded-md object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption for this image"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⏳</span> Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" /> Upload to Gallery
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}