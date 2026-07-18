import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type BlogRouteContext = { params: Promise<{ slug: string }> };

const UpdatePostSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1).optional(),
  cover_image: z.string().url().optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'published']).optional(),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
});

/** GET /api/blog/[slug] — get single post by slug */
export async function GET(_request: NextRequest, { params }: BlogRouteContext) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, profiles(first_name, last_name, avatar_url)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post: data }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/blog/[slug] — update a blog post */
export async function PATCH(request: NextRequest, { params }: BlogRouteContext) {
  try {
    const { slug } = await params;
    const { session, role } = await getSessionWithRole(request as any);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAtLeast(role!, 'marketing_executive')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const parsed = UpdatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const supabase = await createClient();
    const updates: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
    if (parsed.data.status === 'published') {
      updates.published_at = updates.published_at ?? new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('slug', slug)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('blog.update_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/blog/[slug] — delete a post (admin+) */
export async function DELETE(request: NextRequest, { params }: BlogRouteContext) {
  try {
    const { slug } = await params;
    const { session, role } = await getSessionWithRole(request as any);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAtLeast(role!, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = await createClient();
    const { error } = await supabase.from('blog_posts').delete().eq('slug', slug);
    if (error) return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
