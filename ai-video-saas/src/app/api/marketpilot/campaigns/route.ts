import { NextRequest, NextResponse } from "next/server";
import {
  CampaignManager,
  CampaignStatus,
} from "@/modules/marketpilot/social-publisher";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status") as CampaignStatus | null;
    const industry = searchParams.get("industry");

    if (id) {
      const campaign = CampaignManager.getCampaignById(id);
      if (!campaign) {
        return NextResponse.json(
          { error: `Campaign with ID ${id} not found` },
          { status: 404 }
        );
      }
      return NextResponse.json(campaign, { status: 200 });
    }

    const campaigns = CampaignManager.listCampaigns({
      status: status || undefined,
      industry: industry || undefined,
    });

    return NextResponse.json({ count: campaigns.length, campaigns }, {
      status: 200,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve campaigns." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newCampaign = CampaignManager.createCampaign(body);
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create campaign." },
      { status: 500 }
    );
  }
}
