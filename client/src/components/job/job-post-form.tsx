import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, getCsrfToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { 
  insertJobPostingSchema,
  type CompanyProfile
} from "@shared/schema";

// Extended schema for form validation
const jobPostingFormSchema = insertJobPostingSchema.extend({
  expiresInDays: z.number().int().min(1).default(30)
});

export default function JobPostForm() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's company profile
  const { data: companyProfile, isLoading: isLoadingProfile } = useQuery<CompanyProfile>({
    queryKey: ["/api/company-profiles/by-user"],
    enabled: user?.userType === "company",
  });

  const form = useForm<z.infer<typeof jobPostingFormSchema>>({
    resolver: zodResolver(jobPostingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      jobType: "full-time",
      minCompensation: undefined,
      maxCompensation: undefined,
      compensationUnit: "yearly",
      duration: "",
      requirements: "",
      remote: false,
      featured: false,
      status: "open",
      expiresInDays: 30,
      companyId: undefined
    },
  });

  const onSubmit = async (data: z.infer<typeof jobPostingFormSchema>) => {
    if (!companyProfile) {
      toast({
        title: "Profile required",
        description: "You need to complete your company profile before posting a job",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + data.expiresInDays);
      
      // Remove expiresInDays and add expiresAt and companyId
      const { expiresInDays, ...jobData } = data;
      const jobPostingData = {
        ...jobData,
        expiresAt: expirationDate.toISOString(),
        companyId: companyProfile.id
      };
      
      const response = await apiRequest("POST", "/api/job-postings", jobPostingData);
      const savedJob = await response.json();
      
      toast({
        title: "Job posted successfully",
        description: "Your job posting is now live",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyProfile.id}/job-postings`] });
      
      // Redirect to job detail page
      setLocation(`/job/${savedJob.id}`);
    } catch (error) {
      console.error("Job posting error:", error);
      toast({
        title: "Failed to post job",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const jobTypeOptions = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" }
  ];

  const compensationUnitOptions = [
    { value: "hourly", label: "Per hour" },
    { value: "yearly", label: "Per year" },
    { value: "project", label: "Per project" }
  ];

  if (!user || user.userType !== "company") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Company Account Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to be signed in with a company account to post jobs.</p>
            <Button onClick={() => setLocation("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to complete your company profile before posting jobs.</p>
            <Button onClick={() => setLocation("/edit-profile")}>Complete Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="border p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Basic Job Information</h2>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Learning & Development Manager" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, specific title will attract more qualified candidates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="remote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 mt-4 px-1">
                  <FormLabel>Remote Work</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("jobType") === "contract" || form.watch("jobType") === "freelance" ? (
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3 months, 6 weeks, etc." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Specify the estimated duration of the contract or project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
          
          <div className="border p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Job Details</h2>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of the job responsibilities, expectations, and the ideal candidate..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A comprehensive description helps attract the right candidates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List required skills, qualifications, and experience (comma-separated)..." 
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter key skills and requirements separated by commas (e.g., Instructional Design, LMS Administration, Leadership Development)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="border p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Compensation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minCompensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 70000" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxCompensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 90000" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="compensationUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {compensationUnitOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="border p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Posting Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiresInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Posting Duration (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || 30}
                        onChange={(e) => field.onChange(e.target.value === "" ? 30 : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days the job will remain active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Feature this job posting</FormLabel>
                      <FormDescription>
                        Featured job postings appear at the top of search results
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting Job...
              </>
            ) : (
              "Post Job"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
