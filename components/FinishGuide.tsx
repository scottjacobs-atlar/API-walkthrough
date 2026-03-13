'use client';

import { useState } from 'react';
import { useCredentials } from '@/lib/credentials';

export function FinishGuide() {
  const { isSet, clear, clearGuideIds } = useCredentials();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  function handleFinish() {
    clear();
    clearGuideIds();
    setConfirming(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-6 text-center dark:bg-emerald-950/20">
        <svg className="mx-auto mb-3 h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          All session data has been cleared.
        </p>
        <p className="mt-1 text-xs text-emerald-600/70 dark:text-emerald-400/60">
          Credentials, tokens, and saved IDs have been removed from this browser tab.
        </p>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="rounded-xl border border-amber-400/50 bg-amber-50 p-6 dark:border-amber-700/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Are you sure you want to finish?
            </p>
            <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/70">
              This will permanently clear all data stored during this guide from your browser session:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700/80 dark:text-amber-400/70">
              <li className="flex items-center gap-1.5">
                <span className="text-amber-500">-</span> API credentials (access key &amp; secret)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-500">-</span> OAuth access token
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-500">-</span> All saved IDs (account, counterparty, payment, approval step)
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleFinish}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Yes, clear everything
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-2 text-lg font-semibold">Finished with the guide?</h3>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        {isSet
          ? 'Clear your sandbox credentials and all saved session data from this browser tab for security.'
          : 'No credentials are currently connected, but you may still have saved IDs from previous steps.'}
      </p>
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Disconnect &amp; finish tutorial
      </button>
    </div>
  );
}
