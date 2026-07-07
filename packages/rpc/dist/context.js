import { verifySuperadminSessionToken } from '@tecbunny/core/server';
import { BaseSupabaseClient } from '@tecbunny/infra';
// Simple helper to mock the authentication context natively instead of rewriting the entire core middleware inside tRPC for now
export async function createContext({ req, resHeaders }) {
    // We'll mimic the session behavior in apps/api route handlers for seamless integration
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    let session = null;
    let role = null;
    try {
        const cookieHeader = req.headers.get('cookie') || '';
        const superadminCookieMatch = cookieHeader.match(/superadmin-session=([^;]+)/);
        if (superadminCookieMatch) {
            const superadminPayload = await verifySuperadminSessionToken(superadminCookieMatch[1]);
            if (superadminPayload) {
                session = { user: { id: 'superadmin-root-id', email: superadminPayload.email } };
                role = 'superadmin';
            }
        }
        if (!session) {
            const authHeader = req.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.substring(7).trim();
                if (token && SUPABASE_URL && SUPABASE_ANON_KEY) {
                    const baseClient = new BaseSupabaseClient({ url: SUPABASE_URL, key: SUPABASE_ANON_KEY });
                    const { data, error } = await baseClient.rawClient.auth.getUser(token);
                    if (!error && data?.user) {
                        role = data.user.app_metadata?.role || 'customer';
                        session = { user: data.user };
                    }
                }
            }
        }
    }
    catch (error) {
        // Ignore auth extraction errors
    }
    return {
        req,
        resHeaders,
        session,
        role
    };
}
