import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import JobDetail from "@/components/job/job-detail";

export default function JobDetailPage() {
  // Get the job ID from URL parameters
  const params = useParams<{ id: string }>();
  const jobId = params?.id ? parseInt(params.id) : 0;

  if (!jobId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Job ID</h1>
          <p className="text-gray-600">The requested job posting could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <JobDetail jobId={jobId} />
    </div>
  );
}
