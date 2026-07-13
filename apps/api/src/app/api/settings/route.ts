import { isSupabasePublicConfigured } from "@tecbunny/core";
import { isSupabaseServiceConfigured } from "@tecbunny/core/server";
import { getAdminDb, DatabaseError } from "@tecbunny/core/server";
import { NextRequest, NextResponse } from 'next/server';

import { getSessionWithRole } from "@tecbunny/core/auth/server-role";
import { verifySuperadminSessionToken } from "@tecbunny/core/server";

import { logger } from "@tecbunny/core";
const PUBLIC_DEFAULTS: Record<string, unknown> = {
  site_branding: 'TecBunny',
  siteName: 'TecBunny - Your Tech Store',
  siteDescription: 'Discover the latest technology with beautiful design and exceptional user experience.',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  tagline: '',
  payment_phonepe_public: null,
  payment_razorpay_public: null,
  feature_flags_public: {},
  partnerBrands: '',
  phone: '+91 96041 36010',
  support_email: 'support@tecbunny.com',
  whatsapp_template_string: 'https://wa.me/919604136010',
  facebook_pixel_id: '1234567890',
  default_gst_rate: '18.00',
};
const PUBLIC_SETTINGS_CACHE_CONTROL = 'no-store, max-age=0';
const PUBLIC_SETTINGS_SELECT = 'key,value,description,updated_at';


async function getSessionAndRole(request: NextRequest) {
  try {
    // Check superadmin session cookie first
    const superadminCookie = request.cookies.get('superadmin-session')?.value;
    const superadminPayload = await verifySuperadminSessionToken(superadminCookie);
    if (superadminPayload) {
      return {
        session: { user: { id: 'superadmin-root-id', email: superadminPayload.email } } as any,
        role: 'superadmin'
      };
    }

    if (!isSupabasePublicConfigured) {
      logger.error('settings.auth.missing_supabase_config');
      return { session: null, role: null };
    }

    const { session, role } = await getSessionWithRole(request as any);
    return { session, role };
  } catch {
    return { session: null, role: null }
  }
}

function isAllowedPublicKey(key: string) {
  // Limit public unauthenticated access to whitelisted read-only keys
  const allowList = [
    'site_branding',
    'logoUrl',
    'faviconUrl',
    'siteName',
    'siteDescription',
    'tagline',
    'payment_phonepe_public',
    'payment_razorpay_public',
    'feature_flags_public',
    'facebookUrl',
    'twitterUrl',
    'instagramUrl',
    'linkedinUrl',
    'youtubeUrl',
    'websiteUrl',
    'partnerBrands',
    'phone',
    'support_email',
    'whatsapp_template_string',
    'facebook_pixel_id',
    'default_gst_rate',
    'custom_setup_accessory_pricing',
  ];
  return allowList.includes(key);
}

