import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Calendar, Clock, DollarSign, Star, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JobPosting, CompanyProfile } from "@shared/schema";

interface JobCardProps {
  job: JobPosting;
}

export default function JobCard({ job }: JobCardProps) {
  const { data: company } = useQuery<CompanyProfile>({
    queryKey: [`/api/company-profiles/${job.companyId}`],
  });

  // Format compensation
  const formatCompensation = () => {
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

  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded bg-white p-2 border border-gray-200 flex items-center justify-center">
            {company?.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt={company?.companyName || "Company logo"} 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Building className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-heading font-medium">{job.title}</h3>
            <Link href={`/company-profile/${job.companyId}`} className="text-primary font-medium hover:underline">
              {company?.companyName || "Loading..."}
            </Link>
          </div>
        </div>
        <Badge className={`
          ${job.jobType === "full-time" ? "bg-blue-100 text-blue-800" : ""}
          ${job.jobType === "part-time" ? "bg-indigo-100 text-indigo-800" : ""}
          ${job.jobType === "contract" ? "bg-amber-100 text-amber-800" : ""}
          ${job.jobType === "freelance" ? "bg-green-100 text-green-800" : ""}
        `}>
          {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Location</h4>
          <p className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location} {job.remote && "(Remote)"}</span>
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
            {job.jobType === "contract" || job.jobType === "freelance" ? "Duration" : "Employment"}
          </h4>
          <p className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-1" />
            <span>{job.duration || "Permanent"}</span>
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Compensation</h4>
          <p className="flex items-center text-gray-700 font-medium">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{formatCompensation()}</span>
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Posted</h4>
          <p className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </p>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">
        {job.description.length > 120 
          ? job.description.substring(0, 120) + '...' 
          : job.description}
      </p>
      
      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Required Skills</h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements.split(',').map((skill, index) => (
            <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-800">
              {skill.trim()}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Link href={`/job/${job.id}`}>
          <Button className="flex-grow">View Details</Button>
        </Link>
        <Button variant="outline" size="icon">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
