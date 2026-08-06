import { NextRequest, NextResponse } from "next/server";
import { RenderCoordinator } from "@/modules/marketpilot/video-generator";
import { VideoPlan } from "@/modules/marketpilot/video-planner/types/planner.types";
import { HybridCreativePlanner } from "@/modules/marketpilot/video-planner/hybridCreativePlanner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product,
      campaign,
      mediaUrls: incomingMediaUrls,
      useHybridAi = true,
      ttsProvider = "ElevenLabs",
      simulateAsync = false,
    } = body;

    let videoPlan: VideoPlan | undefined = body.videoPlan;

    // Invoke Hybrid AI Creative Planner when product/campaign is provided or useHybridAi is true
    const isHybridAiMode =
      process.env.HYBRID_AI_MODE === "true" ||
      useHybridAi === true ||
      Boolean(product) ||
      Boolean(campaign);

    if (isHybridAiMode && (product || campaign)) {
      const brandName =
        product?.name || campaign?.brandName || "MarketPilot Product";
      const industry =
        product?.category?.toLowerCase() ||
        campaign?.industry ||
        "electronics";
      const mediaUrls =
        incomingMediaUrls ||
        (product?.angles?.map((a: any) => a.url) || []).filter(Boolean);

      const campaignInput = campaign || {
        id: product?.id || crypto.randomUUID(),
        campaignName: `${brandName} 15s Reel`,
        brandName,
        industry,
        promotionType: industry,
        valueProposition:
          product?.offerInfo ||
          product?.features?.[0] ||
          `Discover premium ${brandName}.`,
        marketingStrategy:
          product?.features?.slice(0, 2).join(". ") ||
          "Engineered for excellence.",
        cta: "Order yours today — Visit our official store.",
        goal: "conversion",
      };

      videoPlan = HybridCreativePlanner.createCreativePlan(
        campaignInput,
        {
          duration: "15s",
          aspectRatio: "9:16",
          hybridAiMode: true,
          industryTemplate: industry,
        },
        mediaUrls
      );
    }

    if (!videoPlan || !videoPlan.scenes || !Array.isArray(videoPlan.scenes)) {
      return NextResponse.json(
        {
          error:
            "Invalid request. A valid VideoPlan object with scenes is required.",
        },
        { status: 400 }
      );
    }

    const result = await RenderCoordinator.startVideoGeneration(
      videoPlan,
      ttsProvider,
      simulateAsync
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error generating MarketPilot video:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start video generation pipeline." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId query parameter is required." },
        { status: 400 }
      );
    }

    const status = RenderCoordinator.getJobStatus(videoId);
    if (!status) {
      return NextResponse.json(
        { error: `Video generation job not found for videoId: ${videoId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(status, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch job status." },
      { status: 500 }
    );
  }
}
