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
        <div className="flex h-full items-center justify-center p-6">
          <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="text-5xl">🥖💥</div>
            <h2 className="mt-2 text-xl font-bold">Quầy bánh gặp sự cố</h2>
            <p className="mt-1 text-sm text-stone-600">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-orange-600 px-4 py-2 font-bold text-white"
            >
              Tải lại
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
      <div className="h-full overflow-auto bg-[radial-gradient(circle_at_top,#fff7e6,#fde2b8_55%,#f4c58a)]">
        <GameStageController />
      </div>
    </AppErrorBoundary>
  );
}
