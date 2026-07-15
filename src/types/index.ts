/** A single navigable entry extracted from the PDF's outline/bookmarks. */
export interface TocEntry {
  title: string;
  pageIndex: number | null;
  children: TocEntry[];
}

/** Metadata we pull off the PDF once it's loaded. */
export interface BookMetadata {
  title: string;
  author?: string;
  pageCount: number;
  fileSizeBytes: number;
  fileName: string;
  createdAt: number;
}

/** A rendered page's cached raster + status, kept in the page cache map. */
export interface PageRenderState {
  pageNumber: number; // 1-indexed
  status: 'idle' | 'rendering' | 'ready' | 'error';
  dataUrl?: string;
  width?: number;
  height?: number;
  error?: string;
}

export type ViewMode = 'single' | 'double';
export type ThemeMode = 'light' | 'dark';

export interface FlipbookSettings {
  theme: ThemeMode;
  viewMode: ViewMode;
  hardCover: boolean;
  showCover: boolean;
  animationSpeedMs: number; // page flip duration
  shadowIntensity: number; // 0 - 1
  pageGap: number; // px between pages in double mode
  accentColor: string; // hex
  rtl: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: FlipbookSettings = {
  theme: 'light',
  viewMode: 'double',
  hardCover: true,
  showCover: true,
  animationSpeedMs: 600,
  shadowIntensity: 0.5,
  pageGap: 8,
  accentColor: '#6366f1',
  rtl: false,
  soundEnabled: false,
};

export interface SearchResult {
  pageNumber: number;
  snippet: string;
  matchIndex: number;
}

export interface OverlayItem {
  id: string;
  type: 'link' | 'video' | 'highlight' | 'pencil' | 'textbox';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  value: string; // URL, YouTube ID, SVG Path, or Text content
  color?: string; // hex color
}

export interface RecentProject {
  id: string;
  fileName: string;
  pageCount: number;
  savedAt: number;
  thumbnailDataUrl?: string;
  overlays?: Record<number, OverlayItem[]>;
  logoDataUrl?: string;
  footerText?: string;
  theme?: ThemeMode;
  viewMode?: ViewMode;
  accentColor?: string;
  analytics?: {
    viewsPerPage?: Record<number, number>;
    durationPerPageSeconds?: Record<number, number>;
    linkClicks?: Record<string, number>;
  };
}

export type LoadStage =
  | 'idle'
  | 'validating'
  | 'reading'
  | 'parsing'
  | 'rendering-preview'
  | 'ready'
  | 'error';

export interface LoadProgress {
  stage: LoadStage;
  loadedPages: number;
  totalPages: number;
  message?: string;
}
