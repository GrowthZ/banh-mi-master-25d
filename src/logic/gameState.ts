import { BANH_MI_RECIPES, evaluateBanhMiOrder, getRecipeById } from '../data/menuOrders';
import type {
  BanhMiRecipeId,
  BreadDoneness,
  GamePhase,
  IngredientId,
  OrderEvaluationResult,
} from '../types/game';

/** Độ dài một ca bán (giây). */
export const SHIFT_DURATION_SEC = 90;
/** Tốc độ nướng: % mỗi giây. */
export const TOAST_RATE_PER_SEC = 22;
/** Ngưỡng độ giòn (theo % nướng). */
export const TOAST_CRISPY_MIN = 55;
export const TOAST_BURNT_MIN = 85;
/** Trừ điểm khi khách bỏ đi vì chờ quá lâu. */
export const CUSTOMER_LEAVE_PENALTY = 20;
/** Thời gian hiển thị kết quả trước khi khách tiếp theo vào (giây). */
export const RESULT_PAUSE_SEC = 1.6;

export interface CustomerOrder {
  id: number;
  recipeId: BanhMiRecipeId;
  customerName: string;
  avatar: string;
  timeLimitSec: number;
  timeRemainingSec: number;
}

export type FeedbackKind = 'success' | 'error' | 'info' | 'warning';

export interface FeedbackMessage {
  id: number;
  kind: FeedbackKind;
  title: string;
  details: string[];
  scoreDelta?: number;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  served: number;
  perfect: number;
  failed: number;
  walkedOut: number;
}

export interface GameState {
  phase: GamePhase;
  shiftRemainingSec: number;
  order: CustomerOrder | null;
  /** Khoảng nghỉ giữa 2 khách (giây). >0 nghĩa là đang hiển thị kết quả. */
  pauseRemainingSec: number;
  hasBread: boolean;
  isToasting: boolean;
  /** 0..100 */
  toastLevel: number;
  addedIngredients: IngredientId[];
  stats: GameStats;
  feedback: FeedbackMessage | null;
  lastResult: OrderEvaluationResult | null;
  nextId: number;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'TICK'; dt: number }
  | { type: 'PLACE_BREAD' }
  | { type: 'TOGGLE_TOAST' }
  | { type: 'TOGGLE_INGREDIENT'; id: IngredientId }
  | { type: 'RESET_SANDWICH' }
  | { type: 'DELIVER' }
  | { type: 'END_SHIFT' }
  | { type: 'BACK_TO_MENU' };

const CUSTOMERS: ReadonlyArray<{ name: string; avatar: string }> = [
  { name: 'Cô Ba', avatar: '👩‍🦳' },
  { name: 'Anh Tư xe ôm', avatar: '🧔' },
  { name: 'Bé Na', avatar: '👧' },
  { name: 'Chú Sáu', avatar: '👨‍🦲' },
  { name: 'Chị Hai văn phòng', avatar: '👩‍💼' },
  { name: 'Bạn sinh viên', avatar: '🧑‍🎓' },
  { name: 'Ông Bảy', avatar: '👴' },
  { name: 'Khách Tây', avatar: '🧑‍🦰' },
];

export function getBreadDoneness(toastLevel: number): BreadDoneness {
  if (toastLevel >= TOAST_BURNT_MIN) return 'burnt';
  if (toastLevel >= TOAST_CRISPY_MIN) return 'crispy';
  return 'undercooked';
}

function pick<T>(list: ReadonlyArray<T>, avoid?: T): T {
  if (list.length > 1 && avoid !== undefined) {
    const filtered = list.filter((x) => x !== avoid);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  return list[Math.floor(Math.random() * list.length)];
}

function createOrder(id: number, previous: CustomerOrder | null): CustomerOrder {
  const recipe = pick(BANH_MI_RECIPES, previous ? getRecipeById(previous.recipeId) : undefined);
  const customer = pick(CUSTOMERS);
  return {
    id,
    recipeId: recipe.id,
    customerName: customer.name,
    avatar: customer.avatar,
    timeLimitSec: recipe.orderTimeLimitSec,
    timeRemainingSec: recipe.orderTimeLimitSec,
  };
}

const INITIAL_STATS: GameStats = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  served: 0,
  perfect: 0,
  failed: 0,
  walkedOut: 0,
};

