import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, Flame, RotateCcw, Send, Snowflake } from 'lucide-react';
import {
  BREAD_DONENESS_LABELS,
  INGREDIENT_CATEGORY_LABELS,
  INGREDIENT_MAP,
  INGREDIENTS_BY_CATEGORY,
  getRecipeById,
} from '../data/menuOrders';
import {
  TOAST_BURNT_MIN,
  TOAST_CRISPY_MIN,
  getBreadDoneness,
  type GameAction,
  type GameState,
} from '../logic/gameState';
import type { IngredientCategory, IngredientId } from '../types/game';
import {
  playBurntSizzle,
  playCrispyBell,
  playIngredientPop,
  playOrderError,
  playOrderSuccess,
  playResetSwoosh,
} from '../utils/audioFeedback';

const BanhMiScene = lazy(() => import('./BanhMiScene'));

const INGREDIENT_EMOJI: Record<IngredientId, string> = {
  banh_mi_shell: '🥖',
  butter: '🧈',
  soy_sauce: '🫙',
  special_sauce: '🥫',
  pate: '🟤',
  fried_egg: '🍳',
  cha_lua: '🌸',
  roast_pork: '🥓',
  cucumber: '🥒',
  pickles: '🥕',
  cilantro: '🌿',
  chili: '🌶️',
};

const KEY_BINDINGS: IngredientId[] = [
  'banh_mi_shell',
  'butter',
  'soy_sauce',
  'special_sauce',
  'pate',
  'fried_egg',
  'cha_lua',
  'roast_pork',
  'cucumber',
  'pickles',
  'cilantro',
  'chili',
];

export const INGREDIENT_HOTKEYS: Record<string, IngredientId> = Object.fromEntries(
  KEY_BINDINGS.map((id, i) => [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='][i],
    id,
  ]),
);

