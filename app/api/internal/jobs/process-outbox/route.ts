import { NextResponse } from 'next/server';
import { processOutboxBatch } from '@/lib/queues/outbox';

function isAuthorized(req: Request): boolean {
  const secret = process.env.INTERNAL_JOB_SECRET;
  if (!secret) return true;
  const authHeader = req.headers.get('authorization') || '';
  const jobHeader = req.headers.get('x-internal-job-secret') || '';
  return authHeader === `Bearer ${secret}` || jobHeader === secret;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processOutboxBatch(15);
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error('Error en process-outbox GET:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}