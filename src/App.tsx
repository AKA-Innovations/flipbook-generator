import { useEffect, useState } from 'react';
import { HomePage } from '@/pages/HomePage';
import { TryPage } from '@/pages/TryPage';
import { ViewerPage } from '@/pages/ViewerPage';
import { useAppStore } from '@/store/appStore';
import { useBookStore } from '@/store/bookStore';
import { usePdfLoader } from '@/hooks/usePdfLoader';
import { getProjectFile } from '@/services/dbService';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

type Route = 'home' | 'try' | 'viewer';

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [isRestoring, setIsRestoring] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const accentColor = useBookStore((s) => s.settings.accentColor);
  const { loadFile } = usePdfLoader();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  // Restore active project on reload
  useEffect(() => {
    if (!activeProjectId) return;

    let cancelled = false;
    const restoreSession = async () => {
      setIsRestoring(true);
      try {
        const file = await getProjectFile(activeProjectId);
        if (file && !cancelled) {
          const res = await loadFile(file, activeProjectId);
          if (res.ok && !cancelled) {
            setRoute('viewer');
          } else {
            setActiveProjectId(null);
          }
        } else {
          setActiveProjectId(null);
        }
      } catch (e) {
        console.error('Failed to restore active project', e);
        setActiveProjectId(null);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId]);

  if (isRestoring) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="h-10 w-10 rounded-full border-4 border-accent/25 border-t-accent animate-spin mb-4" />
        <span className="text-sm font-medium">Restoring Turnly…</span>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {route === 'home' && (
        <HomePage onTry={() => setRoute('try')} />
      )}
      {route === 'try' && (
        <TryPage onLoaded={() => setRoute('viewer')} onBack={() => setRoute('home')} />
      )}
      {route === 'viewer' && (
        <ViewerPage onBack={() => setRoute('try')} />
      )}
    </ErrorBoundary>
  );
}
