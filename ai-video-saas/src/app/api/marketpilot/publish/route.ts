import { NextRequest, NextResponse } from "next/server";
import { SocialPublisherEngine } from "@/modules/marketpilot/social-publisher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, platforms, immediate = true } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required." },
        { status: 400 }
      );
    }

    const result = await SocialPublisherEngine.publish({
      campaignId,
      platforms: platforms || [],
      immediate,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in MarketPilot Social Publisher API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish campaign." },
      { status: 500 }
    );
  }
}
