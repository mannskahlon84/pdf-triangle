import { NextRequest, NextResponse } from "next/server";
import { SocialPublisherEngine } from "@/modules/marketpilot/social-publisher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, platforms, scheduledTime } = body;

    if (!campaignId || !scheduledTime) {
      return NextResponse.json(
        { error: "campaignId and scheduledTime are required." },
        { status: 400 }
      );
    }

    const result = await SocialPublisherEngine.schedule({
      campaignId,
      platforms: platforms || [],
      scheduledTime,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in MarketPilot Social Scheduler API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule campaign." },
      { status: 500 }
    );
  }
}
