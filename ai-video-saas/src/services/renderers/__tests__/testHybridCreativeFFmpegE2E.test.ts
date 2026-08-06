import fs from "fs";
import path from "path";
import { ScenePlanner } from "../../../modules/marketpilot/video-planner/scenePlanner";
import { TimelineBuilder } from "../../../modules/marketpilot/video-generator/timelineBuilder";
import { FFmpegRenderer } from "../FFmpegRenderer";
import { Campaign } from "../../../modules/marketpilot/types/promotion.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
}

async function verifyHybridCreativeE2E() {
  console.log("=== HybridCreativePlanner -> FFmpegRenderer E2E Verification Suite ===\n");

  // 1. Setup mock uploaded product images (Data URLs)
  const uploadedEarphoneImages = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  ];

  const mockCampaign: Campaign = {
    id: "camp_hybrid_e2e_001",
    brandName: "Boult",
    campaignName: "Earphone Reel Campaign",
    goal: "product-launch",
    industry: "electronics",
    promotionType: "product_showcase",
    valueProposition: "Deep bass sound with 40 hour battery life",
    cta: "Order Now",
    marketingStrategy: "Highlight audio clarity and long battery",
    videoConcepts: [],
    targetAudience: "Tech enthusiasts",
    scripts: [],
    captions: [],
    hashtags: ["#Boult", "#Audio"],
    adCopy: ["Discover Boult today"],
    createdAt: new Date().toISOString(),
  };

  // 0. Verify HYBRID_AI_MODE=false produces previous behavior
  process.env.HYBRID_AI_MODE = "false";
  console.log("0. Testing HYBRID_AI_MODE=false (verifying default previous behaviour)...");
  const defaultPlan = ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    duration: "15s",
    aspectRatio: "9:16",
    mediaUrls: uploadedEarphoneImages,
  });
  assert(
    defaultPlan.id.startsWith("plan-") && !defaultPlan.id.startsWith("plan_hybrid_"),
    `Plan ID should use standard template planner when mode is OFF. Got: ${defaultPlan.id}`
  );
  console.log("   ✓ Verified HYBRID_AI_MODE=false preserves existing template-driven behaviour.\n");

  // 2. Enable HYBRID_AI_MODE=true
  process.env.HYBRID_AI_MODE = "true";
  console.log("1. Generating VideoPlan with HYBRID_AI_MODE=true...");
  const videoPlan = ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    duration: "15s",
    aspectRatio: "9:16",
    mediaUrls: uploadedEarphoneImages,
  });

  assert(videoPlan.scenes.length === 4, "Should generate exactly 4 scenes");
  const purposes = videoPlan.scenes.map((s) => s.purpose);
  assert(
    purposes.join(",") === "hook,showcase,benefit,cta",
    `Purposes should follow Hook -> Feature -> Benefit -> CTA. Got: ${purposes.join(",")}`
  );
  console.log("   ✓ VideoPlan generated with Hook, Feature, Benefit, CTA marketing structure.");

  // 3. Build RenderTimeline using TimelineBuilder (unchanged contract)
  console.log("2. Building RenderTimeline via TimelineBuilder (verifying schema unchanged)...");
  const timeline = await TimelineBuilder.buildTimeline(videoPlan);

  assert(Boolean(timeline.id), "Timeline must have an id");
  assert(timeline.videoPlanId === videoPlan.id, "Timeline videoPlanId should match videoPlan.id");
  assert(timeline.duration === "15s", "Timeline duration should be 15s");
  assert(timeline.aspectRatio === "9:16", "Timeline aspectRatio should be 9:16");
  assert(timeline.scenes.length === 4, "Timeline must contain 4 scenes");

  // 4. Verify generated scenes contain valid asset URLs from uploaded media
  console.log("3. Verifying all RenderTimeline scenes contain valid uploaded asset URLs...");
  timeline.scenes.forEach((scene, index) => {
    assert(Boolean(scene.backgroundImageUrl), `Scene ${index + 1} missing backgroundImageUrl`);
    assert(
      uploadedEarphoneImages.includes(scene.backgroundImageUrl!),
      `Scene ${index + 1} backgroundImageUrl must be an uploaded asset URL`
    );
    assert(Boolean(scene.productImageUrl), `Scene ${index + 1} missing productImageUrl`);
    assert(
      uploadedEarphoneImages.includes(scene.productImageUrl!),
      `Scene ${index + 1} productImageUrl must be an uploaded asset URL`
    );
  });
  console.log("   ✓ All 4 scenes have valid uploaded asset URLs assigned.");

  // 5. Render Video via FFmpegRenderer (verifying existing renderer unchanged & still works)
  console.log("4. Rendering live MP4 via existing FFmpegRenderer...");
  const renderer = new FFmpegRenderer();
  const renderResult = await renderer.render(timeline);

  assert(Boolean(renderResult.outputUrl), "Render result should produce outputUrl");
  assert(renderResult.duration === 15, `Duration should be 15 seconds. Got: ${renderResult.duration}`);
  console.log(`   ✓ FFmpeg rendering completed: ${renderResult.outputUrl} (${renderResult.duration}s)`);

  // 6. Verify MP4 file exists and has non-zero size
  const relativePath = renderResult.outputUrl.replace(/^\//, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  assert(fs.existsSync(absolutePath), `Output file not found at ${absolutePath}`);

  const stat = fs.statSync(absolutePath);
  assert(stat.size > 0, `Output MP4 file is empty: ${absolutePath}`);
  console.log(`   ✓ Verified MP4 output size: ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB)`);

  console.log("\n=== ALL HYBRID CREATIVE E2E VERIFICATION TESTS PASSED 100% ===");
}

verifyHybridCreativeE2E().catch((err) => {
  console.error("E2E Suite Failed:", err);
  process.exit(1);
});
