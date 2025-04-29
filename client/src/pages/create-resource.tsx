import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { insertResourceSchema, type ResourceCategory } from "@shared/schema";

// Extended schema with client-side validation
const resourceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  resourceType: z.enum(["article", "template", "video", "webinar"]),
  categoryId: z.coerce.number().positive("Please select a category"),
  contentUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  fileUpload: z.instanceof(File).optional(),
});

export default function CreateResource() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch resource categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery<ResourceCategory[]>({
    queryKey: ["/api/resource-categories"],
  });

  // Set up form
  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: "article",
      categoryId: undefined,
      contentUrl: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resourceFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create resources",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      // Extract file from form data if present
      const { fileUpload, ...resourceData } = data;

      // Create FormData if file is included
      if (fileUpload) {
        const formData = new FormData();

        // Add resource data
        Object.entries(resourceData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
          }
        });

        // Add file
        formData.append('file', fileUpload);

        // Submit using fetch with FormData
        const response = await fetch("/api/resources", {
          method: "POST",
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        // Handle success
        toast({
          title: "Resource created",
          description: "Your resource has been published successfully",
        });

        // Redirect to professional dashboard after resource creation
        setLocation("/professional-dashboard");
      } else {
        // If no file, use regular JSON API request
        await apiRequest("POST", "/api/resources", resourceData);

        // Handle success
        toast({
          title: "Resource created",
          description: "Your resource has been published successfully",
        });

        // Invalidate resources query to refresh list
        queryClient.invalidateQueries({
          queryKey: ["/api/resources"]
        });

        // Redirect to professional dashboard after resource creation
        setLocation("/professional-dashboard");
      }
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        title: "Failed to create resource",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to create resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 flex items-center"
        onClick={() => setLocation("/resources")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create a New Resource</h1>
        <p className="text-gray-500 mb-6">
          Share your knowledge with the L&D community
        </p>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Effective Leadership Development Strategies" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive title for your resource
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="resourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a resource type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="template">Template</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="webinar">Webinar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of content you're sharing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCategories ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : (
                              <>
                                <SelectItem value="0">None</SelectItem>
                                {categories?.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The topic area this resource belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of your resource..."
                          className="min-h-32 resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what this resource is about and how it helps L&D professionals
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/your-content"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to your article, video, or downloadable content (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to an image representing your resource (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileUpload"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                          {...fieldProps}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file || null);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload document files (PDF, Word, PowerPoint, Excel, ZIP) up to 25MB (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      "Publish Resource"
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