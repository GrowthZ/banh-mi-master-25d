import type {
  BanhMiRecipe,
  BanhMiRecipeId,
  BreadDoneness,
  EvaluateBanhMiOrderInput,
  IngredientCategory,
  IngredientId,
  IngredientItem,
  OrderEvaluationResult,
} from '../types/game';

export type {
  BanhMiRecipe,
  BanhMiRecipeId,
  BreadDoneness,
  EvaluateBanhMiOrderInput,
  IngredientCategory,
  IngredientId,
  IngredientItem,
  OrderEvaluationResult,
};

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  bread_base: 'Vỏ bánh & Nướng',
  spread_sauce: 'Phết & Sốt',
  main_filling: 'Nhân chính',
  toppings: 'Rau & Đồ chua',
};

export const BREAD_DONENESS_LABELS: Record<BreadDoneness, string> = {
  undercooked: 'Chưa giòn',
  crispy: 'Đạt chuẩn',
  burnt: 'Quá lửa',
};

/**
 * 1. Danh sách nguyên liệu chuẩn, phân loại rõ theo 4 nhóm:
 * - bread_base: Vỏ bánh mì
 * - spread_sauce: Bơ, Nước tương, Nước sốt
 * - main_filling: Pate, Trứng chiên, Chả lụa, Heo quay
 * - toppings: Dưa leo, Đồ chua, Rau ngò, Ớt
 */
export const INGREDIENTS: readonly IngredientItem[] = [
  // Nhóm vỏ/nướng (bread_base)
  {
    id: 'banh_mi_shell',
    name: 'Vỏ bánh mì',
    category: 'bread_base',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.bread_base,
    shortDescription: 'Ổ bánh mì đặc ruột nướng nóng giòn rụm',
    layerOrder: 0,
    accentColor: '#d97706',
  },

  // Nhóm phết/sốt (spread_sauce)
  {
    id: 'butter',
    name: 'Bơ trứng gà',
    category: 'spread_sauce',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.spread_sauce,
    shortDescription: 'Sốt bơ béo ngậy phết dọc ruột bánh',
    layerOrder: 1,
    accentColor: '#facc15',
  },
  {
    id: 'soy_sauce',
    name: 'Nước tương',
    category: 'spread_sauce',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.spread_sauce,
    shortDescription: 'Nước tương đậm đà rưới đều nhân bánh',
    layerOrder: 5,
    accentColor: '#451a03',
  },
  {
    id: 'special_sauce',
    name: 'Nước sốt',
    category: 'spread_sauce',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.spread_sauce,
    shortDescription: 'Nước sốt thịt đậm vị đặc trưng',
    layerOrder: 5,
    accentColor: '#9a3412',
  },

  // Nhóm nhân chính (main_filling)
  {
    id: 'pate',
    name: 'Pate',
    category: 'main_filling',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.main_filling,
    shortDescription: 'Pate gan thơm béo, mịn mượt',
    layerOrder: 2,
    accentColor: '#a16207',
  },
  {
    id: 'fried_egg',
    name: 'Trứng chiên',
    category: 'main_filling',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.main_filling,
    shortDescription: 'Trứng ốp la / chiên nóng hổi',
    layerOrder: 3,
    accentColor: '#fbbf24',
  },
  {
    id: 'cha_lua',
    name: 'Chả lụa',
    category: 'main_filling',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.main_filling,
    shortDescription: 'Chả lụa truyền thống cắt lát vừa ăn',
    layerOrder: 3,
    accentColor: '#fda4af',
  },
  {
    id: 'roast_pork',
    name: 'Heo quay',
    category: 'main_filling',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.main_filling,
    shortDescription: 'Heo quay da giòn bì, thịt mềm thơm',
    layerOrder: 3,
    accentColor: '#c2410c',
  },

  // Nhóm rau & đồ chua (toppings)
  {
    id: 'cucumber',
    name: 'Dưa leo',
    category: 'toppings',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.toppings,
    shortDescription: 'Dưa leo thái lát thanh mát',
    layerOrder: 4,
    accentColor: '#22c55e',
  },
  {
    id: 'pickles',
    name: 'Đồ chua',
    category: 'toppings',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.toppings,
    shortDescription: 'Củ cải cà rốt ngâm chua ngọt giòn sần sật',
    layerOrder: 4,
    accentColor: '#fb923c',
  },
  {
    id: 'cilantro',
    name: 'Rau ngò',
    category: 'toppings',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.toppings,
    shortDescription: 'Ngò rí tươi dậy mùi thơm',
    layerOrder: 4,
    accentColor: '#15803d',
  },
  {
    id: 'chili',
    name: 'Ớt',
    category: 'toppings',
    categoryLabel: INGREDIENT_CATEGORY_LABELS.toppings,
    shortDescription: 'Ớt tươi cắt lát cay nồng',
    layerOrder: 4,
    accentColor: '#dc2626',
  },
] as const;

