import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceManagement from '@/components/resources/resource-management';
import CreateResourceForm from '@/components/resources/create-resource-form';

export default function ManageResources() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('manage');

  // If not logged in, show a message
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Resource Management</h1>
          <p className="mb-6">Please log in to manage your resources.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resource Management</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage your learning and development resources
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="max-w-4xl mx-auto"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="manage">Manage Resources</TabsTrigger>
          <TabsTrigger value="create">Create New Resource</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage">
          <ResourceManagement />
        </TabsContent>
        
        <TabsContent value="create">
          <CreateResourceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}