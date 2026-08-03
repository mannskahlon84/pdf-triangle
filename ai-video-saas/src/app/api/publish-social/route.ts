import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId, platforms, scheduledTime } = body;

    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      postId: `post-api-${Date.now()}`,
      videoId,
      platforms,
      scheduledTime,
      status: "scheduled",
      message: `Video scheduled across ${platforms.length} social channels successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to schedule social post" },
      { status: 500 }
    );
  }
}
