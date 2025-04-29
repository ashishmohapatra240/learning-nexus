import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import CompanyProfessionalMatches from "@/components/matching/company-professional-matches";
import type { JobPosting } from "@shared/schema";

export default function JobProfessionalMatches() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  
  // Fetch job postings for the company
  const { data: jobs, isLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/companies/me/jobs"],
    enabled: true,
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Zap className="mr-2 h-5 w-5 text-amber-500" /> AI Powered Professional Matches
        </h2>
        <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">New</div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Find Matching Professionals</CardTitle>
          <CardDescription>
            Select a job posting to see professionals that match your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="job-select">Select a job posting</Label>
            <Select
              disabled={isLoading || !jobs || jobs.length === 0}
              value={selectedJobId?.toString() || ""}
              onValueChange={(value) => setSelectedJobId(parseInt(value))}
            >
              <SelectTrigger id="job-select" className="w-full">
                <SelectValue placeholder="Select a job posting" />
              </SelectTrigger>
              <SelectContent>
                {jobs && jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedJobId ? (
            <CompanyProfessionalMatches jobId={selectedJobId} />
          ) : (
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <Zap className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium mb-2">Select a job to see matches</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Choose one of your job postings above to find professionals that 
                match your requirements using our AI-powered matching system.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}