'use client';

import { useState } from 'react';
import { useCredentials } from '@/lib/credentials';

export function CredentialManager() {
  const { credentials, isSet, save, clear } = useCredentials();
  const [accessKey, setAccessKey] = useState('');
  const [secret, setSecret] = useState('');
  const [open, setOpen] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessKey.trim() || !secret.trim()) return;
    save(accessKey.trim(), secret.trim());
    setAccessKey('');
    setSecret('');
    setOpen(false);
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
            onChange={(e) => setAccessKey(e.target.value)}
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
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Your API secret"
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-atlar-500 focus:outline-none focus:ring-1 focus:ring-atlar-500"
          />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="rounded-lg bg-atlar-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-atlar-700 disabled:opacity-40"
            disabled={!accessKey.trim() || !secret.trim()}
          >
            Connect
          </button>
          <p className="text-[10px] leading-tight text-[var(--color-text-tertiary)]">
            Only use <strong>sandbox</strong> credentials here.
            <br />
            Never enter production secrets.
          </p>
        </div>
      </form>
    </div>
  );
}
