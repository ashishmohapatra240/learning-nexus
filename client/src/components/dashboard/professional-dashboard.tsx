import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Star, 
  ChevronRight,
  PencilIcon,
  FileText,
  CheckCircle,
  XCircle,
  CreditCard,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import SubscriptionStatus from "@/components/dashboard/subscription-status";
import ProfessionalJobMatches from "@/components/matching/professional-job-matches";
import type { 
  ProfessionalProfile, 
  JobApplication, 
  JobPosting, 
  Message,
  Consultation
} from "@shared/schema";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  
  // Fetch professional profile
  const { 
    data: profile, 
    isLoading: isLoadingProfile 
  } = useQuery<ProfessionalProfile>({
    queryKey: ["/api/professionals/me"],
    enabled: !!user,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (response.status === 401) {
          // Return null for unauthorized
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/professionals/me:", error);
        return null;
      }
    },
  });
  
  // Fetch job applications - using "me" endpoint that doesn't require profile ID
  const { 
    data: applications, 
    isLoading: isLoadingApplications 
  } = useQuery<JobApplication[]>({
    queryKey: ["/api/professionals/me/applications"],
    enabled: !!user,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (response.status === 401) {
          // Return empty array for unauthorized
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching applications: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/professionals/me/applications:", error);
        return [];
      }
    },
  });
  
  // Fetch messages
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (response.status === 401) {
          // Return empty array for unauthorized
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/messages:", error);
        return [];
      }
    },
  });
  
  // Fetch consultations - using "me" endpoint that doesn't require profile ID
  const { 
    data: consultations, 
    isLoading: isLoadingConsultations 
  } = useQuery<Consultation[]>({
    queryKey: ["/api/professionals/me/consultations"],
    enabled: !!user,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (response.status === 401) {
          // Return empty array for unauthorized
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching consultations: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/professionals/me/consultations:", error);
        return [];
      }
    },
  });
  
  // Additional query for job details
  const { 
    data: jobPostings 
  } = useQuery<JobPosting[]>({
    queryKey: ["/api/job-postings"],
    enabled: !!applications && applications.length > 0,
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching job postings: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in query function for /api/job-postings:", error);
        return [];
      }
    },
  });
  
  // Helper to get job details
  const getJobDetails = (jobId: number) => {
    return jobPostings?.find(job => job.id === jobId);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Professional Dashboard</h1>
          <p className="text-gray-500">Manage your profile, applications, and consultations</p>
        </div>
        
        {profile ? (
          <Link href="/edit-profile">
            <Button>
              <PencilIcon className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        ) : (
          <Link href="/edit-profile">
            <Button>
              <PencilIcon className="mr-2 h-4 w-4" /> Create Profile
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Profile Summary Card */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" /> Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="ml-auto h-8 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : profile ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                      {profile.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.title || 'Profile'}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-lg">{profile.title}</h3>
                      <p className="text-gray-500">{profile.location}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{((profile.rating || 0) / 20).toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({profile.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {profile.bio ? profile.bio.substring(0, 200) : 'No bio provided'}
                    {profile.bio && profile.bio.length > 200 ? '...' : ''}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.featured && (
                      <Badge className="bg-amber-100 text-amber-800">Featured Profile</Badge>
                    )}
                    <Badge className="bg-blue-100 text-blue-800">
                      {profile.ratePerHour ? `$${profile.ratePerHour}/hr` : 'Rate not specified'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">You haven't created a professional profile yet.</p>
                  <Link href="/edit-profile">
                    <Button>Complete Your Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Subscription Status Card */}
        <div>
          <SubscriptionStatus />
        </div>
      </div>
      
      {/* AI Job Matching Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Zap className="mr-2 h-5 w-5 text-amber-500" /> AI Powered Job Matches
          </h2>
          <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">New</div>
        </div>
        <ProfessionalJobMatches />
      </div>
      
      <Tabs defaultValue="applications">
        <TabsList className="grid grid-cols-3 w-full mb-8">
          <TabsTrigger value="applications" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" /> Applications
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Messages
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Consultations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Track the status of your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!profile ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Create a profile to apply for jobs</p>
                  <Link href="/edit-profile">
                    <Button>Complete Your Profile</Button>
                  </Link>
                </div>
              ) : isLoadingApplications ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-64" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => {
                    const job = getJobDetails(application.jobId);
                    return (
                      <div key={application.id} className="border rounded-md p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{job?.title || 'Loading job details...'}</h3>
                            <p className="text-gray-500 text-sm">
                              Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge 
                            className={`
                              ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                              ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                              ${application.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                            `}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-gray-500 text-sm">
                            {job?.location} {job?.remote ? '(Remote)' : ''}
                          </div>
                          <Link href={`/job/${application.jobId}`}>
                            <Button variant="ghost" size="sm" className="flex items-center">
                              View Job <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No Applications Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                  <Link href="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Conversations with companies and clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex items-start">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3 space-y-2 flex-grow">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Link key={message.id} href={`/messages?user=${message.senderId === user?.id ? message.receiverId : message.senderId}`}>
                      <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-3 flex-grow">
                            <div className="flex justify-between">
                              <h3 className="font-medium">
                                {message.senderId === user?.id ? 'You' : 'Contact'}
                              </h3>
                              <span className="text-gray-500 text-xs">
                                {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-gray-700 line-clamp-1">{message.content}</p>
                          </div>
                          {!message.read && message.receiverId === user?.id && (
                            <span className="h-2 w-2 bg-primary rounded-full ml-2 mt-2"></span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No Messages</h3>
                  <p className="text-gray-500">Your inbox is empty</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Consultations</CardTitle>
              <CardDescription>
                Manage your scheduled consultations with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!profile ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Create a profile to receive consultation requests</p>
                  <Link href="/edit-profile">
                    <Button>Complete Your Profile</Button>
                  </Link>
                </div>
              ) : isLoadingConsultations ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3 space-y-2 flex-grow">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="border rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Consultation with Company #{consultation.companyId}</h3>
                            <p className="text-gray-700">
                              {format(new Date(consultation.startTime), 'MMM d, yyyy')} at{' '}
                              {format(new Date(consultation.startTime), 'h:mm a')} - {' '}
                              {format(new Date(consultation.endTime), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={`
                            ${consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                            ${consultation.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                            ${consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="ml-13 pl-13">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-500 text-sm">
                            <span className="font-medium">Rate:</span> ${consultation.rate}/hour
                          </p>
                          <div className="flex space-x-2">
                            {consultation.status === 'scheduled' && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
                                  <CheckCircle className="mr-1 h-4 w-4" /> Complete
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                  <XCircle className="mr-1 h-4 w-4" /> Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No Consultations</h3>
                  <p className="text-gray-500 mb-4">You don't have any scheduled consultations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
