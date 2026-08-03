import { NextResponse } from "next/server";
import { MediaAsset } from "@/types/database";

const sampleAssets: MediaAsset[] = [
  {
    id: "media-tech-lab",
    organizationId: "org_01",
    brandId: "manpower",
    title: "Precision Tech & Robotics Lab (MP4)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=340&fit=crop&q=80",
    duration: 15,
    resolution: "1080p · 60fps",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    keyframes: [
      {
        id: "kf-1",
        timestamp: 2,
        label: "Safety equipment detected",
        confidence: 98,
        tags: ["OSHA Compliance", "Safety Gear"],
      },
      {
        id: "kf-2",
        timestamp: 8,
        label: "Team collaboration detected",
        confidence: 96,
        tags: ["Teamwork", "Engineering Review"],
      },
      {
        id: "kf-3",
        timestamp: 15,
        label: "Machine operation detected",
        confidence: 99,
        tags: ["Precision Robotics", "Automation"],
      },
    ],
  },
  {
    id: "media-fitness-gym",
    organizationId: "org_01",
    brandId: "urban-fitness",
    title: "High-Intensity Functional Conditioning (MP4)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-athletes-working-out-in-a-gym-43391-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=340&fit=crop&q=80",
    duration: 15,
    resolution: "1080p · 60fps",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    keyframes: [
      {
        id: "kf-f-1",
        timestamp: 2,
        label: "Athlete high-intensity workout",
        confidence: 99,
        tags: ["Gym Action", "Strength Conditioning"],
      },
      {
        id: "kf-f-2",
        timestamp: 9,
        label: "Expert fitness coaching",
        confidence: 97,
        tags: ["Personal Trainer", "Correct Form"],
      },
    ],
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");

  const filtered = brandId
    ? sampleAssets.filter((a) => a.brandId === brandId)
    : sampleAssets;

  return NextResponse.json({
    success: true,
    data: filtered,
    message: "Market Pilot AI: Media assets fetched successfully.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newAsset: MediaAsset = {
      id: `asset_${Date.now()}`,
      organizationId: body.organizationId || "org_01",
      brandId: body.brandId || "manpower",
      title: body.title || "Uploaded Workplace Media",
      type: body.type || "video",
      url: body.url || "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4",
      thumbnailUrl:
        body.thumbnailUrl ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=340&fit=crop&q=80",
      duration: body.duration || 15,
      resolution: body.resolution || "1080p · 60fps",
      keyframes: body.keyframes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sampleAssets.push(newAsset);

    return NextResponse.json({
      success: true,
      data: newAsset,
      message: "Market Pilot AI: Media asset created successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create asset" },
      { status: 500 }
    );
  }
}