const HOTKEY_LABEL: Record<IngredientId, string> = Object.fromEntries(
  Object.entries(INGREDIENT_HOTKEYS).map(([k, id]) => [id, k]),
) as Record<IngredientId, string>;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[BanhMi] 3D scene failed, using 2.5D CSS fallback', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Fallback 2.5D bằng CSS khi không có WebGL. */
function CssDiorama({ state }: { state: GameState }) {
  const sorted = [...state.addedIngredients].sort(
    (a, b) => INGREDIENT_MAP[b].layerOrder - INGREDIENT_MAP[a].layerOrder,
  );
  const level = state.toastLevel;
  const breadColor =
    level < TOAST_CRISPY_MIN
      ? '#f3d9a4'
      : level < TOAST_BURNT_MIN
        ? '#d98a2b'
        : '#4a2c14';

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-amber-100/80 to-amber-300/80 [perspective:900px]">
      <div className="relative w-[65%] max-w-md [transform:rotateX(48deg)] [transform-style:preserve-3d]">
        <div className="h-32 rounded-3xl bg-amber-950/80 shadow-2xl ring-2 ring-amber-900" />
        {state.hasBread && (
          <div className="absolute inset-x-8 top-5 flex flex-col-reverse items-stretch [transform:translateZ(24px)]">
            <div
              className="h-16 rounded-[45%] shadow-xl transition-colors duration-200"
              style={{ background: breadColor }}
            />
            {sorted.map((id, i) => (
              <div
                key={id}
                className="mx-5 -mb-11 h-4 rounded-full shadow-md"
                style={{
                  background: INGREDIENT_MAP[id].accentColor,
                  transform: `translateZ(${(i + 1) * 7}px)`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToastMeter({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const doneness = getBreadDoneness(state.toastLevel);
  const prevDonenessRef = useRef(doneness);

  useEffect(() => {
    if (state.hasBread) {
      if (prevDonenessRef.current !== 'crispy' && doneness === 'crispy') {
        playCrispyBell();
      } else if (prevDonenessRef.current !== 'burnt' && doneness === 'burnt') {
        playBurntSizzle();
      }
    }
    prevDonenessRef.current = doneness;
  }, [doneness, state.hasBread]);

  const isCrispy = state.hasBread && doneness === 'crispy';
  const isBurnt = state.hasBread && doneness === 'burnt';

  const badge = !state.hasBread
    ? 'bg-amber-100 text-amber-900'
    : isCrispy
      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-md animate-pulse'
      : isBurnt
        ? 'bg-stone-900 text-orange-400 ring-2 ring-red-500 animate-pulse'
        : 'bg-amber-200 text-amber-950';

  return (
    <div
      className={`rounded-2xl bg-white/95 p-3.5 shadow-xl ring-1 backdrop-blur transition-all ${
        isCrispy
          ? 'ring-emerald-500 animate-crispy-glow'
          : isBurnt
            ? 'ring-red-500'
            : 'ring-amber-900/15'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-950">
          🔥 Lò Nướng Bánh
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${badge}`}>
          {state.hasBread ? BREAD_DONENESS_LABELS[doneness] : 'Chưa có bánh'}
        </span>
      </div>

      <div className="relative h-4 overflow-hidden rounded-full bg-amber-100 ring-1 ring-amber-900/15">
        {/* Optimal zone marker */}
        <div
          className="absolute inset-y-0 bg-emerald-400/50"
          style={{
            left: `${TOAST_CRISPY_MIN}%`,
            width: `${TOAST_BURNT_MIN - TOAST_CRISPY_MIN}%`,
          }}
        />
        {/* Burnt zone marker */}
        <div
          className="absolute inset-y-0 right-0 bg-stone-900/40"
          style={{ width: `${100 - TOAST_BURNT_MIN}%` }}
        />
        {/* Progress bar */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-100 ${
            isBurnt
              ? 'bg-gradient-to-r from-orange-500 via-stone-800 to-black'
              : isCrispy
                ? 'bg-gradient-to-r from-amber-400 via-emerald-500 to-green-600'
                : 'bg-gradient-to-r from-amber-200 to-amber-500'
          }`}
          style={{ width: `${state.toastLevel}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-amber-900/70">
        <span>Chưa giòn (0%)</span>
        <span className="text-emerald-700 font-extrabold">Đạt chuẩn (45%)</span>
        <span className="text-red-700 font-extrabold">Quá lửa (92%)</span>
      </div>

      <button
        type="button"
        onClick={() =>
          dispatch(
            state.hasBread ? { type: 'TOGGLE_TOAST' } : { type: 'PLACE_BREAD' },
          )
        }
        className={`mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-white shadow-md transition active:scale-95 ${
          !state.hasBread
            ? 'bg-orange-600 hover:bg-orange-700'
            : state.isToasting
              ? 'bg-sky-600 hover:bg-sky-700 ring-2 ring-sky-300'
              : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {state.isToasting ? <Snowflake size={15} /> : <Flame size={15} />}
        {!state.hasBread
          ? 'Đặt vỏ bánh lên lò (Phím 1 / Space)'
          : state.isToasting
            ? 'Lấy bánh ra khỏi lò (Space)'
            : 'Tiếp tục nướng (Space)'}
      </button>
    </div>
  );
}

function IngredientTray({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const categories = Object.keys(INGREDIENTS_BY_CATEGORY) as IngredientCategory[];
  const added = useMemo(
    () => new Set(state.addedIngredients),
    [state.addedIngredients],
  );

  const needed = useMemo(() => {
    const set = new Set<IngredientId>();
    if (!state.order) return set;
    const recipe = getRecipeById(state.order.recipeId);
    if (!state.hasBread) set.add('banh_mi_shell');
    for (const id of recipe.requiredIngredients) {
      if (!added.has(id)) set.add(id);
    }
    for (const g of recipe.alternativeGroups ?? []) {
      if (!g.options.some((o) => added.has(o))) {
        g.options.forEach((o) => set.add(o));
      }
    }
    return set;
  }, [state.order, state.hasBread, added]);

  const handleIngredientClick = (id: IngredientId) => {
    const isAdding = id === 'banh_mi_shell' ? !state.hasBread : !added.has(id);
    playIngredientPop(isAdding);
    dispatch({ type: 'TOGGLE_INGREDIENT', id });
  };

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {categories.map((cat) => (
        <div
          key={cat}
          className="rounded-2xl bg-gradient-to-b from-amber-950/90 to-amber-900/95 p-2.5 shadow-xl ring-1 ring-amber-950"
        >
          <div className="mb-2 px-1 text-[11px] font-black uppercase tracking-wider text-amber-300/90 flex items-center justify-between">
            <span>{INGREDIENT_CATEGORY_LABELS[cat]}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {INGREDIENTS_BY_CATEGORY[cat].map((item) => {
              const isActive =
                item.id === 'banh_mi_shell' ? state.hasBread : added.has(item.id);
              const isNeeded = needed.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.shortDescription} (Phím ${HOTKEY_LABEL[item.id]})`}
                  onClick={() => handleIngredientClick(item.id)}
                  className={`group relative flex min-w-[4.6rem] flex-1 flex-col items-center justify-center rounded-xl p-2 text-xs font-bold transition-all active:scale-90 ${
                    isActive
                      ? 'bg-amber-50 text-amber-950 shadow-md ring-2 ring-emerald-500 -translate-y-0.5'
                      : isNeeded
                        ? 'animate-hint bg-gradient-to-br from-orange-500 to-amber-600 text-white ring-2 ring-yellow-300 hover:brightness-110'
                        : 'bg-amber-900/80 text-amber-100/80 hover:bg-amber-800/90 hover:text-white'
                  }`}
                >
                  <span className="text-2xl leading-none drop-shadow">
                    {INGREDIENT_EMOJI[item.id]}
                  </span>
                  <span className="mt-1 whitespace-nowrap text-[11px] leading-tight">
                    {item.name}
                  </span>
                  <span className="absolute right-1.5 top-1 text-[9px] font-mono opacity-60">
                    {HOTKEY_LABEL[item.id]}
                  </span>

                  {isNeeded && !isActive && (
                    <span className="absolute -left-1 -top-1 rounded-full bg-yellow-300 px-1.5 py-0.2 text-[9px] font-black text-amber-950 shadow">
                      CẦN
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white shadow ring-1 ring-white">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AssemblyBoard25D({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const webgl = useMemo(hasWebGL, []);
  const fallback = <CssDiorama state={state} />;
  const busy = state.pauseRemainingSec > 0;
  const resultFlash =
    busy && state.feedback
      ? state.feedback.kind === 'success'
        ? 'success'
        : 'error'
      : null;

  const [lastDeliveredId, setLastDeliveredId] = useState<number | null>(null);

  const handleDeliver = () => {
    if (busy || !state.order) return;
    dispatch({ type: 'DELIVER' });
  };

  const handleReset = () => {
    if (busy) return;
    playResetSwoosh();
    dispatch({ type: 'RESET_SANDWICH' });
  };

  // Sound effects when order evaluation completes
  useEffect(() => {
    if (state.lastResult && state.order && state.order.id !== lastDeliveredId) {
      setLastDeliveredId(state.order.id);
      if (state.lastResult.isStandard) {
        playOrderSuccess(state.lastResult.nextCombo);
      } else {
        playOrderError();
      }
    }
  }, [state.lastResult, state.order, lastDeliveredId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* 2.5D / 3D Canvas Stage */}
      <div className="relative min-h-[250px] flex-1 overflow-hidden rounded-3xl bg-amber-950/20 shadow-2xl ring-1 ring-amber-900/25">
        {webgl ? (
          <SceneBoundary fallback={fallback}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm font-bold text-amber-900">
                  🏮 Đang chuẩn bị xe bánh mì…
                </div>
              }
            >
              <BanhMiScene
                hasBread={state.hasBread}
                isToasting={state.isToasting}
                toastLevel={state.toastLevel}
                addedIngredients={state.addedIngredients}
                resultFlash={resultFlash}
              />
            </Suspense>
          </SceneBoundary>
        ) : (
          fallback
        )}

        {/* Prompt when no bread is on stage */}
        {!state.hasBread && !busy && (
          <button
            type="button"
            onClick={() => {
              playIngredientPop(true);
              dispatch({ type: 'PLACE_BREAD' });
            }}
            className="absolute inset-0 m-auto flex h-fit w-fit animate-bounce items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3.5 text-base font-black text-white shadow-2xl ring-2 ring-yellow-300 hover:brightness-110 active:scale-95"
          >
            🥖 Đặt vỏ bánh lên lò nướng (Phím 1 hoặc Space)
          </button>
        )}

        {/* Toast Meter Overlay (Top Left) */}
        <div className="pointer-events-none absolute left-3 top-3 w-64 max-w-[45%]">
          <div className="pointer-events-auto">
            <ToastMeter state={state} dispatch={dispatch} />
          </div>
        </div>

        {/* Sandwich Ingredients Summary (Top Right) */}
        <div className="pointer-events-none absolute right-3 top-3 max-w-[42%] rounded-2xl bg-white/95 p-3 text-xs shadow-xl ring-1 ring-amber-900/15 backdrop-blur">
          <div className="mb-1.5 flex items-center justify-between gap-2 font-black text-amber-950">
            <span>Ổ bánh hiện tại</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              {state.addedIngredients.length} loại nhân
            </span>
          </div>
          {state.addedIngredients.length === 0 ? (
            <div className="text-[11px] font-medium text-amber-900/60">
              Chưa kẹp nhân nào
            </div>
          ) : (
            <ul className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {state.addedIngredients.map((id) => (
                <li
                  key={id}
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                  style={{ background: INGREDIENT_MAP[id].accentColor }}
                >
                  {INGREDIENT_MAP[id].name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons (Bottom Right) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-4 py-3 text-sm font-extrabold text-amber-950 shadow-xl ring-1 ring-amber-900/20 transition-all hover:bg-amber-50 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={17} /> Làm lại (R)
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleDeliver}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-base font-black text-white shadow-xl ring-2 ring-emerald-300 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <Send size={18} /> Giao bánh (Enter)
          </button>
        </div>
      </div>

      {/* Ingredient Trays */}
      <IngredientTray state={state} dispatch={dispatch} />
    </div>
  );
}
