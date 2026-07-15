import { Component, PropsWithChildren, ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // In a full build this would report to a local log surface; kept minimal here.
    console.error('Turnly crashed:', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
              {this.state.error.message || 'An unexpected error occurred while displaying this page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
