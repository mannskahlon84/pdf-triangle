import { NextResponse } from "next/server";
import { ScenePlanner } from "@/modules/marketpilot/video-planner";
import { Campaign } from "@/modules/marketpilot/types/promotion.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign, duration, aspectRatio, customTitle } = body;

    if (!campaign || !campaign.brandName) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload: 'campaign' object with 'brandName' is required.",
        },
        { status: 400 }
      );
    }

    const videoPlan = ScenePlanner.generateVideoPlanFromCampaign(
      campaign as Campaign,
      {
        duration: duration || "30s",
        aspectRatio: aspectRatio || "9:16",
        customTitle,
      }
    );

    return NextResponse.json({
      success: true,
      videoPlan,
    });
  } catch (error: any) {
    console.error("Video Plan API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate video plan.",
      },
      { status: 500 }
    );
  }
}
