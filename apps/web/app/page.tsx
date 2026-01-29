'use client';

import { useEffect, useState } from 'react';
import { SessionGate } from '@/components/SessionGate';
import { KpiCard } from '@/components/KpiCard';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

interface DashboardData {
  kpis: Record<string, number | null>;
  series: Record<string, { date: string; value: number }[]>;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch('/api/metrics?range=12m', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const payload = await response.json();
        setData(payload);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <SessionGate>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Portfolio overview</h1>
            <p className="text-sm text-slate-500">Live performance metrics across the portfolio.</p>
          </div>
          <div className="flex gap-2">
            <Select>
              <option>All funds</option>
              <option>Growth Fund I</option>
              <option>Seed Fund II</option>
            </Select>
            <Select>
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>Last 3 months</option>
              <option>All time</option>
            </Select>
          </div>
        </div>

        {loading && <div className="text-sm text-slate-500">Loading portfolio metrics...</div>}

        {data && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Portfolio ARR" value={data.kpis.portfolioArr?.toLocaleString() ?? '--'} subtitle="Aggregated" />
            <KpiCard title="Portfolio MRR" value={data.kpis.portfolioMrr?.toLocaleString() ?? '--'} subtitle="Aggregated" />
            <KpiCard title="Median runway" value={data.kpis.runwayMedian?.toFixed(1) ?? '--'} subtitle="Months" />
            <KpiCard title="At-risk companies" value={data.kpis.atRiskCompanies ?? 0} subtitle="Flagged" />
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Portfolio ARR trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data?.series?.arr ?? []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Burn & runway</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data?.series?.burn ?? []} color="#e11d48" type="line" />
              <div className="mt-4 text-xs text-slate-500">Median runway shown on KPI cards.</div>
            </CardContent>
          </Card>
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Headcount growth</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data?.series?.headcount ?? []} color="#0ea5e9" />
            </CardContent>
          </Card>
        </div>
      </div>
    </SessionGate>
  );
}
