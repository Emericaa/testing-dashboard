'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import type { Session } from '@supabase/supabase-js';

export function SessionGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading session...</div>;
  }

  if (!session) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold">Sign in required</h2>
        <p className="text-sm text-slate-500">Use the login page to access the dashboard.</p>
        <Link className="mt-3 inline-flex text-sm font-semibold text-brand-700" href="/login">
          Go to login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
