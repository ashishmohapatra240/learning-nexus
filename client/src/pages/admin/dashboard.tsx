import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Import admin components
import UsersPanel from "@/components/admin/simplified/users-panel";
import ProfessionalsPanel from "@/components/admin/simplified/professionals-panel";
import CompaniesPanel from "@/components/admin/simplified/companies-panel";
import JobsPanel from "@/components/admin/simplified/jobs-panel";
import ResourcesPanel from "@/components/admin/simplified/resources-panel";
import ContentPanel from "@/components/admin/simplified/content-panel";
import DashboardStats from "@/components/admin/simplified/dashboard-stats";

import { 
  BarChart4,
  Users,
  Briefcase,
  Building,
  FileText,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be an administrator to access this page.</p>
        <Button onClick={() => setLocation("/")}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="h-8 w-8 mr-2 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-gray-500">Manage all aspects of the L&D Nexus platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 md:w-auto w-full">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="professionals" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Professionals</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DashboardStats />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersPanel />
        </TabsContent>

        <TabsContent value="professionals" className="mt-6">
          <ProfessionalsPanel />
        </TabsContent>

        <TabsContent value="companies" className="mt-6">
          <CompaniesPanel />
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobsPanel />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourcesPanel />
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <ContentPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}