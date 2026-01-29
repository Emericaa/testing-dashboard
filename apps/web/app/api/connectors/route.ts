import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { createAuthedClient } from '@/lib/supabase/authed';
import { encryptSecret } from '@vc/shared';
import { env } from '@/lib/env';
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
  const secret = payload.secret as string;

  if (!connectorType || !secret) {
    return NextResponse.json({ error: 'Missing connectorType or secret' }, { status: 400 });
  }

  if (!env.appEncryptionKey) {
    return NextResponse.json({ error: 'APP_ENCRYPTION_KEY not set' }, { status: 500 });
  }

  log('info', 'connector_secret_save', { orgId: auth.orgId, userId: auth.userId, connectorType });

  const encrypted = encryptSecret(secret, env.appEncryptionKey);
  const supabase = createAuthedClient(auth.accessToken);

  const { error } = await supabase.from('connector_secrets').upsert(
    {
      org_id: auth.orgId,
      connector_type: connectorType,
      encrypted_secret_blob: encrypted,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'org_id,connector_type' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('audit_logs').insert({
    org_id: auth.orgId,
    actor_user_id: auth.userId,
    action: 'connector_secret_saved',
    entity_type: 'connector_secrets',
    entity_id: connectorType
  });

  return NextResponse.json({ status: 'saved' });
}
