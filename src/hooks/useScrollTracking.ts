import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '../lib/analytics';

/**
 * Hook to track scroll depth on pages
 * @param pageType - Type of page for analytics categorization
 * @param enabled - Whether tracking is enabled (default: true)
 */
export const useScrollTracking = (pageType: string, enabled: boolean = true) => {
  const maxScrollDepthRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) return; // Avoid division by zero
      
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      // Track at 25%, 50%, 75%, and 100% milestones
      if (scrollPercent > maxScrollDepthRef.current) {
        const milestones = [25, 50, 75, 100];
        const newMilestone = milestones.find(
          milestone => 
            scrollPercent >= milestone && 
            maxScrollDepthRef.current < milestone
        );
        
        if (newMilestone) {
          maxScrollDepthRef.current = newMilestone;
          trackScrollDepth(newMilestone, pageType);
        }
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [pageType, enabled]);
};