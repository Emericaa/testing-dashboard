'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/companies', label: 'Companies' },
  { href: '/thesis', label: 'Thesis', flag: 'FEATURE_THESIS' },
  { href: '/news', label: 'VC News', flag: 'FEATURE_NEWS' },
  { href: '/chat', label: 'Chat', flag: 'FEATURE_CHAT' },
  { href: '/admin', label: 'Backoffice' }
];

export function Sidebar() {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadBranding = async () => {
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
      const { data: settingsAll } = await supabase
        .from('settings')
        .select('branding_json, feature_flags_json')
        .eq('org_id', orgId)
        .single();
      const branding = settingsAll?.branding_json as Record<string, string> | null;
      const flags = (settingsAll?.feature_flags_json as Record<string, boolean> | null) ?? {};
      if (branding?.logo_url) setLogoUrl(branding.logo_url);
      setFeatureFlags(flags);
    };
    loadBranding();
  }, []);

  return (
    <aside className="hidden lg:flex flex-col border-r border-slate-200 bg-white/70 backdrop-blur px-6 py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
        <div className="mt-3 flex items-center gap-2">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-contain" />}
          <h2 className="text-xl font-semibold text-slate-800">VC Dashboard</h2>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems
          .filter((item) => (item.flag ? featureFlags[item.flag] !== false : true))
          .map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="mt-auto text-xs text-slate-400">Self-hosted build</div>
    </aside>
  );
}
