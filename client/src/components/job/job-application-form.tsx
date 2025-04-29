import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { ProfessionalProfile } from "@shared/schema";

// Define schema for form validation
const applicationSchema = z.object({
  coverLetter: z.string()
    .min(50, { message: "Cover letter must be at least 50 characters" })
    .max(2000, { message: "Cover letter must not exceed 2000 characters" }),
});

interface JobApplicationFormProps {
  jobId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function JobApplicationForm({ jobId, onCancel, onSuccess }: JobApplicationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch professional profile
  const { data: profile } = useQuery<ProfessionalProfile>({
    queryKey: ["/api/professionals/me"],
  });

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof applicationSchema>) => {
    if (!profile) {
      toast({
        title: "Profile required",
        description: "You need to complete your professional profile before applying",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Submit application
      await apiRequest("POST", `/api/job-postings/${jobId}/applications`, {
        coverLetter: data.coverLetter,
        professionalId: profile.id,
      });
      
      toast({
        title: "Application submitted",
        description: "Your job application has been sent successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: [`/api/professionals/${profile.id}/applications`] 
      });
      
      // Notify parent component of success
      onSuccess();
    } catch (error) {
      console.error("Application error:", error);
      
      // Check if it's already applied error
      if (error instanceof Error && error.message.includes("already applied")) {
        toast({
          title: "Already applied",
          description: "You have already applied to this job",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to submit application",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-blue-600 rounded-xl blur opacity-20"></div>
      <Card className="relative overflow-hidden shadow-lg ring-1 ring-slate-200/50">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 -rotate-12 scale-[6] transform origin-center translate-x-8 -translate-y-4">
            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
            <path d="m21 16-6 6-6-6h4v-4h4v4Z" />
          </svg>
        </div>
        
        <CardHeader className="border-b border-slate-200/70 pb-7 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
            <span className="bg-blue-600/90 h-6 w-1 rounded-full"></span>
            Apply for this Position
          </CardTitle>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="inline-flex items-center text-sm text-slate-600 bg-slate-100/70 rounded-full px-3 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-blue-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="8"></line>
                  </svg>
                  <span>Carefully craft your application to highlight relevant skills</span>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium text-base">
                      Your Cover Letter
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Introduce yourself and explain why you're a good fit for this position..."
                        className="min-h-60 bg-white border border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-slate-700 rounded-md shadow-sm placeholder:text-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500 italic">
                      Write a personalized cover letter highlighting your relevant experience and skills.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <div className="mt-3 text-sm text-slate-500 flex justify-between">
                <div>
                  <span className={form.watch("coverLetter").length < 50 ? "text-red-500" : "text-green-600"}>
                    {form.watch("coverLetter").length}
                  </span>/2000 characters
                </div>
                <div className={form.watch("coverLetter").length < 50 ? "text-red-500" : "text-green-600"}>
                  {form.watch("coverLetter").length < 50 
                    ? `(Need ${50 - form.watch("coverLetter").length} more characters)` 
                    : "✓ Minimum length reached"}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-3 border-t border-slate-200/70 bg-gradient-to-r from-slate-50 to-blue-50/30 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-slate-800 to-blue-700 hover:from-slate-900 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 ${isSubmitting ? "opacity-80" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                      <path d="m21 16-6 6-6-6h4v-4h4v4Z" />
                    </svg>
                    Submit Application
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
