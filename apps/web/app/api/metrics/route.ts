import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/supabase/helpers';
import { createAuthedClient } from '@/lib/supabase/authed';
import { aggregateTimeSeries, computeOrgKpis } from '@vc/shared';
import { log } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  log('info', 'metrics_request', { orgId: auth.orgId, userId: auth.userId });

  const supabase = createAuthedClient(auth.accessToken);
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('org_id', auth.orgId);

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 400 });
  }

  const companyIds = (companies ?? []).map((company) => company.id);
  if (companyIds.length === 0) {
    return NextResponse.json({ kpis: {}, series: {} });
  }

  const range = request.nextUrl.searchParams.get('range') ?? '12m';
  const months = range === '6m' ? 6 : range === '3m' ? 3 : range === '12m' ? 12 : 0;
  const since = months > 0 ? new Date(new Date().setMonth(new Date().getMonth() - months)) : null;

  let metricsQuery = supabase.from('company_metrics').select('*').in('company_id', companyIds);
  if (since) {
    metricsQuery = metricsQuery.gte('date', since.toISOString());
  }

  const { data: metrics, error: metricsError } = await metricsQuery;
  if (metricsError) {
    return NextResponse.json({ error: metricsError.message }, { status: 400 });
  }

  const metricsByCompany: Record<string, typeof metrics> = {};
  (metrics ?? []).forEach((metric) => {
    metricsByCompany[metric.company_id] = metricsByCompany[metric.company_id] || [];
    metricsByCompany[metric.company_id].push(metric);
  });

  const kpis = computeOrgKpis(metricsByCompany);

  const series = {
    mrr: aggregateTimeSeries(metrics ?? [], 'mrr'),
    arr: aggregateTimeSeries(metrics ?? [], 'arr'),
    burn: aggregateTimeSeries(metrics ?? [], 'burn'),
    headcount: aggregateTimeSeries(metrics ?? [], 'headcount'),
    runway: aggregateTimeSeries(metrics ?? [], 'runway')
  };

  return NextResponse.json({ kpis, series });
}
