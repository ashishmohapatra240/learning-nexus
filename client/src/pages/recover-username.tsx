import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const recoverUsernameSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type RecoverUsernameValues = z.infer<typeof recoverUsernameSchema>;

export default function RecoverUsernamePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [username, setUsername] = useState("");

  const form = useForm<RecoverUsernameValues>({
    resolver: zodResolver(recoverUsernameSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: RecoverUsernameValues) {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/auth/recover-username", values);
      if (response.ok) {
        const data = await response.json();
        if (data && data.username) {
          setUsername(data.username);
          setIsSuccess(true);
          toast({
            title: "Username found",
            description: "We found your username associated with this email.",
          });
        } else {
          toast({
            title: "No account found",
            description: "No account was found with this email address.",
            variant: "destructive",
          });
        }
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Recover Username</CardTitle>
            <CardDescription>
              Enter your email address below to recover your username.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium mb-2">Username Found!</h3>
                <p className="text-gray-600 mb-4">
                  Your username is: <span className="font-medium">{username}</span>
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Searching..." : "Recover Username"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}