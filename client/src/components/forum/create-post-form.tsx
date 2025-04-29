import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define schema for form validation
const postSchema = z.object({
  title: z.string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  content: z.string()
    .min(10, { message: "Content must be at least 10 characters" })
    .max(5000, { message: "Content must not exceed 5000 characters" }),
});

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ onSuccess, onCancel }: CreatePostFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to create a post",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await apiRequest("POST", "/api/forum-posts", {
        ...data,
        authorId: user.id
      });
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
      
      // Invalidate query to update forum posts
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      
      // Reset form
      form.reset();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Post creation error:", error);
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to Post</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            You need to be signed in to create a post in the community forum.
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Discussion</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a descriptive title for your discussion"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear title will help others understand your topic
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts, questions, or insights with the community..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details to encourage meaningful responses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                "Post Discussion"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