export const initialGameState: GameState = {
  phase: 'IDLE',
  shiftRemainingSec: SHIFT_DURATION_SEC,
  order: null,
  pauseRemainingSec: 0,
  hasBread: false,
  isToasting: false,
  toastLevel: 0,
  addedIngredients: [],
  stats: INITIAL_STATS,
  feedback: null,
  lastResult: null,
  nextId: 1,
};

const emptySandwich = {
  hasBread: false,
  isToasting: false,
  toastLevel: 0,
  addedIngredients: [] as IngredientId[],
};

function feedback(
  state: GameState,
  kind: FeedbackKind,
  title: string,
  details: string[] = [],
  scoreDelta?: number,
): Pick<GameState, 'feedback' | 'nextId'> {
  return {
    feedback: { id: state.nextId, kind, title, details, scoreDelta },
    nextId: state.nextId + 1,
  };
}

function isInteractive(state: GameState): boolean {
  return state.phase === 'PLAYING' && state.pauseRemainingSec <= 0 && state.order !== null;
}

function tick(state: GameState, dt: number): GameState {
  if (state.phase !== 'PLAYING') return state;

  const shiftRemainingSec = Math.max(0, state.shiftRemainingSec - dt);
  if (shiftRemainingSec <= 0) {
    return { ...state, shiftRemainingSec: 0, isToasting: false, phase: 'SUMMARY' };
  }

  let next: GameState = { ...state, shiftRemainingSec };

  // Nướng bánh
  if (next.isToasting && next.hasBread) {
    const before = getBreadDoneness(next.toastLevel);
    const toastLevel = Math.min(100, next.toastLevel + TOAST_RATE_PER_SEC * dt);
    const after = getBreadDoneness(toastLevel);
    next = { ...next, toastLevel };
    if (before !== after) {
      if (after === 'crispy') {
        next = { ...next, ...feedback(next, 'success', 'Vỏ bánh giòn rụm, đạt chuẩn! Lấy ra thôi!') };
      } else if (after === 'burnt') {
        next = { ...next, ...feedback(next, 'warning', 'Ối! Bánh bắt đầu cháy khét!') };
      }
    }
  }

  // Khoảng nghỉ giữa 2 khách
  if (next.pauseRemainingSec > 0) {
    const pauseRemainingSec = Math.max(0, next.pauseRemainingSec - dt);
    if (pauseRemainingSec <= 0) {
      return {
        ...next,
        ...emptySandwich,
        pauseRemainingSec: 0,
        order: createOrder(next.nextId, next.order),
        nextId: next.nextId + 1,
      };
    }
    return { ...next, pauseRemainingSec };
  }

  // Kiên nhẫn của khách
  if (next.order) {
    const timeRemainingSec = Math.max(0, next.order.timeRemainingSec - dt);
    if (timeRemainingSec <= 0) {
      const recipe = getRecipeById(next.order.recipeId);
      const stats: GameStats = {
        ...next.stats,
        score: next.stats.score - CUSTOMER_LEAVE_PENALTY,
        combo: 0,
        walkedOut: next.stats.walkedOut + 1,
      };
      return {
        ...next,
        isToasting: false,
        order: { ...next.order, timeRemainingSec: 0 },
        stats,
        pauseRemainingSec: RESULT_PAUSE_SEC,
        lastResult: null,
        ...feedback(
          next,
          'error',
          `${next.order.customerName} chờ lâu quá nên bỏ đi!`,
          [`Không kịp giao ${recipe.name}`, next.stats.combo > 0 ? 'Mất combo' : ''].filter(Boolean),
          -CUSTOMER_LEAVE_PENALTY,
        ),
      };
    }
    next = { ...next, order: { ...next.order, timeRemainingSec } };
  }

  return next;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      const base: GameState = {
        ...initialGameState,
        phase: 'PLAYING',
        nextId: state.nextId,
      };
      const withOrder: GameState = {
        ...base,
        order: createOrder(base.nextId, null),
        nextId: base.nextId + 1,
      };
      return {
        ...withOrder,
        ...feedback(withOrder, 'info', 'Mở hàng! Đặt vỏ bánh lên lò để bắt đầu.'),
      };
    }

    case 'TICK':
      return tick(state, action.dt);

    case 'PLACE_BREAD': {
      if (!isInteractive(state)) return state;
      if (state.hasBread) {
        return { ...state, ...feedback(state, 'info', 'Đã có vỏ bánh trên lò rồi.') };
      }
      return {
        ...state,
        hasBread: true,
        isToasting: true,
        toastLevel: 0,
        ...feedback(state, 'info', 'Đặt vỏ bánh lên lò — đang nướng…'),
      };
    }

    case 'TOGGLE_TOAST': {
      if (!isInteractive(state)) return state;
      if (!state.hasBread) {
        return { ...state, ...feedback(state, 'warning', 'Chưa có vỏ bánh để nướng!') };
      }
      const isToasting = !state.isToasting;
      return {
        ...state,
        isToasting,
        ...feedback(
          state,
          'info',
          isToasting ? 'Tiếp tục nướng vỏ bánh…' : 'Đã lấy bánh ra khỏi lò.',
        ),
      };
    }

    case 'TOGGLE_INGREDIENT': {
      if (!isInteractive(state)) return state;
      if (action.id === 'banh_mi_shell') {
        return gameReducer(state, { type: 'PLACE_BREAD' });
      }
      if (!state.hasBread) {
        return {
          ...state,
          ...feedback(state, 'warning', 'Cần đặt vỏ bánh mì trước khi thêm nhân!'),
        };
      }
      const exists = state.addedIngredients.includes(action.id);
      return {
        ...state,
        addedIngredients: exists
          ? state.addedIngredients.filter((x) => x !== action.id)
          : [...state.addedIngredients, action.id],
      };
    }

    case 'RESET_SANDWICH': {
      if (!isInteractive(state)) return state;
      return {
        ...state,
        ...emptySandwich,
        ...feedback(state, 'info', 'Đã dọn ổ bánh, làm lại từ đầu.'),
      };
    }

    case 'DELIVER': {
      if (!isInteractive(state) || !state.order) return state;
      const result = evaluateBanhMiOrder({
        recipe: state.order.recipeId,
        breadDoneness: getBreadDoneness(state.toastLevel),
        addedIngredients: state.addedIngredients,
        currentCombo: state.stats.combo,
        hasBread: state.hasBread,
        timeRemainingSec: state.order.timeRemainingSec,
        timeLimitSec: state.order.timeLimitSec,
      });
      const stats: GameStats = {
        ...state.stats,
        score: state.stats.score + result.scoreDelta,
        combo: result.nextCombo,
        maxCombo: Math.max(state.stats.maxCombo, result.nextCombo),
        served: state.stats.served + 1,
        perfect: state.stats.perfect + (result.isStandard ? 1 : 0),
        failed: state.stats.failed + (result.isStandard ? 0 : 1),
      };
      const details = result.isStandard
        ? [
            `Cơ bản +${result.breakdown.basePoints}`,
            `Tốc độ +${result.breakdown.speedBonus}`,
            ...(result.breakdown.comboBonus > 0
              ? [`Combo +${result.breakdown.comboBonus}`]
              : []),
          ]
        : [...result.reasons, ...(result.comboReset ? ['Mất combo!'] : [])];
      return {
        ...state,
        isToasting: false,
        stats,
        lastResult: result,
        pauseRemainingSec: RESULT_PAUSE_SEC,
        ...feedback(
          state,
          result.isStandard ? 'success' : 'error',
          result.isStandard
            ? `${result.recipeName} chuẩn vị! ${result.nextCombo > 1 ? `Combo x${result.nextCombo} 🔥` : ''}`.trim()
            : `${result.recipeName} chưa đạt!`,
          details,
          result.scoreDelta,
        ),
      };
    }

    case 'END_SHIFT':
      return state.phase === 'PLAYING'
        ? { ...state, phase: 'SUMMARY', isToasting: false }
        : state;

    case 'BACK_TO_MENU':
      return { ...initialGameState, nextId: state.nextId };

    default:
      return state;
  }
}
