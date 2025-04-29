import { useQuery, useMutation } from '@tanstack/react-query';
import { Resource } from '@shared/schema';
import { ResourceManager } from '@/components/resources/resource-manager';
import { apiRequest, secureFileUpload, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ResourceManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's resources
  const {
    data: resources,
    isLoading,
    error
  } = useQuery<Resource[]>({
    queryKey: ['/api/me/resources'],
    enabled: !!user,
  });

  // Fetch all resources for admins
  const {
    data: allResources,
    isLoading: isLoadingAll,
  } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
    enabled: !!user?.isAdmin,
  });

  // Mutation for uploading files
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await secureFileUpload('POST', '/api/resources/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh the resource lists
      queryClient.invalidateQueries({ queryKey: ['/api/me/resources'] });
      if (user?.isAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred while uploading files',
        variant: 'destructive'
      });
    }
  });

  // Mutation for removing resources
  const removeMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      await apiRequest('DELETE', `/api/resources/${resourceId}`);
    },
    onSuccess: () => {
      // Invalidate queries to refresh the resource lists
      queryClient.invalidateQueries({ queryKey: ['/api/me/resources'] });
      if (user?.isAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      }
      
      toast({
        title: 'Resource removed',
        description: 'The resource has been removed successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove resource',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    await uploadMutation.mutateAsync(files);
  };

  // Handle resource removal
  const handleResourceRemoved = (resource: Resource) => {
    removeMutation.mutate(resource.id);
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center text-red-500">
            Error loading resources
          </CardTitle>
          <p className="text-center text-gray-600">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </CardHeader>
      </Card>
    );
  }

  // If the user isn't logged in, show a message
  if (!user) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center">
            Please log in to manage resources
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Resource Management</h1>
      
      {user.isAdmin ? (
        <Tabs defaultValue="my-resources">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-resources">My Resources</TabsTrigger>
            <TabsTrigger value="all-resources">All Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-resources" className="space-y-4">
            <ResourceManager
              resources={resources || []}
              onFileUpload={handleFileUpload}
              onResourceRemoved={handleResourceRemoved}
            />
          </TabsContent>
          
          <TabsContent value="all-resources" className="space-y-4">
            {isLoadingAll ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ResourceManager
                resources={allResources || []}
                onFileUpload={handleFileUpload}
                onResourceRemoved={handleResourceRemoved}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <ResourceManager
          resources={resources || []}
          onFileUpload={handleFileUpload}
          onResourceRemoved={handleResourceRemoved}
        />
      )}
    </div>
  );
}