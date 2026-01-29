'use client';

import { ReactNode, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export function BrandingProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const applyBranding = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return;
      const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', sessionData.session.user.id)
        .single();
      if (!profile?.org_id) return;
      const { data: settings } = await supabase
        .from('settings')
        .select('branding_json')
        .eq('org_id', profile.org_id)
        .single();
      if (!settings?.branding_json) return;
      const branding = settings.branding_json as Record<string, string>;
      const root = document.documentElement;
      if (branding['brand-500']) root.style.setProperty('--brand-500', branding['brand-500']);
      if (branding['brand-700']) root.style.setProperty('--brand-700', branding['brand-700']);
      if (branding['brand-100']) root.style.setProperty('--brand-100', branding['brand-100']);
      if (branding['brand-50']) root.style.setProperty('--brand-50', branding['brand-50']);
    };
    applyBranding();
  }, []);

  return <>{children}</>;
}
