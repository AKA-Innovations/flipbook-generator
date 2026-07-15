import { useCallback, useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useBookStore } from '@/store/bookStore';
import { useAppStore } from '@/store/appStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { ViewerToolbar } from '@/components/toolbar/ViewerToolbar';
import { ViewerSidebar } from '@/components/sidebar/ViewerSidebar';
import { FlipbookViewer } from '@/components/viewer/FlipbookViewer';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ExportModal } from '@/components/viewer/ExportModal';
import { exportFlipbook, type ExportProgress } from '@/services/exportService';

interface Props {
  onBack: () => void;
}

export function ViewerPage({ onBack }: Props) {
  useKeyboardShortcuts();
  useAnalyticsTracker();
  const doc = useBookStore((s) => s.doc);
  const metadata = useBookStore((s) => s.metadata);
  const settings = useBookStore((s) => s.settings);
  const reset = useBookStore((s) => s.reset);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  // Synchronize changes to appStore (which persists to LocalStorage)
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const overlays = useBookStore((s) => s.overlays);
  const logoDataUrl = useBookStore((s) => s.logoDataUrl);
  const footerText = useBookStore((s) => s.footerText);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    if (!activeProjectId) return;
    useAppStore.setState((s) => ({
      recentProjects: s.recentProjects.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          overlays,
          logoDataUrl: logoDataUrl || undefined,
          footerText: footerText || undefined,
          theme,
          viewMode: settings.viewMode,
          accentColor: settings.accentColor,
        };
      }),
    }));
  }, [activeProjectId, overlays, logoDataUrl, footerText, theme, settings.viewMode, settings.accentColor]);

  const handleDownload = useCallback(async () => {
    if (!doc || !metadata) return;
    setExportProgress({ renderedPages: 0, totalPages: metadata.pageCount, stage: 'rendering' });
    try {
      await exportFlipbook(doc, metadata, settings, setExportProgress);
    } finally {
      setTimeout(() => setExportProgress(null), 400);
    }
  }, [doc, metadata, settings]);

  const handleBack = () => {
    reset();
    useAppStore.getState().setActiveProjectId(null);
    onBack();
  };

  if (!doc || !metadata) return null;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-800 relative z-20 bg-white dark:bg-slate-900">
        <button
          onClick={handleBack}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-900/5 dark:hover:bg-white/10"
          aria-label="Back to home"
        >
          <FiArrowLeft />
        </button>
        {logoDataUrl ? (
          <img src={logoDataUrl} alt="Logo" className="h-6 max-w-[120px] object-contain" />
        ) : (
          <span className="text-sm font-medium truncate">{metadata.title}</span>
        )}
        <span className="ml-auto" />
        <ViewerToolbar onDownload={handleDownload} isExporting={!!exportProgress} />
      </div>

      <div className="flex-1 flex min-h-0">
        <ViewerSidebar />
        <div className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-950/40">
          <FlipbookViewer />
        </div>
      </div>

      <SettingsPanel />
      <ExportModal progress={exportProgress} />
    </div>
  );
}
