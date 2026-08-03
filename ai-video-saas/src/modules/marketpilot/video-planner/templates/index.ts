import { SceneTemplateDefinition } from "../types/planner.types";
import { brandIntroductionScene } from "./brandIntroductionScene";
import { productLaunchScene } from "./productLaunchScene";
import { appPromotionScene } from "./appPromotionScene";
import { restaurantReelScene } from "./restaurantReelScene";
import { realEstateTourScene } from "./realEstateTourScene";
import { creatorGrowthScene } from "./creatorGrowthScene";
import { recruitmentVideoScene } from "./recruitmentVideoScene";
import { saleCampaignScene } from "./saleCampaignScene";

export * from "./brandIntroductionScene";
export * from "./productLaunchScene";
export * from "./appPromotionScene";
export * from "./restaurantReelScene";
export * from "./realEstateTourScene";
export * from "./creatorGrowthScene";
export * from "./recruitmentVideoScene";
export * from "./saleCampaignScene";

export const SCENE_TEMPLATES: Record<string, SceneTemplateDefinition> = {
  brandIntroductionScene,
  productLaunchScene,
  appPromotionScene,
  restaurantReelScene,
  realEstateTourScene,
  creatorGrowthScene,
  recruitmentVideoScene,
  saleCampaignScene,
};

export function getSceneTemplateForIndustry(industry: string, goal?: string): SceneTemplateDefinition {
  if (goal?.toLowerCase().includes("sale") || goal?.toLowerCase().includes("discount")) {
    return saleCampaignScene;
  }
  const map: Record<string, SceneTemplateDefinition> = {
    business: brandIntroductionScene,
    product: productLaunchScene,
    app: appPromotionScene,
    restaurant: restaurantReelScene,
    "real-estate": realEstateTourScene,
    "social-profile": creatorGrowthScene,
    recruitment: recruitmentVideoScene,
  };
  return map[industry] || brandIntroductionScene;
}
