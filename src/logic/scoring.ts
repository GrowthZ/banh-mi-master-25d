/**
 * Module logic chấm điểm và xử lý đơn hàng.
 * Re-export hàm chấm điểm lõi từ menuOrders để các module UI/Controller sử dụng tập trung.
 */
export {
  evaluateBanhMiOrder,
  getRecipeById,
  BREAD_DONENESS_LABELS,
} from '../data/menuOrders';

export type {
  EvaluateBanhMiOrderInput,
  OrderEvaluationResult,
} from '../types/game';
