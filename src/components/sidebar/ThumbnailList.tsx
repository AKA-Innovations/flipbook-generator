import { useEffect, useRef, useState } from 'react';
import { useBookStore } from '@/store/bookStore';
import { renderPageToDataUrl } from '@/services/pdfService';
import { classNames } from '@/utils/format';

/**
 * Instead of rendering all N thumbnails up front (expensive for 1000+ page
 * books), each thumbnail only renders itself once it scrolls into view via
 * IntersectionObserver, and low-res (scale 0.15) to keep it cheap.
 */
export function ThumbnailList() {
  const doc = useBookStore((s) => s.doc);
  const totalPages = useBookStore((s) => s.metadata?.pageCount ?? 0);
  const currentPage = useBookStore((s) => s.currentPage);
  const goToPage = useBookStore((s) => s.goToPage);
  const [activeNode, setActiveNode] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeNode?.scrollIntoView({ block: 'nearest' });
  }, [activeNode, currentPage]);

  if (!doc) return null;

  return (
    <div className="flex flex-col gap-2 py-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <ThumbnailItem
          key={pageNumber}
          pageNumber={pageNumber}
          isActive={pageNumber === currentPage}
          onClick={() => goToPage(pageNumber)}
          registerActiveNode={pageNumber === currentPage ? setActiveNode : undefined}
        />
      ))}
    </div>
  );
}

function ThumbnailItem({
  pageNumber,
  isActive,
  onClick,
  registerActiveNode,
}: {
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
  registerActiveNode?: (node: HTMLButtonElement | null) => void;
}) {
  const doc = useBookStore((s) => s.doc);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const wrapperRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !doc || dataUrl) return;
    let cancelled = false;
    renderPageToDataUrl(doc, pageNumber, { scale: 0.15, maxDimension: 300 }).then((res) => {
      if (!cancelled) setDataUrl(res.dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [inView, doc, pageNumber, dataUrl]);

  return (
    <button
      ref={(node) => {
        wrapperRef.current = node;
        registerActiveNode?.(node);
      }}
      onClick={onClick}
      className={classNames(
        'w-full rounded-lg border-2 p-1 transition-colors flex flex-col items-center gap-1',
        isActive ? 'border-accent' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700',
      )}
    >
      <div className="w-full aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded overflow-hidden flex items-center justify-center">
        {dataUrl ? (
          <img src={dataUrl} alt={`Page ${pageNumber} thumbnail`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        )}
      </div>
      <span className="text-[10px] text-slate-400">{pageNumber}</span>
    </button>
  );
}
