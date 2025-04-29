import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Plus,
  Globe,
  Users,
  MapPin,
  ChevronRight,
  PencilIcon,
  FileText,
  User,
  CreditCard,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import SubscriptionStatus from "@/components/dashboard/subscription-status";
import JobProfessionalMatches from "@/components/dashboard/job-professional-matches";
import type { 
  CompanyProfile, 
  JobPosting, 
  JobApplication, 
  Message,
  Consultation,
  ProfessionalProfile
} from "@shared/schema";

export default function CompanyDashboard() {
  const { user } = useAuth();
  
  // Fetch company profile
  const { 
    data: profile, 
    isLoading: isLoadingProfile 
  } = useQuery<CompanyProfile>({
    queryKey: ["/api/company-profiles/by-user"],
    enabled: !!user,
  });
  
  // Fetch company job postings - using "me" endpoint that doesn't require profile ID
  const { 
    data: jobPostings, 
    isLoading: isLoadingJobs 
  } = useQuery<JobPosting[]>({
    queryKey: ["/api/companies/me/job-postings"],
    enabled: !!user,
  });
  
  // Fetch applications for all jobs
  const { 
    data: allApplications, 
    isLoading: isLoadingApplications 
  } = useQuery<{ jobId: number, applications: JobApplication[] }[]>({
    queryKey: ["/api/job-applications/company"],
    enabled: !!user,
  });
  
  // Fetch messages
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });
  
  // Fetch consultations - using "me" endpoint that doesn't require profile ID
  const { 
    data: consultations, 
    isLoading: isLoadingConsultations 
  } = useQuery<Consultation[]>({
    queryKey: ["/api/companies/me/consultations"],
    enabled: !!user,
  });
  
  // Fetch professional profiles for applications
  const { 
    data: professionals 
  } = useQuery<ProfessionalProfile[]>({
    queryKey: ["/api/professional-profiles"],
    enabled: !!allApplications && allApplications.length > 0,
  });
  
  // Helper to get professional details
  const getProfessionalDetails = (id: number) => {
    return professionals?.find(p => p.id === id);
  };
  
  // Helper to get all applications
  const getAllApplications = () => {
    if (!allApplications) return [];
    return allApplications.flatMap(item => item.applications);
  };
  
  // Helper to find job by id
  const getJobById = (id: number) => {
    return jobPostings?.find(job => job.id === id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
          <p className="text-gray-500">Manage your job postings, applications, and consultations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          {profile ? (
            <>
              <Link href="/post-job">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Post a Job
                </Button>
              </Link>
              <Link href="/edit-profile">
                <Button variant="outline">
                  <PencilIcon className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/edit-profile">
              <Button>
                <PencilIcon className="mr-2 h-4 w-4" /> Create Company Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Company Profile Summary Card */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" /> Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : profile ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded bg-primary bg-opacity-10 flex items-center justify-center">
                      {profile.logoUrl ? (
                        <img
                          src={profile.logoUrl}
                          alt={profile.companyName}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-lg">{profile.companyName}</h3>
                      <div className="flex flex-wrap gap-x-4 text-gray-500 text-sm">
                        <span className="flex items-center">
                          <Globe className="h-3 w-3 mr-1" /> {profile.industry}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" /> {profile.size}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {profile.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {profile.description.substring(0, 200)}
                    {profile.description.length > 200 ? '...' : ''}
                  </p>
                  
                  {profile.website && (
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">You haven't created a company profile yet.</p>
                  <Link href="/edit-profile">
                    <Button>Complete Your Company Profile</Button>
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
      {profile && jobPostings && jobPostings.length > 0 && (
        <div className="mb-8">
          <JobProfessionalMatches />
        </div>
      )}
      
      <Tabs defaultValue="jobs">
        <TabsList className="grid grid-cols-3 w-full mb-8">
          <TabsTrigger value="jobs" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" /> Job Postings
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Applications
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Messages
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Job Postings</CardTitle>
                <CardDescription>
                  Manage your current job listings
                </CardDescription>
              </div>
              <Link href="/post-job">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Post a Job
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!profile ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Create a company profile to post jobs</p>
                  <Link href="/edit-profile">
                    <Button>Complete Your Company Profile</Button>
                  </Link>
                </div>
              ) : isLoadingJobs ? (
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
              ) : jobPostings && jobPostings.length > 0 ? (
                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="border rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <div className="flex flex-wrap gap-x-4 text-gray-500 text-sm">
                            <span>{job.location} {job.remote ? '(Remote)' : ''}</span>
                            <span>Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <Badge 
                          className={`
                            ${job.status === 'open' ? 'bg-green-100 text-green-800' : ''}
                            ${job.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
                            ${job.status === 'filled' ? 'bg-blue-100 text-blue-800' : ''}
                          `}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Badge variant="outline" className="mr-2">{job.jobType}</Badge>
                        <div className="flex space-x-2">
                          <Link href={`/job/${job.id}`}>
                            <Button variant="ghost" size="sm" className="flex items-center">
                              View <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/job/${job.id}/applications`}>
                            <Button variant="outline" size="sm">
                              Applications
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No Job Postings</h3>
                  <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                  <Link href="/post-job">
                    <Button>Post Your First Job</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Manage applications from L&D professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!profile ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Create a company profile to receive applications</p>
                  <Link href="/edit-profile">
                    <Button>Complete Your Company Profile</Button>
                  </Link>
                </div>
              ) : isLoadingApplications ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex items-start">
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
              ) : getAllApplications().length > 0 ? (
                <div className="space-y-4">
                  {getAllApplications().map((application) => {
                    const professional = getProfessionalDetails(application.professionalId);
                    const job = getJobById(application.jobId);
                    return (
                      <div key={application.id} className="border rounded-md p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <h3 className="font-medium">{professional?.title || 'Applicant'}</h3>
                              <p className="text-gray-500 text-sm">
                                Applied to <span className="font-medium">{job?.title}</span> on {' '}
                                {format(new Date(application.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
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
                        <div className="ml-13 pl-13 mt-2">
                          <p className="text-gray-700 text-sm line-clamp-2">{application.coverLetter}</p>
                          <div className="flex justify-end mt-2">
                            <Link href={`/professional-profile/${application.professionalId}`}>
                              <Button variant="ghost" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No Applications Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't received any applications yet</p>
                  <Link href="/post-job">
                    <Button>Post a Job</Button>
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
                Conversations with L&D professionals
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
                                {message.senderId === user?.id ? 'You' : 'L&D Professional'}
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
      </Tabs>
    </div>
  );
}
