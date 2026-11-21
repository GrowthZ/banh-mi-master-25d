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
  | 'banh_mi_thap_cam';

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
  id: BanhMiRecipeId;
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
  recipe: BanhMiRecipe | BanhMiRecipeId;
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
  recipeId: BanhMiRecipeId;
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
