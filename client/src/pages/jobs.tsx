import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  PlusCircle, 
  Filter, 
  CalendarDays,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import JobCard from "@/components/home/job-card";
import type { JobPosting } from "@shared/schema";

export default function Jobs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  
  // Fetch all job postings
  const { 
    data: jobs, 
    isLoading: isLoadingJobs,
    error: jobsError
  } = useQuery<JobPosting[]>({
    queryKey: ["/api/job-postings"],
  });
  
  // Filter jobs based on search and filters
  const filteredJobs = jobs?.filter(job => {
    // Filter by search term
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by job type
    const matchesType = jobType === "all" || job.jobType === jobType;
    
    // Filter by remote option
    const matchesRemote = !remoteOnly || job.remote;
    
    // Only show open jobs
    const isOpen = job.status === "open";
    
    return matchesSearch && matchesType && matchesRemote && isOpen;
  }) || [];
  
  // Sort jobs by created date (newest first)
  const sortedJobs = [...filteredJobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">L&D Job Opportunities</h1>
          <p className="text-gray-500">Find training and development projects</p>
        </div>
        
        {user?.userType === "company" && (
          <Link href="/post-job">
            <Button className="mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Post a Job
            </Button>
          </Link>
        )}
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search jobs by title, skills, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Job type filter */}
          <div>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Job type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Remote checkbox */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remote" 
                checked={remoteOnly}
                onCheckedChange={(checked) => setRemoteOnly(checked === true)}
              />
              <label
                htmlFor="remote"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remote only
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500">
          {sortedJobs.length} jobs found
        </p>
      </div>
      
      {/* Job listings */}
      <div className="space-y-6">
        {isLoadingJobs ? (
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-6 w-60" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobsError ? (
          // Error state
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-4">Failed to load job listings. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : sortedJobs.length > 0 ? (
          // Job cards
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          // Empty state
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">
                No job listings found matching your criteria. Try adjusting your filters.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setJobType("all");
                setRemoteOnly(false);
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Pagination (simplified for now) */}
      {sortedJobs.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="mx-1">1</Button>
          <Button variant="outline" className="mx-1">2</Button>
          <Button variant="outline" className="mx-1">3</Button>
          <Button variant="outline" className="mx-1">Next</Button>
        </div>
      )}
    </div>
  );
}
