import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@tecbunny/database';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog — TecBunny',
  description: 'Insights on CCTV, IT infrastructure, smart security, and tech tips from the TecBunny team.',
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, tags, published_at, profiles(first_name, last_name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(0, 19);

  const items = posts ?? [];

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          TecBunny <span className="text-indigo-400">Blog</span>
        </h1>
        <p className="mt-4 text-zinc-400 max-w-xl">
          Practical guides, security news, and tech insights from our team.
        </p>

        {items.length === 0 ? (
          <p className="mt-20 text-center text-zinc-500">No posts yet — check back soon.</p>
        ) : (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post: any) => {
              const author = post.profiles
                ? [post.profiles.first_name, post.profiles.last_name].filter(Boolean).join(' ')
                : 'TecBunny';
              const date = post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '';
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-indigo-500/50 transition-all"
                >
                  {post.cover_image && (
                    <div className="aspect-video w-full overflow-hidden bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-zinc-400 line-clamp-3 flex-1">{post.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                      <span>{author}</span>
                      <span>{date}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
