import { ProgressBar } from '@/components/common/ProgressBar';
import { GlassCard } from '@/components/common/GlassCard';
import type { ExportProgress } from '@/services/exportService';

interface Props {
  progress: ExportProgress | null;
}

export function ExportModal({ progress }: Props) {
  if (!progress || progress.stage === 'done') return null;

  const pct = progress.totalPages ? (progress.renderedPages / progress.totalPages) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <GlassCard className="w-96 p-6">
        <h3 className="font-semibold mb-1">Building Turnly publication…</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {progress.stage === 'rendering'
            ? `Rendering page ${progress.renderedPages} of ${progress.totalPages}`
            : 'Packaging into a ZIP…'}
        </p>
        <ProgressBar value={progress.stage === 'zipping' ? 100 : pct} />
      </GlassCard>
    </div>
  );
}
