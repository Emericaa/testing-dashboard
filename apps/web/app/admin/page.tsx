'use client';

import { useEffect, useState } from 'react';
import { SessionGate } from '@/components/SessionGate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

interface UserRow {
  id: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [connectorType, setConnectorType] = useState('crunchbase');
  const [connectorSecret, setConnectorSecret] = useState('');
  const [brand500, setBrand500] = useState('43 91 191');
  const [brand700, setBrand700] = useState('19 54 126');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [featureNews, setFeatureNews] = useState(true);
  const [featureChat, setFeatureChat] = useState(true);
  const [featureThesis, setFeatureThesis] = useState(true);
  const [status, setStatus] = useState('');

  const loadUsers = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;
    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();
    const orgId = (profile as { org_id?: string } | null)?.org_id;
    if (!orgId) return;

    const { data: rows } = await supabase.from('users').select('id, email, role').eq('org_id', orgId);
    setUsers(rows ?? []);
  };

  const loadSettings = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;
    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();
    const orgId = (profile as { org_id?: string } | null)?.org_id;
    if (!orgId) return;

    const { data: settings } = await supabase.from('settings').select('*').eq('org_id', orgId).single();
    const typedSettings = settings as
      | { feature_flags_json?: Record<string, boolean> | null; branding_json?: Record<string, string> | null }
      | null;
    const flags = typedSettings?.feature_flags_json ?? {};
    const branding = typedSettings?.branding_json ?? {};
    if (branding['brand-500']) setBrand500(branding['brand-500']);
    if (branding['brand-700']) setBrand700(branding['brand-700']);
    setFeatureNews(flags.FEATURE_NEWS ?? true);
    setFeatureChat(flags.FEATURE_CHAT ?? true);
    setFeatureThesis(flags.FEATURE_THESIS ?? true);
  };

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, []);

  const updateUserRole = async (userId: string, role: string) => {
    const supabase = getSupabaseBrowser();
    await supabase.from('users').update({ role }).eq('id', userId);
    loadUsers();
  };

  const handleSaveConnector = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const response = await fetch('/api/connectors', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ connectorType, secret: connectorSecret })
    });
    if (response.ok) {
      setStatus('Connector saved.');
      setConnectorSecret('');
    } else {
      const payload = await response.json();
      setStatus(payload.error ?? 'Failed to save connector.');
    }
  };

  const handleTestConnector = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const response = await fetch('/api/connectors/test', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ connectorType })
    });
    const payload = await response.json();
    setStatus(payload.status ?? 'Test complete.');
  };

  const handleSaveBranding = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        branding: {
          'brand-500': brand500,
          'brand-700': brand700
        }
      })
    });
    if (response.ok) {
      setStatus('Branding saved.');
    } else {
      setStatus('Failed to save branding.');
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', sessionData.session.user.id)
      .single();
    const orgId = (profile as { org_id?: string } | null)?.org_id;
    if (!orgId) return;

    const filePath = `${orgId}/logo-${Date.now()}-${logoFile.name}`;
    const { error: uploadError } = await supabase.storage.from('branding').upload(filePath, logoFile, { upsert: true });
    if (uploadError) {
      setStatus(uploadError.message);
      return;
    }

    const logoUrl = supabase.storage.from('branding').getPublicUrl(filePath).data.publicUrl;
    const token = sessionData.session.access_token;

    await fetch('/api/settings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ branding: { logo_url: logoUrl } })
    });
    setStatus('Logo uploaded.');
    setLogoFile(null);
  };

  const handleSaveFeatureFlags = async () => {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        featureFlags: {
          FEATURE_NEWS: featureNews,
          FEATURE_CHAT: featureChat,
          FEATURE_THESIS: featureThesis
        }
      })
    });
    if (response.ok) {
      setStatus('Feature flags saved.');
    } else {
      setStatus('Failed to save feature flags.');
    }
  };

  return (
    <SessionGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Backoffice</h1>
          <p className="text-sm text-slate-500">Manage users, connectors, and branding.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users & roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <div className="text-sm font-semibold">{user.email}</div>
                    <div className="text-xs text-slate-400">{user.id}</div>
                  </div>
                  <Select value={user.role} onChange={(e) => updateUserRole(user.id, e.target.value)}>
                    <option value="admin">admin</option>
                    <option value="partner">partner</option>
                    <option value="analyst">analyst</option>
                    <option value="viewer">viewer</option>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connector secrets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={connectorType} onChange={(e) => setConnectorType(e.target.value)}>
                <option value="crunchbase">Crunchbase</option>
                <option value="pitchbook">PitchBook</option>
                <option value="spectre">Spectre</option>
              </Select>
              <Input placeholder="API key / token" value={connectorSecret} onChange={(e) => setConnectorSecret(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleSaveConnector}>Save</Button>
                <Button variant="secondary" onClick={handleTestConnector}>Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Input value={brand500} onChange={(e) => setBrand500(e.target.value)} placeholder="brand-500 (RGB)" />
              <Input value={brand700} onChange={(e) => setBrand700(e.target.value)} placeholder="brand-700 (RGB)" />
              <Button onClick={handleSaveBranding}>Save branding</Button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
              <Button variant="secondary" onClick={handleUploadLogo}>Upload logo</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature toggles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={featureNews} onChange={(e) => setFeatureNews(e.target.checked)} />
                Enable VC News
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={featureChat} onChange={(e) => setFeatureChat(e.target.checked)} />
                Enable Chat
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={featureThesis} onChange={(e) => setFeatureThesis(e.target.checked)} />
                Enable Thesis
              </label>
            </div>
            <div className="mt-3">
              <Button onClick={handleSaveFeatureFlags}>Save toggles</Button>
            </div>
          </CardContent>
        </Card>

        {status && <div className="text-sm text-slate-500">{status}</div>}
      </div>
    </SessionGate>
  );
}
