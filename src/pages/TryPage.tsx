import { useEffect } from 'react';
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import { UploadZone } from '@/components/upload/UploadZone';
import { RecentProjects } from '@/components/upload/RecentProjects';

interface Props {
  onLoaded: () => void;
  onBack: () => void;
}

export function TryPage({ onLoaded, onBack }: Props) {
  useEffect(() => {
    document.title = "Upload & Library Dashboard | Turnly";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Upload your PDF document to convert it to an interactive 3D publication. Manage recent publications in your 3D wooden bookshelf library.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <header className="w-full flex items-center gap-3 px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={onBack}
          className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Back to home"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <div className="flex items-center gap-2 font-semibold text-lg">
          <FiBookOpen className="text-accent text-xl" />
          <span>Turnly Dashboard</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 py-12 max-w-5xl w-full mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Create & Manage Publications</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Convert new PDFs or open your active work files directly from the bookshelf.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
            <UploadZone onLoaded={onLoaded} />
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
            <RecentProjects onLoaded={onLoaded} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white dark:bg-slate-900">
        Designed and maintained by{' '}
        <a
          href="https://akainnovations.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium transition-all"
        >
          AKA Innovations
        </a>
      </footer>
    </div>
  );
}
