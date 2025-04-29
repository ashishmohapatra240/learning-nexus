import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfessionalProfile } from "@shared/schema";

// Schema for consultation booking form
const consultationSchema = z.object({
  date: z.date({
    required_error: "Please select a date for the consultation",
  }),
  time: z.string({
    required_error: "Please select a time for the consultation",
  }),
  duration: z.string({
    required_error: "Please select the consultation duration",
  }),
  message: z.string().min(1, "Please provide a brief message about your requirements"),
});

export default function BookConsultation() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const professionalId = parseInt(params.id);

  // Fetch professional profile
  const { data: profile, isLoading } = useQuery<ProfessionalProfile>({
    queryKey: [`/api/professional-profiles/${professionalId}`],
    enabled: !isNaN(professionalId),
  });

  // Initialize form
  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      message: "",
    },
  });

  // Array of available time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  // Available durations
  const durations = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1 hour 30 minutes" },
    { value: "120", label: "2 hours" },
  ];

  // Calculate cost based on duration and hourly rate
  const calculateCost = () => {
    const duration = form.watch("duration");
    if (!duration || !profile?.ratePerHour) return null;
    
    const durationInHours = parseInt(duration) / 60;
    return (durationInHours * profile.ratePerHour).toFixed(2);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof consultationSchema>) => {
    if (!user || !profile) return;
    
    try {
      setIsSubmitting(true);
      
      // Format the date and time for API submission
      const formattedDate = format(data.date, "yyyy-MM-dd");
      
      // Create the consultation request
      const consultationData = {
        professionalId: profile.id,
        companyId: user.userType === "company" ? profile.userId : null,
        date: formattedDate,
        time: data.time,
        duration: parseInt(data.duration),
        notes: data.message,
        status: "requested",
      };
      
      // Submit the consultation request
      const response = await apiRequest("POST", "/api/consultations", consultationData);
      const result = await response.json();
      
      toast({
        title: "Consultation Requested",
        description: "Your consultation request has been sent. You'll be notified when it's confirmed.",
      });
      
      // Redirect to messages page or dashboard
      if (user.userType === "company") {
        setLocation("/company-dashboard");
      } else {
        setLocation("/professional-dashboard");
      }
    } catch (error) {
      console.error("Consultation booking error:", error);
      toast({
        title: "Failed to book consultation",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Professional Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">The professional you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation("/professionals")}>Browse All Professionals</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Book a Consultation</CardTitle>
            <CardDescription>
              Schedule a consultation with {profile.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                {profile.profileImageUrl ? (
                  <img 
                    src={profile.profileImageUrl} 
                    alt={profile.title} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Calendar className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{profile.title}</h3>
                <p className="text-muted-foreground text-sm">{profile.location}</p>
              </div>
            </div>

            {profile.ratePerHour ? (
              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="font-medium">Consulting Rate: ${profile.ratePerHour}/hour</p>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="font-medium">Please contact the professional for rate information</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Consultation Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Choose a date for your consultation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Slot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select your preferred time slot
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How long do you need for the consultation?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {calculateCost() && (
                  <div className="p-3 bg-primary/5 rounded-md">
                    <p className="font-medium">Estimated Cost: ${calculateCost()}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe what you'd like to discuss in this consultation"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide some context about your needs to help the professional prepare
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">Processing</span>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </>
                    ) : (
                      "Request Consultation"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}