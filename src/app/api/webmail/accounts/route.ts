import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { action, domain, email, password } = await req.json();

    if (action === 'create_domain') {
      if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 });
      
      const { data, error } = await supabase
        .from('webmail_domains')
        .insert({ domain })
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ success: true, domain: data });
    }
    
    if (action === 'create_account') {
      if (!email || !password || !domain) {
        return NextResponse.json({ error: 'Email, password, and domain are required' }, { status: 400 });
      }

      // 1. Get domain ID
      const { data: domainRec, error: domainError } = await supabase
        .from('webmail_domains')
        .select('id')
        .eq('domain', domain)
        .single();
        
      if (domainError || !domainRec) {
        return NextResponse.json({ error: 'Domain not found or inactive' }, { status: 400 });
      }

      // 2. Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // 3. Create account
      const { data: account, error: accountError } = await supabase
        .from('webmail_accounts')
        .insert({
          domain_id: domainRec.id,
          email,
          password_hash
        })
        .select('id, email, active')
        .single();
        
      if (accountError) throw accountError;
      
      return NextResponse.json({ success: true, account });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Webmail admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Get all domains and accounts
    const { data: domains, error: dErr } = await supabase.from('webmail_domains').select('*');
    const { data: accounts, error: aErr } = await supabase.from('webmail_accounts').select('id, email, domain_id, active, storage_used_bytes, storage_quota_bytes');
    
    if (dErr) throw dErr;
    if (aErr) throw aErr;

    return NextResponse.json({ domains, accounts });
  } catch (err: any) {
    console.error('Webmail admin GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
