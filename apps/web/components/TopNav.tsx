'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    const loadFlags = async () => {
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
      const { data: settings } = await supabase
        .from('settings')
        .select('feature_flags_json')
        .eq('org_id', orgId)
        .single();
      const flags = (settings?.feature_flags_json as Record<string, boolean> | null) ?? {};
      setFeatureFlags(flags);
    };
    loadFlags();
  }, []);

  return (
    <header className="lg:hidden flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3">
      <span className="text-sm font-semibold">VC Dashboard</span>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-md border border-slate-200 px-3 py-1 text-xs"
      >
        Menu
      </button>
      {open && (
        <div className="absolute left-0 top-14 z-20 w-full border-b border-slate-200 bg-white shadow-lg">
          <nav className="flex flex-col gap-1 p-3">
            {navItems
              .filter((item) => (item.flag ? featureFlags[item.flag] !== false : true))
              .map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium',
                      active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>
        </div>
      )}
    </header>
  );
}
