import { NextResponse } from 'next/server';
// @ts-ignore
import { createSupabaseServiceClient } from '@tecbunny/database';

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    
    // Perform a lightweight query to ensure the database is reachable
    const { data, error } = await supabase.from('tenants').select('id').limit(1);

    if (error) {
      console.error('Health Check: Database connection failed', error);
      return new NextResponse('Service Unavailable', { status: 503 });
    }

    // In the future, you can also add Redis checks here
    // const redisStatus = await checkRedisConnection();
    // if (!redisStatus) return new NextResponse('Service Unavailable', { status: 503 });

    return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Health Check Error:', error);
    return new NextResponse('Service Unavailable', { status: 503 });
  }
}
