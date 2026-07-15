import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFile } from 'react-icons/fi';
import { usePdfLoader } from '@/hooks/usePdfLoader';
import { useBookStore } from '@/store/bookStore';
import { ProgressBar } from '@/components/common/ProgressBar';
import { MAX_FILE_SIZE_BYTES } from '@/utils/validation';
import { formatFileSize } from '@/utils/format';

interface Props {
  onLoaded: () => void;
}

export function UploadZone({ onLoaded }: Props) {
  const { loadFile } = usePdfLoader();
  const progress = useBookStore((s) => s.progress);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null);
      const result = await loadFile(file);
      if (result.ok) {
        onLoaded();
      } else {
        setLocalError(result.error);
      }
    },
    [loadFile, onLoaded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const isBusy = progress.stage !== 'idle' && progress.stage !== 'error' && progress.stage !== 'ready';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.005 }}
        className={`relative cursor-pointer rounded-xl2 border-2 border-dashed p-14 text-center transition-colors
          ${isDragging ? 'border-accent bg-accent/5' : 'border-slate-300 dark:border-slate-700 hover:border-accent/60'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            {isBusy ? <FiFile size={28} /> : <FiUploadCloud size={28} />}
          </div>
          <div>
            <p className="text-lg font-medium">Drop your PDF here, or click to browse</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              PDF only · up to {formatFileSize(MAX_FILE_SIZE_BYTES)} · handles 1000+ page documents
            </p>
          </div>
        </div>
      </motion.div>

      {isBusy && (
        <div className="mt-6">
          <ProgressBar
            value={
              progress.stage === 'validating'
                ? 10
                : progress.stage === 'reading'
                  ? 30
                  : progress.stage === 'parsing'
                    ? 70
                    : 90
            }
            label={stageLabel(progress.stage)}
          />
        </div>
      )}

      {localError && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {localError}
        </div>
      )}
    </div>
  );
}

function stageLabel(stage: string): string {
  switch (stage) {
    case 'validating':
      return 'Checking file…';
    case 'reading':
      return 'Reading PDF…';
    case 'parsing':
      return 'Parsing pages and outline…';
    case 'rendering-preview':
      return 'Rendering preview…';
    default:
      return 'Working…';
  }
}
