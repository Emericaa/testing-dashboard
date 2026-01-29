import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { createAuthedClient } from '@/lib/supabase/authed';

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await request.json();
  const branding = payload.branding ?? null;
  const featureFlags = payload.featureFlags ?? null;

  const supabase = createAuthedClient(auth.accessToken);
  const { data: existing } = await supabase
    .from('settings')
    .select('branding_json, feature_flags_json')
    .eq('org_id', auth.orgId)
    .maybeSingle();

  const nextBranding = branding ?? existing?.branding_json ?? null;
  const nextFlags = featureFlags ?? existing?.feature_flags_json ?? null;
  const { error } = await supabase.from('settings').upsert(
    {
      org_id: auth.orgId,
      branding_json: nextBranding,
      feature_flags_json: nextFlags,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'org_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('audit_logs').insert({
    org_id: auth.orgId,
    actor_user_id: auth.userId,
    action: 'settings_updated',
    entity_type: 'settings',
    entity_id: auth.orgId
  });

  return NextResponse.json({ status: 'saved' });
}
