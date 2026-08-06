import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { AssetGenerator } from "../src/modules/marketpilot/video-generator/assetGenerator";

const mockCampaign: Campaign = {
  id: "cmp-motion-test",
  campaignName: "AcousticPro Earbuds",
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

async function runTest() {
  console.log("=== MOTION DIRECTOR PHASE 1 REPORT ===\n");

  const standardPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: false,
    mediaUrls,
  });

  const hybridPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: true,
    mediaUrls,
  });

  const cinematicPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: true,
    cinematicAiMode: true,
    mediaUrls,
  });

  console.log("--- 1. STANDARD MODE (Control) ---");
  console.log("Uses default fallback animations and ignores motion metadata entirely.\n");
  const standardTimelineAssets = await AssetGenerator.generateSceneAssets(standardPlan.scenes, "9:16", mediaUrls);
  
  standardTimelineAssets.forEach((asset, idx) => {
    const scene = standardPlan.scenes[idx];
    console.log(`[Scene ${asset.sceneNumber}] Purpose: ${scene.purpose}`);
    console.log(`  - Original Animation: ${scene.animationStyle}`);
    console.log(`  - Original Transition: ${scene.transition}`);
    console.log(`  - Translated Animation: ${asset.animationStyle}`);
    console.log(`  - Translated Transition: ${asset.transition}`);
    console.log(`  - Motion Metadata Present: ${!!scene.motionMetadata}\n`);
  });

  console.log("--- 2. HYBRID AI MODE (Test) ---");
  console.log("Uses MotionDirectorEngine to intelligently apply motion metadata inside VideoPlan, translated cleanly by AssetGenerator.\n");
  const hybridTimelineAssets = await AssetGenerator.generateSceneAssets(hybridPlan.scenes, "9:16", mediaUrls);
  
  hybridTimelineAssets.forEach((asset, idx) => {
    const scene = hybridPlan.scenes[idx];
    console.log(`[Scene ${asset.sceneNumber}] Purpose: ${scene.purpose}`);
    console.log(`  - Motion Intent: ${scene.motionMetadata?.movement} (${scene.motionMetadata?.emphasis})`);
    console.log(`  - Motion Intensity: ${scene.motionMetadata?.intensity}`);
    console.log(`  - Translated Animation: ${asset.animationStyle}`);
    console.log(`  - Translated Transition: ${asset.transition}`);
    console.log(`  - Preserved Reason: ${scene.motionMetadata?.reason}\n`);
  });

  console.log("--- 3. CINEMATIC AI MODE (Placeholder) ---");
  console.log("Uses MotionDirectorEngine with high intensity flag as placeholder for Phase 2 Cinematic AI logic.\n");
  const cinematicTimelineAssets = await AssetGenerator.generateSceneAssets(cinematicPlan.scenes, "9:16", mediaUrls);
  
  cinematicTimelineAssets.forEach((asset, idx) => {
    const scene = cinematicPlan.scenes[idx];
    console.log(`[Scene ${asset.sceneNumber}] Purpose: ${scene.purpose}`);
    console.log(`  - Motion Intent: ${scene.motionMetadata?.movement} (${scene.motionMetadata?.emphasis})`);
    console.log(`  - Motion Intensity: ${scene.motionMetadata?.intensity}`);
    console.log(`  - Translated Animation: ${asset.animationStyle}`);
    console.log(`  - Translated Transition: ${asset.transition}\n`);
  });

  console.log("All RenderTimelines remain isolated. FFmpegRenderer will only see standard animationStyle enums!");
}

runTest().catch(console.error);
