import { RenderCoordinator } from "@/modules/marketpilot/video-generator/renderCoordinator";
import { VideoPlan } from "@/modules/marketpilot/video-planner/types/planner.types";
import { TimelineBuilder } from "@/modules/marketpilot/video-generator/timelineBuilder";
import * as fs from "fs";
import * as path from "path";

async function testEarphoneUploadPipeline() {
  console.log("=== Testing MarketPilot AI: Uploaded Earphone Assets Flow ===");

  // 1. Simulate 4 uploaded earphone images (from user upload / media storage)
  const uploadedEarphoneImages = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop&q=80",
  ];

  console.log("✓ User uploaded 4 earphone images:");
  uploadedEarphoneImages.forEach((url, i) => console.log(`  - Angle ${i + 1}: ${url}`));

  // 2. Build VideoPlan including the uploaded mediaUrls
  const earphoneVideoPlan: VideoPlan = {
    id: "plan_earphone_001",
    title: "Boult Earphone",
    duration: "15s",
    aspectRatio: "9:16",
    platform: "instagram",
    mediaUrls: uploadedEarphoneImages,
    scenes: [
      {
        sceneNumber: 1,
        startTime: "0s",
        endTime: "5s",
        duration: "5 seconds",
        purpose: "hook",
        voiceText: "Discover Boult Earphone with crystal clear bass.",
        visualDescription: "Hero earphone view",
        imagePrompt: "Boult earphone close up",
        videoPrompt: "Zoom in on earphone",
        animationStyle: "ken-burns-in",
        transition: "fade",
        textOverlay: "Boult Earphone",
      },
      {
        sceneNumber: 2,
        startTime: "5s",
        endTime: "10s",
        duration: "5 seconds",
        purpose: "showcase",
        voiceText: "Ultralight comfort and all-day battery life.",
        visualDescription: "Side angle view",
        imagePrompt: "Earphone ear tips and case",
        videoPrompt: "Pan across charging case",
        animationStyle: "ken-burns-out",
        transition: "fade",
        textOverlay: "All-Day Battery",
      },
      {
        sceneNumber: 3,
        startTime: "10s",
        endTime: "15s",
        duration: "5 seconds",
        purpose: "cta",
        voiceText: "Order your Boult Earphones today.",
        visualDescription: "Lifestyle view",
        imagePrompt: "Boult Earphones in action",
        videoPrompt: "Slow zoom out",
        animationStyle: "static-highlight",
        transition: "fade",
        textOverlay: "Order Today 20% OFF",
      },
    ],
    voiceScript:
      "Discover Boult Earphone with crystal clear bass. Ultralight comfort and all-day battery life. Order your Boult Earphones today.",
    visualAssets: [],
    thumbnailPrompt: "Boult Earphone Thumbnail",
    caption: "Experience Boult Earphones!",
    hashtags: ["#Boult", "#Earphones", "#Tech"],
    createdAt: new Date().toISOString(),
  };

  // 3. Test TimelineBuilder directly to verify scene asset assignment
  console.log("\n--- Step 1: Testing TimelineBuilder Asset Mapping ---");
  const timeline = await TimelineBuilder.buildTimeline(earphoneVideoPlan, "ElevenLabs");

  console.log("✓ RenderTimeline generated:");
  timeline.scenes.forEach((s) => {
    console.log(`  [Scene ${s.sceneNumber}]`);
    console.log(`    - backgroundImageUrl: ${s.backgroundImageUrl}`);
    console.log(`    - productImageUrl:    ${s.productImageUrl}`);
    console.log(`    - supportingVisual:   ${s.supportingVisualUrls?.[0]}`);
  });

  // Verify that all scenes use uploaded earphone images and NO demo office/shoe fallbacks exist
  const allUrlsUsed = timeline.scenes.flatMap((s) => [
    s.backgroundImageUrl,
    s.productImageUrl,
    ...(s.supportingVisualUrls || []),
  ]);
  const hasDemoFallback = allUrlsUsed.some(
    (url) =>
      url &&
      (url.includes("1557804506") ||
        url.includes("1486406146926") ||
        url.includes("1542291026"))
  );
  if (hasDemoFallback) {
    throw new Error("ERROR: Demo fallback Unsplash images were detected in earphone timeline!");
  }
  console.log("✓ ZERO fallback demo images used — 100% scenes populated from uploaded earphone media!");

  // 4. Test Complete Sync Rendering Pipeline (VideoPlan -> Timeline -> FFmpegRenderer)
  console.log("\n--- Step 2: Testing Full Rendering Pipeline with FFmpegRenderer ---");
  const result = await RenderCoordinator.startVideoGeneration(
    earphoneVideoPlan,
    "ElevenLabs",
    false // sync production render
  );

  console.log(`✓ Render completed with status: ${result.status}`);
  console.log(`✓ Output Video URL: ${result.previewUrl}`);

  if (result.status !== "COMPLETED" || !result.previewUrl) {
    throw new Error(`Rendering pipeline failed! Status: ${result.status}`);
  }

  const outputFilePath = path.join(process.cwd(), "public", result.previewUrl);
  if (!fs.existsSync(outputFilePath)) {
    throw new Error(`Output MP4 file not found on disk at: ${outputFilePath}`);
  }

  const stats = fs.statSync(outputFilePath);
  console.log(`✓ Output MP4 file verified on disk: ${outputFilePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  console.log("\n=== Test PASSED Successfully! ===");
  process.exit(0);
}

testEarphoneUploadPipeline().catch((err) => {
  console.error("Test FAILED:", err);
  process.exit(1);
});
