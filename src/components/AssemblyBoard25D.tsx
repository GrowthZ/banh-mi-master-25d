import { Component, Suspense, lazy, useMemo, type ReactNode } from 'react';
import { Flame, RotateCcw, Send, Snowflake } from 'lucide-react';
import {
  BREAD_DONENESS_LABELS,
  INGREDIENT_CATEGORY_LABELS,
  INGREDIENT_MAP,
  INGREDIENTS_BY_CATEGORY,
} from '../data/menuOrders';
import {
  TOAST_BURNT_MIN,
  TOAST_CRISPY_MIN,
  getBreadDoneness,
  type GameAction,
  type GameState,
} from '../logic/gameState';
import type { IngredientCategory, IngredientId } from '../types/game';

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
  KEY_BINDINGS.map((id, i) => [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='][i], id]),
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

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
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
    level < TOAST_CRISPY_MIN ? '#f3d9a4' : level < TOAST_BURNT_MIN ? '#d98a2b' : '#4a2c14';
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-amber-100 to-amber-300 [perspective:900px]">
      <div className="relative w-[60%] max-w-md [transform:rotateX(50deg)] [transform-style:preserve-3d]">
        <div className="h-28 rounded-2xl bg-zinc-700 shadow-2xl" />
        {state.hasBread && (
          <div className="absolute inset-x-6 top-4 flex flex-col-reverse items-stretch [transform:translateZ(20px)]">
            <div className="h-16 rounded-[50%] shadow-xl" style={{ background: breadColor }} />
            {sorted.map((id, i) => (
              <div
                key={id}
                className="mx-4 -mb-12 h-4 rounded-full shadow"
                style={{
                  background: INGREDIENT_MAP[id].accentColor,
                  transform: `translateZ(${(i + 1) * 6}px)`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToastMeter({ state, dispatch }: { state: GameState; dispatch: (a: GameAction) => void }) {
  const doneness = getBreadDoneness(state.toastLevel);
  const badge =
    doneness === 'crispy'
      ? 'bg-green-600 text-white'
      : doneness === 'burnt'
        ? 'bg-stone-900 text-orange-300 animate-pulse'
        : 'bg-amber-200 text-amber-900';
  return (
    <div className="rounded-2xl bg-white/85 p-3 shadow-md ring-1 ring-amber-900/10 backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-amber-950">🔥 Lò nướng</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge}`}>
          {state.hasBread ? BREAD_DONENESS_LABELS[doneness] : 'Chưa có bánh'}
        </span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-amber-100 ring-1 ring-amber-900/10">
        <div className="absolute inset-y-0 bg-green-400/50" style={{ left: `${TOAST_CRISPY_MIN}%`, width: `${TOAST_BURNT_MIN - TOAST_CRISPY_MIN}%` }} />
        <div className="absolute inset-y-0 right-0 bg-stone-800/40" style={{ width: `${100 - TOAST_BURNT_MIN}%` }} />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 via-orange-500 to-stone-900 transition-[width] duration-100"
          style={{ width: `${state.toastLevel}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-amber-900/60">
        <span>Chưa giòn</span>
        <span>Đạt chuẩn</span>
        <span>Quá lửa</span>
      </div>
      <button
        type="button"
        onClick={() => dispatch(state.hasBread ? { type: 'TOGGLE_TOAST' } : { type: 'PLACE_BREAD' })}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white shadow transition active:scale-95 ${
          state.isToasting ? 'bg-sky-600 hover:bg-sky-700' : 'bg-orange-600 hover:bg-orange-700'
        }`}
      >
        {state.isToasting ? <Snowflake size={16} /> : <Flame size={16} />}
        {!state.hasBread ? 'Đặt vỏ bánh & nướng' : state.isToasting ? 'Lấy bánh ra (Space)' : 'Nướng tiếp (Space)'}
      </button>
    </div>
  );
}

function IngredientTray({ state, dispatch }: { state: GameState; dispatch: (a: GameAction) => void }) {
  const categories = Object.keys(INGREDIENTS_BY_CATEGORY) as IngredientCategory[];
  const added = useMemo(() => new Set(state.addedIngredients), [state.addedIngredients]);
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {categories.map((cat) => (
        <div key={cat} className="rounded-2xl bg-amber-900/85 p-2 shadow-inner ring-1 ring-amber-950">
          <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-amber-200">
            {INGREDIENT_CATEGORY_LABELS[cat]}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INGREDIENTS_BY_CATEGORY[cat].map((item) => {
              const isActive = item.id === 'banh_mi_shell' ? state.hasBread : added.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.shortDescription} (phím ${HOTKEY_LABEL[item.id]})`}
                  onClick={() => dispatch({ type: 'TOGGLE_INGREDIENT', id: item.id })}
                  className={`group relative flex min-w-[4.5rem] flex-1 flex-col items-center rounded-xl px-2 py-1.5 text-xs font-semibold transition active:scale-90 ${
                    isActive
                      ? 'bg-amber-50 text-amber-950 shadow-lg ring-2 ring-yellow-300 -translate-y-0.5'
                      : 'bg-amber-800 text-amber-50 hover:bg-amber-700'
                  }`}
                >
                  <span className="text-xl leading-none drop-shadow">{INGREDIENT_EMOJI[item.id]}</span>
                  <span className="mt-0.5 whitespace-nowrap">{item.name}</span>
                  <span className="absolute right-1 top-0.5 text-[9px] opacity-50">{HOTKEY_LABEL[item.id]}</span>
                  {isActive && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white">
                      ✓
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
    busy && state.feedback ? (state.feedback.kind === 'success' ? 'success' : 'error') : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-3xl shadow-xl ring-1 ring-amber-900/20">
        {webgl ? (
          <SceneBoundary fallback={fallback}>
            <Suspense fallback={<div className="flex h-full items-center justify-center text-amber-900">Đang dựng quầy bánh…</div>}>
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

        {!state.hasBread && !busy && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'PLACE_BREAD' })}
            className="absolute inset-0 m-auto flex h-fit w-fit animate-bounce items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-lg font-extrabold text-white shadow-xl hover:bg-orange-700"
          >
            🥖 Đặt vỏ bánh lên lò (1)
          </button>
        )}

        <div className="pointer-events-none absolute left-3 top-3 w-64 max-w-[45%]">
          <div className="pointer-events-auto">
            <ToastMeter state={state} dispatch={dispatch} />
          </div>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 max-w-[40%] rounded-2xl bg-white/85 p-3 text-xs shadow-md ring-1 ring-amber-900/10 backdrop-blur">
          <div className="mb-1 font-bold text-amber-950">Trong ổ bánh ({state.addedIngredients.length})</div>
          {state.addedIngredients.length === 0 ? (
            <div className="text-amber-900/60">Chưa có nhân</div>
          ) : (
            <ul className="flex flex-wrap gap-1">
              {state.addedIngredients.map((id) => (
                <li key={id} className="rounded-full px-2 py-0.5 font-semibold text-white" style={{ background: INGREDIENT_MAP[id].accentColor }}>
                  {INGREDIENT_MAP[id].name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => dispatch({ type: 'RESET_SANDWICH' })}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-amber-900 shadow-lg ring-1 ring-amber-900/20 transition hover:bg-amber-50 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={18} /> Làm lại ổ bánh (R)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => dispatch({ type: 'DELIVER' })}
            className="flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
          >
            <Send size={20} /> Giao bánh (Enter)
          </button>
        </div>
      </div>

      <IngredientTray state={state} dispatch={dispatch} />
    </div>
  );
}
