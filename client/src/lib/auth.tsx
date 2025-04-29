import { createContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  username: string;
  userType: "professional" | "company" | "admin";
  isAdmin: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  // Add snake_case alternatives to support database column names
  user_type?: "professional" | "company" | "admin";
  is_admin?: boolean;
  first_name?: string;
  last_name?: string;
  // Add any other properties that might come from the API
  [key: string]: any;
}

interface LoginCredentials {
  username: string; // This can be either username or email
  password: string;
  rememberMe?: boolean; // Optional flag to keep the user logged in
}

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {
    throw new Error("login function not implemented");
  },
  logout: async () => {
    throw new Error("logout function not implemented");
  },
  isLoading: false,
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If unauthorized (401) or any other status, just set user to null
          // This is expected for users who aren't logged in
          setUser(null);
        }
      } catch (err) {
        // Properly log but don't let the promise reject
        console.error("Auth status check error:", err);
        // Set user to null on error
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Prevent unhandled rejections by catching errors at this level
    checkAuthStatus().catch(error => {
      console.error("Caught auth check error:", error);
      setIsLoading(false);
      setUser(null);
    });
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/login", credentials);
      const userData = await response.json();
      
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiRequest("POST", "/api/logout", {});
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
