import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBookStore } from '@/store/bookStore';
import { ThumbnailList } from '@/components/sidebar/ThumbnailList';
import { TocTree } from '@/components/sidebar/TocTree';
import { SidebarEditor } from '@/components/sidebar/SidebarEditor';
import { classNames } from '@/utils/format';

export function ViewerSidebar() {
  const sidebarOpen = useBookStore((s) => s.sidebarOpen);
  const toc = useBookStore((s) => s.toc);
  const [tab, setTab] = useState<'thumbnails' | 'toc' | 'editor'>('thumbnails');

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full overflow-hidden border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md"
        >
          <div className="w-[260px] h-full flex flex-col">
            <div className="flex p-2 gap-1 border-b border-slate-100 dark:border-slate-800/40">
              {([toc.length ? 'toc' : null, 'thumbnails', 'editor'].filter(Boolean) as ('thumbnails' | 'toc' | 'editor')[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={classNames(
                    'flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-colors capitalize',
                    tab === t
                      ? 'bg-accent/10 text-accent font-bold'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                  )}
                >
                  {t === 'toc' ? 'contents' : t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {tab === 'toc' ? (
                <TocTree />
              ) : tab === 'thumbnails' ? (
                <ThumbnailList />
              ) : (
                <SidebarEditor />
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
