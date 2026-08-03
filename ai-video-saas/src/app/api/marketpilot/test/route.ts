import { NextResponse } from "next/server";
import { runMarketPilotEngineTests } from "@/modules/marketpilot/__tests__/engine.test";

export async function GET() {
  try {
    const report = await runMarketPilotEngineTests();
    return NextResponse.json({
      success: report.failed === 0,
      timestamp: new Date().toISOString(),
      ...report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Test suite execution failed" },
      { status: 500 }
    );
  }
}
