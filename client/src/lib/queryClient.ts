import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // List of special case endpoints where 404 responses are expected and not errors
    const expectedNotFoundEndpoints = [
      '/api/subscription-status', // No subscription is a valid state, not an error
      '/api/professionals/me', // Professional profile might not exist yet
      '/api/professionals/me/consultations', // No consultations yet
      '/api/professionals/me/applications', // No applications yet
      '/api/professionals/me/matches' // No matches yet
    ];
    
    // Don't throw for expected 404s
    if (res.status === 404 && expectedNotFoundEndpoints.some(endpoint => res.url.includes(endpoint))) {
      console.log(`Handling expected 404 for ${res.url}`);
      // Just return the response without throwing, caller will handle it appropriately
      return;
    }
    
    // Special handling for DELETE operations that return 204 No Content
    if (res.status === 204) {
      // 204 is success for DELETE, don't throw
      console.log(`204 No Content response for ${res.url} - this is expected`);
      return;
    }
    
    let errorText;
    let errorJson;
    
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      const contentLength = res.headers.get('content-length');
      
      // Check for empty responses to avoid parsing errors
      if (contentLength === '0' || contentLength === '0') {
        errorText = `Empty response with status ${res.status}`;
      } else if (contentType && contentType.includes('application/json')) {
        try {
          errorJson = await res.json();
          errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch (jsonError) {
          console.warn(`Failed to parse JSON error response from ${res.url}:`, jsonError);
          // If JSON parsing fails, try text
          errorText = await res.text() || res.statusText;
        }
      } else {
        // Fall back to text
        errorText = await res.text() || res.statusText;
      }
    } catch (e) {
      // If we can't get the body at all, fall back to status text
      console.warn(`Failed to parse error response from ${res.url}:`, e);
      errorText = res.statusText || `HTTP Error ${res.status}`;
    }
    
    // Enhanced logging
    console.error(`API Error for ${res.url}:`, {
      status: res.status,
      statusText: res.statusText,
      errorText,
      errorJson
    });
    
    // Create a more specific error message based on status code
    let errorMessage = `${res.status}: ${errorText}`;
    
    // Throw with detailed error
    throw new Error(errorMessage);
  }
}

/**
 * Gets CSRF token from cookies
 */
export function getCsrfToken(): string | null {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  return null;
}

/**
 * Makes authenticated API requests with CSRF protection
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  isFormData: boolean = false,
): Promise<Response> {
  // Build headers with CSRF token
  const headers: Record<string, string> = {};
  
  // Add content type for JSON requests
  if (data && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add CSRF token for non-GET methods
  if (method !== 'GET') {
    let csrfToken = getCsrfToken();
    
    // If the token is missing, immediately try to refresh it
    if (!csrfToken) {
      console.warn('CSRF token not found for API request to:', url, 'method:', method);
      
      try {
        console.log("Attempting to refresh CSRF token for API request...");
        const tokenResponse = await fetch("/api/csrf-token", { 
          method: "GET",
          credentials: "include"
        });
        
        if (tokenResponse.ok) {
          // Wait a moment for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 50));
          csrfToken = getCsrfToken();
        }
      } catch (e) {
        console.error('Error refreshing CSRF token for API request:', e);
      }
    }
    
    // Set the token if we have it
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      console.log(`Using CSRF token for ${method} request to ${url}`);
    } else {
      console.warn("Failed to obtain CSRF token for API request after refresh attempt");
    }
    
    // Log request details for debugging
    try {
      console.log('apiRequest details:', {
        method,
        url,
        dataType: data ? typeof data : 'undefined',
        isFormData,
        hasCSRFToken: !!csrfToken,
        cookies: document.cookie
      });
    } catch (e) {
      console.error('Error logging request details:', e);
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: isFormData ? data as FormData : (data ? JSON.stringify(data) : undefined),
      credentials: "include",
    });

    // Enhanced error handling for CSRF-specific errors
    if (res.status === 403) {
      const responseText = await res.text();
      if (responseText.includes('CSRF') || responseText.includes('csrf')) {
        console.error('CSRF protection error:', responseText);
        throw new Error(`CSRF Protection Error (403): ${responseText}. Please refresh the page and try again.`);
      }
      throw new Error(`Forbidden (403): ${responseText}`);
    }
    
    // Enhanced error handling for Conflict errors (typically dependency constraints)
    if (res.status === 409) {
      let errorDetails = "";
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await res.json();
          errorDetails = errorJson.details || errorJson.message || JSON.stringify(errorJson);
        } else {
          errorDetails = await res.text();
        }
      } catch (e) {
        errorDetails = await res.text();
      }
      
      console.error('Conflict error (409):', errorDetails);
      throw new Error(`409: ${errorDetails}`);
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    // Better error logging with more details
    console.error('Error during API request:', {
      url,
      method,
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack,
      errorName: error.name,
      errorObject: error
    });
    
    // For network errors, provide more helpful message
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error when connecting to ${url}. Please check your internet connection.`);
    }
    
    throw error;
  }
}

/**
 * Upload a file with FormData while preserving CSRF protection
 * Use this for file uploads instead of regular apiRequest
 */
