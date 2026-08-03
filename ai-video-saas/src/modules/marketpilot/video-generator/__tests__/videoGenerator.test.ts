import {
  AssetGenerator,
  VoiceGenerator,
  TimelineBuilder,
  RenderCoordinator,
  MarketPilotRenderAdapter,
} from "../index";
import { ScenePlanner } from "../../video-planner";
import { Campaign } from "../../types/promotion.types";

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
}

export async function runVideoGeneratorTestSuite(): Promise<{
  passed: number;
  failed: number;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, name: string, errMsg?: string) => {
    results.push({
      testName: name,
      passed: condition,
      error: condition ? undefined : errMsg || "Assertion failed",
    });
  };

  const dummyCampaign: Campaign = {
    id: "test-camp-p3",
    campaignName: "Phase 3 CLI Test",
    brandName: "Manpower Corp",
    industry: "business",
    promotionType: "business",
    goal: "brand_awareness",
    valueProposition: "Automating enterprise hiring.",
    cta: "Request Demo",
    marketingStrategy: "Corporate leadership reel",
    targetAudience: "HR Leaders",
    videoConcepts: [],
    scripts: [],
    captions: [],
    hashtags: ["#Manpower", "#Hiring"],
    adCopy: [],
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. VideoPlan conversion
    const videoPlan = ScenePlanner.generateVideoPlanFromCampaign(
      dummyCampaign,
      {
        duration: "30s",
        aspectRatio: "9:16",
      }
    );
    assert(
      Boolean(videoPlan && videoPlan.scenes.length >= 3),
      "VideoPlan Conversion Test"
    );

    // 2. Asset mapping
    const assets = await AssetGenerator.generateSceneAssets(
      videoPlan.scenes,
      "9:16"
    );
    assert(
      Boolean(
        assets.length === videoPlan.scenes.length &&
          assets[0].backgroundImageUrl
      ),
      "Asset Mapping Test"
    );

    // 3. Voice timeline
    const voiceData = await VoiceGenerator.generateVoiceTimeline(
      videoPlan.scenes,
      "ElevenLabs"
    );
    assert(
      Boolean(
        voiceData.segments.length === videoPlan.scenes.length &&
          voiceData.captions.length > 0
      ),
      "Voice Timeline Test"
    );

    // 4. Timeline Builder
    const timeline = await TimelineBuilder.buildTimeline(
      videoPlan,
      "ElevenLabs"
    );
    assert(
      Boolean(
        timeline.id &&
          timeline.scenes.length === videoPlan.scenes.length &&
          timeline.audioTrack.masterAudioUrl
      ),
      "Timeline Builder Test"
    );

    // 5. Renderer adapter
    const adapterResult =
      await MarketPilotRenderAdapter.submitToExistingVideoEngine(
        timeline,
        true
      );
    assert(
      Boolean(adapterResult.jobId && adapterResult.status),
      "Renderer Adapter Test"
    );

    // 6. API response & Coordinator
    const genResult = await RenderCoordinator.startVideoGeneration(
      videoPlan,
      "ElevenLabs",
      false
    );
    assert(
      Boolean(
        genResult.videoId &&
          genResult.status === "COMPLETED" &&
          genResult.timeline &&
          genResult.previewUrl
      ),
      "API Response & Coordinator Test"
    );

    // 7. Error handling
    let caught = false;
    try {
      await RenderCoordinator.startVideoGeneration(
        null as any,
        "ElevenLabs",
        false
      );
    } catch {
      caught = true;
    }
    assert(caught, "Error Handling Test");
  } catch (err: any) {
    assert(false, "Test Suite Fatal Error", err.message);
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

if (typeof require !== "undefined" && require.main === module) {
  runVideoGeneratorTestSuite().then((report) => {
    console.log("=== MarketPilot AI Phase 3 Video Generator Test Report ===");
    console.log(`Passed: ${report.passed} | Failed: ${report.failed}`);
    report.results.forEach((r) => {
      console.log(
        `[${r.passed ? "PASS" : "FAIL"}] ${r.testName}${
          r.error ? ` - Error: ${r.error}` : ""
        }`
      );
    });
    process.exit(report.failed > 0 ? 1 : 0);
  });
}
