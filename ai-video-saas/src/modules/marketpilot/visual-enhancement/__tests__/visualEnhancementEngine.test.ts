import { VisualEnhancementEngine } from "../visualEnhancementEngine";
import { VideoPlan, VideoScene } from "../../video-planner/types/planner.types";
import { TimelineBuilder } from "../../video-generator/timelineBuilder";

async function runTests() {
  console.log("=== Visual Enhancement Engine (VEE) Tests ===");
  const dummyScene: VideoScene = {
    sceneNumber: 1,
    startTime: "0",
    endTime: "3.75",
    duration: "3.75",
    purpose: "hook",
    voiceText: "Hello world",
    visualDescription: "A product on a table",
    imagePrompt: "",
    videoPrompt: "",
    animationStyle: "ken-burns-in",
    transition: "fade",
    textOverlay: "Buy Now",
    backgroundImageUrl: "https://example.com/raw-photo.jpg",
  };

  const dummyVideoPlan: VideoPlan = {
    id: "test-plan",
    title: "Test Plan",
    duration: "15s",
    aspectRatio: "9:16",
    platform: "universal",
    scenes: [dummyScene],
    voiceScript: "Hello world",
    visualAssets: [],
    thumbnailPrompt: "",
    caption: "",
    hashtags: [],
    createdAt: new Date().toISOString(),
  };

  console.log("1. Testing standard mode...");
  const stdPlan = await VisualEnhancementEngine.enhanceVideoPlan(
    dummyVideoPlan,
    { mode: "standard" }
  );

  if (!stdPlan.assetLineage || stdPlan.assetLineage.length !== 1) {
    throw new Error("Asset lineage missing");
  }
  const stdLineage = stdPlan.assetLineage[0];
  if (stdLineage.enhancementMode !== "standard") throw new Error("Wrong mode");
  if (stdPlan.scenes[0].backgroundImageUrl !== "https://example.com/raw-photo.jpg") {
    throw new Error("Standard mode mutated backgroundImageUrl");
  }
  console.log(" ✓ Standard mode passed");

  console.log("2. Testing hybrid_ai mode...");
  const hybridPlan = await VisualEnhancementEngine.enhanceVideoPlan(
    dummyVideoPlan,
    { mode: "hybrid_ai" }
  );

  const hybridLineage = hybridPlan.assetLineage![0];
  if (hybridLineage.enhancementMode !== "hybrid_ai") throw new Error("Wrong mode");
  if (hybridPlan.scenes[0].productImageUrl !== undefined) {
    throw new Error("productImageUrl was not cleared");
  }
  console.log(" ✓ Hybrid AI mode passed");

  console.log("3. Testing RenderTimeline unchanged contract...");
  const timeline = await TimelineBuilder.buildTimeline(stdPlan, "mock");
  if (timeline.scenes[0].backgroundImageUrl !== "https://example.com/raw-photo.jpg") {
    throw new Error("RenderTimeline was modified");
  }
  if ((timeline as any).assetLineage !== undefined) {
    throw new Error("AssetLineage leaked into RenderTimeline");
  }
  console.log(" ✓ RenderTimeline unchanged passed");

  console.log("=== All VEE Tests Passed ===");
}

runTests().catch(console.error);
