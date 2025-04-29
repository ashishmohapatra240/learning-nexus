import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Globe, 
  Clock, 
  Users, 
  CheckCircle, 
  Bookmark,
  MessageSquare
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import JobApplicationForm from "./job-application-form";
import JobMatches from "./job-matches";
import type { 
  JobPosting, 
  CompanyProfile,
  JobApplication,
  ProfessionalProfile
} from "@shared/schema";

interface JobDetailProps {
  jobId: number;
}

export default function JobDetail({ jobId }: JobDetailProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Fetch job details
  const { 
    data: job, 
    isLoading: isLoadingJob,
    error: jobError
  } = useQuery<JobPosting>({
    queryKey: [`/api/job-postings/${jobId}`],
  });

  // Fetch company details if job exists
  const { 
    data: company, 
    isLoading: isLoadingCompany 
  } = useQuery<CompanyProfile>({
    queryKey: [`/api/company-profiles/${job?.companyId}`],
    enabled: !!job,
  });

  // If user is a professional, fetch their profile
  const { 
    data: professionalProfile 
  } = useQuery<ProfessionalProfile>({
    queryKey: ["/api/professionals/me"],
    enabled: !!user && user.userType === "professional",
  });

  // Check if user has already applied for this job
  const { 
    data: userApplications 
  } = useQuery<JobApplication[]>({
    queryKey: [`/api/professionals/${professionalProfile?.id}/applications`],
    enabled: !!professionalProfile,
  });

  const hasAlreadyApplied = userApplications?.some(
    application => application.jobId === jobId
  );

  // Format compensation range
  const formatCompensation = () => {
    if (!job) return "Not specified";
    
    if (!job.minCompensation && !job.maxCompensation) return "Not specified";
    
    let result = "";
    
    if (job.minCompensation && job.maxCompensation) {
      result = `$${job.minCompensation.toLocaleString()} - $${job.maxCompensation.toLocaleString()}`;
    } else if (job.minCompensation) {
      result = `$${job.minCompensation.toLocaleString()}+`;
    } else if (job.maxCompensation) {
      result = `Up to $${job.maxCompensation.toLocaleString()}`;
    }
    
    if (job.compensationUnit) {
      switch (job.compensationUnit) {
        case "hourly":
          result += "/hour";
          break;
        case "project":
          result += " per project";
          break;
        case "yearly":
          result += "/year";
          break;
      }
    }
    
    return result;
  };

  const handleApplyClick = () => {
    if (!user) {
      // Redirect to login if not authenticated
      setLocation(`/login?redirect=/job/${jobId}`);
      return;
    }
    
    if (user.userType !== "professional") {
      // Show error toast or message for company users
      return;
    }
    
    if (!professionalProfile) {
      // Redirect to profile creation
      setLocation("/edit-profile");
      return;
    }
    
    // Show application form
    setShowApplicationForm(true);
  };

  const handleMessageCompany = () => {
    if (!user) {
      // Redirect to login if not authenticated
      setLocation(`/login?redirect=/job/${jobId}`);
      return;
    }
    
    // Navigate to messages with this company
    setLocation(`/messages?company=${company?.id}`);
  };

  if (isLoadingJob) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <p className="text-gray-600 mb-6">The job posting you're looking for doesn't exist or has been removed.</p>
        <Link href="/jobs">
          <Button>Browse All Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-gray-600">
            {company && (
              <span className="flex items-center">
                <Building className="mr-1 h-4 w-4" />
                {company.companyName}
              </span>
            )}
            <span className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {job.location} {job.remote && "(Remote)"}
            </span>
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="icon" className="border-slate-300 text-slate-700 hover:bg-slate-100">
            <Bookmark className="h-4 w-4" />
          </Button>

          {user?.userType === "professional" && !hasAlreadyApplied && (
            <Button 
              onClick={handleApplyClick} 
              disabled={!professionalProfile}
              className="bg-gradient-to-r from-slate-800 to-blue-700 hover:from-slate-900 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                <path d="M16.5 9.4 7.55 4.24" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
                <circle cx="18" cy="16" r="3" />
                <path d="m21 16-6 6-6-6h4v-4h4v4Z" />
              </svg>
              Apply Now
            </Button>
          )}

          {user?.userType === "professional" && hasAlreadyApplied && (
            <Button 
              disabled
              className="bg-gradient-to-r from-green-600 to-green-800 opacity-80 cursor-not-allowed"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Already Applied
            </Button>
          )}

          <Button 
            onClick={handleMessageCompany}
            className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
            variant="outline"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {job.requirements.split(',').map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!showApplicationForm && user?.userType === "professional" && (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                {hasAlreadyApplied && (
                  <CardDescription className="text-green-600 flex items-center mt-2">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    You have already applied for this job
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {hasAlreadyApplied
                    ? "You can check the status of your application in your dashboard."
                    : "Interested in this position? Submit your application now to connect with the employer."}
                </p>
                <Button 
                  onClick={handleApplyClick} 
                  disabled={hasAlreadyApplied || !professionalProfile}
                  className={`w-full ${!hasAlreadyApplied && professionalProfile 
                    ? "bg-gradient-to-r from-slate-800 to-blue-700 hover:from-slate-900 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200" 
                    : hasAlreadyApplied 
                      ? "bg-gradient-to-r from-green-600 to-green-800 opacity-80 cursor-not-allowed"
                      : "bg-gradient-to-r from-slate-600 to-slate-800 opacity-70"}`}
                >
                  {!professionalProfile ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Complete Your Profile to Apply
                    </>
                  ) : hasAlreadyApplied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Already Applied
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                        <path d="m21 16-6 6-6-6h4v-4h4v4Z" />
                      </svg>
                      Apply for This Position
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
          
          {showApplicationForm && (
            <JobApplicationForm 
              jobId={jobId} 
              onCancel={() => setShowApplicationForm(false)}
              onSuccess={() => setShowApplicationForm(false)}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="flex items-center text-gray-600">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Job Type
                  </span>
                  <Badge className={`
                    ${job.jobType === "full-time" ? "bg-blue-100 text-blue-800" : ""}
                    ${job.jobType === "part-time" ? "bg-indigo-100 text-indigo-800" : ""}
                    ${job.jobType === "contract" ? "bg-amber-100 text-amber-800" : ""}
                    ${job.jobType === "freelance" ? "bg-green-100 text-green-800" : ""}
                  `}>
                    {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                  </Badge>
                </div>
                
                {job.duration && (
                  <div className="flex justify-between">
                    <span className="flex items-center text-gray-600">
                      <Clock className="mr-2 h-5 w-5" />
                      Duration
                    </span>
                    <span>{job.duration}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="flex items-center text-gray-600">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Compensation
                  </span>
                  <span className="font-medium">{formatCompensation()}</span>
                </div>
                
                {job.remote && (
                  <div className="flex justify-between">
                    <span className="flex items-center text-gray-600">
                      <Globe className="mr-2 h-5 w-5" />
                      Remote Work
                    </span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Available
                    </Badge>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="flex items-center text-gray-600">
                    <Calendar className="mr-2 h-5 w-5" />
                    Closing Date
                  </span>
                  <span>
                    {job.expiresAt 
                      ? format(new Date(job.expiresAt), "MMM d, yyyy")
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoadingCompany ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded mr-3" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ) : company ? (
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    {company.logoUrl ? (
                      <img 
                        src={company.logoUrl} 
                        alt={company.companyName} 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      <Building className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{company.companyName}</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Globe className="h-3 w-3 mr-1" /> {company.industry}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                    <span>
                      {company.size === "small" && "Small (1-50 employees)"}
                      {company.size === "medium" && "Medium (51-500 employees)"}
                      {company.size === "large" && "Large (501-5000 employees)"}
                      {company.size === "enterprise" && "Enterprise (5000+ employees)"}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                    <span>{company.location}</span>
                  </div>
                  
                  {company.website && (
                    <div className="flex gap-2">
                      <Globe className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        Company Website
                      </a>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <p className="text-sm text-gray-600 line-clamp-4">
                  {company.description}
                </p>
                
                <div className="mt-3">
                  <Link href={`/company/${company.id}`}>
                    <Button variant="link" className="px-0">View Company Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          {(user?.userType === "company" || user?.isAdmin) && (
            <JobMatches jobId={jobId} companyId={company?.id} />
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-md p-3 hover:bg-gray-50">
                  <h3 className="font-medium">Similar Job Title</h3>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">Full-time</Badge>
                    <Link href="/jobs">
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
                <Link href="/jobs">
                  <Button variant="link" className="text-xs w-full">Browse More Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
