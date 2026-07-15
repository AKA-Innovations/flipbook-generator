import { motion } from 'framer-motion';

interface Props {
  value: number; // 0-100
  label?: string;
}

export function ProgressBar({ value, label }: Props) {
  return (
    <div className="w-full">
      {label && <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p>}
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in w-full h-full rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
    </div>
  );
}
