import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const vrm = req.nextUrl.searchParams.get('vrm');
  if (!vrm) return NextResponse.json({ error: 'VRM is required' }, { status: 400 });

  const apiKey = process.env.CHECKCARDETAILS_API_KEY;
  const baseUrl = process.env.CHECKCARDETAILS_API_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'CHECKCARDETAILS not configured' }, { status: 500 });
  }

  const url = new URL(baseUrl);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('vrm', vrm.replace(/\s+/g, '').toUpperCase());

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: res.status });
  }

  const data = await res.json();
  console.log('[checkcardetails] response:', JSON.stringify(data, null, 2));
  return NextResponse.json(data);
}
