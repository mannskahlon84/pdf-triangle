import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scriptId, brandId, mode = "pip", aspectRatio = "9:16" } = body;

    // Simulate encoding latency
    await new Promise((resolve) => setTimeout(resolve, 900));

    return NextResponse.json({
      success: true,
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4",
      mode,
      aspectRatio,
      renderedAt: new Date().toISOString(),
      metadata: {
        resolution: "1080x1920",
        fps: 60,
        bitrate: "12Mbps",
        watermarkApplied: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to render hybrid video" },
      { status: 500 }
    );
  }
}
