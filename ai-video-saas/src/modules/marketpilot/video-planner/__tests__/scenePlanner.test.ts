import { ScenePlanner } from "../scenePlanner";
import { Campaign } from "../../types/promotion.types";
import { SceneTemplatesService } from "../sceneTemplates";
import { TimingCalculator } from "../timingCalculator";

export function runScenePlannerTestSuite(): {
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; error?: string }[];
} {
  const results: { testName: string; passed: boolean; error?: string }[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorMessage: string) {
    if (condition) {
      passed++;
      results.push({ testName, passed: true });
    } else {
      failed++;
      results.push({ testName, passed: false, error: errorMessage });
    }
  }

  const mockCampaign: Campaign = {
    id: "test-id-1",
    campaignName: "Test Campaign 30s",
    marketingStrategy: "Direct response app promotion",
    targetAudience: "Busy Professionals",
    videoConcepts: [
      {
        id: "c1",
        title: "Hook concept",
        hook: "Still managing your daily schedule by hand?",
        format: "Reel",
        duration: "30s",
        visualDescription: "Phone screen showing automation",
        ctaStyle: "Button",
      },
    ],
    scripts: [],
    captions: [
      {
        platform: "instagram",
        text: "Experience the easiest way to automate your daily schedule.",
        hashtags: ["#ViralApp", "#AI", "#Productivity"],
        callToAction: "Download Free",
      },
    ],
    hashtags: ["#ViralApp", "#AI", "#Productivity"],
    adCopy: ["Download ViralApp free today."],
    cta: "Download Free on App Store & Google Play",
    createdAt: new Date().toISOString(),
    brandName: "ViralApp",
    industry: "app",
    promotionType: "app",
    goal: "app_installs",
    valueProposition: "Automate your daily schedule with AI in 1 click.",
  };


  // 1. Template selection test
  try {
    const tApp = SceneTemplatesService.resolveTemplate("app");
    const tRest = SceneTemplatesService.resolveTemplate("restaurant");
    const tSale = SceneTemplatesService.resolveTemplate("business", "sale campaign");
    assert(
      tApp.id === "appPromotionScene" &&
        tRest.id === "restaurantReelScene" &&
        tSale.id === "saleCampaignScene",
      "Template Selection Test",
      "Expected resolveTemplate to match industry and goal correctly."
    );
  } catch (err: any) {
    assert(false, "Template Selection Test", err.message);
  }

  // 2. Duration calculation test
  try {
    const timings15 = TimingCalculator.calculateSceneTimings([0.2, 0.4, 0.4], "15s");
    const timings30 = TimingCalculator.calculateSceneTimings([0.2, 0.4, 0.4], "30s");
    assert(
      timings15[0].startTimeSec === 0 &&
        timings15[2].endTimeSec === 15 &&
        timings30[0].startTimeSec === 0 &&
        timings30[2].endTimeSec === 30,
      "Duration Calculation Test",
      "Expected calculateSceneTimings to produce precise 0 to totalSec boundaries without drift."
    );
  } catch (err: any) {
    assert(false, "Duration Calculation Test", err.message);
  }

  // 3. Scene ordering & continuity test
  try {
    const plan = ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, { duration: "30s" });
    const isOrdered = plan.scenes.every((s, idx) => s.sceneNumber === idx + 1);
    const zeroGap = plan.scenes.every((s, idx) => {
      if (idx === 0) return true;
      const prevEnd = parseFloat(plan.scenes[idx - 1].endTime);
      const currStart = parseFloat(s.startTime);
      return Math.abs(currStart - prevEnd) <= 0.2;
    });
    assert(
      isOrdered && zeroGap && plan.scenes.length >= 4,
      "Scene Ordering & Continuity Test",
      "Expected consecutive scene numbers and zero gap between scene timestamps."
    );
  } catch (err: any) {
    assert(false, "Scene Ordering & Continuity Test", err.message);
  }

  // 4. Missing scene data & validation test
  try {
    const invalidPlan = {
      ...ScenePlanner.generateVideoPlanFromCampaign(mockCampaign),
      scenes: [
        {
          sceneNumber: 2, // invalid order
          startTime: "0s",
          endTime: "5s",
          duration: "5 seconds",
          purpose: "hook",
          voiceText: "",
          visualDescription: "",
          imagePrompt: "",
          videoPrompt: "",
          animationStyle: "cut",
          transition: "cut",
          textOverlay: "",
        },
      ],
    };
    let threwError = false;
    try {
      ScenePlanner.validateVideoPlan(invalidPlan as any);
    } catch (e) {
      threwError = true;
    }
    assert(
      threwError,
      "Missing Scene Data Validation Test",
      "Expected validateVideoPlan to throw on invalid ordering or empty required fields."
    );
  } catch (err: any) {
    assert(false, "Missing Scene Data Validation Test", err.message);
  }

  // 5. JSON schema validation test
  try {
    const plan = ScenePlanner.generateVideoPlanFromCampaign(mockCampaign);
    assert(
      Boolean(
        plan.id &&
          plan.title &&
          plan.duration &&
          plan.voiceScript &&
          plan.visualAssets &&
          plan.thumbnailPrompt &&
          plan.caption &&
          plan.hashtags.length > 0
      ),
      "JSON Schema Validation Test",
      "Expected VideoPlan schema to be fully populated with assets, voiceScript, and social metadata."
    );
  } catch (err: any) {
    assert(false, "JSON Schema Validation Test", err.message);
  }

  return {
    passed,
    failed,
    results,
  };
}

if (typeof require !== "undefined" && require.main === module) {
  const report = runScenePlannerTestSuite();
  console.log("=== MarketPilot AI Scene Planner Test Report ===");
  console.log(`Passed: ${report.passed} | Failed: ${report.failed}`);
  report.results.forEach((r) => {
    console.log(`[${r.passed ? "PASS" : "FAIL"}] ${r.testName}${r.error ? ` - Error: ${r.error}` : ""}`);
  });
  process.exit(report.failed > 0 ? 1 : 0);
}