function jsonWithCache(body: unknown, cacheControl: string, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', cacheControl);
  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const keys = searchParams.get('keys')
    const keyArray = keys ? keys.split(',').map(k => k.trim()).filter(Boolean) : key ? [key] : null
    const allPublic = keyArray ? keyArray.every(isAllowedPublicKey) : false

    if (!isSupabaseServiceConfigured) {
      logger.warn('settings.get.missing_supabase_config');
      if (keyArray && allPublic) {
        if (key) {
          return jsonWithCache({ key, value: PUBLIC_DEFAULTS[key] ?? null }, PUBLIC_SETTINGS_CACHE_CONTROL)
        }
        const payload = keyArray.reduce<Record<string, unknown>>((acc, currentKey) => {
          acc[currentKey] = PUBLIC_DEFAULTS[currentKey] ?? null
          return acc
        }, {})
        return jsonWithCache(payload, PUBLIC_SETTINGS_CACHE_CONTROL)
      }
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Security: Only allow authenticated users to read settings unless public keys
    if (!allPublic) {
      const { session } = await getSessionAndRole(request);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized handler' }, { status: 401 });
      }
    }

    const db = getAdminDb();

    if (key) {
      // Get single setting by key
      if (!isAllowedPublicKey(key)) {
        // Require auth for non-public keys
        const { role } = await getSessionAndRole(request)
        if (!role || role !== 'superadmin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
      
      try {
        const data = await db.execute(db.from('settings')
          .select(isAllowedPublicKey(key) ? PUBLIC_SETTINGS_SELECT : '*')
          .eq('key', key)
          .single());

        return isAllowedPublicKey(key)
          ? jsonWithCache(data, PUBLIC_SETTINGS_CACHE_CONTROL)
          : NextResponse.json(data);
      } catch (error: any) {
        if (isAllowedPublicKey(key)) {
          return jsonWithCache({ key, value: PUBLIC_DEFAULTS[key] ?? null }, PUBLIC_SETTINGS_CACHE_CONTROL)
        }
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    } else if (keys) {
      // Get multiple settings by comma-separated keys
      const keyArray = keys.split(',').map(k => k.trim())
      // Split into public vs protected
      const protectedKeys = keyArray.filter(k => !isAllowedPublicKey(k))
      if (protectedKeys.length > 0) {
        const { role } = await getSessionAndRole(request)
        if (!role || role !== 'superadmin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
      try {
        const data = await db.execute(db.from('settings')
          .select(protectedKeys.length === 0 ? PUBLIC_SETTINGS_SELECT : '*')
          .in('key', keyArray));

        // Convert to key-value object
        const settings = (data as any as Array<{ key: string; value: unknown }>).reduce<Record<string, unknown>>((acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        }, {})

        if (protectedKeys.length === 0) {
          keyArray.forEach((currentKey) => {
            if (!(currentKey in settings)) {
              settings[currentKey] = PUBLIC_DEFAULTS[currentKey] ?? null
            }
          })
        }

        return protectedKeys.length === 0
          ? jsonWithCache(settings, PUBLIC_SETTINGS_CACHE_CONTROL)
          : NextResponse.json(settings)
      } catch (error: any) {
        if (protectedKeys.length === 0) {
          const payload = keyArray.reduce<Record<string, unknown>>((acc, currentKey) => {
            acc[currentKey] = PUBLIC_DEFAULTS[currentKey] ?? null
            return acc
          }, {})
          return jsonWithCache(payload, PUBLIC_SETTINGS_CACHE_CONTROL)
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Get all settings - superadmin only
      const { role } = await getSessionAndRole(request)
      if (!role || role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      try {
        const data = await db.execute(db.from('settings')
          .select('*')
          .order('key'));
        return NextResponse.json(data)
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
  } catch (error) {
    logger.error('Settings API error:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseServiceConfigured) {
      logger.error('settings.post.missing_supabase_config');
      return NextResponse.json(
        {
          error: 'Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        },
        { status: 503 }
      );
    }

    const db = getAdminDb();
    const { role } = await getSessionAndRole(request)
    if (!role || role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    try {
      const data = await db.execute(db.from('settings')
        .upsert({ key, value, description, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select()
        .single());
      
      return NextResponse.json(data)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (error) {
    logger.error('Settings POST error:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseServiceConfigured) {
      logger.error('settings.put.missing_supabase_config');
      return NextResponse.json(
        {
          error: 'Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        },
        { status: 503 }
      );
    }

    const db = getAdminDb();
    const { role } = await getSessionAndRole(request)
    if (!role || role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const { key, value, description } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    try {
      const data = await db.execute(db.from('settings')
        .update({
          value,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single());

      return NextResponse.json(data)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (error) {
    logger.error('Settings PUT error:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseServiceConfigured) {
      logger.error('settings.delete.missing_supabase_config');
      return NextResponse.json(
        {
          error: 'Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        },
        { status: 503 }
      );
    }

    const db = getAdminDb();
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const { role } = await getSessionAndRole(request)
    if (!role || role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    try {
      await db.execute(db.from('settings')
        .delete()
        .eq('key', key));

      return NextResponse.json({ success: true })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (error) {
    logger.error('Settings DELETE error:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
