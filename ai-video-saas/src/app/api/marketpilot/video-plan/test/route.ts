import { NextResponse } from "next/server";
import { runScenePlannerTestSuite } from "@/modules/marketpilot/video-planner/__tests__/scenePlanner.test";

export async function GET() {
  try {
    const report = runScenePlannerTestSuite();
    return NextResponse.json({
      success: report.failed === 0,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute Video Scene Planner test suite.",
      },
      { status: 500 }
    );
  }
}
