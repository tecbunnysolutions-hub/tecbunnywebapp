import { NextResponse } from 'next/server';

// IndexNow: instant URL submission to Bing, Yandex, and engines powering
// Copilot / ChatGPT search. Key is served at /<key>.txt from /public.
// Usage: POST /api/indexnow { "urls": ["https://www.tecbunny.com/products"] }
// Header: x-indexnow-secret must match process.env.INDEXNOW_SECRET.

export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = 'aebe35f3031386fb91688e8ba36c0850';
const HOST = 'www.tecbunny.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const MAX_URLS_PER_REQUEST = 10_000;

export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'IndexNow not configured' }, { status: 503 });
  }

  const provided = request.headers.get('x-indexnow-secret');
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { urls?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const urls = Array.isArray(body?.urls) ? body.urls.filter((u): u is string => typeof u === 'string') : [];
  if (urls.length === 0) {
    return NextResponse.json({ error: 'urls must be a non-empty array of strings' }, { status: 400 });
  }
  if (urls.length > MAX_URLS_PER_REQUEST) {
    return NextResponse.json({ error: `Max ${MAX_URLS_PER_REQUEST} URLs per request` }, { status: 400 });
  }

  const invalid = urls.filter((u) => !u.startsWith(`https://${HOST}/`));
  if (invalid.length > 0) {
    return NextResponse.json({ error: 'All URLs must be on www.tecbunny.com', invalid }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
    });

    return NextResponse.json(
      { submitted: urls.length, engineStatus: res.status },
      { status: res.ok ? 200 : 502 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'IndexNow submission failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
