'use client';

import { useEffect, useState } from 'react';
import { SessionGate } from '@/components/SessionGate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

interface ThesisDoc {
  id: string;
  title: string;
  tags: string[] | null;
  storage_path: string | null;
  created_at: string;
}

export default function ThesisPage() {
  const [docs, setDocs] = useState<ThesisDoc[]>([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const loadDocs = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;
    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();
    if (!profile?.org_id) return;
    const { data: rows } = await supabase.from('thesis_docs').select('*').eq('org_id', profile.org_id).order('created_at', { ascending: false });
    setDocs(rows ?? []);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async () => {
    if (!file || !title) {
      setStatus('Title and file required.');
      return;
    }
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('tags', tags);
    formData.append('file', file);

    setStatus('Uploading...');
    const response = await fetch('/api/thesis/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (response.ok) {
      setStatus('Uploaded.');
      setTitle('');
      setTags('');
      setFile(null);
      loadDocs();
    } else {
      const payload = await response.json();
      setStatus(payload.error ?? 'Upload failed');
    }
  };

  const handleSummarize = async (docId: string) => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    await fetch('/api/n8n', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'summarize', docId })
    });
    setStatus('Summary requested in n8n workflow.');
  };

  return (
    <SessionGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Thesis documents</h1>
          <p className="text-sm text-slate-500">Upload new thesis docs and feed n8n RAG ingestion.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload thesis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button onClick={handleUpload}>Upload</Button>
              {status && <span className="text-xs text-slate-500">{status}</span>}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleString()}</div>
                <div className="mt-2 text-sm text-slate-500">Tags: {(doc.tags ?? []).join(', ') || 'None'}</div>
                <div className="mt-3 flex gap-2">
                  {doc.storage_path && (
                    <a className="text-sm font-semibold text-brand-700" href={doc.storage_path} target="_blank" rel="noreferrer">
                      View document
                    </a>
                  )}
                  <Button variant="secondary" onClick={() => handleSummarize(doc.id)}>
                    Summarize with n8n
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SessionGate>
  );
}
