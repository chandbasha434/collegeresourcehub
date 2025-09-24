import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Refetch on window focus to catch auth state changes
    refetchOnWindowFocus: true,
    // Set a short stale time to ensure fresh auth checks
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Invalidate auth query when the component first mounts
  // This ensures fresh auth state after page reloads/redirects
  useEffect(() => {
    const invalidateAuth = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    };
    
    // Invalidate on mount
    invalidateAuth();
    
    // Also invalidate when window gains focus (e.g., after OAuth redirect)
    window.addEventListener('focus', invalidateAuth);
    
    return () => {
      window.removeEventListener('focus', invalidateAuth);
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}