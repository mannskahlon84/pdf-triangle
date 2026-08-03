import { NextResponse } from "next/server";
import { SocialPublisherEngine } from "@/modules/marketpilot/social-publisher";

export async function GET() {
  try {
    const portfolio = SocialPublisherEngine.getPortfolioAnalytics();
    return NextResponse.json(portfolio, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve portfolio analytics." },
      { status: 500 }
    );
  }
}
