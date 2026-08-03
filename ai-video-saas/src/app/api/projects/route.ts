import { NextResponse } from "next/server";
import { VideoProject } from "@/types/database";

const sampleProjects: VideoProject[] = [
  {
    id: "proj_01",
    organizationId: "org_01",
    brandId: "manpower",
    title: "2026 Robotics Staffing Hybrid Reel",
    targetDuration: "15s",
    aspectRatio: "9:16",
    compositorMode: "pip",
    activeMediaId: "media-tech-lab",
    activeScriptVersionId: "script_01",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_02",
    organizationId: "org_01",
    brandId: "urban-fitness",
    title: "High-Intensity Athlete Transformation Promo",
    targetDuration: "15s",
    aspectRatio: "9:16",
    compositorMode: "alternating",
    activeMediaId: "media-fitness-gym",
    activeScriptVersionId: "script_02",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_03",
    organizationId: "org_01",
    brandId: "smileone",
    title: "Cosmetic & Preventive Dental Showcase",
    targetDuration: "30s",
    aspectRatio: "16:9",
    compositorMode: "pip",
    activeMediaId: "media-dental",
    activeScriptVersionId: "script_03",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");

  const filtered = brandId
    ? sampleProjects.filter((p) => p.brandId === brandId)
    : sampleProjects;

  return NextResponse.json({
    success: true,
    data: filtered,
    message: "Market Pilot AI: Video projects fetched successfully.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProject: VideoProject = {
      id: `proj_${Date.now()}`,
      organizationId: body.organizationId || "org_01",
      brandId: body.brandId || "manpower",
      title: body.title || "New Workplace Reel Project",
      targetDuration: body.targetDuration || "15s",
      aspectRatio: body.aspectRatio || "9:16",
      compositorMode: body.compositorMode || "pip",
      activeMediaId: body.activeMediaId || "media-tech-lab",
      activeScriptVersionId: body.activeScriptVersionId || "script_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sampleProjects.push(newProject);

    return NextResponse.json({
      success: true,
      data: newProject,
      message: "Market Pilot AI: Project created successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
