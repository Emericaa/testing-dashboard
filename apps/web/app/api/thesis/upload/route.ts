import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { env } from '@/lib/env';
import { log } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;
  const tagString = (formData.get('tags') as string | null) ?? '';

  if (!file || !title) {
    return NextResponse.json({ error: 'Missing file or title' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${auth.orgId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(env.supabaseBucket)
    .upload(filePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const publicUrl = supabaseAdmin.storage.from(env.supabaseBucket).getPublicUrl(filePath).data.publicUrl;
  const tags = tagString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const { data: doc, error: docError } = await supabaseAdmin
    .from('thesis_docs')
    .insert({
      org_id: auth.orgId,
      title,
      tags,
      storage_path: publicUrl,
      created_by: auth.userId
    })
    .select('*')
    .single();

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 400 });
  }

  log('info', 'thesis_uploaded', { orgId: auth.orgId, userId: auth.userId, docId: doc.id });

  if (env.n8nWebhookUrl) {
    await fetch(env.n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shared-secret': env.n8nSharedSecret || ''
      },
      body: JSON.stringify({
        docId: doc.id,
        storageUrl: publicUrl,
        tags,
        orgId: auth.orgId
      })
    });
  }

  return NextResponse.json({ status: 'uploaded', docId: doc.id });
}
