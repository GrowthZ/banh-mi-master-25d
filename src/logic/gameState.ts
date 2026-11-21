import {
  BANH_MI_RECIPES,
  EXTENDED_BANH_MI_RECIPES,
  evaluateBanhMiOrder,
  generateRandomBanhMiRecipe,
} from '../data/menuOrders';
import type {
  BanhMiRecipe,
  BreadDoneness,
  DifficultyPreset,
  DifficultySettings,
  GamePhase,
  IngredientId,
  OrderEvaluationResult,
} from '../types/game';

/** Ngưỡng độ giòn (theo % nướng). */
export const TOAST_CRISPY_MIN = 45;
export const TOAST_BURNT_MIN = 92;
/** Trừ điểm khi khách bỏ đi vì chờ quá lâu. */
export const CUSTOMER_LEAVE_PENALTY = 12;
/** Thời gian hiển thị kết quả trước khi khách tiếp theo vào (giây). */
export const RESULT_PAUSE_SEC = 1.4;

export const DIFFICULTY_PRESETS: Record<
  Exclude<DifficultyPreset, 'custom'>,
  DifficultySettings
> = {
  easy: {
    preset: 'easy',
    shiftDurationSec: 180,
    showIngredientHints: true,
    randomIngredientCount: false,
    randomRecipes: false,
    fastPaced: false,
    bgmEnabled: true,
  },
  normal: {
    preset: 'normal',
    shiftDurationSec: 120,
    showIngredientHints: true,
    randomIngredientCount: false,
    randomRecipes: true,
    fastPaced: false,
    bgmEnabled: true,
  },
  hard: {
    preset: 'hard',
    shiftDurationSec: 90,
    showIngredientHints: false,
    randomIngredientCount: true,
    randomRecipes: true,
    fastPaced: true,
    bgmEnabled: true,
  },
  rush: {
    preset: 'rush',
    shiftDurationSec: 60,
    showIngredientHints: false,
    randomIngredientCount: true,
    randomRecipes: true,
    fastPaced: true,
    bgmEnabled: true,
  },
};

export const DEFAULT_DIFFICULTY: DifficultySettings = DIFFICULTY_PRESETS.normal;

