import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Shield,
  BookOpen,
  DollarSign,
  BarChart3,
  Building,
  Bell,
  List,
  Award,
  AlertTriangle,
} from "lucide-react";

// Functional admin components
const UsersManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          throw new Error("No admin token found");
        }
        
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };
        
        // Fetch users data from API
        const response = await fetch("/api/admin/users", {
          method: "GET",
          headers
        });
        
        if (!response.ok) {
          // For demo purposes, we'll create sample data if the endpoint is not ready
          console.log("Users endpoint not ready, using sample data");
          
          // Sample data
          const sampleUsers = [
            { 
              id: 1, 
              username: "jsmith", 
              email: "john.smith@example.com", 
              firstName: "John", 
              lastName: "Smith", 
              userType: "professional",
              createdAt: "2025-03-15T10:00:00Z",
              lastActiveAt: "2025-04-25T14:30:00Z",
              blocked: false,
            },
            { 
              id: 2, 
              username: "agarcia", 
              email: "alex.garcia@example.com", 
              firstName: "Alex", 
              lastName: "Garcia", 
              userType: "professional",
              createdAt: "2025-03-16T11:00:00Z",
              lastActiveAt: "2025-04-26T09:15:00Z",
              blocked: false,
            },
            { 
              id: 3, 
              username: "techcorp", 
              email: "info@techcorp.com", 
              firstName: "Tech", 
              lastName: "Corp", 
              userType: "company",
              createdAt: "2025-03-10T09:30:00Z",
              lastActiveAt: "2025-04-27T10:45:00Z",
              blocked: false,
            },
            { 
              id: 4, 
              username: "jdoe", 
              email: "jane.doe@example.com", 
              firstName: "Jane", 
              lastName: "Doe", 
              userType: "professional",
              createdAt: "2025-03-18T14:20:00Z",
              lastActiveAt: "2025-04-24T16:50:00Z",
              blocked: true,
              blockReason: "Inappropriate content"
            },
            { 
              id: 5, 
              username: "traininginc", 
              email: "contact@traininginc.com", 
              firstName: "Training", 
              lastName: "Inc", 
              userType: "company",
              createdAt: "2025-03-05T08:15:00Z",
              lastActiveAt: "2025-04-26T11:30:00Z",
              blocked: false,
            },
          ];
          
          setUsers(sampleUsers);
          return;
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users data",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'professional':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Professional</span>;
      case 'company':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Company</span>;
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Admin</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };
  
  const getStatusLabel = (user: any) => {
    if (user.blocked) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Blocked</span>;
    }
    
    const lastActiveDate = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    const now = new Date();
    const timeDiff = lastActiveDate ? now.getTime() - lastActiveDate.getTime() : 0;
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (!lastActiveDate) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    } else if (daysDiff < 1) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    } else if (daysDiff < 7) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Recent</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Inactive</span>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Users Management</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Users Management</h2>
        <Card>
          <CardContent className="p-4 text-center text-rose-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Users Management</h2>
        <Button size="sm">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Last Active</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{getUserTypeLabel(user.userType)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusLabel(user)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.lastActiveAt ? formatDate(user.lastActiveAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right space-x-2">
                      <Button variant="outline" size="icon" title="Edit user">
                        <span className="sr-only">Edit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </Button>
                      
                      {user.blocked ? (
                        <Button variant="outline" size="icon" className="text-green-500" title="Unblock user">
                          <span className="sr-only">Unblock</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            <line x1="12" y1="15" x2="12" y2="17"></line>
                          </svg>
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" className="text-red-500" title="Block user">
                          <span className="sr-only">Block</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            <line x1="8" y1="5" x2="16" y2="19"></line>
                          </svg>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfessionalsManagement = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          throw new Error("No admin token found");
        }
        
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };
        
        // Fetch professionals data from API
        const response = await fetch("/api/admin/users?userType=professional", {
          method: "GET",
          headers
        });
        
        if (!response.ok) {
          // For demo purposes, we'll create sample data
          console.log("Professionals endpoint not ready, using sample data");
          
          // Sample professional data
          const sampleProfessionals = [
            {
              id: 1,
              userId: 10,
              firstName: "John",
              lastName: "Smith",
              title: "Learning Development Specialist",
              location: "New York, NY",
              expertise: ["Leadership Training", "Team Building", "Executive Coaching"],
              ratings: 4.8,
              verified: true,
              featured: true,
              createdAt: "2025-01-15T10:30:00Z",
              completedJobs: 15,
              topSkills: ["Workshop Facilitation", "Curriculum Design", "Assessment"]
            },
            {
              id: 2,
              userId: 12,
              firstName: "Sarah",
              lastName: "Johnson",
              title: "Corporate Trainer",
              location: "Chicago, IL",
              expertise: ["Sales Training", "Customer Service", "Onboarding"],
              ratings: 4.7,
              verified: true,
              featured: false,
              createdAt: "2025-01-20T14:15:00Z",
              completedJobs: 12,
              topSkills: ["Presentation Skills", "Content Development", "Needs Assessment"]
            },
            {
              id: 3,
              userId: 15,
              firstName: "Michael",
              lastName: "Williams",
              title: "E-Learning Developer",
              location: "Austin, TX",
              expertise: ["LMS Implementation", "Digital Learning", "Instructional Design"],
              ratings: 4.9,
              verified: true,
              featured: true, 
              createdAt: "2025-02-05T09:45:00Z",
              completedJobs: 20,
              topSkills: ["Articulate Storyline", "Adobe Captivate", "Video Production"]
            },
            {
              id: 4,
              userId: 18,
              firstName: "Emily",
              lastName: "Davis",
              title: "DEI Consultant",
              location: "San Francisco, CA",
              expertise: ["Diversity Workshops", "Inclusion Strategies", "Cultural Competence"],
              ratings: 4.6,
              verified: true,
              featured: false,
              createdAt: "2025-02-12T11:20:00Z", 
              completedJobs: 8,
              topSkills: ["Facilitated Discussions", "Program Development", "Assessments"]
            },
            {
              id: 5,
              userId: 22,
              firstName: "Robert",
              lastName: "Garcia",
              title: "Technical Trainer",
              location: "Seattle, WA",
              expertise: ["Software Training", "IT Skills Development", "Technical Documentation"],
              ratings: 4.5,
              verified: false,
              featured: false,
              createdAt: "2025-03-01T13:10:00Z",
              completedJobs: 5,
              topSkills: ["Hands-on Labs", "Process Documentation", "Knowledge Management"]
            }
          ];
          
          setProfessionals(sampleProfessionals);
          return;
        }
        
        const data = await response.json();
        setProfessionals(data);
      } catch (err) {
        console.error("Error fetching professionals:", err);
        setError("Failed to load professionals data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load professionals data",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfessionals();
  }, [toast]);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">L&D Professionals</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">L&D Professionals</h2>
        <Card>
          <CardContent className="p-4 text-center text-rose-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">L&D Professionals</h2>
        <Button size="sm">
          <Users className="h-4 w-4 mr-2" />
          Add Professional
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {professionals.map((pro) => (
          <Card key={pro.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mr-4">
                      {pro.firstName?.[0]}{pro.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{pro.firstName} {pro.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{pro.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {pro.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        Verified
                      </span>
                    )}
                    {pro.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="mr-3">📍 {pro.location}</span>
                    <span>⭐ {pro.ratings}/5.0</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined {formatDate(pro.createdAt)}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Expertise:</h4>
                  <div className="flex flex-wrap gap-1">
                    {pro.expertise.map((expertise: string, index: number) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {expertise}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Top Skills:</h4>
                  <div className="flex flex-wrap gap-1">
                    {pro.topSkills.map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">{pro.completedJobs}</span> jobs completed
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CompaniesManagement = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Companies Management</h2>
    <Card>
      <CardContent className="p-4">
        <p className="text-center py-8 text-muted-foreground">
          Company management features will be implemented here
        </p>
      </CardContent>
    </Card>
  </div>
);

const JobsManagement = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Jobs Management</h2>
    <Card>
      <CardContent className="p-4">
        <p className="text-center py-8 text-muted-foreground">
          Job posting management features will be implemented here
        </p>
      </CardContent>
    </Card>
  </div>
);

const ResourcesManagement = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Resources Management</h2>
    <Card>
      <CardContent className="p-4">
        <p className="text-center py-8 text-muted-foreground">
          Resource management features will be implemented here
        </p>
      </CardContent>
    </Card>
  </div>
);

const FinancialManagement = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Financial Management</h2>
    <Card>
      <CardContent className="p-4">
        <p className="text-center py-8 text-muted-foreground">
          Financial management features will be implemented here
        </p>
      </CardContent>
    </Card>
  </div>
);

const AnalyticsView = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Analytics & Reporting</h2>
    <Card>
      <CardContent className="p-4">
        <p className="text-center py-8 text-muted-foreground">
          Analytics and reporting features will be implemented here
        </p>
      </CardContent>
    </Card>
  </div>
);

const SystemSettings = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">System Settings</h2>
    <Card>
      <CardContent className="p-4">
        <p className="text-center py-8 text-muted-foreground">
          System settings and configuration options will be implemented here
        </p>
      </CardContent>
    </Card>
  </div>
);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verify admin authentication on component mount
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
        
        // If no token is found, redirect to login
        if (!token) {
          throw new Error("No admin token found");
        }
        
        // Create headers with JWT token
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };
        
        // Verify token with backend
        try {
          const response = await fetch("/api/admin/auth/verify-token", {
            method: "GET",
            headers
          });
          
          if (!response.ok) {
            throw new Error("Admin authentication failed: " + response.statusText);
          }
        } catch (tokenError) {
          console.error("Token verification error:", tokenError);
          throw new Error("Authentication error: Unable to verify admin token");
        }
        
        // Get admin data
        try {
          const adminDataResponse = await fetch("/api/admin/auth/me", {
            method: "GET",
            headers
          });
          
          if (!adminDataResponse.ok) {
            throw new Error("Failed to fetch admin data: " + adminDataResponse.statusText);
          }
          
          const data = await adminDataResponse.json();
          console.log("Admin data received:", data);
          setAdminData(data);
        } catch (dataError) {
          console.error("Admin data fetch error:", dataError);
          toast({
            variant: "destructive",
            title: "Data Error",
            description: "Could not load admin dashboard data. The server may be experiencing issues.",
          });
          // We still set isAuthenticated to true since the token was valid
        }
        
        setIsAuthenticated(true);
      } catch (err: any) {
        console.error("Admin authentication error:", err);
        setError(err.message);
        
        // Clear any invalid tokens
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please login to access the admin panel",
          });
          setLocation("/admin-login");
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAdmin();
  }, [setLocation, toast]);

  // Sample summary data for the dashboard (would be replaced with real data from API)
  const summaryData = {
    users: adminData?.stats?.totalUsers || 0,
    professionals: adminData?.stats?.totalProfessionals || 0,
    companies: adminData?.stats?.totalCompanies || 0,
    jobs: adminData?.stats?.totalJobs || 0,
    resources: adminData?.stats?.totalResources || 0,
    revenue: adminData?.stats?.monthlyRevenue || "$0",
  };

  const handleLogout = async () => {
    // Clear admin tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    
    // Show logout notification
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel",
    });
    
    // Redirect to login page
    setLocation("/admin-login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Verifying Admin Access</h2>
        <p className="text-muted-foreground">Please wait while we authenticate your credentials...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center mb-6 text-rose-500">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Authentication Error</h2>
          <p className="text-center text-muted-foreground mb-6">{error}</p>
          <Button 
            className="w-full" 
            onClick={() => setLocation("/admin-login")}
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
          {adminData && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {adminData.role || 'Admin'}
            </span>
          )}
        </div>
        
        <nav className="space-y-1">
          {/* Desktop menu */}
          <div onClick={() => setActiveTab("dashboard")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <BarChart3 className="h-5 w-5 mr-2" />
              Dashboard
            </div>
          </div>
          
          <div onClick={() => setActiveTab("users")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <Users className="h-5 w-5 mr-2" />
              Users
            </div>
          </div>
          
          <div onClick={() => setActiveTab("professionals")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "professionals" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <Award className="h-5 w-5 mr-2" />
              Professionals
            </div>
          </div>
          
          <div onClick={() => setActiveTab("companies")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "companies" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <Building className="h-5 w-5 mr-2" />
              Companies
            </div>
          </div>
          
          <div onClick={() => setActiveTab("jobs")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "jobs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <Briefcase className="h-5 w-5 mr-2" />
              Jobs
            </div>
          </div>
          
          <div onClick={() => setActiveTab("resources")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "resources" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <BookOpen className="h-5 w-5 mr-2" />
              Resources
            </div>
          </div>
          
          <div onClick={() => setActiveTab("finances")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "finances" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <DollarSign className="h-5 w-5 mr-2" />
              Finances
            </div>
          </div>
          
          <div onClick={() => setActiveTab("analytics")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </div>
          </div>
          
          <div onClick={() => setActiveTab("settings")} className="cursor-pointer">
            <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </div>
          </div>

          <hr className="my-4" />
          
          <div onClick={handleLogout} className="cursor-pointer">
            <div className="flex items-center w-full px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md">
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar - Shown when mobileMenuOpen is true */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
            
            <nav className="space-y-1">
              {/* Mobile menu - same items as desktop but with setMobileMenuOpen(false) added */}
              <div 
                onClick={() => {
                  setActiveTab("dashboard");
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Dashboard
                </div>
              </div>
              
              <div 
                onClick={() => {
                  setActiveTab("users");
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Users className="h-5 w-5 mr-2" />
                  Users
                </div>
              </div>
              
              <div 
                onClick={() => {
                  setActiveTab("professionals");
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "professionals" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Award className="h-5 w-5 mr-2" />
                  Professionals
                </div>
              </div>
              
              <div 
                onClick={() => {
                  setActiveTab("companies");
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "companies" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Building className="h-5 w-5 mr-2" />
                  Companies
                </div>
              </div>
              
              <div 
                onClick={() => {
                  setActiveTab("jobs");
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "jobs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Briefcase className="h-5 w-5 mr-2" />
                  Jobs
                </div>
              </div>
              
              <div 
                onClick={() => {
                  setActiveTab("resources");
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${activeTab === "resources" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Resources
                </div>
              </div>
              
              <hr className="my-4" />
              
              <div 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }} 
                className="cursor-pointer"
              >
                <div className="flex items-center w-full px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile menu button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <List className="h-4 w-4" />
      </Button>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500">Overview of the L&D Nexus platform</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminData ? (
                      <div className="text-2xl font-bold">{summaryData.users}</div>
                    ) : (
                      <Skeleton className="h-8 w-16" />
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Professionals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminData ? (
                      <div className="text-2xl font-bold">{summaryData.professionals}</div>
                    ) : (
                      <Skeleton className="h-8 w-16" />
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminData ? (
                      <div className="text-2xl font-bold">{summaryData.companies}</div>
                    ) : (
                      <Skeleton className="h-8 w-16" />
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminData ? (
                      <div className="text-2xl font-bold">{summaryData.jobs}</div>
                    ) : (
                      <Skeleton className="h-8 w-16" />
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminData ? (
                      <div className="text-2xl font-bold">{summaryData.resources}</div>
                    ) : (
                      <Skeleton className="h-8 w-16" />
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminData ? (
                      <div className="text-2xl font-bold">{summaryData.revenue}</div>
                    ) : (
                      <Skeleton className="h-8 w-20" />
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {adminData ? (
                    <p className="text-center py-8 text-muted-foreground">
                      Activity feed will be displayed here
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "users" && <UsersManagement />}
          {activeTab === "professionals" && <ProfessionalsManagement />}
          {activeTab === "companies" && <CompaniesManagement />}
          {activeTab === "jobs" && <JobsManagement />}
          {activeTab === "resources" && <ResourcesManagement />}
          {activeTab === "finances" && <FinancialManagement />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "settings" && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}