import { create } from 'zustand';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageFlip } from 'page-flip';
import {
  BookMetadata,
  DEFAULT_SETTINGS,
  FlipbookSettings,
  LoadProgress,
  PageRenderState,
  TocEntry,
  OverlayItem,
} from '@/types';

interface BookState {
  // Source document
  doc: PDFDocumentProxy | null;
  file: File | null;
  metadata: BookMetadata | null;
  toc: TocEntry[];

  // Loading
  progress: LoadProgress;

  // Page cache: pageNumber -> render state. Kept as a plain object so we can
  // shallow-clear old entries and avoid unbounded memory growth on huge PDFs.
  pageCache: Record<number, PageRenderState>;

  // Viewer state
  currentPage: number;
  zoom: number;
  isFullscreen: boolean;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  settings: FlipbookSettings;
  flipRef: { current: PageFlip | null };

  // Project features
  overlays: Record<number, OverlayItem[]>;
  logoDataUrl: string | null;
  footerText: string;
  editMode: boolean;
  activeTool: 'link' | 'video' | 'highlight' | 'pencil' | 'textbox';
  activeColor: string;

  // Actions
  setDoc: (doc: PDFDocumentProxy | null, file: File | null) => void;
  setMetadata: (m: BookMetadata | null) => void;
  setToc: (toc: TocEntry[]) => void;
  setProgress: (p: Partial<LoadProgress>) => void;
  setPageState: (pageNumber: number, state: Partial<PageRenderState>) => void;
  evictFarPages: (keepAroundPage: number, radius: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setZoom: (zoom: number) => void;
  toggleFullscreen: (value?: boolean) => void;
  toggleSidebar: (value?: boolean) => void;
  toggleSettings: (value?: boolean) => void;
  updateSettings: (patch: Partial<FlipbookSettings>) => void;
  setEditMode: (editMode: boolean) => void;
  setActiveTool: (tool: 'link' | 'video' | 'highlight' | 'pencil' | 'textbox') => void;
  setActiveColor: (color: string) => void;
  
  // Custom features actions
  setOverlays: (overlays: Record<number, OverlayItem[]>) => void;
  addOverlay: (pageNumber: number, item: OverlayItem) => void;
  removeOverlay: (pageNumber: number, overlayId: string) => void;
  setLogoDataUrl: (logo: string | null) => void;
  setFooterText: (text: string) => void;
  
  reset: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  doc: null,
  file: null,
  metadata: null,
  toc: [],
  progress: { stage: 'idle', loadedPages: 0, totalPages: 0 },
  pageCache: {},
  currentPage: 1,
  zoom: 1,
  isFullscreen: false,
  sidebarOpen: true,
  settingsOpen: false,
  settings: DEFAULT_SETTINGS,
  flipRef: { current: null },
  editMode: false,

  setDoc: (doc, file) => set({ doc, file }),
  setMetadata: (metadata) => set({ metadata }),
  setToc: (toc) => set({ toc }),
  setProgress: (p) => set((s) => ({ progress: { ...s.progress, ...p } })),
  setEditMode: (editMode) => set({ editMode }),

  setPageState: (pageNumber, patch) =>
    set((s) => ({
      pageCache: {
        ...s.pageCache,
        [pageNumber]: {
          ...(s.pageCache[pageNumber] ?? { pageNumber, status: 'idle' }),
          ...patch,
        },
      },
    })),

  // Drop rendered pages far outside the current viewing window so a
  // 1500-page book doesn't keep every raster in memory at once.
  evictFarPages: (keepAroundPage, radius) =>
    set((s) => {
      const next: Record<number, PageRenderState> = {};
      for (const [key, val] of Object.entries(s.pageCache)) {
        const n = Number(key);
        if (Math.abs(n - keepAroundPage) <= radius) {
          next[n] = val;
        }
      }
      return { pageCache: next };
    }),

  goToPage: (page) => {
    const total = get().metadata?.pageCount ?? 1;
    const clamped = Math.min(Math.max(1, page), total);
    set({ currentPage: clamped });
  },

  goToNextPage: () => {
    const flip = get().flipRef.current;
    if (flip) {
      flip.flipNext();
    } else {
      const { currentPage, settings, metadata } = get();
      const total = metadata?.pageCount ?? 1;
      if (currentPage >= total) return;

      if (settings.viewMode === 'double') {
        if (currentPage === 1 && settings.showCover) {
          set({ currentPage: Math.min(2, total) });
        } else {
          set({ currentPage: Math.min(currentPage + 2, total) });
        }
      } else {
        set({ currentPage: Math.min(currentPage + 1, total) });
      }
    }
  },

  goToPrevPage: () => {
    const flip = get().flipRef.current;
    if (flip) {
      flip.flipPrev();
    } else {
      const { currentPage, settings } = get();
      if (currentPage <= 1) return;

      if (settings.viewMode === 'double') {
        if (currentPage === 2 && settings.showCover) {
          set({ currentPage: 1 });
        } else {
          set({ currentPage: Math.max(currentPage - 2, 1) });
        }
      } else {
        set({ currentPage: Math.max(currentPage - 1, 1) });
      }
    }
  },

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(0.25, zoom), 4) }),
  toggleFullscreen: (value) => set((s) => ({ isFullscreen: value ?? !s.isFullscreen })),
  toggleSidebar: (value) => set((s) => ({ sidebarOpen: value ?? !s.sidebarOpen })),
  toggleSettings: (value) => set((s) => ({ settingsOpen: value ?? !s.settingsOpen })),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  overlays: {},
  logoDataUrl: null,
  footerText: '',
  activeTool: 'link',
  activeColor: '#eab308',

  setEditMode: (editMode) => set({ editMode }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveColor: (activeColor) => set({ activeColor }),

  setOverlays: (overlays) => set({ overlays }),
  addOverlay: (pageNumber, item) => set((s) => {
    const list = s.overlays[pageNumber] || [];
    return {
      overlays: {
        ...s.overlays,
        [pageNumber]: [...list, item]
      }
    };
  }),
  removeOverlay: (pageNumber, overlayId) => set((s) => {
    const list = s.overlays[pageNumber] || [];
    return {
      overlays: {
        ...s.overlays,
        [pageNumber]: list.filter(item => item.id !== overlayId)
      }
    };
  }),
  setLogoDataUrl: (logoDataUrl) => set({ logoDataUrl }),
  setFooterText: (footerText) => set({ footerText }),

  reset: () =>
    set({
      doc: null,
      file: null,
      metadata: null,
      toc: [],
      progress: { stage: 'idle', loadedPages: 0, totalPages: 0 },
      pageCache: {},
      currentPage: 1,
      zoom: 1,
      isFullscreen: false,
      overlays: {},
      logoDataUrl: null,
      footerText: '',
    }),
}));
