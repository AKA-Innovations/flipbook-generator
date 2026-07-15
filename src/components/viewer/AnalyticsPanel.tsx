import { useAppStore } from '@/store/appStore';
import { FiX, FiActivity, FiClock, FiEye, FiDownload, FiExternalLink } from 'react-icons/fi';
import { GlassCard } from '@/components/common/GlassCard';

interface Props {
  onClose: () => void;
}

export function AnalyticsPanel({ onClose }: Props) {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const project = useAppStore((s) => s.recentProjects.find((p) => p.id === activeProjectId));

  if (!project) return null;

  const analytics = project.analytics || {};
  const views = analytics.viewsPerPage || {};
  const durations = analytics.durationPerPageSeconds || {};
  const linkClicks = analytics.linkClicks || {};

  // Compute summary stats
  const totalViews = Object.values(views).reduce((a, b) => a + b, 0);
  const totalDurationSecs = Object.values(durations).reduce((a, b) => a + b, 0);
  
  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const averageDuration = totalViews > 0 ? Math.round(totalDurationSecs / totalViews) : 0;

  // Compile page list sorted by most views
  const pageStats = Array.from({ length: project.pageCount }, (_, i) => {
    const pageNum = i + 1;
    return {
      pageNum,
      views: views[pageNum] || 0,
      duration: durations[pageNum] || 0,
    };
  }).sort((a, b) => b.views - a.views);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Page Number,Views,Total Time Read (seconds)\n';
    
    // Add page data
    pageStats.forEach((p) => {
      csvContent += `${p.pageNum},${p.views},${p.duration}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_report_${project.id.slice(0, 6)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-950 dark:text-slate-50">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FiActivity className="text-accent text-xl" />
            <h3 className="font-bold text-lg">Document Analytics</h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <FiEye className="text-accent text-lg mb-2" />
              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Total Views</span>
              <span className="text-2xl font-bold mt-1">{totalViews}</span>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <FiClock className="text-emerald-500 text-lg mb-2" />
              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Total Time</span>
              <span className="text-2xl font-bold mt-1">{formatDuration(totalDurationSecs)}</span>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <FiActivity className="text-indigo-500 text-lg mb-2" />
              <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Avg. Time/View</span>
              <span className="text-2xl font-bold mt-1">{averageDuration}s</span>
            </GlassCard>
          </div>

          {/* Detailed Page stats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase text-slate-400 font-bold tracking-wider">Engagement by Page</h4>
              <button
                onClick={handleExportCSV}
                className="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1.5"
              >
                <FiDownload size={13} /> Export CSV
              </button>
            </div>
            
            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                    <th className="px-4 py-2">Page</th>
                    <th className="px-4 py-2 text-right">Views</th>
                    <th className="px-4 py-2 text-right">Total Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {pageStats.map((p) => (
                    <tr key={p.pageNum} className="hover:bg-slate-200/20 dark:hover:bg-slate-800/10">
                      <td className="px-4 py-2">Page {p.pageNum}</td>
                      <td className="px-4 py-2 text-right">{p.views}</td>
                      <td className="px-4 py-2 text-right">{formatDuration(p.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clicked links */}
          {Object.keys(linkClicks).length > 0 && (
            <div>
              <h4 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-3">Outgoing Link Clicks</h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-40 overflow-y-auto">
                {Object.entries(linkClicks).map(([url, count]) => (
                  <div key={url} className="px-4 py-2 flex items-center justify-between text-xs font-mono">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-1 max-w-[80%] truncate"
                    >
                      <FiExternalLink size={10} className="flex-shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{count} click{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