export interface CustomerOrder {
  id: number;
  recipe: BanhMiRecipe;
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
  difficulty: DifficultySettings;
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
  | { type: 'BACK_TO_MENU' }
  | { type: 'SET_DIFFICULTY'; settings: Partial<DifficultySettings> }
  | { type: 'APPLY_PRESET'; preset: DifficultyPreset };

const CUSTOMERS: ReadonlyArray<{ name: string; avatar: string }> = [
  { name: 'Cô Ba', avatar: '👩‍🦳' },
  { name: 'Anh Tư xe ôm', avatar: '🧔' },
  { name: 'Bé Na', avatar: '👧' },
  { name: 'Chú Sáu', avatar: '👨‍🦲' },
  { name: 'Chị Hai văn phòng', avatar: '👩‍💼' },
  { name: 'Bạn sinh viên', avatar: '🧑‍🎓' },
  { name: 'Ông Bảy', avatar: '👴' },
  { name: 'Khách Tây', avatar: '🧑‍🦰' },
  { name: 'Anh shipper', avatar: '🛵' },
  { name: 'Bác tổ trưởng', avatar: '👨‍💼' },
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

function createOrder(
  id: number,
  previous: CustomerOrder | null,
  difficulty: DifficultySettings,
): CustomerOrder {
  let recipe: BanhMiRecipe;

  // Nếu bật số lượng nguyên liệu ngẫu nhiên và tỉ lệ ngẫu nhiên xuất hiện
  if (difficulty.randomIngredientCount && Math.random() < 0.45) {
    recipe = generateRandomBanhMiRecipe(id);
  } else if (difficulty.randomRecipes) {
    recipe = pick(
      EXTENDED_BANH_MI_RECIPES,
      previous ? previous.recipe : undefined,
    );
  } else {
    recipe = pick(BANH_MI_RECIPES, previous ? previous.recipe : undefined);
  }

  const customer = pick(CUSTOMERS);
  const patienceMultiplier = difficulty.fastPaced ? 1.25 : 1.75;
  const timeLimit = Math.round(recipe.orderTimeLimitSec * patienceMultiplier);

  return {
    id,
    recipe,
    customerName: customer.name,
    avatar: customer.avatar,
    timeLimitSec: timeLimit,
    timeRemainingSec: timeLimit,
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
  difficulty: DEFAULT_DIFFICULTY,
  shiftRemainingSec: DEFAULT_DIFFICULTY.shiftDurationSec,
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
  return (
    state.phase === 'PLAYING' &&
    state.pauseRemainingSec <= 0 &&
    state.order !== null
  );
}

function tick(state: GameState, dt: number): GameState {
  if (state.phase !== 'PLAYING') return state;

  const shiftRemainingSec = Math.max(0, state.shiftRemainingSec - dt);
  if (shiftRemainingSec <= 0) {
    return {
      ...state,
      shiftRemainingSec: 0,
      isToasting: false,
      phase: 'SUMMARY',
    };
  }

  let next: GameState = { ...state, shiftRemainingSec };

  // Nướng bánh: tốc độ nướng tăng khi fastPaced bật
  const toastRate = state.difficulty.fastPaced ? 25 : 16;

  if (next.isToasting && next.hasBread) {
    const before = getBreadDoneness(next.toastLevel);
    const toastLevel = Math.min(100, next.toastLevel + toastRate * dt);
    const after = getBreadDoneness(toastLevel);
    next = { ...next, toastLevel };
    if (before !== after) {
      if (after === 'crispy') {
        next = {
          ...next,
          ...feedback(
            next,
            'success',
            'Vỏ bánh giòn rụm, đạt chuẩn! Lấy ra ngay!',
          ),
        };
      } else if (after === 'burnt') {
        next = {
          ...next,
          ...feedback(
            next,
            'warning',
            'Ối! Bánh bắt đầu quá lửa, hãy cẩn thận!',
          ),
        };
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
        order: createOrder(next.nextId, next.order, next.difficulty),
        nextId: next.nextId + 1,
      };
    }
    return { ...next, pauseRemainingSec };
  }

  // Kiên nhẫn của khách
  if (next.order) {
    const timeRemainingSec = Math.max(0, next.order.timeRemainingSec - dt);
    if (timeRemainingSec <= 0) {
      const recipe = next.order.recipe;
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
          `${next.order.customerName} giục mãi không được nên bỏ đi!`,
          [
            `Không kịp giao ${recipe.name}`,
            next.stats.combo > 0 ? 'Mất chuỗi combo!' : '',
          ].filter(Boolean),
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
        difficulty: state.difficulty,
        shiftRemainingSec: state.difficulty.shiftDurationSec,
        phase: 'PLAYING',
        nextId: state.nextId,
      };
      const withOrder: GameState = {
        ...base,
        order: createOrder(base.nextId, null, state.difficulty),
        nextId: base.nextId + 1,
      };
      return {
        ...withOrder,
        ...feedback(
          withOrder,
          'info',
          'Mở hàng! Đặt vỏ bánh lên lò để nướng giòn.',
        ),
      };
    }

    case 'TICK':
      return tick(state, action.dt);

    case 'PLACE_BREAD': {
      if (!isInteractive(state)) return state;
      if (state.hasBread) {
        return {
          ...state,
          ...feedback(state, 'info', 'Đã có vỏ bánh trên lò rồi.'),
        };
      }
      return {
        ...state,
        hasBread: true,
        isToasting: true,
        toastLevel: 0,
        ...feedback(state, 'info', 'Đang nướng vỏ bánh mì nóng giòn…'),
      };
    }

    case 'TOGGLE_TOAST': {
      if (!isInteractive(state)) return state;
      if (!state.hasBread) {
        return {
          ...state,
          ...feedback(state, 'warning', 'Chưa có vỏ bánh để nướng!'),
        };
      }
      const isToasting = !state.isToasting;
      return {
        ...state,
        isToasting,
        ...feedback(
          state,
          'info',
          isToasting ? 'Tiếp tục nướng vỏ bánh…' : 'Đã nhấc bánh ra khỏi lò.',
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
          ...feedback(
            state,
            'warning',
            'Cần đặt vỏ bánh mì trước khi kẹp nhân!',
          ),
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
        recipe: state.order.recipe,
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
        : [...result.reasons, ...(result.comboReset ? ['Mất chuỗi combo!'] : [])];

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
            : `${result.recipeName} chưa đạt chuẩn!`,
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
      return {
        ...initialGameState,
        difficulty: state.difficulty,
        shiftRemainingSec: state.difficulty.shiftDurationSec,
        nextId: state.nextId,
      };

    case 'SET_DIFFICULTY': {
      const nextDiff: DifficultySettings = {
        ...state.difficulty,
        ...action.settings,
        preset: 'custom',
      };
      return {
        ...state,
        difficulty: nextDiff,
        shiftRemainingSec:
          state.phase === 'IDLE'
            ? nextDiff.shiftDurationSec
            : state.shiftRemainingSec,
      };
    }

    case 'APPLY_PRESET': {
      if (action.preset === 'custom') return state;
      const presetSettings = DIFFICULTY_PRESETS[action.preset];
      return {
        ...state,
        difficulty: presetSettings,
        shiftRemainingSec:
          state.phase === 'IDLE'
            ? presetSettings.shiftDurationSec
            : state.shiftRemainingSec,
      };
    }

    default:
      return state;
  }
}
