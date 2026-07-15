import { useBookStore } from '@/store/bookStore';
import { FiLink, FiVideo, FiTrash2, FiType, FiPenTool, FiEdit } from 'react-icons/fi';

export function SidebarEditor() {
  const editMode = useBookStore((s) => s.editMode);
  const setEditMode = useBookStore((s) => s.setEditMode);
  const currentPage = useBookStore((s) => s.currentPage);
  const overlays = useBookStore((s) => s.overlays[currentPage] || []);
  const removeOverlay = useBookStore((s) => s.removeOverlay);
  
  const activeTool = useBookStore((s) => s.activeTool);
  const setActiveTool = useBookStore((s) => s.setActiveTool);
  const activeColor = useBookStore((s) => s.activeColor);
  const setActiveColor = useBookStore((s) => s.setActiveColor);

  return (
    <div className="flex flex-col gap-4 text-slate-800 dark:text-slate-200 mt-2">
      {/* Toggle edit mode */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
        <div className="flex flex-col">
          <span className="text-xs font-semibold">Overlay Edit Mode</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Draw boxes on pages</span>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${editMode ? 'bg-accent' : 'bg-slate-350 dark:bg-slate-750'}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${editMode ? 'translate-x-4.5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {editMode && (
        <div className="flex flex-col gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Active Tool</span>
          <div className="grid grid-cols-5 gap-1">
            {[
              { tool: 'link', icon: <FiLink size={13} />, label: 'Link' },
              { tool: 'video', icon: <FiVideo size={13} />, label: 'Video' },
              { tool: 'highlight', icon: <FiEdit size={13} />, label: 'Highlight' },
              { tool: 'pencil', icon: <FiPenTool size={13} />, label: 'Pencil' },
              { tool: 'textbox', icon: <FiType size={13} />, label: 'Text' },
            ].map((t) => (
              <button
                key={t.tool}
                onClick={() => setActiveTool(t.tool as 'link' | 'video' | 'highlight' | 'pencil' | 'textbox')}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all text-xs ${activeTool === t.tool ? 'border-accent bg-accent/15 text-accent font-semibold' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>
          
          {/* Color picker for Highlight & Pencil */}
          {(activeTool === 'highlight' || activeTool === 'pencil') && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <span className="text-[10px] text-slate-400">Color:</span>
              <div className="flex gap-1.5">
                {['#eab308', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className="h-4 w-4 rounded-full border border-black/10 dark:border-white/10 ring-offset-1 dark:ring-offset-slate-900"
                    style={{
                      backgroundColor: color,
                      boxShadow: activeColor === color ? `0 0 0 1.5px ${color}` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-slate-400 leading-relaxed px-1">
        To add annotations: enable edit mode, select a tool, then draw directly on the page.
      </div>

      {/* List of active page overlays */}
      <div className="mt-2">
        <h4 className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-2 px-1">
          Page {currentPage} Overlays ({overlays.length})
        </h4>

        {overlays.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No overlays on this page
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {overlays.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/30 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  {item.type === 'link' ? (
                    <FiLink className="text-blue-500 flex-shrink-0" />
                  ) : (
                    <FiVideo className="text-red-500 flex-shrink-0" />
                  )}
                  <span className="truncate text-[11px] font-mono text-slate-500 dark:text-slate-400" title={item.value}>
                    {item.value}
                  </span>
                </div>
                <button
                  onClick={() => removeOverlay(currentPage, item.id)}
                  className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-red-550 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove overlay"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
