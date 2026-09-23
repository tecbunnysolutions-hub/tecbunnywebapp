import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = 'aebe35f3031386fb91688e8ba36c0850';
const HOST = 'www.tecbunny.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const MAX_URLS_PER_REQUEST = 10_000;

/** Submit TecBunny URLs to IndexNow. Restricted to an internal caller. */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) return NextResponse.json({ error: 'IndexNow not configured' }, { status: 503 });
  if (request.headers.get('x-indexnow-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { urls?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const urls = Array.isArray(body.urls) ? body.urls.filter((value): value is string => typeof value === 'string') : [];
  if (urls.length === 0 || urls.length > MAX_URLS_PER_REQUEST) {
    return NextResponse.json({ error: `urls must contain between 1 and ${MAX_URLS_PER_REQUEST} strings` }, { status: 400 });
  }
  const invalid = urls.filter((url) => !url.startsWith(`https://${HOST}/`));
  if (invalid.length) return NextResponse.json({ error: 'All URLs must be on www.tecbunny.com', invalid }, { status: 400 });

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList: urls }),
    });
    return NextResponse.json({ submitted: urls.length, engineStatus: response.status }, { status: response.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ error: 'IndexNow submission failed' }, { status: 502 });
  }
}
