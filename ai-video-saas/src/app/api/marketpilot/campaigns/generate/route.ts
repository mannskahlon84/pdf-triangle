import { NextResponse } from 'next/server';
import { GenerationOrchestrator } from '../../../../../modules/marketpilot/orchestrator/generationOrchestrator';
import { AssetService } from '../../../../../modules/marketpilot/storage/assetService';
import { GCSStorageProvider } from '../../../../../modules/marketpilot/storage/providers/gcsStorageProvider';
import { CampaignDefaults } from '../../../../../modules/marketpilot/campaign-profile/campaignDefaults';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workspaceId, type } = body;

    const campaignId = `cmp_${Date.now()}`;
    const jobId = `job_${Date.now()}`;

    // Initialize mock dependencies
    const storageProvider = new GCSStorageProvider();
    const assetService = new AssetService(storageProvider);
    const orchestrator = new GenerationOrchestrator(assetService);

    // Mock Context
    const context = {
      jobId,
      userId: 'usr_mock',
      workspaceId,
      campaignId,
      campaign: {
        id: campaignId,
        campaignName: `${type} Campaign`,
        status: "DRAFT" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      campaignProfile: CampaignDefaults.applyDefaults({
        userType: type === 'individual' ? 'individual' : 'business',
      }),
      metrics: { startTime: 0, stepDurations: {}, retryCounts: {} }
    };

    // Run async in background (fire and forget for this mock)
    orchestrator.runGeneration(context).catch(console.error);

    return NextResponse.json({ success: true, jobId, campaignId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
