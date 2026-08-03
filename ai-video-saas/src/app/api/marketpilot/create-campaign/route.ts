import { NextResponse } from "next/server";
import { MarketPilotPromotionEngine } from "@/modules/marketpilot";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await MarketPilotPromotionEngine.generateCampaign(body);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          errors: response.validation.errors,
          warnings: response.validation.warnings,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      selectedTemplate: response.selectedTemplate,
      suggestedTemplates: response.suggestedTemplates,
      campaign: response.campaign,
      warnings: response.validation.warnings,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate campaign" },
      { status: 500 }
    );
  }
}
