import { ScenePlanner } from "../scenePlanner";
import { HybridCreativePlanner } from "../hybridCreativePlanner";
import { AssetAnalyzer } from "../analyzers/assetAnalyzer";
import { Campaign } from "../../types/promotion.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
}

async function runHybridCreativeTests() {
  console.log("=== Running HybridCreativePlanner & AssetAnalyzer Suite ===\n");

  const mockCampaign: Campaign = {
    id: "camp_hybrid_test_001",
    brandName: "Boult",
    campaignName: "Earphone Launch Campaign",
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

  const sampleMediaUrls = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  ];

  // Test 1: When HYBRID_AI_MODE is false, preserve existing behaviour
  console.log("Test 1: Verify existing ScenePlanner behaviour when HYBRID_AI_MODE=false...");
  process.env.HYBRID_AI_MODE = "false";
  const planDefault = ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    duration: "15s",
  });
  assert(Boolean(planDefault), "Plan should be generated");
  assert(planDefault.scenes.length > 0, "Default plan should have scenes");
  assert(
    planDefault.title.includes("Boult — Earphone Launch Campaign"),
    "Default plan should use standard template title"
  );
  console.log("  ✓ Test 1 Passed: Existing ScenePlanner behaviour preserved.\n");

  // Test 2: AssetAnalyzer should score images and choose Hero Image
  console.log("Test 2: Verify AssetAnalyzer hero selection and role assignment...");
  const analyzed = AssetAnalyzer.analyze(sampleMediaUrls, "Boult", "electronics");
  assert(analyzed.length === 4, "Should analyze all 4 uploaded images");
  assert(analyzed[0].role === "hero", "First image should be designated hero");
  assert(analyzed[0].score === 95, "Hero image should receive highest quality score 95");

  const hero = AssetAnalyzer.chooseHeroImage(analyzed);
  assert(Boolean(hero), "Hero image should be selected");
  assert(hero?.url === sampleMediaUrls[0], "Hero image URL should match top asset");
  console.log("  ✓ Test 2 Passed: Hero image correctly selected and scored.\n");

  // Test 3: When HYBRID_AI_MODE=true, use HybridCreativePlanner
  console.log("Test 3: Verify HybridCreativePlanner Hook -> Feature -> Benefit -> CTA marketing structure when HYBRID_AI_MODE=true...");
  process.env.HYBRID_AI_MODE = "true";
  const hybridPlan = ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    duration: "15s",
    aspectRatio: "9:16",
    mediaUrls: sampleMediaUrls,
  });

  assert(Boolean(hybridPlan), "Hybrid plan should be generated");
  assert(hybridPlan.duration === "15s", "Duration should be 15s");
  assert(hybridPlan.scenes.length === 4, "Should generate exactly 4 marketing structure scenes");

  const purposes = hybridPlan.scenes.map((s) => s.purpose);
  assert(
    purposes.join(",") === "hook,showcase,benefit,cta",
    `Purposes should match Hook, Feature(showcase), Benefit, CTA structure. Got: ${purposes.join(",")}`
  );

  // Test 4: Check asset URLs in generated scenes
  console.log("Test 4: Verify generated scenes contain valid uploaded asset URLs...");
  hybridPlan.scenes.forEach((scene, i) => {
    assert(Boolean(scene.backgroundImageUrl), `Scene ${i + 1} must have backgroundImageUrl`);
    assert(
      sampleMediaUrls.includes(scene.backgroundImageUrl!),
      `Scene ${i + 1} backgroundImageUrl must be from uploaded mediaUrls`
    );
    assert(Boolean(scene.productImageUrl), `Scene ${i + 1} must have productImageUrl`);
    assert(Boolean(scene.textOverlay), `Scene ${i + 1} must have textOverlay`);
  });
  console.log("  ✓ Test 4 Passed: All scenes mapped to valid uploaded asset URLs.\n");

  console.log("=== ALL HYBRID CREATIVE PLANNER TESTS PASSED 100% ===");
}

runHybridCreativeTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
