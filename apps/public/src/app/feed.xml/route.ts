import { createClient } from '@supabase/supabase-js';
import { requireSupabasePublicEnv } from '@tecbunny/database';

export const revalidate = 3600;

const SITE_URL = 'https://www.tecbunny.com';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { url, publicKey } = requireSupabasePublicEnv();
  const supabase = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, seo_description, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((post: { title: string; slug: string; excerpt: string | null; seo_description: string | null; published_at: string | null }) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const description = post.seo_description || post.excerpt || '';
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : '';
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        description ? `      <description>${escapeXml(description)}</description>` : '',
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TecBunny Solutions Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>CCTV, IT services, networking, and smart automation insights from TecBunny Solutions in Goa, India.</description>
    <language>en-in</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
