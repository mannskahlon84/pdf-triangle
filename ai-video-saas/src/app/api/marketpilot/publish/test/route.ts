import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

import {
  ContentFormatter,
  PlatformAdapterRegistry,
  CampaignManager,
  SocialPublisherEngine,
  SocialScheduler,
} from "@/modules/marketpilot/social-publisher";
import { Campaign } from "@/modules/marketpilot/types/promotion.types";

export async function GET() {
  const tests: { name: string; passed: boolean; details?: string; error?: string }[] = [];

  const dummyCampaign: Campaign = {
    id: "test-camp-p4",
    campaignName: "Phase 4 Automated Test Campaign",
    brandName: "Manpower Corp",
    industry: "recruitment",
    promotionType: "business",
    goal: "lead_generation",
    valueProposition: "AI-powered candidate screening for enterprise teams.",
    cta: "Request Demo Today",
    marketingStrategy: "High conversion recruiting reel",
    targetAudience: "HR Leaders",
    videoConcepts: [],
    scripts: [],
    captions: [
      {
        platform: "instagram",
        text: "Automate technical screening with Manpower AI.",
        hashtags: ["#TechRecruiter", "#AIHiring"],
        callToAction: "Request Demo Today"
      },
    ],
    hashtags: ["#TechRecruiter", "#AIHiring", "#ManpowerCorp"],
    adCopy: [],
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. ContentFormatter test
    const formatted = ContentFormatter.formatForPlatforms(dummyCampaign);
    const test1Passed = Boolean(
      formatted.length === 5 &&
        formatted.some((f) => f.platform === "instagram") &&
        formatted.some((f) => f.platform === "linkedin")
    );
    tests.push({
      name: "ContentFormatter Platform Variants Test",
      passed: test1Passed,
      details: `Generated ${formatted.length} platform-optimized content packages (IG, Shorts, TikTok, FB, LinkedIn).`,
    });

    // 2. PlatformAdapterRegistry test
    const allAdapters = PlatformAdapterRegistry.getAllAdapters();
    const test2Passed = Boolean(allAdapters.length === 5);
    tests.push({
      name: "Platform Adapter Registry Test",
      passed: test2Passed,
      details: `Resolved ${allAdapters.length} adapters: ${allAdapters.map((a) => a.platformName).join(", ")}`,
    });

    // 3. Register Campaign in Manager
    const created = SocialPublisherEngine.registerCampaignForPublishing(
      dummyCampaign,
      "vid_test_101",
      "/demo-reels/recruitment-tech.mp4"
    );
    const test3Passed = Boolean(
      created.id && created.status === "READY" && created.platforms.length > 0
    );
    tests.push({
      name: "Campaign Manager Registration Test",
      passed: test3Passed,
      details: `Registered Campaign ID: ${created.id} with status: ${created.status}`,
    });

    // 4. Instant Publish across adapters
    const publishRes = await SocialPublisherEngine.publish({
      campaignId: created.id,
      platforms: ["instagram", "linkedin"],
      immediate: true,
    });
    const test4Passed = Boolean(
      publishRes.success &&
        publishRes.status === "PUBLISHED" &&
        publishRes.publishedPlatforms.length === 2
    );
    tests.push({
      name: "Instant Multi-Platform Publish Test",
      passed: test4Passed,
      details: `Published successfully across 2 adapters. Post IDs: ${publishRes.publishedPlatforms
        .map((p) => p.postId)
        .join(", ")}`,
    });

    // 5. Future Schedule Test
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const scheduleRes = await SocialPublisherEngine.schedule({
      campaignId: created.id,
      platforms: ["tiktok", "youtube_shorts"],
      scheduledTime: futureDate,
    });
    const test5Passed = Boolean(
      scheduleRes.success &&
        scheduleRes.status === "SCHEDULED" &&
        scheduleRes.scheduledTime === futureDate
    );
    tests.push({
      name: "Social Scheduler Queue Test",
      passed: test5Passed,
      details: `Scheduled campaign release for ${futureDate} (${scheduleRes.status})`,
    });

    // 6. Portfolio Analytics Aggregation
    const portfolio = SocialPublisherEngine.getPortfolioAnalytics();
    const test6Passed = Boolean(
      portfolio.totalCampaigns >= 1 &&
        portfolio.totalViews >= 0 &&
        portfolio.topPerformingPlatform
    );
    tests.push({
      name: "Portfolio Analytics ROI Test",
      passed: test6Passed,
      details: `Aggregated ${portfolio.totalCampaigns} campaigns. Total views: ${portfolio.totalViews} | Top platform: ${portfolio.topPerformingPlatform}`,
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
        error: error.message || "Phase 4 Test Suite Failed",
        tests,
      },
      { status: 500 }
    );
  }
}