export async function secureFileUpload(
  method: string,
  url: string,
  formData: FormData
): Promise<Response> {
  // Enhanced debug - log form data keys
  console.log("DEBUG secureFileUpload - Preparing for upload to:", url);
  console.log("FormData keys:", Array.from(formData.keys()));
  
  // Build headers with CSRF token only
  const headers: Record<string, string> = {};
  
  // Add CSRF token
  let csrfToken = getCsrfToken();
  console.log("Initial CSRF token found:", csrfToken ? "Yes ("+csrfToken.substring(0,5)+"...)" : "No");
  
  // If the token is missing, immediately try to refresh it
  if (!csrfToken) {
    console.warn('CSRF token not found when uploading to:', url);
    console.log('Current cookies:', document.cookie);
    
    try {
      console.log("Attempting to refresh CSRF token...");
      const tokenResponse = await fetch("/api/csrf-token", { 
        method: "GET",
        credentials: "include"
      });
      
      if (tokenResponse.ok) {
        // Wait longer for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 150));
        csrfToken = getCsrfToken();
        console.log("After refresh, CSRF token found:", csrfToken ? "Yes ("+csrfToken.substring(0,5)+"...)" : "No");
      }
    } catch (e) {
      console.error('Error refreshing CSRF token:', e);
    }
  }
  
  // Set the token if we have it
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
    console.log(`Using CSRF token for ${method} request to ${url}`);
    
    // Also add token to formData as a fallback
    formData.append("_csrf", csrfToken);
    console.log("Added CSRF token to formData as fallback");
  } else {
    console.warn("Failed to obtain CSRF token after refresh attempt");
    
    // Create an additional fallback mechanism by trying to get token from another source
    try {
      console.log("Attempting direct CSRF token fetch...");
      const tokenResponse = await fetch("/api/csrf-token", { 
        method: "GET", 
        headers: { "Accept": "application/json" },
        credentials: "include" 
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData && tokenData.csrfToken) {
          headers['X-CSRF-Token'] = tokenData.csrfToken;
          formData.append("_csrf", tokenData.csrfToken);
          console.log("Using directly fetched CSRF token");
        }
      }
    } catch (err) {
      console.error("Error during direct token fetch:", err);
    }
  }
  
  // Log request details for debugging regardless
  console.log('secureFileUpload request details:', {
    method,
    url,
    formDataEntries: Array.from(formData.entries()).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value];
      } else {
        return [key, '(File or Blob object)'];
      }
    }),
    hasCSRFToken: !!csrfToken,
    cookies: document.cookie
  });

  try {
    console.log(`Sending ${method} request to ${url} with ${formData ? Array.from(formData.keys()).length : 0} form fields`);
    
    const res = await fetch(url, {
      method,
      headers,
      body: formData,
      credentials: "include",
    });

    console.log(`Response received: ${res.status} ${res.statusText}`);

    // Enhanced error handling for CSRF-specific errors
    if (res.status === 403) {
      const responseText = await res.text();
      if (responseText.includes('CSRF') || responseText.includes('csrf')) {
        console.error('CSRF protection error:', responseText);
        throw new Error(`CSRF Protection Error (403): ${responseText}. Please refresh the page and try again.`);
      }
      throw new Error(`Forbidden (403): ${responseText}`);
    }
    
    // Handle authentication errors
    if (res.status === 401) {
      const responseText = await res.text();
      console.error('Authentication error:', responseText);
      throw new Error(`Authentication Error (401): You must be logged in to perform this action. Please log in and try again.`);
    }
    
    // Enhanced error handling for Conflict errors (typically dependency constraints)
    if (res.status === 409) {
      let errorDetails = "";
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await res.json();
          errorDetails = errorJson.details || errorJson.message || JSON.stringify(errorJson);
        } else {
          errorDetails = await res.text();
        }
      } catch (e) {
        errorDetails = await res.text();
      }
      
      console.error('Conflict error (409):', errorDetails);
      throw new Error(`409: ${errorDetails}`);
    }

    // Handle other errors with detailed information
    if (!res.ok) {
      const responseText = await res.text();
      console.error(`Error ${res.status} from server:`, responseText);
      throw new Error(`Server Error (${res.status}): ${responseText}`);
    }
    
    return res;
  } catch (error: any) {
    // Better error logging with more details
    console.error('Error during file upload:', {
      url,
      method,
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack,
      errorName: error.name,
      errorObject: error
    });
    
    // For network errors, provide more helpful message
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error when uploading to ${url}. Please check your internet connection.`);
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build headers with CSRF token if needed
    const headers: Record<string, string> = {};
    
    // For non-GET methods we need to include CSRF tokens
    // This applies to some query patterns that might use POST
    const url = queryKey[0] as string;
    const method = queryKey.length > 1 && typeof queryKey[1] === 'string' ? queryKey[1] : 'GET';
    
    if (method !== 'GET') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        console.log(`Using CSRF token for query function ${method} request to ${url}`);
      } else {
        console.warn(`CSRF token not found for query ${url} with method ${method}`);
        
        // If the token is missing, try to refresh it by making a GET request
        try {
          console.log("Attempting to refresh CSRF token for query function...");
          await fetch("/api/csrf-token", { 
            method: "GET",
            credentials: "include"
          });
          
          // Try again to get the token
          const refreshedToken = getCsrfToken();
          if (refreshedToken) {
            console.log("Successfully refreshed CSRF token for query function");
            headers['X-CSRF-Token'] = refreshedToken;
          } else {
            console.warn("Failed to refresh CSRF token for query function");
            console.log('Current cookies:', document.cookie);
          }
        } catch (e) {
          console.error('Error refreshing CSRF token for query function:', e);
        }
      }
    }
    
    try {
      console.log(`Executing query for ${url} with method ${method}`);
      
      const res = await fetch(url, {
        method,
        headers,
        credentials: "include",
      });

      // Log response details for debugging
      console.log(`Query response received for ${url}: ${res.status} ${res.statusText}`);

      // Handle unauthorized response (401) with the specified behavior
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Unauthorized (401) response from ${url}, returning null as specified`);
        return null;
      }
      
      // Handle 404 for endpoints where it's expected
      if (res.status === 404) {
        const expectedNotFoundEndpoints = [
          '/api/subscription-status',
          '/api/professionals/me',
          '/api/professionals/me/consultations',
          '/api/professionals/me/applications'
        ];
        
        if (expectedNotFoundEndpoints.some(endpoint => url.includes(endpoint))) {
          console.log(`Received expected 404 from ${url}, returning null`);
          return null;
        } else {
          // For other endpoints, 404 means the resource doesn't exist
          console.warn(`Resource not found at ${url}`);
          let errorMsg;
          
          try {
            // Try to get more details about the 404
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await res.json();
              errorMsg = errorData.message || 'Resource not found';
            } else {
              errorMsg = await res.text() || 'Resource not found';
            }
          } catch (e) {
            errorMsg = 'Resource not found';
          }
          
          throw new Error(`404: ${errorMsg}`);
        }
      }
      
      // Enhanced error handling for CSRF-specific errors
      if (res.status === 403) {
        const responseText = await res.text();
        if (responseText.includes('CSRF') || responseText.includes('csrf')) {
          console.error('CSRF protection error in query function:', responseText);
          throw new Error(`CSRF Protection Error (403): ${responseText}. Please refresh the page and try again.`);
        }
        throw new Error(`Forbidden (403): ${responseText}`);
      }
      
      // Enhanced error handling for Conflict errors (typically dependency constraints)
      if (res.status === 409) {
        let errorDetails = "";
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await res.json();
            errorDetails = errorJson.details || errorJson.message || JSON.stringify(errorJson);
          } else {
            errorDetails = await res.text();
          }
        } catch (e) {
          errorDetails = await res.text();
        }
        
        console.error('Conflict error (409) in query function:', errorDetails);
        throw new Error(`409: ${errorDetails}`);
      }

      await throwIfResNotOk(res);
      
      // Handle empty responses (like 204 No Content)
      if (res.status === 204 || res.headers.get('content-length') === '0') {
        return null;
      }
      
      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      } else {
        // For non-JSON responses, return the text
        console.warn(`Non-JSON response received from ${url} (${contentType})`);
        return { text: await res.text() };
      }
    } catch (error: any) {
      // Create more descriptive error messages for common network issues
      if (
        error instanceof TypeError && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('NetworkError') ||
         error.message.includes('Network request failed'))
      ) {
        console.warn(`Network error in query function for ${url}. Will retry automatically.`);
        // Create a more specific error for network issues to help with retry logic
        const networkError = new Error(`Network connection issue: ${error.message}. The application will automatically retry when connectivity is restored.`);
        networkError.name = 'NetworkError';
        throw networkError;
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        // Handle JSON parsing errors
        console.error(`JSON parsing error in query function for ${url}:`, error);
        throw new Error(`Invalid response format from server. Please try again later.`);
      } else if (error.message?.includes("404")) {
        // Specifically handle 404 errors with more detailed logging
        console.error(`Resource not found error in query function for ${url}:`, error.message);
        throw new Error(`The requested resource was not found. Please check that it exists and try again.`);
      } else if (error.message?.includes("400")) {
        // Specifically handle 400 errors (bad request)
        console.error(`Bad request error in query function for ${url}:`, error.message);
        throw new Error(`Invalid request format: ${error.message}. Please check your inputs and try again.`);
      } else if (error.message?.includes("500") || error.message?.includes("502") || 
                error.message?.includes("503") || error.message?.includes("504")) {
        // Handle server errors
        console.error(`Server error in query function for ${url}:`, error.message);
        throw new Error(`Server error: ${error.message}. Our team has been notified and is working on a solution.`);
      } else {
        // General error handling with more detailed logging
        console.error(`Error in query function for ${url}:`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
          url,
          method
        });
        throw error;
      }
    }
  };