export const INGREDIENT_MAP: Record<IngredientId, IngredientItem> =
  INGREDIENTS.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<IngredientId, IngredientItem>,
  );

export const INGREDIENTS_BY_CATEGORY: Record<
  IngredientCategory,
  IngredientItem[]
> = {
  bread_base: INGREDIENTS.filter((item) => item.category === 'bread_base'),
  spread_sauce: INGREDIENTS.filter((item) => item.category === 'spread_sauce'),
  main_filling: INGREDIENTS.filter((item) => item.category === 'main_filling'),
  toppings: INGREDIENTS.filter((item) => item.category === 'toppings'),
};

/**
 * 2. Danh sách 4 công thức bánh mì chuẩn theo SPEC.md
 */
export const BANH_MI_RECIPES: readonly BanhMiRecipe[] = [
  {
    id: 'banh_mi_pate',
    name: 'Bánh mì Pate',
    description:
      'Vỏ bánh giòn rụm kèm Pate thơm béo, dưa leo, đồ chua, ngò và sốt/nước tương.',
    breadBase: 'banh_mi_shell',
    requiredDoneness: 'crispy',
    requiredIngredients: ['pate', 'cucumber', 'pickles', 'cilantro'],
    alternativeGroups: [
      {
        label: 'Sốt/Nước tương',
        options: ['soy_sauce', 'special_sauce'],
      },
    ],
    basePoints: 100,
    orderTimeLimitSec: 25,
  },
  {
    id: 'banh_mi_trung_cha',
    name: 'Bánh mì Trứng Chả',
    description:
      'Vỏ bánh giòn kèm trứng chiên, chả lụa, pate hoặc bơ, đồ chua và rau ngò.',
    breadBase: 'banh_mi_shell',
    requiredDoneness: 'crispy',
    requiredIngredients: ['fried_egg', 'cha_lua', 'pickles', 'cilantro'],
    alternativeGroups: [
      {
        label: 'Pate/Bơ',
        options: ['pate', 'butter'],
      },
    ],
    basePoints: 120,
    orderTimeLimitSec: 28,
  },
  {
    id: 'banh_mi_heo_quay',
    name: 'Bánh mì Heo Quay',
    description:
      'Vỏ bánh giòn cùng heo quay giòn bì, dưa leo, đồ chua, rau ngò và nước sốt.',
    breadBase: 'banh_mi_shell',
    requiredDoneness: 'crispy',
    requiredIngredients: [
      'roast_pork',
      'cucumber',
      'pickles',
      'cilantro',
      'special_sauce',
    ],
    basePoints: 140,
    orderTimeLimitSec: 28,
  },
  {
    id: 'banh_mi_thap_cam',
    name: 'Bánh mì Thập Cẩm',
    description:
      'Đầy đủ nhân đặc biệt: Pate, trứng chiên, chả lụa, heo quay, dưa leo, đồ chua và rau ngò.',
    breadBase: 'banh_mi_shell',
    requiredDoneness: 'crispy',
    requiredIngredients: [
      'pate',
      'fried_egg',
      'cha_lua',
      'roast_pork',
      'cucumber',
      'pickles',
      'cilantro',
    ],
    basePoints: 180,
    orderTimeLimitSec: 35,
  },
] as const;

export const RECIPE_MAP: Record<BanhMiRecipeId, BanhMiRecipe> =
  BANH_MI_RECIPES.reduce(
    (acc, recipe) => {
      acc[recipe.id] = recipe;
      return acc;
    },
    {} as Record<BanhMiRecipeId, BanhMiRecipe>,
  );

export function getRecipeById(recipeId: BanhMiRecipeId): BanhMiRecipe {
  return RECIPE_MAP[recipeId];
}

const SCORING_CONFIG = {
  maxSpeedBonus: 50,
  comboBonusStep: 25,
  maxComboBonus: 150,
  baseFailurePenalty: 10,
  perMistakePenalty: 5,
  maxFailurePenalty: 30,
} as const;

/**
 * 3. Hàm chấm điểm ổ bánh mì so với order của khách.
 * - Kiểm tra độ giòn của vỏ bánh (chưa giòn / đạt chuẩn / quá lửa).
 * - Kiểm tra thiếu nguyên liệu bắt buộc & nhóm thay thế (VD: Pate/Bơ, Sốt/Nước tương).
 * - Kiểm tra nguyên liệu thừa/sai (VD: Thừa Ớt).
 * - Tính điểm cơ bản + thưởng tốc độ + thưởng combo, hoặc trừ điểm nhẹ & reset combo.
 */
