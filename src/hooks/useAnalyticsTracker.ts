import { useEffect, useRef } from 'react';
import { useBookStore } from '@/store/bookStore';
import { useAppStore } from '@/store/appStore';

export function useAnalyticsTracker() {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const currentPage = useBookStore((s) => s.currentPage);
  const trackPageView = useAppStore((s) => s.trackPageView);
  const trackPageDuration = useAppStore((s) => s.trackPageDuration);

  const prevPageRef = useRef<number>(currentPage);
  const enterTimeRef = useRef<number>(Date.now());

  // Track initial page view on mount
  useEffect(() => {
    if (!activeProjectId) return;
    trackPageView(activeProjectId, currentPage);
    enterTimeRef.current = Date.now();
    prevPageRef.current = currentPage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, trackPageView]);

  // Track page changes
  useEffect(() => {
    if (!activeProjectId) return;

    if (currentPage !== prevPageRef.current) {
      const now = Date.now();
      const durationSeconds = Math.max(0.5, (now - enterTimeRef.current) / 1000);
      
      // Save duration for the page we are leaving
      trackPageDuration(activeProjectId, prevPageRef.current, Math.round(durationSeconds));
      
      // Save view for the page we are entering
      trackPageView(activeProjectId, currentPage);

      // Update refs
      enterTimeRef.current = now;
      prevPageRef.current = currentPage;
    }
  }, [currentPage, activeProjectId, trackPageView, trackPageDuration]);

  // Track final duration on unmount
  useEffect(() => {
    return () => {
      if (!activeProjectId) return;
      const now = Date.now();
      const durationSeconds = Math.max(0.5, (now - enterTimeRef.current) / 1000);
      trackPageDuration(activeProjectId, prevPageRef.current, Math.round(durationSeconds));
    };
  }, [activeProjectId, trackPageDuration]);
}
