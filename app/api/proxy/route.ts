import { NextRequest, NextResponse } from 'next/server';

const ATLAR_BASE = 'https://api.atlar.com';
const ALLOWED_PREFIXES = ['/v1/', '/financial-data/', '/iam/', '/payments/'];

export async function POST(req: NextRequest) {
  try {
    const { method, path, headers, body, formBody } = await req.json();

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    if (!ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
      return NextResponse.json({ error: 'Path not allowed' }, { status: 400 });
    }

    const bearerToken = req.headers.get('x-atlar-bearer-token');
    const accessKey = req.headers.get('x-atlar-access-key');
    const secret = req.headers.get('x-atlar-secret');

    let authorization: string;
    if (bearerToken) {
      authorization = `Bearer ${bearerToken}`;
    } else if (accessKey && secret) {
      authorization = `Basic ${Buffer.from(`${accessKey}:${secret}`).toString('base64')}`;
    } else {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 401 },
      );
    }

    const outboundHeaders: Record<string, string> = {
      Authorization: authorization,
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

    if (httpMethod !== 'GET' && httpMethod !== 'HEAD') {
      if (formBody && typeof formBody === 'string') {
        fetchOpts.body = formBody;
        outboundHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (body) {
        fetchOpts.body = JSON.stringify(body);
        outboundHeaders['Content-Type'] = 'application/json';
      }
    }

    const upstream = await fetch(url, fetchOpts);
    const rawText = await upstream.text();

    let responseBody: unknown;
    if (rawText) {
      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText;
      }
    } else {
      responseBody = upstream.status >= 200 && upstream.status < 300
        ? { message: `Success (${upstream.status})` }
        : null;
    }

    return NextResponse.json(
      { status: upstream.status, body: responseBody },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
