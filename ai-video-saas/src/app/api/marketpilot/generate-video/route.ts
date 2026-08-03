import { NextRequest, NextResponse } from "next/server";
import { RenderCoordinator } from "@/modules/marketpilot/video-generator";
import { VideoPlan } from "@/modules/marketpilot/video-planner/types/planner.types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoPlan, ttsProvider = "ElevenLabs", simulateAsync = true } = body;

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
      videoPlan as VideoPlan,
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
