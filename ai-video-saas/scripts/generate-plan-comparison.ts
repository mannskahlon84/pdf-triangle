import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";

const mockCampaign: Campaign = {
  id: "cmp-123",
  campaignName: "Pro Earbuds Launch",
  brandName: "AcousticPro",
  industry: "electronics",
  goal: "sales",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Discover AcousticPro with premium quality and deep bass sound.",
  marketingStrategy: "Engineered with studio-grade acoustic drivers.",
  cta: "Order your AcousticPro earphones today.",
};

const mediaUrls = [
  "blob:http://localhost:3000/earphone-side-profile.png",
  "blob:http://localhost:3000/earphone-box-front.png",
  "blob:http://localhost:3000/earphone-lifestyle-gym.png",
  "blob:http://localhost:3000/earphone-clean-top.png",
];

(async () => {
  console.log("# Hybrid AI vs Standard Mode Comparison\n");

  const standardPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: false,
    mediaUrls,
  });

  const hybridPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: true,
    mediaUrls,
  });

  console.log("## Standard Mode\n");
  standardPlan.scenes.forEach((s) => {
    console.log(`### Scene ${s.sceneNumber}: ${s.purpose}`);
    console.log(`- **Asset**: ${s.backgroundImageUrl?.split('/').pop() || "None"}`);
    console.log(`- **Text Overlay**: ${s.textOverlay}`);
    console.log(`- **Voice**: ${s.voiceText}`);
    console.log(`- **Animation**: ${s.animationStyle}`);
    console.log(`- **Transition**: ${s.transition}`);
  });

  console.log("\n## Hybrid AI Mode\n");
  hybridPlan.scenes.forEach((s) => {
    console.log(`### Scene ${s.sceneNumber}: ${s.purpose}`);
    console.log(`- **Asset**: ${s.backgroundImageUrl?.split('/').pop() || "None"}`);
    console.log(`- **Text Overlay**: ${s.textOverlay}`);
    console.log(`- **Voice**: ${s.voiceText}`);
    console.log(`- **Animation**: ${s.animationStyle}`);
    console.log(`- **Transition**: ${s.transition}`);
  });
})();
