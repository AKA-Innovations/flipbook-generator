import { FiFileText, FiTrash2, FiClock, FiLayers } from 'react-icons/fi';
import { useAppStore } from '@/store/appStore';
import { getProjectFile, clearAllProjectFiles, deleteProjectFile } from '@/services/dbService';
import { usePdfLoader } from '@/hooks/usePdfLoader';

interface Props {
  onLoaded: () => void;
}

export function RecentProjects({ onLoaded }: Props) {
  const recentProjects = useAppStore((s) => s.recentProjects);
  const clearRecentProjects = useAppStore((s) => s.clearRecentProjects);
  const { loadFile } = usePdfLoader();

  const handleOpenProject = async (id: string) => {
    try {
      const file = await getProjectFile(id);
      if (file) {
        const result = await loadFile(file, id);
        if (result.ok) {
          useAppStore.getState().setActiveProjectId(id);
          onLoaded();
        }
      } else {
        alert('Could not find the local PDF file for this project. It may have been cleared.');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading this project.');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      // Remove from appStore
      useAppStore.setState((s) => ({
        recentProjects: s.recentProjects.filter((p) => p.id !== id),
      }));
      // Remove from IndexedDB
      await deleteProjectFile(id);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all recent projects?')) {
      clearRecentProjects();
      await clearAllProjectFiles();
    }
  };

  if (recentProjects.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Your Local Library</h3>
          <p className="text-xs text-slate-400 mt-1">Saved securely in browser-local IndexedDB storage</p>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 text-red-550 dark:text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center gap-1.5"
        >
          <FiTrash2 size={13} /> Clear Library
        </button>
      </div>

      {/* Bookshelf Layout */}
      <div className="relative pb-10">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-16 pt-8 pb-4 px-6 bg-slate-900/5 dark:bg-white/[0.02] rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
          {recentProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenProject(p.id)}
              className="group relative cursor-pointer flex flex-col items-center select-none"
              style={{ perspective: '800px' }}
            >
              {/* Delete Hotspot */}
              <button
                onClick={(e) => handleDeleteProject(p.id, e)}
                className="absolute -top-4 -right-4 z-20 h-7 w-7 rounded-full bg-red-650 hover:bg-red-750 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200"
                title="Delete project"
              >
                <FiTrash2 size={12} />
              </button>

              {/* 3D Book Object */}
              <div 
                className="relative w-[110px] h-[155px] transition-transform duration-500 ease-out group-hover:rotate-y-[-18deg] group-hover:translate-x-[-6px] shadow-md group-hover:shadow-[12px_12px_20px_rgba(0,0,0,0.4)]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Cover */}
                <div className="absolute inset-0 w-full h-full bg-indigo-900 rounded-r-md overflow-hidden z-10 border-l border-indigo-700/40 flex flex-col justify-between">
                  {p.thumbnailDataUrl ? (
                    <img src={p.thumbnailDataUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-white/50">
                      <FiFileText size={28} />
                      <span className="text-[10px] mt-2 text-center truncate w-full">{p.fileName}</span>
                    </div>
                  )}
                  {/* Subtle Spine shadow on front cover */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-r from-black/30 to-transparent" />
                </div>

                {/* 3D Spine (Visible when rotated) */}
                <div 
                  className="absolute top-0 left-0 w-[16px] h-full bg-indigo-950 origin-left"
                  style={{
                    transform: 'rotateY(-90deg) translateX(-16px)',
                    boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.6)'
                  }}
                />
              </div>

              {/* Book Metadata details (appearing below) */}
              <div className="mt-4 text-center max-w-[120px]">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate w-full" title={p.fileName}>
                  {p.fileName}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <FiLayers size={10} />
                  <span>{p.pageCount} pages</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-450 mt-0.5">
                  <FiClock size={9} />
                  <span>{new Date(p.savedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Wooden Shelf Base */}
        <div className="absolute bottom-6 left-0 w-full h-4 bg-gradient-to-b from-[#bd8448] to-[#804e1c] rounded-lg shadow-[0_8px_12px_rgba(0,0,0,0.35)] border-b border-[#5e3711]" />
      </div>
    </div>
  );
}
