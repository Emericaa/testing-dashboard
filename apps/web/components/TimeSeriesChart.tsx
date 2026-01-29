'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';

interface SeriesPoint {
  date: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: SeriesPoint[];
  color?: string;
  type?: 'line' | 'area';
}

export function TimeSeriesChart({ data, color = '#2b5bbf', type = 'area' }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-400">No data</div>;
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke={color} fill="url(#areaFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
