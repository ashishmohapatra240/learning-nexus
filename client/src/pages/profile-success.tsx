import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileSuccess() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to home if accessed directly without saving a profile
    const timer = setTimeout(() => {
      // Redirect to appropriate dashboard based on user type
      if (user?.userType === "professional") {
        setLocation("/professional-dashboard");
      } else if (user?.userType === "company") {
        setLocation("/company-dashboard");
      } else {
        setLocation("/");
      }
    }, 10000); // Auto-redirect after 10 seconds - extended to give users more time to decide

    return () => clearTimeout(timer);
  }, [user, setLocation]);

  const navigateToDashboard = () => {
    if (user?.userType === "professional") {
      setLocation("/professional-dashboard");
    } else if (user?.userType === "company") {
      setLocation("/company-dashboard");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="container max-w-screen-lg mx-auto py-10 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Profile Updated Successfully!</CardTitle>
          <CardDescription>
            Your profile changes have been saved and are now visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Thank you for keeping your profile up to date. A complete profile increases your visibility and opportunities on our platform.
          </p>
          <p className="text-center mb-4">
            You can continue editing your profile by clicking "Edit Profile Again" below if you need to make additional changes.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            You will be automatically redirected to your dashboard in 10 seconds if no action is taken.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={() => setLocation("/edit-profile")} variant="outline">
            Edit Profile Again
          </Button>
          <Button onClick={navigateToDashboard} className="bg-blue-600 hover:bg-blue-700 text-white">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}