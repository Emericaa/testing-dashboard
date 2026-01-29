import Parser from 'rss-parser';
import crypto from 'node:crypto';
import { supabaseAdmin } from '../services/supabase';
import { log } from '../services/logger';

const parser = new Parser();

function hashUrl(url: string) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export async function handleNewsSync() {
  const urls = (process.env.NEWS_RSS_URLS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (urls.length === 0) {
    log('warn', 'No RSS urls configured');
    return;
  }

  const { data: orgs } = await supabaseAdmin.from('orgs').select('id');
  if (!orgs || orgs.length === 0) {
    log('warn', 'No orgs found for news sync');
    return;
  }

  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items || [];
      const source = feed.title || new URL(url).hostname;

      for (const org of orgs) {
        const payload = items
          .filter((item) => item.link)
          .map((item) => ({
            org_id: org.id,
            title: item.title || 'Untitled',
            url: item.link as string,
            url_hash: hashUrl(item.link as string),
            source,
            published_at: item.isoDate || item.pubDate || null,
            summary: item.contentSnippet || item.content || null,
            tags: []
          }));

        if (payload.length > 0) {
          const { error } = await supabaseAdmin.from('news_items').upsert(payload, { onConflict: 'org_id,url_hash' });
          if (error) {
            log('warn', 'News upsert failed', { error: error.message });
          }
        }
      }
    } catch (error) {
      log('error', 'RSS parse failed', { url, error: error instanceof Error ? error.message : String(error) });
    }
  }
}
