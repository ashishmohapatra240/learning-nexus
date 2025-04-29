import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Resource } from '@shared/schema';
import { ReorderableList, FileUploadZone } from '@/components/dnd';
import { useToast } from '@/hooks/use-toast';

interface ResourceManagerProps {
  resources: Resource[];
  onResourcesReordered?: (resources: Resource[]) => void;
  onResourceRemoved?: (resource: Resource) => void;
  onResourceAdded?: (resource: Resource) => void;
  onFileUpload?: (files: File[]) => Promise<void>;
}

/**
 * A component for managing resources with drag and drop functionality
 */
export function ResourceManager({
  resources,
  onResourcesReordered,
  onResourceRemoved,
  onResourceAdded,
  onFileUpload
}: ResourceManagerProps) {
  const [items, setItems] = useState<Resource[]>(resources);
  const { toast } = useToast();

  // Handle reordering of resources
  const handleReorder = (reorderedItems: Resource[]) => {
    setItems(reorderedItems);
    if (onResourcesReordered) {
      onResourcesReordered(reorderedItems);
    }
  };

  // Handle file uploads
  const handleFilesAdded = async (files: File[]) => {
    if (onFileUpload) {
      try {
        await onFileUpload(files);
        toast({
          title: 'Files uploaded successfully',
          description: `${files.length} file${files.length !== 1 ? 's' : ''} uploaded.`,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    } else {
      // Default implementation if no onFileUpload provided
      try {
        const formData = new FormData();
        
        // Append each file to the FormData object
        files.forEach(file => {
          formData.append('files', file);
        });
        
        // Make the API request to upload files
        const response = await fetch('/api/resources/upload', {
          method: 'POST',
          body: formData,
          // No need to set Content-Type header, it will be set automatically with the boundary
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const uploadedResources = await response.json();
        
        // Add uploaded resources to the list
        const newItems = [...items, ...uploadedResources];
        setItems(newItems);
        
        if (onResourcesReordered) {
          onResourcesReordered(newItems);
        }
        
        toast({
          title: 'Files uploaded successfully',
          description: `${files.length} file${files.length !== 1 ? 's' : ''} uploaded.`,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Resources</CardTitle>
          <CardDescription>
            Drag and drop to reorder resources or upload new files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* File upload area */}
          <div className="mb-6">
            <FileUploadZone
              onFilesAdded={handleFilesAdded}
              maxFiles={5}
              maxFileSizeMB={10}
              acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
              supportedFileTypesText="Supported formats: PDF, JPEG, PNG, DOC, DOCX"
            />
          </div>

          {/* Reorderable resource list */}
          <div className="space-y-2">
            <div className="font-medium">Resource Order</div>
            <ReorderableList
              items={items}
              keyExtractor={(item) => item.id}
              onReorder={handleReorder}
              className="space-y-2"
              dragType="resource-item"
              renderItem={(item) => (
                <Card className="cursor-move">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.resourceType}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onResourceRemoved) {
                          onResourceRemoved(item);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            />
          </div>

          {/* Action button */}
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={() => {
                if (onResourceAdded) {
                  // This would typically open a modal or navigate to a create resource page
                  // For now, we'll just show a toast
                  toast({
                    title: 'Create Resource',
                    description: 'This would open a modal or navigate to a create resource page.',
                  });
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Resource
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}