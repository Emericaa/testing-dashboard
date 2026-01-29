import { describe, expect, it } from 'vitest';
import { aggregateTimeSeries, computeCompanyFlags } from './metrics';
import type { CompanyMetric } from '../types';

const sampleMetrics: CompanyMetric[] = [
  {
    id: '1',
    company_id: 'c1',
    date: '2025-01-15',
    metric_key: 'arr',
    metric_value: 120000,
    source: 'seed',
    created_at: '2025-01-15'
  },
  {
    id: '2',
    company_id: 'c1',
    date: '2025-02-15',
    metric_key: 'arr',
    metric_value: 100000,
    source: 'seed',
    created_at: '2025-02-15'
  },
  {
    id: '3',
    company_id: 'c1',
    date: '2025-03-15',
    metric_key: 'arr',
    metric_value: 90000,
    source: 'seed',
    created_at: '2025-03-15'
  },
  {
    id: '4',
    company_id: 'c1',
    date: '2025-03-15',
    metric_key: 'runway',
    metric_value: 4,
    source: 'seed',
    created_at: '2025-03-15'
  },
  {
    id: '5',
    company_id: 'c1',
    date: '2025-03-15',
    metric_key: 'burn',
    metric_value: 200,
    source: 'seed',
    created_at: '2025-03-15'
  },
  {
    id: '6',
    company_id: 'c1',
    date: '2025-03-15',
    metric_key: 'mrr',
    metric_value: 50,
    source: 'seed',
    created_at: '2025-03-15'
  }
];

describe('aggregateTimeSeries', () => {
  it('aggregates by month', () => {
    const series = aggregateTimeSeries(sampleMetrics, 'arr');
    expect(series).toHaveLength(3);
    expect(series[0].value).toBe(120000);
  });
});

describe('computeCompanyFlags', () => {
  it('flags at-risk companies', () => {
    const flags = computeCompanyFlags(sampleMetrics, { runwayThreshold: 6, burnMultipleThreshold: 2 });
    expect(flags.runwayLow).toBe(true);
    expect(flags.arrDecline).toBe(true);
    expect(flags.burnMultipleHigh).toBe(true);
  });
});
