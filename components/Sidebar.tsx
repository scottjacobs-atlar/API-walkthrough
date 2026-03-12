'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { steps } from '@/lib/steps';
import { useTheme } from './ThemeProvider';

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

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