// Setup global unhandled rejection handler for all promises
window.addEventListener('unhandledrejection', event => {
  // Capture the error details for debugging
  const errorDetails = {
    message: event.reason?.message || 'Unknown error',
    name: event.reason?.name || 'UnknownError',
    stack: event.reason?.stack || 'No stack trace available',
    source: 'Unhandled Promise Rejection Handler'
  };

  // Categorize the error type
  let errorType = 'Unknown';
  
  // Check if it's a React Query error
  if (event.reason && (
      event.reason.name === 'QueryError' || 
      event.reason.name === 'MutationError' || 
      event.reason.name === 'NetworkError'
    )) {
    errorType = 'ReactQuery';
  } 
  // Check if it's a network error
  else if (event.reason && typeof event.reason.message === 'string' && (
    event.reason.message.includes('Network') ||
    event.reason.message.includes('Failed to fetch') ||
    event.reason.message.includes('connection') ||
    event.reason.message.includes('timeout')
  )) {
    errorType = 'Network';
  }
  // Check if it's an authentication/authorization error
  else if (event.reason && typeof event.reason.message === 'string' && (
    event.reason.message.includes('401') ||
    event.reason.message.includes('403') ||
    event.reason.message.includes('Unauthorized') ||
    event.reason.message.includes('Forbidden')
  )) {
    errorType = 'Auth';
  }
  
  // Log the error with better categorization
  console.warn(`Unhandled promise rejection (${errorType}):`, errorDetails);
  
  // Always prevent the default browser handling of these errors during development
  // This prevents the console from getting cluttered
  if (import.meta.env.DEV) {
    event.preventDefault();
  }
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Changed to returnNull for better error handling
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // Set to 1 minute instead of Infinity for dev purposes
      retry: 1, // Reduce retries for faster development feedback
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
      // TypeScript doesn't allow global onError through defaultOptions, but we handle this through
      // our global unhandled rejection handler above
    },
    mutations: {
      retry: 1, // Reduce retries for faster development feedback 
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000)
      // TypeScript doesn't allow global onError through defaultOptions, but we handle this through
      // our global unhandled rejection handler above
    }
  }
});
