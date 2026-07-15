import { useState } from 'react';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { useBookStore } from '@/store/bookStore';
import type { TocEntry } from '@/types';

export function TocTree() {
  const toc = useBookStore((s) => s.toc);

  if (toc.length === 0) {
    return <p className="text-xs text-slate-400 p-3">No table of contents found in this PDF.</p>;
  }

  return (
    <div className="py-2">
      {toc.map((entry, i) => (
        <TocNode key={i} entry={entry} depth={0} />
      ))}
    </div>
  );
}

function TocNode({ entry, depth }: { entry: TocEntry; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const goToPage = useBookStore((s) => s.goToPage);
  const hasChildren = entry.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 rounded-lg px-1 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => {
          if (entry.pageIndex !== null) goToPage(entry.pageIndex + 1);
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="text-slate-400"
          >
            {expanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate">{entry.title}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {entry.children.map((child, i) => (
            <TocNode key={i} entry={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
