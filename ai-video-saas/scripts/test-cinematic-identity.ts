import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { AssetGenerator } from "../src/modules/marketpilot/video-generator/assetGenerator";

const mockCampaign: Campaign = {
  id: "cmp-cinematic-test",
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
  console.log("=== CINEMATIC PRODUCT IDENTITY PROTECTION TEST ===\n");

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

  console.log("--- 1. STANDARD MODE ---");
  console.log("Uses original assets as full-screen backgrounds directly.\n");
  const standardTimelineAssets = await AssetGenerator.generateSceneAssets(standardPlan.scenes, "9:16", mediaUrls);
  
  standardTimelineAssets.forEach((asset, idx) => {
    const scene = standardPlan.scenes[idx];
    console.log(`[Scene ${asset.sceneNumber}] Purpose: ${scene.purpose}`);
    console.log(`  - Original Asset URL: ${asset.backgroundImageUrl}`);
    console.log(`  - Cinematic Instruction Present: ${!!scene.cinematicInstruction}\n`);
  });

  console.log("--- 2. HYBRID AI MODE ---");
  console.log("Uses intelligent asset routing but retains original assets directly.\n");
  const hybridTimelineAssets = await AssetGenerator.generateSceneAssets(hybridPlan.scenes, "9:16", mediaUrls);
  
  hybridTimelineAssets.forEach((asset, idx) => {
    const scene = hybridPlan.scenes[idx];
    console.log(`[Scene ${asset.sceneNumber}] Purpose: ${scene.purpose}`);
    console.log(`  - Routed Asset URL: ${asset.backgroundImageUrl}`);
    console.log(`  - Cinematic Instruction Present: ${!!scene.cinematicInstruction}\n`);
  });

  console.log("--- 3. CINEMATIC AI MODE ---");
  console.log("Applies rich environments while strictly preserving product identity.\n");
  const cinematicTimelineAssets = await AssetGenerator.generateSceneAssets(cinematicPlan.scenes, "9:16", mediaUrls);
  
  cinematicTimelineAssets.forEach((asset, idx) => {
    const scene = cinematicPlan.scenes[idx];
    // Cast to access cinematicMetadata which we added dynamically in engine
    const cinematicMetadata = (scene as any).cinematicMetadata;
    
    console.log(`[Scene ${asset.sceneNumber}] Purpose: ${scene.purpose}`);
    console.log(`  - Original Base Asset (Product Hero): ${asset.productImageUrl || "Preserved directly in BG"}`);
    console.log(`  - Generated Environment (Background): ${asset.backgroundImageUrl}`);
    if (cinematicMetadata) {
      console.log(`  - Instruction Snapshot: Environment [${cinematicMetadata.instructionSnapshot?.environment}], Style [${cinematicMetadata.instructionSnapshot?.visualStyle}]`);
    }
    console.log(`  - Cinematic Provider: ${cinematicMetadata?.model || "none"}\n`);
  });

  console.log("=== FFmpeg Output Contract Verification ===");
  const allValid = cinematicTimelineAssets.every(asset => 
    typeof asset.backgroundImageUrl === "string" &&
    typeof asset.animationStyle === "string" &&
    typeof asset.transition === "string"
  );
  console.log(`✓ RenderTimeline schema valid: ${allValid}`);
  console.log(`✓ FFmpegRenderer isolated from cinematic instructions: ${cinematicTimelineAssets.every(a => !(a as any).cinematicInstruction)}`);
}

runTest().catch(console.error);
