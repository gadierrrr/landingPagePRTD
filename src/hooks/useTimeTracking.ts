import { useEffect, useRef } from 'react';
import { trackTimeOnPage } from '../lib/analytics';

/**
 * Hook to track time spent on page
 * @param pageType - Type of page for analytics categorization
 * @param enabled - Whether tracking is enabled (default: true)
 */
export const useTimeTracking = (pageType: string, enabled: boolean = true) => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    startTimeRef.current = Date.now();

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      // Only track if user spent more than 5 seconds on page
      if (timeSpent > 5) {
        trackTimeOnPage(timeSpent, pageType);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        if (timeSpent > 5) {
          trackTimeOnPage(timeSpent, pageType);
        }
        
        // Reset start time for when they come back
        startTimeRef.current = Date.now();
      }
    };

    // Track on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Track when page becomes hidden (tab switch, minimize, etc.)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Track time when component unmounts
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 5) {
        trackTimeOnPage(timeSpent, pageType);
      }
    };
  }, [pageType, enabled]);
};