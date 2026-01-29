'use client';

import { useEffect, useState } from 'react';
import { SessionGate } from '@/components/SessionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [mode, setMode] = useState<'iframe' | 'webhook'>('iframe');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('portfolio');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const envMode = (process.env.N8N_EMBED_MODE || process.env.NEXT_PUBLIC_N8N_EMBED_MODE || 'iframe') as 'iframe' | 'webhook';
    setMode(envMode);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const message: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input };
    setMessages((prev) => [...prev, message]);
    setInput('');

    const response = await fetch('/api/n8n', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'chat', message: message.content, context })
    });
    const payload = await response.json();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'assistant', content: payload.reply ?? 'No response' }
    ]);
    setLoading(false);
  };

  if (mode === 'iframe') {
    return (
      <SessionGate>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">n8n Chat</h1>
            <p className="text-sm text-slate-500">Embedded n8n workflow chat.</p>
          </div>
          <div className="card overflow-hidden">
            <iframe
              src={process.env.NEXT_PUBLIC_N8N_CHAT_URL}
              className="h-[720px] w-full"
              title="n8n chat"
            />
          </div>
        </div>
      </SessionGate>
    );
  }

  return (
    <SessionGate>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">n8n Chat (Webhook)</h1>
          <p className="text-sm text-slate-500">Custom UI calling n8n webhook.</p>
        </div>
        <div className="card flex h-[600px] flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            <Select value={context} onChange={(e) => setContext(e.target.value)}>
              <option value="portfolio">Ask about: Portfolio</option>
              <option value="thesis">Ask about: Thesis</option>
              <option value="news">Ask about: News</option>
              <option value="company">Ask about: Company</option>
            </Select>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user' ? 'ml-auto bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {messages.length === 0 && <div className="text-xs text-slate-400">Start a conversation.</div>}
          </div>
          <div className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the portfolio..." />
              <Button onClick={handleSend} disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SessionGate>
  );
}
