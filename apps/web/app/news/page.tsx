'use client';

import { useEffect, useState } from 'react';
import { SessionGate } from '@/components/SessionGate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string | null;
  published_at: string | null;
  summary: string | null;
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const response = await fetch('/api/news', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const payload = await response.json();
        setItems(payload.items ?? []);
      }
    };
    load();
  }, []);

  return (
    <SessionGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">VC News</h1>
          <p className="text-sm text-slate-500">Latest funding and VC market updates.</p>
        </div>
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-400">
                  {item.source ?? 'News'} - {item.published_at ? new Date(item.published_at).toLocaleString() : 'Unknown'}
                </div>
                {item.summary && <p className="mt-2 text-sm text-slate-600">{item.summary}</p>}
                <a className="mt-3 inline-flex text-sm font-semibold text-brand-700" href={item.url} target="_blank" rel="noreferrer">
                  Open article
                </a>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <div className="text-sm text-slate-400">No news yet. Worker will ingest RSS feeds.</div>}
        </div>
      </div>
    </SessionGate>
  );
}
