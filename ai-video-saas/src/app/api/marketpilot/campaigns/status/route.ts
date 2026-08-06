import { NextResponse } from 'next/server';
import { JobRepository } from '../../../../../modules/marketpilot/database/repositories/jobRepository';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const job = await JobRepository.findById(jobId);
  
  return NextResponse.json({ 
    status: job?.status || 'PENDING'
  });
}
