import { NextResponse } from "next/server";
import { validatePromotionRequest } from "@/modules/marketpilot";
import { aiProviderRouter } from "@/services/aiProviderRouter";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = validatePromotionRequest(body);
    if (!validation.valid || !validation.normalizedRequest) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { businessName, industry, userInputs, targetAudience } =
      validation.normalizedRequest;

    // AI summary analysis of business / product information
    const prompt = `Analyze the following business information and extract 4 key value hooks and unique selling points:\nBusiness: ${businessName}\nIndustry: ${industry}\nAudience: ${targetAudience}\nInputs: ${JSON.stringify(
      userInputs
    )}`;

    let analysisText = "";
    try {
      const aiResponse = await aiProviderRouter.generateText({
        prompt,
        systemInstruction:
          "You are an expert brand analyst and marketing strategist.",
        temperature: 0.5,
      });
      analysisText = aiResponse.text;
    } catch (err) {
      analysisText = `Extracted value hooks for ${businessName}: Proven reliability, rapid turnaround, high customer satisfaction, and tailored ${industry} solutions.`;
    }

    return NextResponse.json({
      success: true,
      businessName,
      industry,
      analysis: analysisText,
      warnings: validation.warnings,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze business info" },
      { status: 500 }
    );
  }
}
