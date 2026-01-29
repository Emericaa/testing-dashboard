'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SessionGate } from '@/components/SessionGate';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { computeCompanyFlags } from '@vc/shared';

interface CompanyRow {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
  geo: string | null;
  status: string | null;
  metrics?: Record<string, number>;
  risk?: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newGeo, setNewGeo] = useState('');

  const loadCompanies = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();
    if (!profile?.org_id) return;

    const { data: rows } = await supabase
      .from('companies')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('created_at', { ascending: false });

    const { data: metrics } = await supabase
      .from('company_metrics')
      .select('*')
      .in('company_id', (rows ?? []).map((row) => row.id));

    const metricsByCompany: Record<string, typeof metrics> = {};
    (metrics ?? []).forEach((metric) => {
      metricsByCompany[metric.company_id] = metricsByCompany[metric.company_id] || [];
      metricsByCompany[metric.company_id].push(metric);
    });

    const enriched = (rows ?? []).map((row) => {
      const flags = computeCompanyFlags(metricsByCompany[row.id] ?? []);
      return {
        ...row,
        risk: flags.runwayLow || flags.burnMultipleHigh || flags.arrDecline
      } as CompanyRow;
    });

    setCompanies(enriched);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleAddCompany = async () => {
    if (!newName.trim()) return;
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();
    if (!profile?.org_id) return;

    await supabase.from('companies').insert({
      org_id: profile.org_id,
      name: newName,
      sector: newSector || null,
      stage: newStage || null,
      geo: newGeo || null,
      status: 'active'
    });

    setNewName('');
    setNewSector('');
    setNewStage('');
    setNewGeo('');
    await loadCompanies();
  };

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase());
      const matchesSector = sectorFilter ? company.sector === sectorFilter : true;
      return matchesSearch && matchesSector;
    });
  }, [companies, search, sectorFilter]);

  const sectors = Array.from(new Set(companies.map((c) => c.sector).filter(Boolean))) as string[];

  return (
    <SessionGate>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Companies</h1>
            <p className="text-sm text-slate-500">Search, filter, and flag portfolio companies.</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Search companies" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
              <option value="">All sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <thead>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Geo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Link className="font-semibold text-brand-700" href={`/companies/${company.id}`}>
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell>{company.sector ?? '--'}</TableCell>
                  <TableCell>{company.stage ?? '--'}</TableCell>
                  <TableCell>{company.geo ?? '--'}</TableCell>
                  <TableCell>{company.status ?? '--'}</TableCell>
                  <TableCell>
                    {company.risk ? <span className="badge badge-risk">At risk</span> : <span className="badge badge-ok">On track</span>}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Add new company</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <Input placeholder="Company name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Sector" value={newSector} onChange={(e) => setNewSector(e.target.value)} />
              <Input placeholder="Stage" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
              <Input placeholder="Geo" value={newGeo} onChange={(e) => setNewGeo(e.target.value)} />
            </div>
            <div className="mt-3">
              <Button onClick={handleAddCompany}>Add company</Button>
            </div>
          </div>
        </Card>
      </div>
    </SessionGate>
  );
}