export function evaluateBanhMiOrder(
  input: EvaluateBanhMiOrderInput,
): OrderEvaluationResult {
  const recipe =
    typeof input.recipe === 'string'
      ? getRecipeById(input.recipe)
      : input.recipe;

  const hasBread = input.hasBread ?? true;
  const uniqueAdded = new Set<IngredientId>(input.addedIngredients);
  // Bỏ qua mã vỏ bánh trong tập nguyên liệu nhân để tránh báo thừa khi UI gửi kèm bread_base
  uniqueAdded.delete(recipe.breadBase);

  const reasons: string[] = [];
  const missingIngredients: IngredientId[] = [];
  const extraIngredients: IngredientId[] = [];

  // 1. Kiểm tra vỏ bánh & độ giòn
  let donenessValid = true;
  if (!hasBread) {
    donenessValid = false;
    reasons.push('Chưa có vỏ bánh mì');
  } else if (input.breadDoneness !== recipe.requiredDoneness) {
    donenessValid = false;
    if (input.breadDoneness === 'undercooked') {
      reasons.push('Vỏ bánh chưa giòn');
    } else if (input.breadDoneness === 'burnt') {
      reasons.push('Bánh hơi cháy (quá lửa)');
    } else {
      reasons.push(
        `Độ giòn chưa đạt chuẩn (cần ${BREAD_DONENESS_LABELS[recipe.requiredDoneness]})`,
      );
    }
  }

  // 2. Tập các nguyên liệu hợp lệ cho công thức này
  const allowedIngredients = new Set<IngredientId>(recipe.requiredIngredients);
  const alternativeGroups = recipe.alternativeGroups ?? [];

  for (const group of alternativeGroups) {
    for (const optionId of group.options) {
      allowedIngredients.add(optionId);
    }
  }

  // 3. Kiểm tra nguyên liệu bắt buộc bị thiếu
  for (const requiredId of recipe.requiredIngredients) {
    if (!uniqueAdded.has(requiredId)) {
      missingIngredients.push(requiredId);
      const item = INGREDIENT_MAP[requiredId];
      reasons.push(`Thiếu ${item.name}`);
    }
  }

  // 4. Kiểm tra các nhóm nguyên liệu thay thế (VD: Pate/Bơ, Sốt/Nước tương)
  let missingGroupCount = 0;
  for (const group of alternativeGroups) {
    const hasAtLeastOne = group.options.some((optionId) =>
      uniqueAdded.has(optionId),
    );
    if (!hasAtLeastOne) {
      missingGroupCount += 1;
      reasons.push(`Thiếu ${group.label}`);
    }
  }

  // 5. Kiểm tra nguyên liệu thừa / sai công thức
  for (const addedId of uniqueAdded) {
    if (!allowedIngredients.has(addedId)) {
      extraIngredients.push(addedId);
      const item = INGREDIENT_MAP[addedId];
      reasons.push(`Thừa ${item.name}`);
    }
  }

  const isStandard =
    donenessValid &&
    missingIngredients.length === 0 &&
    missingGroupCount === 0 &&
    extraIngredients.length === 0;

  if (isStandard) {
    const nextCombo = Math.max(0, input.currentCombo) + 1;

    const timeLimit = input.timeLimitSec ?? recipe.orderTimeLimitSec;
    const clampedRemaining =
      input.timeRemainingSec !== undefined && timeLimit > 0
        ? Math.min(Math.max(input.timeRemainingSec, 0), timeLimit)
        : 0;
    const speedRatio = timeLimit > 0 ? clampedRemaining / timeLimit : 0;
    const speedBonus = Math.round(speedRatio * SCORING_CONFIG.maxSpeedBonus);

    const comboBonus = Math.min(
      Math.max(nextCombo - 1, 0) * SCORING_CONFIG.comboBonusStep,
      SCORING_CONFIG.maxComboBonus,
    );

    const scoreDelta = recipe.basePoints + speedBonus + comboBonus;

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      isStandard: true,
      scoreDelta,
      breakdown: {
        basePoints: recipe.basePoints,
        speedBonus,
        comboBonus,
        penalty: 0,
      },
      nextCombo,
      comboReset: false,
      reasons: [],
      missingIngredients: [],
      extraIngredients: [],
      donenessValid: true,
      summary: `${recipe.name} đạt chuẩn! +${scoreDelta} điểm (Combo x${nextCombo}).`,
    };
  }

  const mistakeCount =
    (donenessValid ? 0 : 1) +
    missingIngredients.length +
    missingGroupCount +
    extraIngredients.length;

  const penalty = Math.min(
    SCORING_CONFIG.baseFailurePenalty +
      Math.max(mistakeCount - 1, 0) * SCORING_CONFIG.perMistakePenalty,
    SCORING_CONFIG.maxFailurePenalty,
  );

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    isStandard: false,
    scoreDelta: -penalty,
    breakdown: {
      basePoints: 0,
      speedBonus: 0,
      comboBonus: 0,
      penalty,
    },
    nextCombo: 0,
    comboReset: input.currentCombo > 0,
    reasons,
    missingIngredients,
    extraIngredients,
    donenessValid,
    summary: `${recipe.name} chưa đạt chuẩn (${reasons.join(', ')}). -${penalty} điểm.`,
  };
}
