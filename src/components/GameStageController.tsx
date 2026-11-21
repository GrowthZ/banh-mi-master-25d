import { useEffect, useReducer, useRef, useState } from 'react';
import {
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Dice5,
  Eye,
  EyeOff,
  Flame,
  Music,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { BANH_MI_RECIPES, INGREDIENT_MAP } from '../data/menuOrders';
import {
  gameReducer,
  initialGameState,
  type GameAction,
  type GameState,
} from '../logic/gameState';
import type { DifficultyPreset, DifficultySettings } from '../types/game';
import {
  isBgmEnabled,
  setBgmEnabled,
  startCheerfulBgm,
  stopCheerfulBgm,
} from '../utils/audioFeedback';
import AssemblyBoard25D, { INGREDIENT_HOTKEYS } from './AssemblyBoard25D';
import CustomerOrderHUD from './CustomerOrderHUD';

const BEST_KEY = 'banh-mi-viet-nam-best';

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function StartScreen({
  difficulty,
  dispatch,
  onStart,
}: {
  difficulty: DifficultySettings;
  dispatch: (a: GameAction) => void;
  onStart: () => void;
}) {
  const [showCustom, setShowCustom] = useState(false);

  const presets: Array<{
    id: DifficultyPreset;
    title: string;
    badge: string;
    desc: string;
  }> = [
    {
      id: 'easy',
      title: 'Tập Sự Vỉa Hè',
      badge: '🟢 Dễ',
      desc: '3 phút · Có gợi ý · Tốc độ êm ái · 4 món chuẩn',
    },
    {
      id: 'normal',
      title: 'Quán Quen Phố Cổ',
      badge: '🟡 Vừa (Chuẩn)',
      desc: '2 phút · Có gợi ý · Món ngẫu nhiên phong phú',
    },
    {
      id: 'hard',
      title: 'Giờ Cao Điểm',
      badge: '🔴 Khó',
      desc: '1.5 phút · Ẩn gợi ý (tự nhớ) · Topping biến thiên · Nhanh',
    },
    {
      id: 'rush',
      title: 'Siêu Tốc Thần Thánh',
      badge: '⚡ Siêu Tốc',
      desc: '1 phút · Lò nướng cực nóng · Khách giục gấp liên tục',
    },
  ];

  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div className="animate-pop w-full max-w-3xl rounded-[2.5rem] bg-gradient-to-b from-white/95 via-amber-50/90 to-white/95 p-6 sm:p-10 shadow-2xl ring-1 ring-amber-900/15 backdrop-blur">
        {/* Banner Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 text-4xl sm:text-5xl">
            <span>🏮</span>
            <span>🥖</span>
            <span>🏮</span>
          </div>
          <h1 className="mt-2.5 text-3xl font-black tracking-tight text-amber-950 sm:text-5xl">
            BÁNH MÌ VIỆT NAM
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base font-semibold text-amber-900/80">
            Mô phỏng xe bánh mì đường phố Việt Nam 2.5D: Nướng giòn vỏ bánh, kẹp đúng nhân, giao thật nhanh và giữ chuỗi Combo rực lửa!
          </p>
        </div>

        {/* 4 Recipes Showcase */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {BANH_MI_RECIPES.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-amber-900/10 transition-all hover:bg-amber-100/60"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-black text-amber-950 text-sm sm:text-base">
                  {r.name}
                </span>
                <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-xs font-black text-amber-900">
                  +{r.basePoints}đ
                </span>
              </div>
              <div className="mt-1 text-xs font-medium text-amber-900/80 leading-relaxed">
                <span className="font-bold text-amber-950">Nhân:</span>{' '}
                {r.requiredIngredients.map((id) => INGREDIENT_MAP[id].name).join(', ')}
                {(r.alternativeGroups ?? []).map((g) => `, ${g.label}`).join('')}
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty Selection */}
        <div className="mt-5 rounded-3xl bg-amber-100/60 p-4 ring-1 ring-amber-900/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-950">
              🎯 Tùy Chọn Độ Khó & Tiết Tấu:
            </span>
            <button
              type="button"
              onClick={() => setShowCustom(!showCustom)}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 hover:text-amber-950 underline"
            >
              <Sliders size={14} />
              <span>{showCustom ? 'Thu gọn tùy biến' : 'Tùy chỉnh chi tiết'}</span>
              {showCustom ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presets.map((p) => {
              const isActive = difficulty.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => dispatch({ type: 'APPLY_PRESET', preset: p.id })}
                  className={`flex flex-col items-start rounded-2xl p-2.5 text-left transition-all active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md ring-2 ring-yellow-300'
                      : 'bg-white/80 text-amber-950 hover:bg-white ring-1 ring-amber-900/10'
                  }`}
                >
                  <span className="text-xs font-black">{p.badge}</span>
                  <span className="mt-0.5 text-xs font-extrabold truncate w-full">
                    {p.title}
                  </span>
                  <span
                    className={`mt-1 text-[10px] leading-tight line-clamp-2 ${
                      isActive ? 'text-amber-100' : 'text-amber-900/70'
                    }`}
                  >
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Settings Panel */}
          {showCustom && (
            <div className="mt-4 rounded-2xl bg-white/95 p-3.5 shadow-inner ring-1 ring-amber-900/15 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-900/80">
                ⚙️ Tùy Chỉnh Chi Tiết (Sẽ kích hoạt chế độ "Tùy biến")
              </div>

              {/* Shift Duration */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/10 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Clock size={15} className="text-amber-700" />
                  Thời gian ca bán:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[60, 90, 120, 180, 300].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'SET_DIFFICULTY',
                          settings: { shiftDurationSec: sec },
                        })
                      }
                      className={`rounded-xl px-2.5 py-1 text-xs font-black transition-all ${
                        difficulty.shiftDurationSec === sec
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100/80 text-amber-950 hover:bg-amber-200'
                      }`}
                    >
                      {sec / 60}p ({sec}s)
                    </button>
                  ))}
                </div>
              </div>

              {/* Show/Hide Ingredient Hints */}
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  {difficulty.showIngredientHints ? (
                    <Eye size={15} className="text-emerald-700" />
                  ) : (
                    <EyeOff size={15} className="text-amber-700" />
                  )}
                  Hiển thị gợi ý nguyên liệu ("CẦN"):
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_DIFFICULTY',
                      settings: {
                        showIngredientHints: !difficulty.showIngredientHints,
                      },
                    })
                  }
                  className={`rounded-xl px-3 py-1 text-xs font-black transition-all ${
                    difficulty.showIngredientHints
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  {difficulty.showIngredientHints ? 'BẬT (Hiện)' : 'TẮT (Tự nhớ)'}
                </button>
              </div>

              {/* Random Ingredient Count */}
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Dice5 size={15} className="text-orange-700" />
                  Số lượng nguyên liệu ngẫu nhiên (3–7 vị):
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_DIFFICULTY',
                      settings: {
                        randomIngredientCount: !difficulty.randomIngredientCount,
                      },
                    })
                  }
                  className={`rounded-xl px-3 py-1 text-xs font-black transition-all ${
                    difficulty.randomIngredientCount
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  {difficulty.randomIngredientCount ? 'BẬT (Biến thiên)' : 'TẮT'}
                </button>
              </div>

              {/* Random Recipes */}
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Sparkles size={15} className="text-amber-700" />
                  Các loại bánh mì ngẫu nhiên đặc sản:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_DIFFICULTY',
                      settings: {
                        randomRecipes: !difficulty.randomRecipes,
                      },
                    })
                  }
                  className={`rounded-xl px-3 py-1 text-xs font-black transition-all ${
                    difficulty.randomRecipes
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  {difficulty.randomRecipes ? 'BẬT (Đa dạng)' : 'TẮT (Chỉ 4 món)'}
                </button>
              </div>

              {/* Fast-Paced Rush Mode */}
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Zap size={15} className="text-red-600" />
                  Tiết tấu game nhanh (Lò nóng gấp đôi, khách giục gấp):
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_DIFFICULTY',
                      settings: {
                        fastPaced: !difficulty.fastPaced,
                      },
                    })
                  }
                  className={`rounded-xl px-3 py-1 text-xs font-black transition-all ${
                    difficulty.fastPaced
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  {difficulty.fastPaced ? 'BẬT (Siêu tốc)' : 'TẮT (Vừa phải)'}
                </button>
              </div>

              {/* Cheerful BGM Music */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Music size={15} className="text-amber-700" />
                  Nhạc nền vui nhộn (BGM):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !difficulty.bgmEnabled;
                    setBgmEnabled(next);
                    dispatch({
                      type: 'SET_DIFFICULTY',
                      settings: { bgmEnabled: next },
                    });
                  }}
                  className={`rounded-xl px-3 py-1 text-xs font-black transition-all ${
                    difficulty.bgmEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  {difficulty.bgmEnabled ? 'BẬT' : 'TẮT'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onStart}
            autoFocus
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 px-8 py-4 text-xl font-black text-white shadow-xl ring-2 ring-yellow-300 transition-all hover:brightness-110 active:scale-95"
          >
            <Play size={24} className="fill-white" />
            <span>Mở Quầy Bán Bánh</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryScreen({
  state,
  best,
  onRestart,
}: {
  state: GameState;
  best: number;
  onRestart: () => void;
}) {
  const { stats } = state;
  const isRecord = stats.score > 0 && stats.score > best;
  const accuracy =
    stats.served > 0 ? Math.round((stats.perfect / stats.served) * 100) : 0;

  const rank =
    stats.score >= 2500
      ? 'Huyền thoại bánh mì vỉa hè 👑'
      : stats.score >= 1400
        ? 'Nghệ nhân kẹp bánh giòn rụm 🔥'
        : stats.score >= 600
          ? 'Đầu bếp bánh mì tài ba 🌟'
          : 'Tập sự đứng quầy bánh mì 🌱';

  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div className="animate-pop w-full max-w-xl rounded-[2.5rem] bg-gradient-to-b from-white/95 to-amber-50/95 p-6 sm:p-10 text-center shadow-2xl ring-1 ring-amber-900/15 backdrop-blur">
        <div className="text-5xl">🏮🏁🏮</div>
        <h2 className="mt-2 text-3xl font-black text-amber-950 sm:text-4xl">
          Hết Ca Bán!
        </h2>
        <p className="mt-1.5 text-base font-extrabold text-orange-700">{rank}</p>

        {/* Big Score Callout */}
        <div className="mt-5 rounded-3xl bg-amber-100/60 p-4 ring-1 ring-amber-900/10">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-900/70">
            Tổng điểm ca bán
          </div>
          <div className="mt-1 text-5xl sm:text-6xl font-black tabular-nums text-amber-600 drop-shadow-sm">
            {stats.score}
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900/80">
            {isRecord ? (
              <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
                <Sparkles size={14} /> 🎉 Kỷ lục mới tiệm bánh!
              </span>
            ) : (
              <span>Kỷ lục cao nhất: {best} điểm</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            ['Ổ bánh đạt chuẩn', stats.perfect, <ChefHat size={16} key="c" />],
            ['Combo cao nhất', `x${stats.maxCombo}`, <Flame size={16} key="f" />],
            ['Độ chính xác', `${accuracy}%`, <Trophy size={16} key="t" />],
            ['Khách bỏ đi', stats.walkedOut, <span key="w">😤</span>],
          ].map(([label, value, icon]) => (
            <div
              key={label as string}
              className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-amber-900/10"
            >
              <div className="flex items-center justify-center gap-1 text-amber-800">
                {icon}
              </div>
              <div className="mt-1 text-2xl font-black tabular-nums text-amber-950">
                {value}
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-amber-900/70 leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Restart Button */}
        <div className="mt-7">
          <button
            type="button"
            onClick={onRestart}
            autoFocus
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-3.5 text-xl font-black text-white shadow-xl ring-2 ring-yellow-300 transition-all hover:brightness-110 active:scale-95"
          >
            <RotateCcw size={22} /> Chơi Ca Mới
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GameStageController() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const bestRef = useRef(readBest());

  // Background Music (BGM) Sync: Chơi nhạc khi PLAYING nếu BGM bật
  useEffect(() => {
    if (state.phase === 'PLAYING' && state.difficulty.bgmEnabled && isBgmEnabled()) {
      startCheerfulBgm();
    } else {
      stopCheerfulBgm();
    }
    return () => {
      stopCheerfulBgm();
    };
  }, [state.phase, state.difficulty.bgmEnabled]);

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

  // Phím tắt bàn phím
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

      if (state.phase === 'IDLE' && e.key === 'Enter') {
        e.preventDefault();
        dispatch({ type: 'START' });
        return;
      }

      if (state.phase === 'SUMMARY' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        dispatch({ type: 'START' });
        return;
      }

      if (state.phase !== 'PLAYING') return;

      const ing = INGREDIENT_HOTKEYS[e.key];
      if (ing) {
        dispatch({ type: 'TOGGLE_INGREDIENT', id: ing });
      } else if (e.key === ' ') {
        e.preventDefault();
        dispatch(
          state.hasBread ? { type: 'TOGGLE_TOAST' } : { type: 'PLACE_BREAD' },
        );
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
    return (
      <StartScreen
        difficulty={state.difficulty}
        dispatch={dispatch}
        onStart={() => dispatch({ type: 'START' })}
      />
    );
  }

  if (state.phase === 'SUMMARY') {
    return (
      <SummaryScreen
        state={state}
        best={Math.max(prevBest.current, 0)}
        onRestart={() => dispatch({ type: 'START' })}
      />
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-[1440px] flex-col gap-2 p-2 sm:p-3">
      <CustomerOrderHUD state={state} />
      <AssemblyBoard25D state={state} dispatch={dispatch} />
      <div className="flex items-center justify-between px-1 text-xs text-amber-900/60">
        <span>
          Phím tắt: [1–0, -, =] Chọn nhân | [Space] Lò nướng | [Enter] Giao bánh | [R] Làm lại
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: 'END_SHIFT' })}
          className="font-bold underline hover:text-amber-950 transition-colors"
        >
          Kết thúc ca sớm
        </button>
      </div>
    </div>
  );
}
