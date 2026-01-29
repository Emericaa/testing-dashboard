import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  if (!env.n8nWebhookUrl) {
    return NextResponse.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 });
  }

  const response = await fetch(env.n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-shared-secret': env.n8nSharedSecret || ''
    },
    body: JSON.stringify({
      ...payload,
      orgId: auth.orgId,
      userId: auth.userId
    })
  });

  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ reply: text });
  }
}
