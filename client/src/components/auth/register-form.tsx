
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Linkedin } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3).max(50).transform(val => val.trim()),
  email: z.string().email().transform(val => val.trim()),
  password: z.string().min(8),
  confirmPassword: z.string(),
  firstName: z.string().min(2).transform(val => val.trim()),
  lastName: z.string().min(2).transform(val => val.trim()),
  userType: z.enum(["professional", "company"]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  emailUpdates: z.boolean().default(false)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormProps = {
  initialUserType?: string;
};

export default function RegisterForm({ initialUserType }: RegisterFormProps) {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      userType: (initialUserType === "professional" || initialUserType === "company") 
        ? initialUserType 
        : "professional",
      acceptTerms: false,
      emailUpdates: false
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await login({ username: values.username, password: values.password });
      toast({
        title: "Registration successful!",
        description: "Welcome to L&D Nexus",
      });
      
      setLocation(values.userType === "professional" ? "/professional-dashboard" : "/company-dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="professional" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      L&D Professional
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="company" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Company
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  I accept the <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a>
                </FormLabel>
                <FormDescription className="text-xs">
                  By accepting, you agree to our privacy policy and terms of service
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="emailUpdates"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  I want to receive updates and newsletters
                </FormLabel>
                <FormDescription className="text-xs">
                  We'll send you occasional updates about new features and industry trends
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.location.href = '/api/auth/google'} 
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12.545 12.151L12.542 12.156 12.545 12.151zM10.879 7.655l-1.388-.6407-2.236-3.421-1.766 7.48.058.0464c.1154 1.4097 1.6492 4.57 5.162 4.57 3.513 0 5.162-2.911 5.302-4.006L10.877 7.655h.002z" fill="#FF4131" />
              <path d="M13.548 8.746l1.6-.6714.869-1.2806h-6.232l3.763 1.952z" fill="#FDBA12" />
              <path d="M15.211 10.437c-.167-.9087-1.064-1.6913-2.047-1.6913h-4.05c.0774 2.9486 2.428 3.4893 3.282 3.4893 0 0 1.6927-.211 2.8154-1.798z" fill="#517CBD" />
            </svg>
            Google
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.location.href = '/api/auth/linkedin'} 
            className="w-full"
          >
            <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
            LinkedIn
          </Button>
        </div>
      </form>
    </Form>
  );
}
