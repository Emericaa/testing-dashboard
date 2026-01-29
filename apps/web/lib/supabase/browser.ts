import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return browserClient;
}
