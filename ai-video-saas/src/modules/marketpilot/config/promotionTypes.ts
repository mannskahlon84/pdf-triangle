import { promotionTypesConfig, PromotionTypeConfig, PromotionFieldSchema } from "@/config/promotionTypes.config";
import { PromotionTargetType } from "@/types/database";

export { promotionTypesConfig };
export type { PromotionTypeConfig, PromotionFieldSchema };

export const getPromotionTypeConfig = (type: PromotionTargetType): PromotionTypeConfig => {
  return promotionTypesConfig[type] || promotionTypesConfig.website;
};

export const getAllPromotionTypes = (): PromotionTypeConfig[] => {
  return Object.values(promotionTypesConfig);
};
