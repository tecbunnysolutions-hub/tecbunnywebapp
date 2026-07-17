import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreatePostSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1),
  cover_image: z.string().url().optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
});

/** GET /api/blog — list published posts (public) or all posts (staff) */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.min(20, Math.max(1, Number(searchParams.get('pageSize') || '10')));
    const tag = searchParams.get('tag');
    const supabase = await createClient();

    const { session, role } = await getSessionWithRole(request as any).catch(() => ({ session: null, role: null }));
    const isStaff = !!session && !!role && isAtLeast(role, 'marketing_executive');

    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, tags, status, author_id, published_at, created_at, profiles(first_name, last_name)', { count: 'estimated' })
      .order('published_at', { ascending: false, nullsFirst: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (!isStaff) query = query.eq('status', 'published');
    if (tag) query = query.contains('tags', [tag]);

    const { data, count, error } = await query;
    if (error) {
      logger.error('blog.list_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    return NextResponse.json({ posts: data ?? [], total: count ?? 0, page, pageSize });
  } catch (err: any) {
    logger.error('blog.get_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/blog — create a new blog post (marketing_executive+) */
export async function POST(request: NextRequest) {
  try {
    const { session, role } = await getSessionWithRole(request as any);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAtLeast(role!, 'marketing_executive')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...parsed.data,
        author_id: session.user.id,
        published_at: parsed.data.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 });
      logger.error('blog.create_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    logger.info('blog.post_created', { postId: data.id, slug: data.slug, userId: session.user.id });
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err: any) {
    logger.error('blog.post_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
