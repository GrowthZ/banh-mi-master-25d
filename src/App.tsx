import { Component, type ReactNode } from 'react';
import GameStageController from './components/GameStageController';

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('[BanhMi] Unhandled error', error);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full items-center justify-center p-6 bg-amber-50">
          <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-amber-900/20">
            <div className="text-5xl">🥖💥</div>
            <h2 className="mt-2 text-xl font-black text-amber-950">Quầy bánh gặp sự cố</h2>
            <p className="mt-2 text-sm text-amber-900/80">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-2xl bg-orange-600 px-6 py-2.5 font-bold text-white shadow-lg hover:bg-orange-700 active:scale-95"
            >
              Tải lại quầy
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <div className="h-full w-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#fffbf2_0%,_#fcedd4_45%,_#ebd1a7_100%)] text-amber-950">
        <GameStageController />
      </div>
    </AppErrorBoundary>
  );
}
