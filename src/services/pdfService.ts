import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import type { BookMetadata, TocEntry } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export class PdfLoadError extends Error {
  constructor(
    message: string,
    public code: 'password' | 'corrupted' | 'unsupported' | 'unknown',
  ) {
    super(message);
    this.name = 'PdfLoadError';
  }
}

/**
 * Loads a PDF File/Blob into a pdf.js document proxy.
 * Throws PdfLoadError with a specific `code` for known failure modes so the
 * UI can show an actionable message instead of a generic error toast.
 */
export async function loadPdfDocument(
  file: File,
  onPassword?: (attempt: number) => Promise<string>,
): Promise<PDFDocumentProxy> {
  const data = await file.arrayBuffer();
  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      // Keep memory bounded for huge documents - pdf.js streams pages lazily
      // regardless, but this caps how much it keeps resident.
      isEvalSupported: false,
    });

    if (onPassword) {
      loadingTask.onPassword = (callback: (password: string) => void, reason: number) => {
        onPassword(reason).then((pw) => callback(pw));
      };
    }

    const doc = await loadingTask.promise;
    return doc;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/password/i.test(message)) {
      throw new PdfLoadError('This PDF is password protected.', 'password');
    }
    if (/invalid pdf structure|corrupt/i.test(message)) {
      throw new PdfLoadError('This file appears to be corrupted or is not a valid PDF.', 'corrupted');
    }
    throw new PdfLoadError('Could not load this PDF in your browser.', 'unknown');
  }
}

export async function extractMetadata(
  doc: PDFDocumentProxy,
  file: File,
): Promise<BookMetadata> {
  const meta = await doc.getMetadata().catch(() => null);
  const info = (meta?.info ?? {}) as Record<string, string>;
  return {
    title: info.Title || file.name.replace(/\.pdf$/i, ''),
    author: info.Author || undefined,
    pageCount: doc.numPages,
    fileSizeBytes: file.size,
    fileName: file.name,
    createdAt: Date.now(),
  };
}

/** Recursively converts pdf.js's outline format into our TocEntry tree. */
export async function extractTableOfContents(doc: PDFDocumentProxy): Promise<TocEntry[]> {
  const outline = await doc.getOutline().catch(() => null);
  if (!outline) return [];

  const resolveDest = async (dest: unknown): Promise<number | null> => {
    try {
      let destArray = dest;
      if (typeof dest === 'string') {
        destArray = await doc.getDestination(dest);
      }
      if (!Array.isArray(destArray)) return null;
      const ref = destArray[0];
      const pageIndex = await doc.getPageIndex(ref);
      return pageIndex;
    } catch {
      return null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = async (items: any[]): Promise<TocEntry[]> => {
    const out: TocEntry[] = [];
    for (const item of items) {
      const pageIndex = await resolveDest(item.dest);
      out.push({
        title: item.title || 'Untitled',
        pageIndex,
        children: item.items?.length ? await walk(item.items) : [],
      });
    }
    return out;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return walk(outline as any[]);
}

interface RenderOptions {
  scale: number;
  maxDimension?: number; // clamp huge pages so retina renders don't blow memory
}

/** Renders a single page to a data URL at the given scale (retina-aware). */
export async function renderPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  { scale, maxDimension = 3000 }: RenderOptions,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page: PDFPageProxy = await doc.getPage(pageNumber);
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  let effectiveScale = scale * devicePixelRatio;

  const unclamped = page.getViewport({ scale: effectiveScale });
  if (Math.max(unclamped.width, unclamped.height) > maxDimension) {
    effectiveScale *= maxDimension / Math.max(unclamped.width, unclamped.height);
  }
  const viewport = page.getViewport({ scale: effectiveScale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  await page.render({ canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  page.cleanup();

  return { dataUrl, width: canvas.width, height: canvas.height };
}

/** Simple text search across the whole document. Runs sequentially and lazily. */
export async function* searchDocument(
  doc: PDFDocumentProxy,
  query: string,
): AsyncGenerator<{ pageNumber: number; snippet: string }> {
  const needle = query.trim().toLowerCase();
  if (!needle) return;

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = textContent.items.map((it: any) => it.str).join(' ');
    const lower = pageText.toLowerCase();
    let idx = lower.indexOf(needle);
    while (idx !== -1) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(pageText.length, idx + needle.length + 30);
      yield { pageNumber: i, snippet: `…${pageText.slice(start, end)}…` };
      idx = lower.indexOf(needle, idx + needle.length);
    }
    page.cleanup();
  }
}
