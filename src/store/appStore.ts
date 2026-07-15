import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecentProject, ThemeMode } from '@/types';

interface AppState {
  theme: ThemeMode;
  recentProjects: RecentProject[];
  activeProjectId: string | null;
  setTheme: (t: ThemeMode) => void;
  addRecentProject: (p: RecentProject) => void;
  clearRecentProjects: () => void;
  setActiveProjectId: (id: string | null) => void;
  trackPageView: (projectId: string, pageNumber: number) => void;
  trackPageDuration: (projectId: string, pageNumber: number, durationSeconds: number) => void;
  trackLinkClick: (projectId: string, linkUrl: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light',
      recentProjects: [],
      activeProjectId: null,
      setTheme: (theme) => set({ theme }),
      addRecentProject: (project) =>
        set((s) => ({
          recentProjects: [project, ...s.recentProjects.filter((p) => p.id !== project.id)].slice(0, 8),
        })),
      clearRecentProjects: () => set({ recentProjects: [] }),
      setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
      trackPageView: (projectId, pageNumber) =>
        set((s) => ({
          recentProjects: s.recentProjects.map((p) => {
            if (p.id !== projectId) return p;
            const views = p.analytics?.viewsPerPage || {};
            const newViews = { ...views, [pageNumber]: (views[pageNumber] || 0) + 1 };
            return {
              ...p,
              analytics: {
                ...p.analytics,
                viewsPerPage: newViews,
              },
            };
          }),
        })),
      trackPageDuration: (projectId, pageNumber, durationSeconds) =>
        set((s) => ({
          recentProjects: s.recentProjects.map((p) => {
            if (p.id !== projectId) return p;
            const durations = p.analytics?.durationPerPageSeconds || {};
            const newDurations = { ...durations, [pageNumber]: (durations[pageNumber] || 0) + durationSeconds };
            return {
              ...p,
              analytics: {
                ...p.analytics,
                durationPerPageSeconds: newDurations,
              },
            };
          }),
        })),
      trackLinkClick: (projectId, linkUrl) =>
        set((s) => ({
          recentProjects: s.recentProjects.map((p) => {
            if (p.id !== projectId) return p;
            const clicks = p.analytics?.linkClicks || {};
            const newClicks = { ...clicks, [linkUrl]: (clicks[linkUrl] || 0) + 1 };
            return {
              ...p,
              analytics: {
                ...p.analytics,
                linkClicks: newClicks,
              },
            };
          }),
        })),
    }),
    { name: 'flipbook-app-store' },
  ),
);
