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

  const payload = await request.json();
  const connectorType = payload.connectorType as string;
  if (!connectorType) {
    return NextResponse.json({ error: 'Missing connectorType' }, { status: 400 });
  }

  await connectorQueue.add('test-connection', {
    connectorType,
    orgId: auth.orgId,
    userId: auth.userId
  });
  log('info', 'connector_test_queued', { orgId: auth.orgId, connectorType });

  return NextResponse.json({ status: 'queued' });
}
