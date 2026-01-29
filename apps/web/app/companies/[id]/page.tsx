'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SessionGate } from '@/components/SessionGate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { aggregateTimeSeries } from '@vc/shared';

interface CompanyDetail {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
  geo: string | null;
  domain: string | null;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params?.id as string;
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [benchmark, setBenchmark] = useState<{ metric_key: string; metric_value: number }[]>([]);
  const [rounds, setRounds] = useState<{ id: string; round_type: string | null; amount: number | null; announced_at: string | null }[]>([]);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return;

      const { data: companyRow } = await supabase.from('companies').select('*').eq('id', companyId).single();
      setCompany(companyRow);

      const { data: metricRows } = await supabase.from('company_metrics').select('*').eq('company_id', companyId);
      setMetrics(metricRows ?? []);

      const { data: roundRows } = await supabase
        .from('funding_rounds')
        .select('*')
        .eq('company_id', companyId)
        .order('announced_at', { ascending: false });
      setRounds(roundRows ?? []);

      const { data: noteRows } = await supabase
        .from('company_notes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      setNotes(noteRows ?? []);

      if (companyRow?.sector) {
        const { data: benchRows } = await supabase
          .from('sector_benchmarks')
          .select('metric_key, metric_value')
          .eq('sector', companyRow.sector)
          .limit(5);
        setBenchmark(benchRows ?? []);
      }
    };
    if (companyId) {
      load();
    }
  }, [companyId]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();

    await supabase.from('company_notes').insert({
      company_id: companyId,
      org_id: (profile as { org_id?: string } | null)?.org_id ?? null,
      content: noteText
    });
    setNoteText('');
    const { data: noteRows } = await supabase
      .from('company_notes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setNotes(noteRows ?? []);
  };

  return (
    <SessionGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{company?.name ?? 'Company'}</h1>
          <p className="text-sm text-slate-500">
            {company?.sector ?? 'Sector'} | {company?.stage ?? 'Stage'} | {company?.geo ?? 'Geo'}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>MRR trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={aggregateTimeSeries(metrics, 'mrr')} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ARR trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={aggregateTimeSeries(metrics, 'arr')} color="#0ea5e9" type="line" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Burn</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={aggregateTimeSeries(metrics, 'burn')} color="#ef4444" type="line" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Headcount</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={aggregateTimeSeries(metrics, 'headcount')} color="#22c55e" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sector benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {benchmark.length === 0 && <li className="text-slate-400">No benchmarks for sector.</li>}
                {benchmark.map((item) => (
                  <li key={item.metric_key} className="flex justify-between">
                    <span className="text-slate-500">{item.metric_key}</span>
                    <span className="font-semibold">{item.metric_value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note..." />
              <Button onClick={handleAddNote}>Add</Button>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {notes.map((note) => (
                <li key={note.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-400">{new Date(note.created_at).toLocaleString()}</div>
                  <div>{note.content}</div>
                </li>
              ))}
              {notes.length === 0 && <li className="text-slate-400">No notes yet.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funding rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {rounds.map((round) => (
                <li key={round.id} className="flex justify-between border-b border-slate-200 pb-2 last:border-0">
                  <span>{round.round_type ?? 'Round'}</span>
                  <span className="text-slate-500">{round.amount ? `$${round.amount.toLocaleString()}` : '--'}</span>
                  <span className="text-xs text-slate-400">
                    {round.announced_at ? new Date(round.announced_at).toLocaleDateString() : '--'}
                  </span>
                </li>
              ))}
              {rounds.length === 0 && <li className="text-slate-400">No rounds recorded.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </SessionGate>
  );
}
