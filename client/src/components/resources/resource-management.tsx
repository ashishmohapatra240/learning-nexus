import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, secureFileUpload } from '@/lib/queryClient';
import { Resource } from '@shared/schema';
import { ResourceManager } from './resource-manager';

export default function ResourceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all resources
  useEffect(() => {
    setLoading(true);
    apiRequest('GET', '/api/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resources:', err);
        toast({
          title: 'Error',
          description: 'Failed to load resources',
          variant: 'destructive',
        });
        setLoading(false);
      });
  }, [toast]);

  // Function to toggle featured status
  const toggleFeatured = async (resource: Resource) => {
    try {
      const response = await apiRequest('PATCH', `/api/resources/${resource.id}/feature`, {
        featured: !resource.featured
      });
      
      if (response.ok) {
        const updatedResource = await response.json();
        
        // Update the resource in the local state
        setResources(resources.map(r => 
          r.id === updatedResource.id ? updatedResource : r
        ));
        
        toast({
          title: 'Success',
          description: `Resource ${updatedResource.featured ? 'featured' : 'unfeatured'} successfully`,
        });
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resource',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Display a message if there are no resources
  if (resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>No resources found</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You haven't created any resources yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter to show only resources created by the current user
  const userResources = user ? resources.filter(resource => resource.authorId === user.id) : [];

  // Handle file uploads
  const handleFileUpload = async (files: File[]) => {
    if (!user) return;
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await secureFileUpload('POST', '/api/resources/upload', formData);
      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `Uploaded ${files.length} file(s) successfully`,
        });
        
        // Refresh resources list
        const resourcesResponse = await apiRequest('GET', '/api/resources');
        const resourcesData = await resourcesResponse.json();
        setResources(resourcesData);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    }
  };
  
  // Handle resource reordering
  const handleResourcesReordered = async (reorderedResources: Resource[]) => {
    try {
      // This would typically update the order in the database
      // For now, we'll just update the local state
      setResources(prevResources => {
        const otherResources = prevResources.filter(
          r => !reorderedResources.find(rr => rr.id === r.id)
        );
        return [...reorderedResources, ...otherResources];
      });
      
      toast({
        title: 'Success',
        description: 'Resource order updated',
      });
    } catch (error) {
      console.error('Error reordering resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resource order',
        variant: 'destructive',
      });
    }
  };
  
  // Handle resource removal
  const handleResourceRemoved = async (resource: Resource) => {
    try {
      const response = await apiRequest('DELETE', `/api/resources/${resource.id}`);
      if (response.ok) {
        // Remove the resource from the local state
        setResources(resources.filter(r => r.id !== resource.id));
        
        toast({
          title: 'Success',
          description: 'Resource removed successfully',
        });
      }
    } catch (error) {
      console.error('Error removing resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove resource',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="drag">Drag & Drop</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cards" className="space-y-4">
          <h2 className="text-2xl font-bold">Manage Your Resources</h2>
          
          {userResources.length === 0 ? (
            <p>You haven't created any resources yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userResources.map(resource => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Type:</span> {resource.resourceType}
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        resource.featured 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {resource.featured ? 'Featured' : 'Not featured'}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-1 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleFeatured(resource)}
                    >
                      {resource.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.location.href = `/resource/${resource.id}`}
                    >
                      View
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="drag">
          <ResourceManager
            resources={userResources}
            onResourcesReordered={handleResourcesReordered}
            onResourceRemoved={handleResourceRemoved}
            onFileUpload={handleFileUpload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}