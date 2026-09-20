import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@tecbunny/database';
import { sanitizeHtml } from '@tecbunny/core/sanitize-html';

export const revalidate = 300;

const SITE_URL = 'https://www.tecbunny.com';

const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, seo_title, excerpt, seo_description, cover_image, published_at, updated_at, tags')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!post) return { title: 'Post Not Found' };

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;
  const canonical = `${SITE_URL}/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: 'TecBunny Solutions',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      tags: Array.isArray(post.tags) ? post.tags : undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, profiles(first_name, last_name, avatar_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!post) notFound();

  const author = post.profiles
    ? [post.profiles.first_name, post.profiles.last_name].filter(Boolean).join(' ')
    : 'TecBunny';

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const postUrl = `${SITE_URL}/blog/${slug}`;
  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#blogposting`,
    headline: post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    inLanguage: 'en-IN',
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
    author: {
      '@type': 'Person',
      name: author,
      ...(post.profiles?.avatar_url ? { image: post.profiles.avatar_url } : {}),
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'TecBunny Solutions',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: 'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/TECBUNNY_SOLUTIONS_PVT_LTD-removebg-preview.png',
      },
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article .prose'],
    },
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingJsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        {/* Back */}
        <Link href="/blog" className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
          ← Back to Blog
        </Link>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl text-white">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
          <span>By {author}</span>
          {publishedDate && <><span>·</span><span>{publishedDate}</span></>}
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mt-8 rounded-2xl overflow-hidden relative h-64 sm:h-96">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="mt-10 prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-a:text-indigo-400"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content ?? '') }}
        />
      </article>
    </main>
  );
}
