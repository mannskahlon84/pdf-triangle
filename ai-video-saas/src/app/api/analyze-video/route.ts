import { NextResponse } from "next/server";
import { VisionService } from "@/services/visionService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mediaUrl, type, brandId, mockMode } = body;

    const analysis = await VisionService.analyzeWorkplaceMedia({
      mediaUrl: mediaUrl || "default-url",
      mediaType: type || "video",
      brandId: brandId || "manpower",
      mockMode: mockMode ?? true,
    });

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Market Pilot AI: Workplace vision analysis completed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze media" },
      { status: 500 }
    );
  }
}
