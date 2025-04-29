import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean;
  userTypes?: Array<"professional" | "company" | "admin">;
}

// Wrapper component that handles the authentication check
function AuthenticationCheck({ 
  component: Component, 
  adminOnly = false,
  userTypes = [] 
}: Omit<ProtectedRouteProps, 'path'>) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Get current path for redirect after login
        const currentPath = window.location.pathname;
        setLocation(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else if (adminOnly && !user.isAdmin) {
        setLocation("/");
      } else if (userTypes.length > 0 && !userTypes.includes(user.userType)) {
        setLocation("/");
      }
    }
  }, [user, isLoading, adminOnly, userTypes, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (adminOnly && !user.isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (userTypes.length > 0 && !userTypes.includes(user.userType)) {
    return null; // Will redirect in useEffect
  }

  return <Component />;
}

export function ProtectedRoute({ path, component, adminOnly, userTypes }: ProtectedRouteProps) {
  return (
    <Route path={path}>
      {() => (
        <AuthenticationCheck 
          component={component} 
          adminOnly={adminOnly} 
          userTypes={userTypes} 
        />
      )}
    </Route>
  );
}