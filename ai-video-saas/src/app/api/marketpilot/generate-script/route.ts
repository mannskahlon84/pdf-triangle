import { NextResponse } from "next/server";
import {
  validatePromotionRequest,
  ScriptGenerator,
  getTemplateByIdOrName,
} from "@/modules/marketpilot";

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

    const request = validation.normalizedRequest;
    const template = getTemplateByIdOrName(
      body.selectedTemplate || request.selectedTemplate || "Brand Introduction"
    );

    const concepts = await ScriptGenerator.generateVideoConcepts(
      request,
      template
    );
    const scripts = await ScriptGenerator.generateScripts(
      request,
      template,
      concepts
    );

    return NextResponse.json({
      success: true,
      businessName: request.businessName,
      template: template.name,
      scripts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate video scripts",
      },
      { status: 500 }
    );
  }
}
