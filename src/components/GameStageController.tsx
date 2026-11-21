import { useEffect, useReducer, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { BANH_MI_RECIPES, INGREDIENT_MAP } from '../data/menuOrders';
import { SHIFT_DURATION_SEC, gameReducer, initialGameState, type GameState } from '../logic/gameState';
import AssemblyBoard25D, { INGREDIENT_HOTKEYS } from './AssemblyBoard25D';
import CustomerOrderHUD from './CustomerOrderHUD';

const BEST_KEY = 'banh-mi-master-best';

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="animate-pop w-full max-w-3xl rounded-[2rem] bg-white/90 p-8 shadow-2xl ring-1 ring-amber-900/10">
        <div className="text-center">
          <div className="text-6xl">🏮🥖🏮</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-amber-950 sm:text-5xl">Bánh Mì Master Việt Nam</h1>
          <p className="mt-2 text-amber-900/80">
            Đứng xe bánh mì vỉa hè Hà Nội trong {SHIFT_DURATION_SEC / 60} phút — nướng giòn, kẹp đúng nhân, giao thật nhanh để giữ combo!
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {BANH_MI_RECIPES.map((r) => (
            <div key={r.id} className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <div className="flex items-baseline justify-between">
                <span className="font-extrabold text-amber-950">{r.name}</span>
                <span className="text-xs font-bold text-amber-700">{r.basePoints}đ</span>
              </div>
              <div className="mt-1 text-xs text-amber-900/80">
                {r.requiredIngredients.map((id) => INGREDIENT_MAP[id].name).join(', ')}
                {(r.alternativeGroups ?? []).map((g) => `, ${g.label}`).join('')}
              </div>
            </div>
          ))}
        </div>
        <ol className="mt-5 space-y-1 text-sm text-amber-950">
          <li>1. Đặt vỏ bánh lên lò, lấy ra khi thanh nướng ở vùng <b className="text-green-700">Đạt chuẩn</b>.</li>
          <li>2. Bấm nguyên liệu theo order — món khách cần sẽ <b className="text-orange-700">nhấp nháy gợi ý</b> (bấm lại để bỏ). Phím tắt 1–0, -, =.</li>
          <li>3. <b>Giao bánh</b> (Enter) — đúng & nhanh được thưởng tốc độ + combo. <b>Làm lại</b> (R) để sửa sai.</li>
        </ol>
        <button
          type="button"
          onClick={onStart}
          autoFocus
          className="mx-auto mt-6 flex items-center gap-2 rounded-2xl bg-orange-600 px-8 py-4 text-xl font-black text-white shadow-xl transition hover:bg-orange-700 active:scale-95"
        >
          <Play size={24} /> Bắt đầu ca bán
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({ state, best, onRestart }: { state: GameState; best: number; onRestart: () => void }) {
  const { stats } = state;
  const isRecord = stats.score > 0 && stats.score > best;
  const accuracy = stats.served > 0 ? Math.round((stats.perfect / stats.served) * 100) : 0;
  const rank =
    stats.score >= 2500 ? 'Huyền thoại bánh mì 👑' : stats.score >= 1400 ? 'Đầu bếp lành nghề 🔥' : stats.score >= 500 ? 'Phụ bếp chăm chỉ 💪' : 'Tập sự đứng quầy 🌱';
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="animate-pop w-full max-w-xl rounded-[2rem] bg-white/90 p-8 text-center shadow-2xl ring-1 ring-amber-900/10">
        <div className="text-5xl">🏁</div>
        <h2 className="mt-2 text-3xl font-black text-amber-950">Hết ca bán!</h2>
        <p className="mt-1 font-semibold text-orange-700">{rank}</p>
        <div className="mt-4 text-6xl font-black tabular-nums text-amber-600">{stats.score}</div>
        <div className="text-sm text-amber-900/70">{isRecord ? '🎉 Kỷ lục mới!' : `Kỷ lục: ${best}`}</div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Bánh hoàn thành', stats.perfect],
            ['Combo cao nhất', `x${stats.maxCombo}`],
            ['Độ chính xác', `${accuracy}%`],
            ['Khách bỏ đi', stats.walkedOut],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <div className="text-2xl font-black text-amber-950">{value}</div>
              <div className="text-xs text-amber-900/70">{label}</div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onRestart}
          autoFocus
          className="mx-auto mt-6 flex items-center gap-2 rounded-2xl bg-orange-600 px-8 py-4 text-xl font-black text-white shadow-xl transition hover:bg-orange-700 active:scale-95"
        >
          <RotateCcw size={22} /> Chơi lại
        </button>
      </div>
    </div>
  );
}

export default function GameStageController() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const bestRef = useRef(readBest());

  // Vòng lặp game: chỉ chạy khi PLAYING, dọn sạch khi đổi phase/unmount.
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      dispatch({ type: 'TICK', dt });
    }, 50);
    return () => window.clearInterval(id);
  }, [state.phase]);

  // Lưu kỷ lục khi tổng kết
  const prevBest = useRef(bestRef.current);
  useEffect(() => {
    if (state.phase === 'SUMMARY') {
      prevBest.current = bestRef.current;
      if (state.stats.score > bestRef.current) {
        bestRef.current = state.stats.score;
        try {
          localStorage.setItem(BEST_KEY, String(state.stats.score));
        } catch {
          /* ignore */
        }
      }
    }
  }, [state.phase, state.stats.score]);

  // Phím tắt
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const ing = INGREDIENT_HOTKEYS[e.key];
      if (ing) {
        dispatch({ type: 'TOGGLE_INGREDIENT', id: ing });
      } else if (e.key === ' ') {
        e.preventDefault();
        dispatch(state.hasBread ? { type: 'TOGGLE_TOAST' } : { type: 'PLACE_BREAD' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        dispatch({ type: 'DELIVER' });
      } else if (e.key === 'r' || e.key === 'R') {
        dispatch({ type: 'RESET_SANDWICH' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, state.hasBread]);

  if (state.phase === 'IDLE') {
    return <StartScreen onStart={() => dispatch({ type: 'START' })} />;
  }
  if (state.phase === 'SUMMARY') {
    return <SummaryScreen state={state} best={Math.max(prevBest.current, 0)} onRestart={() => dispatch({ type: 'START' })} />;
  }

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-2 p-2 sm:p-3">
      <CustomerOrderHUD state={state} />
      <AssemblyBoard25D state={state} dispatch={dispatch} />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => dispatch({ type: 'END_SHIFT' })}
          className="text-xs font-semibold text-amber-900/60 underline hover:text-amber-900"
        >
          Kết thúc ca sớm
        </button>
      </div>
    </div>
  );
}
