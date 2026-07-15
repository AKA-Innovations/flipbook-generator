import { useEffect, useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import { useBookStore } from '@/store/bookStore';
import { useAppStore } from '@/store/appStore';
import { usePageRender } from '@/hooks/usePageRender';
import { OverlayEditor } from '@/components/viewer/OverlayEditor';

// Helper to generate a placeholder SVG data URL with a loading spinner and page number
const getPlaceholderSvg = (pageNumber: number, isDark: boolean) => {
  const bg = isDark ? '#1e293b' : '#ffffff';
  const stroke = '#6366f1';
  const text = '#94a3b8';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700"><rect width="100%" height="100%" fill="${bg}"/><circle cx="250" cy="350" r="20" fill="none" stroke="${stroke}" stroke-width="4" stroke-dasharray="80 20"/><text x="250" y="660" font-family="sans-serif" font-size="12" fill="${text}" text-anchor="middle">${pageNumber}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

interface PageFlipBounds {
  left: number;
  top: number;
  width: number;
  height: number;
  pageWidth: number;
}

/**
 * Renders the actual flip-book surface. Each "page" is a div containing
 * either the rendered PDF page image (once ready) or a skeleton. PageFlip
 * takes over pointer/touch handling for the curl animation once initialized.
 */
export function FlipbookViewer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);

  const totalPages = useBookStore((s) => s.metadata?.pageCount ?? 0);
  const currentPage = useBookStore((s) => s.currentPage);
  const goToPage = useBookStore((s) => s.goToPage);
  const pageCache = useBookStore((s) => s.pageCache);
  const settings = useBookStore((s) => s.settings);
  const storeFlipRef = useBookStore((s) => s.flipRef);
  const zoom = useBookStore((s) => s.zoom);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [bounds, setBounds] = useState<PageFlipBounds | null>(null);

  usePageRender(1.4 * zoom);

  const getPageImages = () => {
    return Array.from({ length: totalPages }, (_, i) => {
      const pageNumber = i + 1;
      const state = pageCache[pageNumber];
      return state?.status === 'ready' && state.dataUrl
        ? state.dataUrl
        : getPlaceholderSvg(pageNumber, isDark);
    });
  };

  // Initialize PageFlip once we know the page count.
  useEffect(() => {
    if (!wrapperRef.current || !totalPages) return;

    // Create the main container div manually so React doesn't interfere with its children
    const container = document.createElement('div');
    container.className = 'flip-book-container';
    if (settings.viewMode === 'single') {
      container.style.width = '500px';
      container.style.maxWidth = '100%';
      container.style.height = '700px';
      container.style.maxHeight = '90vh';
    } else {
      container.style.width = '1000px';
      container.style.maxWidth = '100%';
      container.style.height = '700px';
      container.style.maxHeight = '90vh';
    }
    wrapperRef.current.appendChild(container);

    const images = getPageImages();

    const flip = new PageFlip(container, {
      startPage: currentPage - 1,
      width: 500,
      height: 700,
      size: 'stretch',
      minWidth: 300,
      maxWidth: 1200,
      minHeight: 400,
      maxHeight: 1600,
      maxShadowOpacity: settings.shadowIntensity,
      showCover: settings.showCover,
      usePortrait: settings.viewMode === 'single',
      flippingTime: settings.animationSpeedMs,
      mobileScrollSupport: true,
      useMouseEvents: true,
      drawShadow: true,
      autoSize: true,
    });

    const updateBounds = () => {
      if (flip) {
        setBounds(flip.getBoundsRect());
      }
    };

    flip.loadFromImages(images);

    // Initial bounds update after layout settles
    setTimeout(updateBounds, 100);
    window.addEventListener('resize', updateBounds);

    flip.on('flip', (e: { data: number }) => {
      goToPage(e.data + 1);
      setTimeout(updateBounds, 50);
    });

    flipRef.current = flip;
    storeFlipRef.current = flip;

    return () => {
      window.removeEventListener('resize', updateBounds);
      flip.destroy();
      container.remove();
      flipRef.current = null;
      storeFlipRef.current = null;
    };
    // Re-init when structural settings change or theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    totalPages,
    settings.viewMode,
    settings.showCover,
    settings.hardCover,
    settings.shadowIntensity,
    settings.animationSpeedMs,
    isDark,
  ]);

  // Update PageFlip images when pageCache finishes rendering new pages
  useEffect(() => {
    const flip = flipRef.current;
    if (!flip || !totalPages) return;

    const images = getPageImages();
    flip.updateFromImages(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCache, totalPages, isDark]);

  // Keep PageFlip in sync when navigation happens from outside (toolbar, TOC, thumbnails).
  useEffect(() => {
    const flip = flipRef.current;
    if (!flip) return;
    const flipPage = flip.getCurrentPageIndex();
    if (flipPage !== currentPage - 1) {
      flip.flip(currentPage - 1);
    }
  }, [currentPage]);

  const renderOverlayEditors = () => {
    if (!bounds) return null;

    const renderEditor = (pageNum: number, isLeft: boolean) => {
      if (pageNum < 1 || pageNum > totalPages) return null;
      
      const width = bounds.pageWidth;
      const height = bounds.height;
      const top = bounds.top;
      const left = isLeft ? bounds.left : (bounds.left + bounds.pageWidth);

      return (
        <OverlayEditor
          key={pageNum}
          pageNumber={pageNum}
          width={width}
          height={height}
          left={left}
          top={top}
        />
      );
    };

    if (settings.viewMode === 'single') {
      return renderEditor(currentPage, false);
    } else {
      if (currentPage === 1 && settings.showCover) {
        return renderEditor(1, false);
      }
      
      const isLastPage = currentPage === totalPages;
      if (isLastPage && totalPages % 2 === 1) {
        return renderEditor(totalPages, true);
      }

      const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      const rightPage = leftPage + 1;
      return (
        <>
          {renderEditor(leftPage, true)}
          {renderEditor(rightPage, false)}
        </>
      );
    }
  };

  const flipbookKey = `${totalPages}-${settings.viewMode}-${settings.showCover}-${settings.hardCover}-${settings.shadowIntensity}-${settings.animationSpeedMs}-${isDark}`;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div
        key={flipbookKey}
        ref={wrapperRef}
        className="w-full h-full flex items-center justify-center relative"
      >
        {bounds && renderOverlayEditors()}
      </div>
    </div>
  );
}
