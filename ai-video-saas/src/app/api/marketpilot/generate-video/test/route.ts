import { NextResponse } from "next/server";
import {
  AssetGenerator,
  VoiceGenerator,
  TimelineBuilder,
  RenderCoordinator,
  MarketPilotRenderAdapter,
} from "@/modules/marketpilot/video-generator";
import { ScenePlanner } from "@/modules/marketpilot/video-planner";
import { Campaign } from "@/modules/marketpilot/types/promotion.types";

export async function GET() {
  const tests: { name: string; passed: boolean; details?: string; error?: string }[] = [];

  // Dummy campaign for generating a VideoPlan
  const dummyCampaign: Campaign = {
    id: "test-camp-p3",
    campaignName: "Phase 3 Test Campaign",
    brandName: "Urban Fitness",
    industry: "fitness",
    promotionType: "business",
    goal: "brand_awareness",
    valueProposition: "Transform your body with AI training plans.",
    cta: "Start Free Today",
    marketingStrategy: "High energy gym motivation reel",
    targetAudience: "Fitness enthusiasts",
    videoConcepts: [],
    scripts: [],
    captions: [],
    hashtags: ["#UrbanFitness", "#GymReel"],
    adCopy: [],
    createdAt: new Date().toISOString(),
  };

  try {
    // Test 1: VideoPlan conversion & creation
    const videoPlan = ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
      duration: "30s",
      aspectRatio: "9:16",
    });
    const test1Passed = Boolean(videoPlan && videoPlan.scenes.length >= 3);
    tests.push({
      name: "VideoPlan Conversion Test",
      passed: test1Passed,
      details: `Generated ${videoPlan.scenes.length} scenes for ${videoPlan.title}`,
    });

    // Test 2: Asset mapping
    const assets = await AssetGenerator.generateSceneAssets(videoPlan.scenes, "9:16");
    const test2Passed = Boolean(
      assets.length === videoPlan.scenes.length && assets[0].backgroundImageUrl
    );
    tests.push({
      name: "Asset Mapping Test",
      passed: test2Passed,
      details: `Mapped ${assets.length} visual asset specifications successfully.`,
    });

    // Test 3: Voice timeline
    const voiceData = await VoiceGenerator.generateVoiceTimeline(videoPlan.scenes, "ElevenLabs");
    const test3Passed = Boolean(
      voiceData.segments.length === videoPlan.scenes.length &&
        voiceData.captions.length > 0 &&
        voiceData.totalDurationSec > 0
    );
    tests.push({
      name: "Voice Timeline Test",
      passed: test3Passed,
      details: `Generated ${voiceData.segments.length} audio segments with word-level subtitles. Total duration: ${voiceData.totalDurationSec}s`,
    });

    // Test 4: Timeline Builder
    const timeline = await TimelineBuilder.buildTimeline(videoPlan, "ElevenLabs");
    const test4Passed = Boolean(
      timeline.id &&
        timeline.scenes.length === videoPlan.scenes.length &&
        timeline.audioTrack.masterAudioUrl
    );
    tests.push({
      name: "Timeline Builder Test",
      passed: test4Passed,
      details: `Compiled full RenderTimeline with ID: ${timeline.id}`,
    });

    // Test 5: Renderer adapter
    const adapterResult = await MarketPilotRenderAdapter.submitToExistingVideoEngine(
      timeline,
      true
    );
    const test5Passed = Boolean(adapterResult.jobId && adapterResult.status);
    tests.push({
      name: "Renderer Adapter Test",
      passed: test5Passed,
      details: `Connected to existing VideoRenderService. JobID: ${adapterResult.jobId} (${adapterResult.status})`,
    });

    // Test 6: API Response & Render Coordinator (Synchronous check)
    const genResult = await RenderCoordinator.startVideoGeneration(
      videoPlan,
      "ElevenLabs",
      false // run synchronously for test
    );
    const test6Passed = Boolean(
      genResult.videoId &&
        genResult.status === "COMPLETED" &&
        genResult.timeline &&
        genResult.previewUrl
    );
    tests.push({
      name: "API Response & Coordinator Test",
      passed: test6Passed,
      details: `Pipeline completed synchronously. Status: ${genResult.status} | VideoID: ${genResult.videoId}`,
    });

    // Test 7: Error handling
    let errorCaught = false;
    try {
      await RenderCoordinator.startVideoGeneration(null as any, "ElevenLabs", false);
    } catch {
      errorCaught = true;
    }
    tests.push({
      name: "Error Handling Test",
      passed: errorCaught,
      details: "Correctly caught invalid VideoPlan and prevented pipeline crash.",
    });

    const totalPassed = tests.filter((t) => t.passed).length;
    return NextResponse.json(
      {
        success: totalPassed === tests.length,
        totalTests: tests.length,
        passed: totalPassed,
        failed: tests.length - totalPassed,
        tests,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Test suite failed",
        tests,
      },
      { status: 500 }
    );
  }
}
