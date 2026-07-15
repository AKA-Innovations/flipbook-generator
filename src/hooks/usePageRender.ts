import { useEffect } from 'react';
import { useBookStore } from '@/store/bookStore';
import { renderPageToDataUrl } from '@/services/pdfService';

const RENDER_WINDOW = 4; // pages ahead/behind current to keep rendered
const EVICT_RADIUS = 8; // pages beyond which we drop cached rasters

/**
 * Renders pages within RENDER_WINDOW of the current page, skips ones already
 * cached, and evicts anything far outside EVICT_RADIUS. This is what lets a
 * 1000+ page book stay smooth instead of rendering everything up front.
 */
export function usePageRender(scale: number) {
  const doc = useBookStore((s) => s.doc);
  const currentPage = useBookStore((s) => s.currentPage);
  const pageCache = useBookStore((s) => s.pageCache);
  const setPageState = useBookStore((s) => s.setPageState);
  const evictFarPages = useBookStore((s) => s.evictFarPages);
  const totalPages = useBookStore((s) => s.metadata?.pageCount ?? 0);

  useEffect(() => {
    if (!doc || !totalPages) return;
    let cancelled = false;

    const start = Math.max(1, currentPage - RENDER_WINDOW);
    const end = Math.min(totalPages, currentPage + RENDER_WINDOW);

    const renderRange = async () => {
      for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        if (cancelled) return;
        const existing = pageCache[pageNumber];
        if (existing?.status === 'ready' || existing?.status === 'rendering') continue;

        setPageState(pageNumber, { pageNumber, status: 'rendering' });
        try {
          const { dataUrl, width, height } = await renderPageToDataUrl(doc, pageNumber, { scale });
          if (cancelled) return;
          setPageState(pageNumber, { status: 'ready', dataUrl, width, height });
        } catch (err) {
          if (cancelled) return;
          setPageState(pageNumber, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Render failed',
          });
        }
      }
    };

    renderRange();
    evictFarPages(currentPage, EVICT_RADIUS);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, currentPage, scale, totalPages]);
}
