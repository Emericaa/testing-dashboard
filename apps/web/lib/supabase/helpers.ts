import { NextRequest } from 'next/server';
import { createAuthedClient } from './authed';

export interface AuthContext {
  accessToken: string;
  userId: string;
  email: string | null;
  orgId: string;
  role: string;
}

export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const supabase = createAuthedClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('org_id, role, email')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    accessToken: token,
    userId: userData.user.id,
    email: profile.email ?? userData.user.email ?? null,
    orgId: profile.org_id,
    role: profile.role
  };
}
