'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { steps } from '@/lib/steps';
import { useTheme } from './ThemeProvider';
import { useCredentials } from '@/lib/credentials';

function TokenTimer() {
  const { token, refreshToken } = useCredentials();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!token) { setRemaining(null); return; }

    function tick() {
      setRemaining(Math.max(0, Math.floor((token!.expiresAt - Date.now()) / 1000)));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [token]);

  if (!token || remaining === null) return null;

  const expired = remaining <= 0;
  const isLow = !expired && remaining < 60;
  const isValid = !expired && !isLow;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  async function handleRefresh() {
    setRefreshing(true);
    try { await refreshToken(); } finally { setRefreshing(false); }
  }

  const containerColor = expired
    ? 'border border-red-400/40 bg-red-50 dark:bg-red-950/20'
    : isLow
      ? 'border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20'
      : 'border border-emerald-400/30 bg-emerald-50/50 dark:bg-emerald-950/10';

  const timeColor = expired
    ? 'text-red-700 dark:text-red-400'
    : isLow
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-emerald-700 dark:text-emerald-400';

  const labelColor = expired
    ? 'text-red-600 dark:text-red-400/80'
    : isLow
      ? 'text-amber-600 dark:text-amber-400/80'
      : 'text-emerald-600 dark:text-emerald-400/80';

  return (
    <div className={`mt-1 rounded-lg px-3 py-1.5 text-xs ${containerColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {!expired && (
            <span className={`font-mono font-semibold tabular-nums ${timeColor}`}>
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          )}
          <span className={labelColor}>
            {expired ? 'Token expired' : isLow ? 'expiring soon' : 'token valid'}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh token"
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-atlar-600 transition-colors hover:bg-atlar-50 dark:text-atlar-400 dark:hover:bg-atlar-900/30 disabled:opacity-40"
        >
          <svg className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="sr-only">Refresh</span>
        </button>
      </div>
      {expired && (
        <p className={`mt-0.5 text-[10px] leading-snug ${labelColor}`}>
          Refresh to continue making API calls
        </p>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { isSet } = useCredentials();

  const currentSlug =
    pathname === '/'
      ? 'welcome'
      : pathname.replace('/steps/', '');

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] max-lg:hidden">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-atlar-600 text-sm font-bold text-white">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Atlar API Guide</h1>
          <p className="text-xs text-[var(--color-text-tertiary)]">Interactive Tutorial</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {steps.map((step) => {
            const href = step.slug === 'welcome' ? '/' : `/steps/${step.slug}`;
            const isActive = currentSlug === step.slug;

            return (
              <li key={step.slug}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-atlar-600 text-white font-medium'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className="truncate">{step.shortTitle}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <Link
          href="/steps/roles-and-access"
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg-tertiary)] ${
            isSet
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-[var(--color-text-tertiary)]'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isSet ? 'bg-emerald-500' : 'bg-[var(--color-text-tertiary)] opacity-40'}`} />
          <span>{isSet ? 'Sandbox connected' : 'No credentials'}</span>
        </Link>
        {isSet && <TokenTimer />}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
          aria-label="Toggle theme"
        >
          <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
        <a
          href="https://docs.atlar.com/reference/post_payments-v2-credit-transfers-1"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
        >
          <span className="text-base">📖</span>
          <span>API Reference</span>
          <svg className="ml-auto h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
