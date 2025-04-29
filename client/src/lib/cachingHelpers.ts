// Utility functions for React Query cache management

import { useQueryClient } from '@tanstack/react-query';

/**
 * Invalidates multiple query keys at once
 * @param queryKeys An array of query keys to invalidate
 */
export const invalidateQueries = (queryKeys: string[], queryClient: any) => {
  // Track any failures
  const failures: string[] = [];
  
  // Attempt to invalidate each query
  queryKeys.forEach(key => {
    try {
      queryClient.invalidateQueries({ queryKey: [key] });
    } catch (error) {
      console.error(`Failed to invalidate query for key ${key}:`, error);
      failures.push(key);
    }
  });
  
  // If we have failures, log them for debugging
  if (failures.length > 0) {
    console.warn('Failed to invalidate some queries:', failures);
  }
  
  return failures.length === 0; // Return true if all invalidations succeeded
};

/**
 * Resets query data for a specific query key
 * @param queryKey The query key to reset
 * @param newData Optional new data to set
 */
export const resetQueryData = (queryKey: string, newData: any = null, queryClient: any) => {
  try {
    if (newData) {
      queryClient.setQueryData([queryKey], newData);
    } else {
      queryClient.resetQueries({ queryKey: [queryKey] });
    }
    return true;
  } catch (error) {
    console.error(`Failed to reset query data for key ${queryKey}:`, error);
    return false;
  }
};

/**
 * Utility hook to help with cache invalidation
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateQueries: (queryKeys: string[]) => invalidateQueries(queryKeys, queryClient),
    resetQueryData: (queryKey: string, newData: any = null) => resetQueryData(queryKey, newData, queryClient),
    
    // Convenience method to invalidate and force a refetch
    refreshQueries: async (queryKeys: string[]) => {
      const invalidated = invalidateQueries(queryKeys, queryClient);
      if (invalidated) {
        // Force a refetch of all invalidated queries
        await Promise.all(
          queryKeys.map(key => 
            queryClient.refetchQueries({ queryKey: [key] })
          )
        );
      }
      return invalidated;
    }
  };
};