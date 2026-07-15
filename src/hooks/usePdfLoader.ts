import { useCallback } from 'react';
import { useBookStore } from '@/store/bookStore';
import { extractMetadata, extractTableOfContents, loadPdfDocument, PdfLoadError, renderPageToDataUrl } from '@/services/pdfService';
import { validatePdfFile } from '@/utils/validation';
import { saveProjectFile } from '@/services/dbService';
import { useAppStore } from '@/store/appStore';
import { uid } from '@/utils/format';

export function usePdfLoader() {
  const setDoc = useBookStore((s) => s.setDoc);
  const setMetadata = useBookStore((s) => s.setMetadata);
  const setToc = useBookStore((s) => s.setToc);
  const setProgress = useBookStore((s) => s.setProgress);

  const loadFile = useCallback(
    async (file: File, existingProjectId?: string) => {
      setProgress({ stage: 'validating', loadedPages: 0, totalPages: 0, message: undefined });
      const validation = validatePdfFile(file);
      if (!validation.valid) {
        setProgress({ stage: 'error', message: validation.error });
        return { ok: false as const, error: validation.error! };
      }

      try {
        setProgress({ stage: 'reading' });
        const doc = await loadPdfDocument(file, async () => {
          // Password handling: in a full build this would open a modal and
          // await user input. For now we surface it as an error state so the
          // UI can prompt clearly rather than hang silently.
          throw new PdfLoadError('This PDF is password protected.', 'password');
        });

        setProgress({ stage: 'parsing', totalPages: doc.numPages });
        const metadata = await extractMetadata(doc, file);
        const toc = await extractTableOfContents(doc);

        // Save project file to IndexedDB
        const projectId = existingProjectId || uid();
        await saveProjectFile(projectId, file);

        // Only register a new project if we don't have an existing ID
        if (!existingProjectId) {
          // Generate thumbnail
          let thumbnailDataUrl: string | undefined;
          try {
            const thumb = await renderPageToDataUrl(doc, 1, { scale: 0.15, maxDimension: 300 });
            thumbnailDataUrl = thumb.dataUrl;
          } catch (e) {
            console.error('Failed to generate project thumbnail', e);
          }

          // Add to recent projects in appStore
          useAppStore.getState().addRecentProject({
            id: projectId,
            fileName: file.name,
            pageCount: doc.numPages,
            savedAt: Date.now(),
            thumbnailDataUrl,
          });
        }
        useAppStore.getState().setActiveProjectId(projectId);

        // Load project customizations if it's an existing project
        if (existingProjectId) {
          const project = useAppStore.getState().recentProjects.find(p => p.id === existingProjectId);
          if (project) {
            if (project.overlays) useBookStore.getState().setOverlays(project.overlays);
            if (project.logoDataUrl) useBookStore.getState().setLogoDataUrl(project.logoDataUrl);
            if (project.footerText) useBookStore.getState().setFooterText(project.footerText);
            if (project.viewMode) useBookStore.getState().updateSettings({ viewMode: project.viewMode });
            if (project.accentColor) useBookStore.getState().updateSettings({ accentColor: project.accentColor });
          }
        }

        setDoc(doc, file);
        setMetadata(metadata);
        setToc(toc);
        setProgress({ stage: 'ready', loadedPages: doc.numPages, totalPages: doc.numPages });

        return { ok: true as const, metadata };
      } catch (err) {
        const message =
          err instanceof PdfLoadError
            ? err.message
            : 'Something went wrong while reading this PDF.';
        setProgress({ stage: 'error', message });
        return { ok: false as const, error: message };
      }
    },
    [setDoc, setMetadata, setToc, setProgress],
  );

  return { loadFile };
}
