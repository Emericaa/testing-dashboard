export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'VC Dashboard',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'thesis',
  n8nEmbedMode: process.env.N8N_EMBED_MODE || process.env.NEXT_PUBLIC_N8N_EMBED_MODE || 'iframe',
  n8nChatUrl: process.env.NEXT_PUBLIC_N8N_CHAT_URL || '',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  n8nSharedSecret: process.env.N8N_SHARED_SECRET || '',
  appEncryptionKey: process.env.APP_ENCRYPTION_KEY || ''
};
