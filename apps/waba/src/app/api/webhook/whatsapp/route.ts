import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { InboundTriageAgent } from '@/agents/InboundTriageAgent';
import { AssignmentOrchestrator } from '@/agents/AssignmentOrchestrator';

const INFOBIP_HMAC_SECRET = process.env.INFOBIP_HMAC_SECRET || 'bunny@6010';

function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature || !INFOBIP_HMAC_SECRET) return false;
  
  const hash = crypto
    .createHmac('sha256', INFOBIP_HMAC_SECRET)
    .update(payload)
    .digest('base64');
    
  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // Check if the user is passing a token in the URL query parameters
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    // Check headers for HMAC signature
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');

    // Authenticate via URL token OR HMAC signature
    let isAuthenticated = false;
    
    if (token === INFOBIP_HMAC_SECRET) {
      isAuthenticated = true;
    } else if (signature && verifySignature(rawBody, signature)) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Invalid authentication token or signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    
    // Execute agents synchronously since Vercel is serverless and cannot run background BullMQ workers
    const triageAgent = new InboundTriageAgent();
    const orchestrator = new AssignmentOrchestrator();

    // 1. Process incoming message and triage
    const triageResult = await triageAgent.execute(body);

    // 2. If the message was actionable and actionable payload was returned, assign to manager
    if (triageResult) {
      await orchestrator.execute(triageResult);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
