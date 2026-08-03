import { NextResponse } from "next/server";
import { ScriptService } from "@/services/scriptService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessInfo, targetAudience, brandTone, angle, duration, mockMode } = body;

    const script = await ScriptService.generateMarketingScript({
      businessInfo: businessInfo || "Enterprise engineering recruiting and technical staff placement.",
      targetAudience: targetAudience || "Senior Tech Talent & Hiring Managers",
      brandTone: brandTone || "Professional & Authoritative",
      angle,
      duration: duration || "15s",
      mockMode: mockMode ?? true,
    });

    return NextResponse.json({
      success: true,
      data: script,
      message: "Market Pilot AI: Script generated successfully using Zero-Glitch 3-segment structure.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}
