import type { CompanyMetric } from '../types';

export type MetricKey =
  | 'mrr'
  | 'arr'
  | 'revenue'
  | 'burn'
  | 'runway'
  | 'headcount'
  | 'gross_margin'
  | 'retention'
  | 'churn';

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface OrgKpis {
  totalInvested?: number;
  tvpi?: number;
  dpi?: number;
  rvpi?: number;
  portfolioArr?: number;
  portfolioMrr?: number;
  burnMultiple?: number;
  runwayMedian?: number;
  headcountGrowth?: number;
  activeCompanies?: number;
  atRiskCompanies?: number;
}

export interface CompanyFlags {
  runwayLow: boolean;
  burnMultipleHigh: boolean;
  arrDecline: boolean;
}

export interface CompanySeries {
  companyId: string;
  series: TimeSeriesPoint[];
}

export function normalizeMonth(dateValue: string): string {
  const date = new Date(dateValue);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function aggregateTimeSeries(metrics: CompanyMetric[], metricKey: MetricKey): TimeSeriesPoint[] {
  const buckets = new Map<string, number>();
  metrics
    .filter((metric) => metric.metric_key === metricKey)
    .forEach((metric) => {
      const bucket = normalizeMonth(metric.date);
      const current = buckets.get(bucket) ?? 0;
      const value = Number(metric.metric_value) || 0;
      buckets.set(bucket, current + value);
    });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, value]) => ({ date, value }));
}

export function latestMetricValue(metrics: CompanyMetric[], metricKey: MetricKey): number | null {
  const filtered = metrics.filter((metric) => metric.metric_key === metricKey);
  if (filtered.length === 0) return null;
  const latest = filtered.reduce((acc, metric) => (metric.date > acc.date ? metric : acc));
  return Number(latest.metric_value);
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function computeCompanyFlags(metrics: CompanyMetric[], options?: { runwayThreshold?: number; burnMultipleThreshold?: number }): CompanyFlags {
  const runwayThreshold = options?.runwayThreshold ?? 6;
  const burnMultipleThreshold = options?.burnMultipleThreshold ?? 2;

  const runway = latestMetricValue(metrics, 'runway') ?? Infinity;
  const burn = latestMetricValue(metrics, 'burn') ?? 0;
  const mrr = latestMetricValue(metrics, 'mrr') ?? 0;
  const arrSeries = aggregateTimeSeries(metrics, 'arr');

  const burnMultiple = mrr > 0 ? burn / mrr : 0;
  const lastThreeArr = arrSeries.slice(-3).map((point) => point.value);
  const arrDecline = lastThreeArr.length === 3 && lastThreeArr[2] < lastThreeArr[1] && lastThreeArr[1] < lastThreeArr[0];

  return {
    runwayLow: runway < runwayThreshold,
    burnMultipleHigh: burnMultiple > burnMultipleThreshold,
    arrDecline
  };
}

export function computeOrgKpis(metricsByCompany: Record<string, CompanyMetric[]>): OrgKpis {
  const companyIds = Object.keys(metricsByCompany);
  const mrrValues: number[] = [];
  const arrValues: number[] = [];
  const runwayValues: number[] = [];
  const headcountValues: number[] = [];
  const atRisk: string[] = [];

  companyIds.forEach((companyId) => {
    const metrics = metricsByCompany[companyId] ?? [];
    const mrr = latestMetricValue(metrics, 'mrr');
    const arr = latestMetricValue(metrics, 'arr');
    const runway = latestMetricValue(metrics, 'runway');
    const headcount = latestMetricValue(metrics, 'headcount');
    if (mrr !== null) mrrValues.push(mrr);
    if (arr !== null) arrValues.push(arr);
    if (runway !== null) runwayValues.push(runway);
    if (headcount !== null) headcountValues.push(headcount);

    const flags = computeCompanyFlags(metrics);
    if (flags.runwayLow || flags.burnMultipleHigh || flags.arrDecline) {
      atRisk.push(companyId);
    }
  });

  return {
    portfolioMrr: mrrValues.reduce((sum, value) => sum + value, 0),
    portfolioArr: arrValues.reduce((sum, value) => sum + value, 0),
    runwayMedian: median(runwayValues) ?? undefined,
    headcountGrowth: headcountValues.length > 1 ? headcountValues[headcountValues.length - 1] - headcountValues[0] : undefined,
    activeCompanies: companyIds.length,
    atRiskCompanies: atRisk.length
  };
}
