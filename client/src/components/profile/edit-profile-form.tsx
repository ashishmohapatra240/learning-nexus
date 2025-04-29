import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, getCsrfToken, secureFileUpload } from "@/lib/queryClient";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash, Upload, X } from "lucide-react";
import { 
  insertProfessionalProfileSchema, 
  insertCompanyProfileSchema,
  type ProfessionalProfile,
  type CompanyProfile,
  type Expertise,
  insertCertificationSchema
} from "@shared/schema";

// Type for work experience entries with all fields optional
const workExperienceSchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(), 
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  current: z.boolean().optional().default(false)
}).partial(); // Make all fields optional

// Type for testimonial entries with all fields optional
const testimonialSchema = z.object({
  clientName: z.string().optional(),
  company: z.string().optional(),
  text: z.string().optional(),
  date: z.string().optional()
}).partial(); // Make all fields optional

// Extended professional profile schema with ALL fields optional for validation
const professionalProfileFormSchema = insertProfessionalProfileSchema.extend({
  profileImage: z.instanceof(File).optional(),
  newExpertise: z.string().optional(),
  newCertification: z.object({
    name: z.string().optional(),
    issuer: z.string().optional(),
    year: z.coerce.number().optional()
  }).optional(),
  newWorkExperience: workExperienceSchema.optional(),
  newTestimonial: testimonialSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // Make sure ALL fields are optional
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  videoIntroUrl: z.string().optional(),
  profileImageUrl: z.string().optional(),
  ratePerHour: z.coerce.number().optional(),
  services: z.string().optional(),
  availability: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  yearsExperience: z.coerce.number().optional(),
  workExperience: z.string().optional(),
  testimonials: z.string().optional(),
  // Ensure userId is always there but can be passed in
  userId: z.number().optional()
}).partial(); // This makes all fields optional, even those not explicitly defined above

// Extended company profile schema with ALL fields optional for validation
const companyProfileFormSchema = insertCompanyProfileSchema.extend({
  profileImage: z.instanceof(File).optional(),
  // Make sure ALL fields are optional
  companyName: z.string().optional(),
  industry: z.string().optional(), 
  description: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  logoImagePath: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  userId: z.number().optional()
}).partial(); // This makes all fields optional, even those not explicitly defined above

