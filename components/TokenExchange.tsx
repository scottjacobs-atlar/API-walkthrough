'use client';

import { useState } from 'react';
import { useCredentials } from '@/lib/credentials';

export function TokenExchange() {
  const { credentials, isSet, token, saveToken } = useCredentials();
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<{ status: number; body: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!credentials) return;
    setRunning(true);
    setError(null);
    setResponse(null);

    try {
      const resp = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-atlar-access-key': credentials.accessKey,
          'x-atlar-secret': credentials.secret,
        },
        body: JSON.stringify({
          method: 'POST',
          path: '/iam/v2beta/oauth2/token',
          formBody: 'grant_type=client_credentials',
        }),
      });

      const data = await resp.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResponse({ status: data.status, body: data.body });
        if (data.status >= 200 && data.status < 300 && data.body?.access_token) {
          saveToken(data.body.access_token, data.body.expires_in ?? 300);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setRunning(false);
    }
  }

  const statusColor =
    response && response.status >= 200 && response.status < 300
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleRun}
          disabled={!isSet || running}
          className="inline-flex items-center gap-2 rounded-lg bg-atlar-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-atlar-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Requesting…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {token ? 'Refresh Token' : 'Get Token'}
            </>
          )}
        </button>

        {!isSet && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Connect your credentials on the{' '}
            <a href="/steps/roles-and-access" className="underline underline-offset-2">previous step</a> first
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400/80">{error}</p>
        </div>
      )}

      {response && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Response</span>
            <span className={`font-mono text-xs font-semibold ${statusColor}`}>
              {response.status}
            </span>
          </div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            <code>{typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
