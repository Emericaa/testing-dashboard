import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { createAuthedClient } from '@/lib/supabase/authed';

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAuthedClient(auth.accessToken);
  const { data: items, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('org_id', auth.orgId)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items });
}
