import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { connectorQueue } from '@/lib/queue';
import { log } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({}));
  const connectorType = payload.connectorType as string | undefined;

  await connectorQueue.add('manual-sync', {
    connectorType: connectorType ?? 'all',
    orgId: auth.orgId,
    userId: auth.userId
  });
  log('info', 'connector_sync_queued', { orgId: auth.orgId, connectorType: connectorType ?? 'all' });

  return NextResponse.json({ status: 'queued' });
}
