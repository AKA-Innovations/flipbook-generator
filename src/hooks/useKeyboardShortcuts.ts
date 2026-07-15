import { useEffect } from 'react';
import { useBookStore } from '@/store/bookStore';

export function useKeyboardShortcuts() {
  const goToPage = useBookStore((s) => s.goToPage);
  const goToNextPage = useBookStore((s) => s.goToNextPage);
  const goToPrevPage = useBookStore((s) => s.goToPrevPage);
  const currentPage = useBookStore((s) => s.currentPage);
  const setZoom = useBookStore((s) => s.setZoom);
  const zoom = useBookStore((s) => s.zoom);
  const toggleFullscreen = useBookStore((s) => s.toggleFullscreen);
  const toggleSidebar = useBookStore((s) => s.toggleSidebar);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't hijack typing in inputs (e.g. search box, settings fields)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goToNextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevPage();
          break;
        case '+':
        case '=':
          setZoom(zoom + 0.1);
          break;
        case '-':
          setZoom(zoom - 0.1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'b':
        case 'B':
          toggleSidebar();
          break;
        case 'Home':
          goToPage(1);
          break;
        case 'End':
          goToPage(Number.MAX_SAFE_INTEGER);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    currentPage,
    zoom,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setZoom,
    toggleFullscreen,
    toggleSidebar,
  ]);
}
