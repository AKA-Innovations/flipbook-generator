import { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/utils/format';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // required for accessibility (aria-label + tooltip)
  active?: boolean;
}

export function IconButton({ label, active, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={classNames(
        'inline-flex items-center justify-center h-9 w-9 rounded-lg',
        'text-slate-600 dark:text-slate-300',
        'hover:bg-slate-900/5 dark:hover:bg-white/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        active && 'bg-accent/10 text-accent',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
