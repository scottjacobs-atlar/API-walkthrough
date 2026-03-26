'use client';

import { useState } from 'react';
import { useCredentials } from '@/lib/credentials';

export function CredentialManager() {
  const { credentials, isSet, save, clear } = useCredentials();
  const [accessKey, setAccessKey] = useState('');
  const [secret, setSecret] = useState('');
  const [open, setOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const ak = accessKey.trim();
    const sec = secret.trim();
    if (!ak || !sec) return;

    setValidating(true);
    setError(null);

    try {
      const resp = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-atlar-access-key': ak,
          'x-atlar-secret': sec,
        },
        body: JSON.stringify({
          method: 'POST',
          path: '/iam/v2beta/oauth2/token',
          formBody: 'grant_type=client_credentials',
        }),
      });

      const data = await resp.json();

      if (data.status >= 200 && data.status < 300 && data.body?.access_token) {
        save(ak, sec);
        setAccessKey('');
        setSecret('');
        setOpen(false);
      } else {
        setError('Invalid credentials \u2014 check your Access Key and Secret and try again.');
      }
    } catch {
      setError('Could not reach the API \u2014 please try again.');
    } finally {
      setValidating(false);
    }
  }

  if (isSet && !open) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                API credentials connected
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
                Access key: {credentials!.accessKey.slice(0, 8)}…
                &nbsp;·&nbsp; Stored in this tab only (sessionStorage)
              </p>
            </div>
          </div>
          <button
            onClick={() => { clear(); setOpen(false); }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
      <h3 className="mb-1 text-sm font-semibold">Connect your sandbox credentials</h3>
      <p className="mb-4 text-xs text-[var(--color-text-tertiary)]">
        Credentials are stored in <strong>sessionStorage</strong> — they never leave your
        browser, are not persisted to disk, and are cleared when you close this tab.
      </p>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label htmlFor="cred-ak" className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
            Access Key
          </label>
          <input
            id="cred-ak"
            type="text"
            value={accessKey}
            onChange={(e) => { setAccessKey(e.target.value); setError(null); }}
            placeholder="e.g. ak_live_abc123…"
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-atlar-500 focus:outline-none focus:ring-1 focus:ring-atlar-500"
          />
        </div>
        <div>
          <label htmlFor="cred-secret" className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
            Secret
          </label>
          <input
            id="cred-secret"
            type="password"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setError(null); }}
            placeholder="Your API secret"
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-atlar-500 focus:outline-none focus:ring-1 focus:ring-atlar-500"
          />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-atlar-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-atlar-700 disabled:opacity-40"
            disabled={!accessKey.trim() || !secret.trim() || validating}
          >
            {validating ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </>
            ) : (
              'Connect'
            )}
          </button>
          <p className="text-[10px] leading-tight text-[var(--color-text-tertiary)]">
            Only use <strong>sandbox</strong> credentials here.
            <br />
            Never enter production secrets.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Connection failed</p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400/80">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
