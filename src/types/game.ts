export type IngredientCategory =
  | 'bread_base'
  | 'spread_sauce'
  | 'main_filling'
  | 'toppings';

export type IngredientId =
  // Nhóm vỏ/nướng (bread_base)
  | 'banh_mi_shell'
  // Nhóm phết/sốt (spread_sauce)
  | 'butter'
  | 'soy_sauce'
  | 'special_sauce'
  // Nhóm nhân chính (main_filling)
  | 'pate'
  | 'fried_egg'
  | 'cha_lua'
  | 'roast_pork'
  // Nhóm rau & đồ chua (toppings)
  | 'cucumber'
  | 'pickles'
  | 'cilantro'
  | 'chili';

export type BreadDoneness = 'undercooked' | 'crispy' | 'burnt';

export type BanhMiRecipeId =
  | 'banh_mi_pate'
  | 'banh_mi_trung_cha'
  | 'banh_mi_heo_quay'
  | 'banh_mi_thap_cam'
  | 'banh_mi_dac_biet'
  | 'banh_mi_heo_chay'
  | 'banh_mi_op_la_pate'
  | 'banh_mi_cha_bo_que'
  | 'banh_mi_custom';

export interface IngredientItem {
  id: IngredientId;
  name: string;
  category: IngredientCategory;
  categoryLabel: string;
  shortDescription: string;
  /** Layer stacking order for 2.5D visual rendering */
  layerOrder: number;
  /** Accent color token for UI badges and 2.5D diorama styling */
  accentColor: string;
}

export interface IngredientAlternativeGroup {
  /** Human-readable group name for UI hints and error messages */
  label: string;
  /** Any ingredient in this list fulfills the requirement */
  options: IngredientId[];
}

export interface BanhMiRecipe {
  id: BanhMiRecipeId | string;
  name: string;
  description: string;
  breadBase: 'banh_mi_shell';
  requiredDoneness: BreadDoneness;
  /** Mandatory ingredients that must all be present */
  requiredIngredients: IngredientId[];
  /** Optional "either-or" requirement groups (e.g. Pate/Bơ, Sốt/Nước tương) */
  alternativeGroups?: IngredientAlternativeGroup[];
  /** Base score awarded when order meets standard */
  basePoints: number;
  /** Default patience/time limit for this order in seconds */
  orderTimeLimitSec: number;
}

export interface EvaluateBanhMiOrderInput {
  recipe: BanhMiRecipe | BanhMiRecipeId | string;
  breadDoneness: BreadDoneness;
  addedIngredients: IngredientId[];
  currentCombo: number;
  /** Defaults to true; set false if player submits without placing bread */
  hasBread?: boolean;
  /** Optional remaining time (seconds) for speed bonus calculation */
  timeRemainingSec?: number;
  /** Optional total order time limit (seconds); falls back to recipe.orderTimeLimitSec */
  timeLimitSec?: number;
}

export interface OrderScoreBreakdown {
  basePoints: number;
  speedBonus: number;
  comboBonus: number;
  penalty: number;
}

export interface OrderEvaluationResult {
  recipeId: string;
  recipeName: string;
  /** True only if bread doneness and all required/allowed ingredients match */
  isStandard: boolean;
  /** Net points to add (positive) or deduct (negative) */
  scoreDelta: number;
  breakdown: OrderScoreBreakdown;
  /** Updated combo count after this delivery */
  nextCombo: number;
  /** True when an existing combo was broken or delivery failed */
  comboReset: boolean;
  /** Detailed Vietnamese feedback messages for missing/extra items or bread issues */
  reasons: string[];
  missingIngredients: IngredientId[];
  extraIngredients: IngredientId[];
  donenessValid: boolean;
  summary: string;
}

export type GamePhase = 'IDLE' | 'PLAYING' | 'SUMMARY';

export type DifficultyPreset = 'easy' | 'normal' | 'hard' | 'rush' | 'custom';

export interface DifficultySettings {
  preset: DifficultyPreset;
  /** Thời lượng ca bán tính theo giây (60, 90, 120, 180, 240, 300) */
  shiftDurationSec: number;
  /** Hiển thị gợi ý "CẦN" trên khay nguyên liệu (tắt = người chơi phải tự nhớ công thức) */
  showIngredientHints: boolean;
  /** Số lượng nguyên liệu ngẫu nhiên (thêm/bớt topping biến thiên) */
  randomIngredientCount: boolean;
  /** Xuất hiện các loại bánh mì ngẫu nhiên đặc sản ngoài 4 món chuẩn */
  randomRecipes: boolean;
  /** Tiết tấu game nhanh (tốc độ nướng nhanh gấp đôi, khách giục gấp) */
  fastPaced: boolean;
  /** Bật nhạc nền vui tươi rộn rã */
  bgmEnabled: boolean;
}
