import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPageToDataUrl } from '@/services/pdfService';
import { buildExportHtml } from '@/templates/exportHtml';
import { buildExportCss } from '@/templates/exportStyle';
import { buildExportAppJs } from '@/templates/exportApp';
import type { BookMetadata, FlipbookSettings } from '@/types';
import pageFlipCode from 'page-flip/dist/js/page-flip.browser.js?raw';

import { useBookStore } from '@/store/bookStore';

export interface ExportProgress {
  renderedPages: number;
  totalPages: number;
  stage: 'rendering' | 'zipping' | 'done';
}

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] ?? '';
}

/**
 * Builds a fully offline, self-contained flipbook website and triggers a ZIP
 * download. Every page is rasterized once at export time (rather than
 * shipping pdf.js + the source PDF to the reader), which is what makes the
 * exported bundle work with zero build step and no server.
 */
export async function exportFlipbook(
  doc: PDFDocumentProxy,
  metadata: BookMetadata,
  settings: FlipbookSettings,
  onProgress?: (p: ExportProgress) => void,
  // Cap export resolution so a 1500-page book doesn't produce a multi-GB zip.
  exportScale = 1.2,
): Promise<void> {
  const zip = new JSZip();
  const pagesFolder = zip.folder('js/pages')!;
  const searchIndex: { page: number; text: string }[] = [];
  const manifestPages: { src: string }[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const { dataUrl } = await renderPageToDataUrl(doc, i, { scale: exportScale, maxDimension: 2200 });
    const fileName = `page-${String(i).padStart(4, '0')}.jpg`;
    pagesFolder.file(fileName, dataUrlToBase64(dataUrl), { base64: true });
    manifestPages.push({ src: `js/pages/${fileName}` });

    try {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = textContent.items.map((it: any) => it.str).join(' ').slice(0, 4000);
      searchIndex.push({ page: i - 1, text });
      page.cleanup();
    } catch {
      // Text extraction failing shouldn't block export - just skip search for that page.
    }

    onProgress?.({ renderedPages: i, totalPages: doc.numPages, stage: 'rendering' });
  }

  onProgress?.({ renderedPages: doc.numPages, totalPages: doc.numPages, stage: 'zipping' });

  const { overlays, logoDataUrl, footerText } = useBookStore.getState();

  const manifest = {
    title: metadata.title,
    pages: manifestPages,
    searchIndex,
    defaultDark: settings.theme === 'dark',
    settings: {
      viewMode: settings.viewMode,
      showCover: settings.showCover,
      hardCover: settings.hardCover,
      shadowIntensity: settings.shadowIntensity,
      animationSpeedMs: settings.animationSpeedMs,
    },
    overlays,
    logoDataUrl,
    footerText,
  };

  zip.file('index.html', buildExportHtml(metadata.title));
  zip.file('css/style.css', buildExportCss(settings.accentColor));
  zip.file('js/page-flip.js', pageFlipCode);
  zip.file('js/app.js', buildExportAppJs());
  zip.file('js/manifest.js', `window.FLIPBOOK_MANIFEST = ${JSON.stringify(manifest)};`);
  zip.file(
    'manifest.json',
    JSON.stringify({
      name: metadata.title,
      short_name: metadata.title.slice(0, 20),
      start_url: './index.html',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#0f172a',
    }),
  );
  zip.file(
    'sw.js',
    `const CACHE = 'flipbook-cache-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './css/style.css', './js/page-flip.js', './js/app.js', './js/manifest.js'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
`,
  );
  zip.file(
    'README.txt',
    `${metadata.title} — exported flipbook

Open index.html directly in any modern browser, or upload this whole folder
to any static host (Netlify, GitHub Pages, S3, etc). No build step, no
server-side code, and no external dependencies are required — everything
this page needs ships inside this folder.
`,
  );

  onProgress?.({ renderedPages: doc.numPages, totalPages: doc.numPages, stage: 'zipping' });
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  onProgress?.({ renderedPages: doc.numPages, totalPages: doc.numPages, stage: 'done' });

  const safeName = metadata.title.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'flipbook';
  saveAs(blob, `${safeName}.zip`);
}
