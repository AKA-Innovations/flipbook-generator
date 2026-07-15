import { useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiDownload,
  FiSearch,
  FiSettings,
  FiSidebar,
  FiRotateCw,
  FiActivity,
} from 'react-icons/fi';
import { useBookStore } from '@/store/bookStore';
import { IconButton } from '@/components/common/IconButton';
import { SearchPanel } from '@/components/viewer/SearchPanel';
import { AnalyticsPanel } from '@/components/viewer/AnalyticsPanel';

import { saveAs } from 'file-saver';
import { exportAnnotatedPdf } from '@/services/pdfExportService';

interface Props {
  onDownload: () => void;
  isExporting: boolean;
}

export function ViewerToolbar({ onDownload, isExporting }: Props) {
  const currentPage = useBookStore((s) => s.currentPage);
  const totalPages = useBookStore((s) => s.metadata?.pageCount ?? 0);
  const goToPage = useBookStore((s) => s.goToPage);
  const goToNextPage = useBookStore((s) => s.goToNextPage);
  const goToPrevPage = useBookStore((s) => s.goToPrevPage);
  const zoom = useBookStore((s) => s.zoom);
  const setZoom = useBookStore((s) => s.setZoom);
  const isFullscreen = useBookStore((s) => s.isFullscreen);
  const toggleFullscreen = useBookStore((s) => s.toggleFullscreen);
  const toggleSidebar = useBookStore((s) => s.toggleSidebar);
  const toggleSettings = useBookStore((s) => s.toggleSettings);
  const file = useBookStore((s) => s.file);
  const doc = useBookStore((s) => s.doc);
  const metadata = useBookStore((s) => s.metadata);

  const [searchOpen, setSearchOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [isPdfCompiling, setIsPdfCompiling] = useState(false);

  const onFullscreenClick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      toggleFullscreen(true);
    } else {
      document.exitFullscreen?.();
      toggleFullscreen(false);
    }
  };

  const handleDownloadZip = () => {
    setDownloadMenuOpen(false);
    onDownload();
  };

  const handleDownloadPdf = async () => {
    if (!doc || !metadata) return;
    setDownloadMenuOpen(false);
    setIsPdfCompiling(true);
    try {
      const blob = await exportAnnotatedPdf(doc, metadata.title);
      saveAs(blob, `${metadata.title.replace(/\.[^/.]+$/, '')}-annotated.pdf`);
    } catch (err) {
      console.error('Failed to export annotated PDF', err);
    } finally {
      setIsPdfCompiling(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-glass">
        <IconButton label="Toggle sidebar" onClick={() => toggleSidebar()}>
          <FiSidebar />
        </IconButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <IconButton label="First page" onClick={() => goToPage(1)} disabled={currentPage <= 1}>
          <FiChevronsLeft />
        </IconButton>
        <IconButton label="Previous page" onClick={goToPrevPage} disabled={currentPage <= 1}>
          <FiChevronLeft />
        </IconButton>

        <div className="px-2 text-sm tabular-nums text-slate-600 dark:text-slate-300 select-none">
          {currentPage} / {totalPages || '–'}
        </div>

        <IconButton
          label="Next page"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
        >
          <FiChevronRight />
        </IconButton>
        <IconButton
          label="Last page"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <FiChevronsRight />
        </IconButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <IconButton label="Zoom out" onClick={() => setZoom(zoom - 0.1)}>
          <FiZoomOut />
        </IconButton>
        <span className="text-xs w-10 text-center tabular-nums text-slate-500">{Math.round(zoom * 100)}%</span>
        <IconButton label="Zoom in" onClick={() => setZoom(zoom + 0.1)}>
          <FiZoomIn />
        </IconButton>
        <IconButton label="Rotate" onClick={() => setRotation((r) => (r + 90) % 360)}>
          <FiRotateCw />
        </IconButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <IconButton label="Search" active={searchOpen} onClick={() => setSearchOpen((v) => !v)}>
          <FiSearch />
        </IconButton>
        <IconButton label="Analytics" active={analyticsOpen} onClick={() => setAnalyticsOpen((v) => !v)}>
          <FiActivity />
        </IconButton>
        <IconButton label="Settings" onClick={() => toggleSettings()}>
          <FiSettings />
        </IconButton>
        <IconButton label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={onFullscreenClick}>
          {isFullscreen ? <FiMinimize /> : <FiMaximize />}
        </IconButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <div className="relative">
          <IconButton
            label="Download options"
            onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
            disabled={isExporting || isPdfCompiling}
          >
            {isPdfCompiling ? (
              <div className="h-4 w-4 rounded-full border-2 border-slate-350 border-t-accent animate-spin" />
            ) : (
              <FiDownload />
            )}
          </IconButton>
          
          {downloadMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDownloadMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-40 text-left">
                <button
                  onClick={handleDownloadZip}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Interactive Offline App</span>
                  <span className="text-[10px] text-slate-450 mt-0.5">Export ZIP folder with player</span>
                </button>
                {file && (
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col gap-0.5 mt-1 border-t border-slate-100 dark:border-slate-800/40 pt-1.5"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Annotated PDF Document</span>
                    <span className="text-[10px] text-slate-450 mt-0.5">Download PDF with overlays</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-full mt-2 right-0 z-20">
          <SearchPanel onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {analyticsOpen && (
        <AnalyticsPanel onClose={() => setAnalyticsOpen(false)} />
      )}

      {/* rotation is applied to the flipbook container by a CSS var consumer;
          kept local here since it's a transient view tweak, not persisted state */}
      <style>{`.flip-book-container { transform: rotate(${rotation}deg); transition: transform 0.3s ease; }`}</style>
    </div>
  );
}
