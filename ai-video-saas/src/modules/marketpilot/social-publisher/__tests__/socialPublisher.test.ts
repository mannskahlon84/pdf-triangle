import {
  ContentFormatter,
  PlatformAdapterRegistry,
  CampaignManager,
  SocialPublisherEngine,
  SocialScheduler,
} from "../index";
import { Campaign } from "../../types/promotion.types";

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
}

export async function runSocialPublisherTestSuite(): Promise<{
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
    id: "test-camp-p4-cli",
    campaignName: "Phase 4 CLI Test Campaign",
    brandName: "Urban Fitness",
    industry: "fitness",
    promotionType: "business",
    goal: "lead_generation",
    valueProposition: "AI-personalized macro & workout planning.",
    cta: "Start 7 Days Free",
    marketingStrategy: "High conversion gym reel",
    targetAudience: "Fitness enthusiasts",
    videoConcepts: [],
    scripts: [],
    captions: [],
    hashtags: ["#UrbanFitness", "#GymReels", "#WorkoutChallenge"],
    adCopy: [],
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. ContentFormatter
    const formatted = ContentFormatter.formatForPlatforms(dummyCampaign);
    assert(
      Boolean(formatted.length === 5 && formatted[0].caption),
      "ContentFormatter Platform Variants Test"
    );

    // 2. Registry & Adapters
    const allAdapters = PlatformAdapterRegistry.getAllAdapters();
    assert(
      Boolean(allAdapters.length === 5),
      "Platform Adapter Registry Test"
    );

    // 3. Register Campaign
    const created = SocialPublisherEngine.registerCampaignForPublishing(
      dummyCampaign,
      "vid_test_cli_101",
      "/demo-reels/fitness-challenge.mp4"
    );
    assert(
      Boolean(created.id && created.status === "READY"),
      "Campaign Manager Registration Test"
    );

    // 4. Instant Publish
    const publishRes = await SocialPublisherEngine.publish({
      campaignId: created.id,
      platforms: ["instagram", "tiktok"],
      immediate: true,
    });
    assert(
      Boolean(
        publishRes.success &&
          publishRes.status === "PUBLISHED" &&
          publishRes.publishedPlatforms.length === 2
      ),
      "Instant Multi-Platform Publish Test"
    );

    // 5. Future Schedule
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString();
    const scheduleRes = await SocialPublisherEngine.schedule({
      campaignId: created.id,
      platforms: ["youtube_shorts", "facebook"],
      scheduledTime: futureDate,
    });
    assert(
      Boolean(
        scheduleRes.success &&
          scheduleRes.status === "SCHEDULED" &&
          scheduleRes.scheduledTime === futureDate
      ),
      "Social Scheduler Queue Test"
    );

    // 6. Portfolio Analytics
    const portfolio = SocialPublisherEngine.getPortfolioAnalytics();
    assert(
      Boolean(portfolio.totalCampaigns >= 1 && portfolio.totalViews >= 0),
      "Portfolio Analytics ROI Test"
    );
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
  runSocialPublisherTestSuite().then((report) => {
    console.log("=== MarketPilot AI Phase 4 Social Publisher Test Report ===");
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
