import { HTMLAttributes, PropsWithChildren } from 'react';
import { classNames } from '@/utils/format';

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function GlassCard({ children, className, ...rest }: Props) {
  return (
    <div
      className={classNames(
        'rounded-xl2 border border-white/20 dark:border-white/10',
        'bg-white/70 dark:bg-slate-900/60 backdrop-blur-md',
        'shadow-glass',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
