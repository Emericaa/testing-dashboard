'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('Signing in...');
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus('Signed in. Reload the page.');
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to access the VC dashboard.</p>
        <form className="mt-4 space-y-3" onSubmit={handleLogin}>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        {status && <p className="mt-3 text-xs text-slate-500">{status}</p>}
      </div>
      <div className="text-xs text-slate-400">Demo seed user: admin@demo.local / password123</div>
    </div>
  );
}
