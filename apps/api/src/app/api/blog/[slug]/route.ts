import { withPublicRevalidation } from '../../../../lib/revalidate-public';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { getSessionWithRole } from '@tecbunny/core/auth/server-role';
import { isAtLeast } from '@tecbunny/core/roles';
import { logger } from '@tecbunny/core';
import { z } from 'zod';
import { blogStorageFields, normalizePost } from '../../../../services/blog.service';

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
export async function GET(request: NextRequest, { params }: BlogRouteContext) {
  try {
    const { slug } = await params;
    logger.info('blog_slug.audit.requested', { slug });
    const supabase = await createClient();
    const { session, role } = await getSessionWithRole(request).catch(() => ({ session: null, role: null }));
    const isStaff = !!session && !!role && isAtLeast(role, 'marketing_executive');
    let query = supabase
      .from('blog_posts')
      .select('id,title,slug,excerpt,content:body,cover_image:cover_image_url,tags,status,author_id,published_at,created_at,updated_at,metadata,profiles(name,avatar_url)')
      .eq('slug', slug)
      .is('deleted_at', null);
    if (!isStaff) query = query.eq('status', 'active').not('published_at', 'is', null).lte('published_at', new Date().toISOString());
    const { data, error } = await query.maybeSingle();

    if (error || !data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    logger.info('blog_slug.audit.success', { slug });
    return NextResponse.json({ post: normalizePost(data) }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (err: any) {
    logger.error('blog_slug.audit.failed', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/blog/[slug] — update a blog post */
async function PATCHHandler(request: NextRequest, { params }: BlogRouteContext) {
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
    const { data: current, error: readError } = await supabase.from('blog_posts')
      .select('metadata,updated_at,published_at').eq('slug', slug).maybeSingle();
    if (readError) return NextResponse.json({ error: 'Failed to load post for update' }, { status: 500 });
    if (!current) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    const updates: Record<string, unknown> = { ...blogStorageFields(parsed.data, current.metadata), updated_at: new Date().toISOString() };
    if (parsed.data.status === 'published') {
      updates.published_at = current.published_at ?? new Date().toISOString();
    } else if (parsed.data.status === 'draft') {
      updates.published_at = null;
    }

    let update = supabase
      .from('blog_posts')
      .update(updates)
      .eq('slug', slug);
    // Avoid overwriting metadata if another editor changed this post after the read.
    update = current.updated_at ? update.eq('updated_at', current.updated_at) : update.is('updated_at', null);
    const { data, error } = await update.select().maybeSingle();

    if (error) {
      logger.error('blog.update_failed', { error: error.message });
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Post changed; reload before saving again' }, { status: 409 });

    return NextResponse.json({ post: normalizePost(data) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/blog/[slug] — delete a post (admin+) */
async function DELETEHandler(request: NextRequest, { params }: BlogRouteContext) {
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

export const PATCH = withPublicRevalidation(['blog'], PATCHHandler);
export const DELETE = withPublicRevalidation(['blog'], DELETEHandler);
