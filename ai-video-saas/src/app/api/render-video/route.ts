import { NextResponse } from "next/server";
import { VideoRenderService } from "@/services/videoRenderService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoProjectId, scriptVersionId, mediaAssetId, duration, mockMode } = body;

    const renderJob = await VideoRenderService.createRenderJob({
      videoProjectId: videoProjectId || "proj_default",
      scriptVersionId: scriptVersionId || "script_default",
      mediaAssetId: mediaAssetId || "asset_default",
      duration: duration || "15s",
      mockMode: mockMode ?? true,
    });

    return NextResponse.json({
      success: true,
      data: renderJob,
      message:
        "Market Pilot AI: Zero-Glitch asynchronous render job initiated (0-5s Intro, 5-22s Footage, 22-30s CTA).",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate render job" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: "jobId query parameter is required" },
      { status: 400 }
    );
  }

  const job = await VideoRenderService.getRenderJobProgress(jobId);
  return NextResponse.json({ success: true, data: job });
}