export default function EditProfileForm() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all available expertise areas
  const { data: expertiseAreas } = useQuery<Expertise[]>({
    queryKey: ["/api/expertise"],
    enabled: user?.userType === "professional",
  });

  // Fetch user's professional profile if it exists
  const { data: professionalProfile } = useQuery<ProfessionalProfile>({
    queryKey: ["/api/professionals/me"],
    enabled: user?.userType === "professional",
  });

  // Fetch user's company profile if it exists
  const { data: companyProfile } = useQuery<CompanyProfile>({
    queryKey: ["/api/company-profiles/by-user"],
    enabled: user?.userType === "company",
  });

  // Fetch user's expertise if professional profile exists
  const { data: userExpertise } = useQuery<Expertise[]>({
    queryKey: [`/api/professionals/me/expertise`],
    enabled: !!professionalProfile && user?.userType === "professional",
  });

  // Fetch user's certifications if professional profile exists
  const { data: certifications } = useQuery<any[]>({
    queryKey: [`/api/professionals/me/certifications`],
    enabled: !!professionalProfile && user?.userType === "professional",
  });

  // State for work experiences and testimonials
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showWorkExpForm, setShowWorkExpForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  // Set up form for professional profile
  const professionalForm = useForm<z.infer<typeof professionalProfileFormSchema>>({
    resolver: zodResolver(professionalProfileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",  
      title: "",
      bio: "",
      location: "",
      videoIntroUrl: "",
      ratePerHour: undefined,
      profileImageUrl: "",
      userId: user?.id,
      newExpertise: "",
      services: "",
      availability: "",
      email: "",
      phone: "",
      yearsExperience: undefined,
      newCertification: {
        name: "",
        issuer: "",
        year: undefined
      },
      newWorkExperience: {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false
      },
      newTestimonial: {
        clientName: "",
        company: "",
        text: "",
        date: ""
      }
    },
  });

  // Set up form for company profile
  const companyForm = useForm<z.infer<typeof companyProfileFormSchema>>({
    resolver: zodResolver(companyProfileFormSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      description: "",
      website: "",
      logoUrl: "",
      size: "",
      location: "",
      userId: user?.id,
    },
  });

  // Update form values when profiles are loaded
  useEffect(() => {
    if (professionalProfile && user?.userType === "professional") {
      // Load work experience and testimonials if present
      if (professionalProfile.workExperience) {
        try {
          const workExpData = typeof professionalProfile.workExperience === 'string' 
            ? JSON.parse(professionalProfile.workExperience)
            : professionalProfile.workExperience;
          setWorkExperiences(Array.isArray(workExpData) ? workExpData : []);
        } catch (e) {
          console.error("Error parsing work experience data:", e);
          setWorkExperiences([]);
        }
      }
      
      if (professionalProfile.testimonials) {
        try {
          const testimonialData = typeof professionalProfile.testimonials === 'string'
            ? JSON.parse(professionalProfile.testimonials)
            : professionalProfile.testimonials;
          setTestimonials(Array.isArray(testimonialData) ? testimonialData : []);
        } catch (e) {
          console.error("Error parsing testimonial data:", e);
          setTestimonials([]);
        }
      }
      
      professionalForm.reset({
        firstName: professionalProfile.firstName || "",
        lastName: professionalProfile.lastName || "",
        title: professionalProfile.title || "",
        bio: professionalProfile.bio || "",
        location: professionalProfile.location || "",
        videoIntroUrl: professionalProfile.videoIntroUrl || "",
        ratePerHour: professionalProfile.ratePerHour || undefined,
        profileImageUrl: professionalProfile.profileImageUrl || "",
        userId: user.id,
        newExpertise: "",
        services: professionalProfile.services || "",
        availability: typeof professionalProfile.availability === 'string' ? professionalProfile.availability : '',
        email: professionalProfile.email || "",
        phone: professionalProfile.phone || "",
        yearsExperience: professionalProfile.yearsExperience || undefined,
        newCertification: {
          name: "",
          issuer: "",
          year: undefined
        },
        newWorkExperience: {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false
        },
        newTestimonial: {
          clientName: "",
          company: "",
          text: "",
          date: ""
        }
      });
    }

    if (companyProfile && user?.userType === "company") {
      companyForm.reset({
        companyName: companyProfile.companyName,
        industry: companyProfile.industry,
        description: companyProfile.description,
        website: companyProfile.website || "",
        logoUrl: companyProfile.logoUrl || "",
        size: companyProfile.size,
        location: companyProfile.location,
        userId: user.id,
      });
    }
  }, [professionalProfile, companyProfile, user]);

  // Update selected expertise when user expertise is loaded
  useEffect(() => {
    if (userExpertise) {
      setSelectedExpertise(userExpertise);
    }
  }, [userExpertise]);

  const handleAddExpertise = async () => {
    const expertiseValue = professionalForm.getValues("newExpertise");
    if (!expertiseValue || expertiseValue.trim() === "") return;

    // Find if this expertise already exists
    const existing = expertiseAreas?.find(
      e => e.name.toLowerCase() === expertiseValue.toLowerCase()
    );

    if (existing) {
      // Check if already selected
      if (selectedExpertise.some(e => e.id === existing.id)) {
        toast({
          title: "Already added",
          description: "This expertise is already in your profile",
          variant: "destructive"
        });
        return;
      }

      // Add to selected
      setSelectedExpertise([...selectedExpertise, existing]);
    } else {
      // Create new expertise
      try {
        const response = await apiRequest("POST", "/api/expertise", { name: expertiseValue });
        const newExpertise = await response.json();
        setSelectedExpertise([...selectedExpertise, newExpertise]);
        
        // Refresh expertise list
        queryClient.invalidateQueries({ queryKey: ["/api/expertise"] });
      } catch (error) {
        toast({
          title: "Failed to add expertise",
          description: "Please try again later",
          variant: "destructive"
        });
      }
    }

    // Clear the input
    professionalForm.setValue("newExpertise", "");
  };

  const handleRemoveExpertise = (expertiseId: number) => {
    setSelectedExpertise(selectedExpertise.filter(e => e.id !== expertiseId));
  };

  const handleAddCertification = async () => {
    if (!professionalProfile) {
      toast({
        title: "Profile not found",
        description: "Please save your basic profile information first",
        variant: "destructive"
      });
      return;
    }
    
    const certData = professionalForm.getValues("newCertification");
    
    // Make certification fields optional - only require name at minimum
    if (!certData || !certData.name) {
      toast({
        title: "Name required",
        description: "Please enter at least the certification name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Adding certification:", certData);
      const response = await apiRequest('POST', `/api/professionals/me/certifications`, {
        name: certData.name,
        issuer: certData.issuer,
        year: certData.year,
        professionalId: professionalProfile.id
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Reset form fields
      professionalForm.setValue("newCertification.name", "");
      professionalForm.setValue("newCertification.issuer", "");
      professionalForm.setValue("newCertification.year", undefined);
      
      // Hide the certification form
      setShowCertForm(false);
      
      // Refresh certifications list
      queryClient.invalidateQueries({ 
        queryKey: [`/api/professionals/me/certifications`] 
      });
      
      toast({
        title: "Certification added",
        description: "Your certification has been added successfully"
      });
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Failed to add certification",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCertification = async (certId: number) => {
    try {
      await apiRequest("DELETE", `/api/certifications/${certId}`, {});
      
      // Refresh certifications list
      queryClient.invalidateQueries({ 
        queryKey: [`/api/professionals/me/certifications`] 
      });
      
      toast({
        title: "Certification deleted",
        description: "Your certification has been removed"
      });
    } catch (error) {
      toast({
        title: "Failed to delete certification",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const handleAddWorkExperience = () => {
    const workExp = professionalForm.getValues("newWorkExperience");
    // Make work experience more flexible - require at least company name
    if (!workExp || !workExp.company) {
      toast({
        title: "Company name required",
        description: "Please enter at least the company name",
        variant: "destructive"
      });
      return;
    }
    
    // Add to work experiences array
    setWorkExperiences([...workExperiences, workExp]);
    
    // Reset form
    professionalForm.setValue("newWorkExperience.company", "");
    professionalForm.setValue("newWorkExperience.position", "");
    professionalForm.setValue("newWorkExperience.startDate", "");
    professionalForm.setValue("newWorkExperience.endDate", "");
    professionalForm.setValue("newWorkExperience.description", "");
    professionalForm.setValue("newWorkExperience.current", false);
    
    // Hide form
    setShowWorkExpForm(false);
    
    toast({
      title: "Work experience added",
      description: "Your work experience has been added to your profile"
    });
  };
  
  const handleRemoveWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };
  
  const handleAddTestimonial = () => {
    const testimonial = professionalForm.getValues("newTestimonial");
    // Make testimonials more flexible - only require client name at minimum
    if (!testimonial || !testimonial.clientName) {
      toast({
        title: "Client name required",
        description: "Please enter at least the client name",
        variant: "destructive"
      });
      return;
    }
    
    // Add to testimonials array
    setTestimonials([...testimonials, testimonial]);
    
    // Reset form
    professionalForm.setValue("newTestimonial.clientName", "");
    professionalForm.setValue("newTestimonial.company", "");
    professionalForm.setValue("newTestimonial.text", "");
    professionalForm.setValue("newTestimonial.date", "");
    
    // Hide form
    setShowTestimonialForm(false);
    
    toast({
      title: "Testimonial added",
      description: "The client testimonial has been added to your profile"
    });
  };
  
  const handleRemoveTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  // BUG KILLER: Helper function to sanitize numeric fields
  const sanitizeNumericValue = (value: any) => {
    // If it's already undefined/null, return empty string
    if (value === undefined || value === null) return "";
    
    // If it's a number or valid string number, return as is
    const numVal = Number(value);
    if (!isNaN(numVal)) return numVal.toString();
    
    // Otherwise return empty string (sanitizing invalid values)
    return "";
  };

  const onSubmitProfessional = async (data: z.infer<typeof professionalProfileFormSchema>) => {
    console.log("Form submission started - professional profile", data);
    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      if (!user || !user.id) {
        console.error("Authentication error: User is not logged in");
        throw new Error("You must be logged in to save your profile. Please log in and try again.");
      }
      
      // Remove additional form fields
      const { newExpertise, newCertification, newWorkExperience, newTestimonial, profileImage, ...profileData } = data;
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Prepare work experience and testimonials as JSON
      const workExperienceJSON = JSON.stringify(workExperiences);
      const testimonialsJSON = JSON.stringify(testimonials);
      
      // Sanitize numeric values before submission - BUG KILLER
      console.log("BUG KILLER: Sanitizing numeric values for profile submission");
      console.log("Before sanitization - ratePerHour:", profileData.ratePerHour, "yearsExperience:", profileData.yearsExperience);
      
      // Add to profile data with explicit type conversions and sanitization
      const enrichedProfileData = {
        ...profileData,
        workExperience: workExperienceJSON,
        testimonials: testimonialsJSON,
        userId: user.id, // Explicitly set userId to ensure it's included
        // Sanitize and convert all values properly
        ratePerHour: sanitizeNumericValue(profileData.ratePerHour),
        yearsExperience: sanitizeNumericValue(profileData.yearsExperience),
        title: profileData.title || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        availability: profileData.availability || "" // Treat as string
      };
      
      console.log("Prepared professional profile data with explicit conversions:", enrichedProfileData);
      
      // Add text fields to FormData with proper type handling
      Object.entries(enrichedProfileData).forEach(([key, value]) => {
        // Handle different types of values appropriately
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? "true" : "false");
          } else if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
          console.log(`Added form field: ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
      });
      
      // Add file if provided
      if (profileImage instanceof File) {
        formData.append('profileImage', profileImage);
        console.log(`Added file: profileImage (${profileImage.name}, ${profileImage.size} bytes)`);
      }
      
      // Verify the FormData before submission
      console.log("About to save professional profile with form data:", {
        entries: Array.from(formData.entries()).map(([key, value]) => 
          [key, typeof value === 'string' ? value : `(${typeof value})`]
        ),
        userInfo: {
          id: user.id,
          userType: user.userType,
          loggedIn: !!user
        }
      });
      
      // Use secureFileUpload which handles CSRF tokens and file uploads
      const response = await secureFileUpload('PUT', "/api/professionals/me", formData);
      
      console.log("DEBUG: Response from profile save:", response.status, response.statusText, {
        url: "/api/professionals/me",
        userId: user.id,
        method: 'PUT',
        cookies: document.cookie,
        headers: Array.from(response.headers.entries())
      });
      
      // Read the response body for debugging
      const responseText = await response.text();
      let savedProfile;
      
      try {
        // Try to parse the response as JSON
        savedProfile = JSON.parse(responseText);
        console.log("Saved profile data:", savedProfile);
      } catch (e) {
        console.warn("Could not parse response as JSON:", responseText);
        // If not JSON, check if the response was ok
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText} - ${responseText}`);
        }
      }
      
      // Add all selected expertise to the profile (only if we have a profile ID)
      if (savedProfile && savedProfile.id) {
        console.log("Adding selected expertise to profile...");
        for (const expertise of selectedExpertise) {
          try {
            // Check if this expertise is already linked to the profile
            if (!userExpertise || !userExpertise.some(e => e.id === expertise.id)) {
              console.log(`Adding expertise ${expertise.name} (ID: ${expertise.id}) to profile`);
              const expertiseResponse = await apiRequest(
                "POST", 
                `/api/professionals/me/expertise`, 
                { expertiseId: expertise.id }
              );
              
              if (!expertiseResponse.ok) {
                console.warn(`Failed to add expertise ${expertise.id}: ${expertiseResponse.status} ${expertiseResponse.statusText}`);
              }
            }
          } catch (error) {
            console.error(`Failed to link expertise ${expertise.id}:`, error);
          }
        }
      } else {
        console.warn("Skipping expertise addition: No valid profile ID found in response");
      }
      
      toast({
        title: "Profile saved",
        description: "Your professional profile has been updated successfully",
      });
      
      // Set success state to show message
      setSaveSuccess(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/professionals/me"]
      });
      
      console.log("Profile save completed successfully");
      
      // Navigate to success page after a short delay
      setTimeout(() => {
        setLocation("/profile-success");
      }, 1500);
      
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Failed to save profile",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCompany = async (data: z.infer<typeof companyProfileFormSchema>) => {
    console.log("Form submission started - company profile", data);
    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated with more detailed logging
      if (!user || !user.id) {
        console.error("Authentication error: User is not logged in");
        throw new Error("You must be logged in to save your profile. Please log in and try again.");
      }
      
      // Extract file from form data
      const { profileImage, ...profileData } = data;
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Sanitize values before submission - BUG KILLER
      console.log("BUG KILLER: Sanitizing values for company profile submission");
      console.log("Before sanitization - company data:", profileData);
      
      // Add text fields to FormData with explicit userId and type conversions
      const enrichedProfileData = {
        ...profileData,
        userId: user.id, // Explicitly set userId to ensure it's included
        // Apply sanitization to all values
        companyName: profileData.companyName || "",
        industry: profileData.industry || "",
        description: profileData.description || "",
        website: profileData.website || "",
        size: profileData.size || "",
        location: profileData.location || ""
      };
      
      console.log("Prepared company profile data with explicit conversions:", enrichedProfileData);
      
      // Add fields to FormData with proper type handling
      Object.entries(enrichedProfileData).forEach(([key, value]) => {
        // Handle different types of values appropriately
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? "true" : "false");
          } else if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
          console.log(`Added form field: ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
      });
      
      // Add file if provided
      if (profileImage instanceof File) {
        formData.append('profileImage', profileImage);
        console.log(`Added file: profileImage (${profileImage.name}, ${profileImage.size} bytes)`);
      }
      
      // Verify the FormData before submission
      console.log("About to save company profile with form data:", {
        entries: Array.from(formData.entries()).map(([key, value]) => 
          [key, typeof value === 'string' ? value : `(${typeof value})`]
        ),
        userInfo: {
          id: user.id,
          userType: user.userType,
          loggedIn: !!user
        }
      });
      
      let response;
      
      if (companyProfile) {
        // Update existing profile with FormData using secureFileUpload
        console.log(`Updating existing company profile ID: ${companyProfile.id}`);
        response = await secureFileUpload(
          'PUT',
          `/api/company-profiles/${companyProfile.id}`, 
          formData
        );
      } else {
        // Create new profile with FormData using secureFileUpload
        console.log("Creating new company profile");
        response = await secureFileUpload(
          'POST',
          "/api/company-profiles", 
          formData
        );
      }
      
      console.log("DEBUG: Response from company profile save:", response.status, response.statusText, {
        url: companyProfile ? `/api/company-profiles/${companyProfile.id}` : "/api/company-profiles",
        userId: user.id,
        method: companyProfile ? 'PUT' : 'POST',
        cookies: document.cookie,
        headers: Array.from(response.headers.entries())
      });
      
      // Read the response body for debugging
      const responseText = await response.text();
      let savedProfile;
      
      try {
        // Try to parse the response as JSON
        savedProfile = JSON.parse(responseText);
        console.log("Saved company profile data:", savedProfile);
      } catch (e) {
        console.warn("Could not parse response as JSON:", responseText);
        // If not JSON, check if the response was ok
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText} - ${responseText}`);
        }
      }
      
      toast({
        title: "Profile saved",
        description: "Your company profile has been updated successfully",
      });
      
      // Set success state to show message
      setSaveSuccess(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/company-profiles/by-user"]
      });
      
      console.log("Company profile save completed successfully");
      
      // Navigate to success page after a short delay
      setTimeout(() => {
        setLocation("/profile-success");
      }, 1500);
      
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Failed to save profile",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to be signed in to edit your profile.</p>
            <Button onClick={() => setLocation("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.userType === "professional") {
    return (
      <Form {...professionalForm}>
        <form onSubmit={professionalForm.handleSubmit(onSubmitProfessional)} className="space-y-8">
          <div className="space-y-6">
            <div className="border p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  control={professionalForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={professionalForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Smith" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={professionalForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Leadership Development Specialist" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Your professional title will be displayed on your profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={professionalForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Your primary location for work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={professionalForm.control}
                name="ratePerHour"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 150" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          // BUG KILLER: Safe parseInt with NaN protection
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange(undefined);
                          } else {
                            const parsedValue = parseInt(value);
                            field.onChange(isNaN(parsedValue) ? "" : parsedValue);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Your hourly rate for consultations and services
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={professionalForm.control}
                name="profileImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                // Use hidden file input
                                const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement;
                                fileInput?.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                            
                            {(value && typeof value === 'object') && (
                              <Badge variant="outline" className="bg-blue-50">
                                Selected: {(value as File).name}
                              </Badge>
                            )}
                          </div>
                          
                          <Input 
                            id="profile-image-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            {...fieldProps}
                            onChange={(e) => {
                              // Handle file selection for the form
                              const file = e.target.files?.[0];
                              onChange(file || null);
                            }} 
                          />
                        </div>
                        
                        {professionalProfile?.profileImagePath && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-2">Current image:</p>
                            <div className="relative group">
                              <img 
                                src={`/${professionalProfile.profileImagePath}`} 
                                alt="Current profile" 
                                className="w-32 h-32 object-cover rounded-md border"
                                onError={(e) => {
                                  console.log("Image load error, using placeholder");
                                  // Set default avatar on error
                                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent((professionalProfile.firstName || '') + ' ' + (professionalProfile.lastName || ''));
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (confirm("Are you sure you want to delete your profile image?")) {
                                    try {
                                      const res = await apiRequest(
                                        "DELETE", 
                                        `/api/professional-profiles/${professionalProfile.id}/profile-image`
                                      );
                                      
                                      if (res.ok) {
                                        // Refresh profile data
                                        queryClient.invalidateQueries({ queryKey: ["/api/professionals/me"] });
                                        toast({
                                          title: "Profile image deleted",
                                          description: "Your profile image has been removed",
                                        });
                                      } else {
                                        const error = await res.json();
                                        throw new Error(error.message || "Failed to delete image");
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: error instanceof Error ? error.message : "Failed to delete profile image",
                                        variant: "destructive"
                                      });
                                    }
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a professional headshot (JPG, PNG, GIF, WEBP up to 25MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Professional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  control={professionalForm.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            // BUG KILLER: Safe parseInt with NaN protection
                            const value = e.target.value;
                            if (value === "") {
                              field.onChange(undefined);
                            } else {
                              const parsedValue = parseInt(value);
                              field.onChange(isNaN(parsedValue) ? "" : parsedValue);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Your total professional experience in years
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={professionalForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your experience, skills, and what you offer to clients..." 
                        className="min-h-32"
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of your experience and expertise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={professionalForm.control}
                name="services"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Services Offered</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the services you provide, e.g.: 'Leadership Training, Team Building Workshops, Executive Coaching...'" 
                        className="min-h-24"
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Detail the specific L&D services you provide to clients
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-6">
                <FormLabel>Areas of Expertise</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {selectedExpertise.map((expertise) => (
                    <Badge key={expertise.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {expertise.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveExpertise(expertise.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {selectedExpertise.length === 0 && (
                    <div className="text-sm text-muted-foreground">No expertise areas selected yet</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <FormField
                    control={professionalForm.control}
                    name="newExpertise"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select or type a new expertise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expertiseAreas?.map((expertise) => (
                              <SelectItem key={expertise.id} value={expertise.name}>
                                {expertise.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={handleAddExpertise}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <FormLabel>Certifications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCertForm(!showCertForm)}
                  >
                    {showCertForm ? "Cancel" : "Add Certification"}
                  </Button>
                </div>
                
                {certifications && certifications.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCertification(cert.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-4">No certifications added yet</div>
                )}
                
                {showCertForm && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <FormField
                      control={professionalForm.control}
                      name="newCertification.name"
                      render={({ field }) => (
                        <FormItem className="mb-3">
                          <FormLabel>Certification Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Project Management Professional (PMP)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={professionalForm.control}
                      name="newCertification.issuer"
                      render={({ field }) => (
                        <FormItem className="mb-3">
                          <FormLabel>Issuing Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Project Management Institute" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={professionalForm.control}
                      name="newCertification.year"
                      render={({ field }) => (
                        <FormItem className="mb-3">
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 2022" 
                              {...field}
                              onChange={(e) => {
                                // BUG KILLER: Safe parseInt with NaN protection
                                const value = e.target.value;
                                if (value === "") {
                                  field.onChange(undefined);
                                } else {
                                  const parsedValue = parseInt(value);
                                  field.onChange(isNaN(parsedValue) ? "" : parsedValue);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="button" 
                      onClick={handleAddCertification} 
                      className="mt-3 w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Certification
                    </Button>
                  </div>
                )}
              </div>
              
              <FormField
                control={professionalForm.control}
                name="videoIntroUrl"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Video Introduction URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/your-video.mp4" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Link to a short video introducing yourself and your services
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Work Experience Section */}
            <div className="border p-6 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Work Experience</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkExpForm(!showWorkExpForm)}
                >
                  {showWorkExpForm ? "Cancel" : "Add Work Experience"}
                </Button>
              </div>
              
              {workExperiences && workExperiences.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {workExperiences.map((exp, index) => (
                    <div key={index} className="p-4 border rounded-md bg-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{exp.position}</h3>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exp.startDate} {exp.current ? "- Present" : exp.endDate ? `- ${exp.endDate}` : ""}
                          </p>
                          {exp.description && (
                            <p className="mt-2 text-sm">{exp.description}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWorkExperience(index)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-4">No work experience added yet</div>
              )}
              
              {showWorkExpForm && (
                <div className="p-4 border rounded-md bg-muted/50 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={professionalForm.control}
                      name="newWorkExperience.company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={professionalForm.control}
                      name="newWorkExperience.position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Learning Development Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={professionalForm.control}
                      name="newWorkExperience.startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. July 2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={professionalForm.control}
                      name="newWorkExperience.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. June 2023 (leave empty if current)" 
                              {...field}
                              value={field.value || ''} 
                              disabled={professionalForm.watch("newWorkExperience.current")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={professionalForm.control}
                    name="newWorkExperience.current"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This is my current position</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={professionalForm.control}
                    name="newWorkExperience.description"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your responsibilities and achievements..." 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="button" 
                    onClick={handleAddWorkExperience} 
                    className="mt-4 w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Work Experience
                  </Button>
                </div>
              )}
            </div>
            
            {/* Testimonials Section */}
            <div className="border p-6 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Client Testimonials</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTestimonialForm(!showTestimonialForm)}
                >
                  {showTestimonialForm ? "Cancel" : "Add Testimonial"}
                </Button>
              </div>
              
              {testimonials && testimonials.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 border rounded-md bg-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="italic text-sm">"{testimonial.text}"</p>
                          <p className="font-semibold mt-2">{testimonial.clientName}</p>
                          {testimonial.company && (
                            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                          )}
                          {testimonial.date && (
                            <p className="text-xs text-muted-foreground mt-1">{testimonial.date}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTestimonial(index)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-4">No testimonials added yet</div>
              )}
              
              {showTestimonialForm && (
                <div className="p-4 border rounded-md bg-muted/50 mb-4">
                  <FormField
                    control={professionalForm.control}
                    name="newTestimonial.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Testimonial</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the client's feedback..." 
                            {...field} 
                            className="min-h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={professionalForm.control}
                      name="newTestimonial.clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={professionalForm.control}
                      name="newTestimonial.company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Acme Corporation" 
                              {...field}
                              value={field.value || ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={professionalForm.control}
                    name="newTestimonial.date"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. January 2023" 
                            {...field}
                            value={field.value || ''}  
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="button" 
                    onClick={handleAddTestimonial} 
                    className="mt-4 w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                  </Button>
                </div>
              )}
            </div>
            
            {/* Contact Information Section */}
            <div className="border p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={professionalForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. contact@example.com" 
                          type="email"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        Email where clients can reach you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={professionalForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. +1 (555) 123-4567" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        Phone number for client inquiries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={professionalForm.control}
                name="availability"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your availability, e.g. 'Available for consultations Monday-Friday, 9am-5pm EST'" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Let clients know when and how they can reach you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4 items-end">
            {/* Debug info for professional profile form */}
            <div className="text-xs text-red-500 mb-2">
              <div>isSubmitting: {isSubmitting ? "true" : "false"}</div>
              {Object.keys(professionalForm.formState.errors).length > 0 && (
                <div>
                  Form has errors: {JSON.stringify(professionalForm.formState.errors)}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md cursor-pointer z-10 relative !important"
              disabled={isSubmitting}
              onClick={(e) => {
                // Just log the click, don't prevent default or stop propagation
                console.log("Professional Save button clicked");
                console.log("Form data:", professionalForm.getValues());
                // Let the native form submission happen naturally
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
            
            {saveSuccess && (
              <div className="w-full flex items-center p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Profile saved successfully! Your changes have been applied.</span>
              </div>
            )}
          </div>
        </form>
      </Form>
    );
  }

  if (user.userType === "company") {
    return (
      <Form {...companyForm}>
        <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-8">
          <div className="space-y-6">
            <div className="border p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Company Information</h2>
              
              <FormField
                control={companyForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={companyForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Professional Services">Professional Services</SelectItem>
                          <SelectItem value="Hospitality">Hospitality</SelectItem>
                          <SelectItem value="Non-profit">Non-profit</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={companyForm.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="small">Small (1-50 employees)</SelectItem>
                          <SelectItem value="medium">Medium (51-500 employees)</SelectItem>
                          <SelectItem value="large">Large (501-5000 employees)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (5000+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={companyForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. San Francisco, CA" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your company's primary location
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={companyForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Your company's website URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={companyForm.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/logo.png" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your company logo (optional if uploading image below)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={companyForm.control}
                name="profileImage"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Upload Company Logo</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          {...fieldProps}
                          onChange={(e) => {
                            // Handle file selection for the form
                            const file = e.target.files?.[0];
                            onChange(file || null);
                          }} 
                        />
                        {/* Show selected file name or existing company logo */}
                        {(value && typeof value === 'object') && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {(value as File).name}
                          </p>
                        )}
                        {/* Check if logoImagePath exists in companyProfile */}
                        {companyProfile?.logoImagePath && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-2">Current logo:</p>
                            <img 
                              src={`/${companyProfile.logoImagePath}`} 
                              alt="Company logo" 
                              className="w-32 h-32 object-contain rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a company logo (JPG, PNG, GIF, WEBP up to 25MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Company Description</h2>
              
              <FormField
                control={companyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your company, its mission, and what types of L&D professionals you're looking for..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of your company that will help L&D professionals understand your needs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4 items-end">
            {/* Debug info for company profile form */}
            <div className="text-xs text-red-500 mb-2">
              <div>isSubmitting: {isSubmitting ? "true" : "false"}</div>
              {Object.keys(companyForm.formState.errors).length > 0 && (
                <div>
                  Form has errors: {JSON.stringify(companyForm.formState.errors)}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md cursor-pointer z-10 relative !important"
              disabled={isSubmitting}
              onClick={(e) => {
                // Just log the click, don't prevent default or stop propagation
                console.log("Company Save button clicked");
                console.log("Form data:", companyForm.getValues());
                // Let the native form submission happen naturally
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
            
            {saveSuccess && (
              <div className="w-full flex items-center p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Company profile saved successfully! Your changes have been applied.</span>
              </div>
            )}
          </div>
        </form>
      </Form>
    );
  }

  return null;
}
