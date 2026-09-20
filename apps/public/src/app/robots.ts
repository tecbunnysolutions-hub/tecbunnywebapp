import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.tecbunny.com';

  return {
    rules: [
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: [
          '/api/',
          '/mgmt/',
          '/auth/',
          '/checkout/',
          '/cart/',
          '/profile/',
          '/admin/',
          '/superadmin/',
          '/staff/',
          '/dashboard/',
          '/projects/',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'Claude-User',
          'CCBot',
          'Google-Extended',
          'Anthropic-AI',
          'Omgilibot',
          'FacebookBot',
          'Meta-ExternalAgent',
          'Meta-ExternalFetcher',
          'PerplexityBot',
          'Perplexity-User',
          'Applebot-Extended',
          'cohere-ai',
          'Bytespider',
          'YouBot',
          'Amazonbot',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/mgmt/',
          '/auth/',
          '/checkout/',
          '/cart/',
          '/profile/',
          '/admin/',
          '/superadmin/',
          '/staff/',
          '/dashboard/',
          '/projects/',
        ],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/mgmt/',
          '/auth/',
          '/checkout/',
          '/cart/',
          '/profile/',
          '/admin/',
          '/superadmin/',
          '/staff/',
          '/dashboard/',
          '/projects/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
