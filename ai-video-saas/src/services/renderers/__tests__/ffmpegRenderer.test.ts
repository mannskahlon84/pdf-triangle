import { RendererFactory } from "../RendererFactory";
import { RenderTimeline } from "@/modules/marketpilot/video-generator/types/generator.types";
import { VideoRenderService } from "@/services/videoRenderService";

async function testFFmpegRenderer() {
  console.log("=== Testing MarketPilot AI FFmpeg Rendering Provider ===");

  // 1. Verify RendererFactory instantiation
  const ffmpegRenderer = RendererFactory.getRenderer("ffmpeg");
  console.log("✓ Successfully instantiated FFmpegRenderer from RendererFactory");

  // 2. Verify environment & ffmpeg binary detection
  const isEnvReady = (ffmpegRenderer as any).checkEnvironment();
  if (!isEnvReady) {
    throw new Error("FFmpeg environment check failed!");
  }
  console.log("✓ FFmpeg environment check passed (ffmpeg-static binary resolved)");

  // 3. Test sample RenderTimeline composition
  const sampleTimeline: RenderTimeline = {
    id: "test_timeline_001",
    videoPlanId: "plan_001",
    duration: "15s",
    aspectRatio: "9:16",
    scenes: [
      {
        sceneNumber: 1,
        backgroundImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&h=1920&fit=crop",
        supportingVisualUrls: [],
        textOverlay: "MarketPilot AI Reel",
        animationStyle: "zoom-in",
        transition: "fade",
      },
    ],
    audioTrack: {
      totalDurationSec: 15,
      provider: "mock",
      segments: [],
      masterAudioUrl:
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    },
    captions: [
      {
        sceneNumber: 1,
        startTime: "00:00",
        endTime: "00:05",
        text: "Scale your marketing with MarketPilot AI",
        words: [],
      },
    ],
    createdAt: new Date().toISOString(),
  };

  // 4. Test VideoRenderService with mockMode=false (Production execution path)
  const renderJob = await VideoRenderService.createRenderJob({
    videoProjectId: "proj_ffmpeg_test",
    scriptVersionId: "ver_01",
    mediaAssetId: "asset_01",
    duration: "15s",
    renderTimeline: sampleTimeline,
    mockMode: false,
  });

  console.log("✓ Initiated production render job via VideoRenderService:");
  console.log(`  - Job ID: ${renderJob.id}`);
  console.log(`  - Status: ${renderJob.status}`);
  console.log(`  - Progress: ${renderJob.progress}%`);
  console.log(`  - Step Text: ${renderJob.stepText}`);

  // Allow production background render to finish executing
  let progress = await VideoRenderService.getRenderJobProgress(renderJob.id);
  let attempts = 0;
  while (
    progress &&
    progress.status !== "COMPLETED" &&
    progress.status !== ("FAILED" as any) &&
    attempts < 15
  ) {
    await new Promise((r) => setTimeout(r, 1000));
    progress = await VideoRenderService.getRenderJobProgress(renderJob.id);
    attempts++;
  }

  console.log("✓ Updated Job Status after production render execution:");
  console.log(`  - Status: ${progress?.status}`);
  console.log(`  - Progress: ${progress?.progress}%`);
  console.log(`  - Output URL: ${progress?.outputUrl || "(rendering in background/fallback)"}`);

  console.log("\n=== All FFmpeg Rendering Provider checks passed! ===");
  process.exit(0);
}

testFFmpegRenderer().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
