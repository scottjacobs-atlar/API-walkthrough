import { NextRequest, NextResponse } from 'next/server';

const ATLAR_BASE = 'https://api.atlar.com';
const ALLOWED_PREFIXES = ['/v1/', '/financial-data/', '/iam/', '/payments/'];

export async function POST(req: NextRequest) {
  try {
    const { method, path, headers, body } = await req.json();

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    if (!ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
      return NextResponse.json({ error: 'Path not allowed' }, { status: 400 });
    }

    const accessKey = req.headers.get('x-atlar-access-key');
    const secret = req.headers.get('x-atlar-secret');

    if (!accessKey || !secret) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 401 },
      );
    }

    const basicAuth = Buffer.from(`${accessKey}:${secret}`).toString('base64');

    const outboundHeaders: Record<string, string> = {
      Authorization: `Basic ${basicAuth}`,
      Accept: 'application/json',
    };

    if (headers && typeof headers === 'object') {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === 'string') outboundHeaders[k] = v;
      }
    }

    const httpMethod = (method ?? 'GET').toUpperCase();
    const url = `${ATLAR_BASE}${path}`;

    const fetchOpts: RequestInit = {
      method: httpMethod,
      headers: outboundHeaders,
    };

    if (body && httpMethod !== 'GET' && httpMethod !== 'HEAD') {
      fetchOpts.body = JSON.stringify(body);
      outboundHeaders['Content-Type'] = 'application/json';
    }

    const upstream = await fetch(url, fetchOpts);
    const contentType = upstream.headers.get('content-type') ?? '';
    const responseBody = contentType.includes('json')
      ? await upstream.json()
      : await upstream.text();

    return NextResponse.json(
      { status: upstream.status, body: responseBody },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
