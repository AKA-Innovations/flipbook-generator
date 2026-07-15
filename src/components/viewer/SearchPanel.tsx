import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useBookStore } from '@/store/bookStore';
import { searchDocument } from '@/services/pdfService';
import { GlassCard } from '@/components/common/GlassCard';
import type { SearchResult } from '@/types';

interface Props {
  onClose: () => void;
}

export function SearchPanel({ onClose }: Props) {
  const doc = useBookStore((s) => s.doc);
  const goToPage = useBookStore((s) => s.goToPage);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = async (q: string) => {
    setQuery(q);
    setResults([]);
    if (!doc || q.trim().length < 2) return;

    setIsSearching(true);
    let idx = 0;
    try {
      for await (const hit of searchDocument(doc, q)) {
        setResults((prev) => [...prev, { pageNumber: hit.pageNumber, snippet: hit.snippet, matchIndex: idx++ }]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <GlassCard className="w-80 p-3">
      <div className="flex items-center gap-2 mb-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Search this document…"
          className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <FiX />
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-2">
        {isSearching ? 'Searching…' : results.length > 0 ? `${results.length} matches` : query.length >= 2 ? 'No matches' : ''}
      </p>

      <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
        {results.map((r) => (
          <button
            key={`${r.pageNumber}-${r.matchIndex}`}
            onClick={() => goToPage(r.pageNumber)}
            className="text-left rounded-lg px-2 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="font-medium text-accent">Page {r.pageNumber}</span>
            <p className="text-slate-500 dark:text-slate-400 truncate">{r.snippet}</p>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
