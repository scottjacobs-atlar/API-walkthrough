'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { steps } from '@/lib/steps';
import { useTheme } from './ThemeProvider';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const currentSlug =
    pathname === '/' ? 'welcome' : pathname.replace('/steps/', '');
  const current = steps.find((s) => s.slug === currentSlug);

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-atlar-600 text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold">Atlar API Guide</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            aria-label="Menu"
          >
            {open ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Current step breadcrumb */}
      {current && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-xs text-[var(--color-text-tertiary)]">
          Step {current.number} — {current.title}
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 top-[57px] z-50 overflow-y-auto bg-[var(--color-bg)] p-4">
          <ul className="space-y-1">
            {steps.map((step) => {
              const href = step.slug === 'welcome' ? '/' : `/steps/${step.slug}`;
              const isActive = currentSlug === step.slug;
              return (
                <li key={step.slug}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                      isActive
                        ? 'bg-atlar-600 font-medium text-white'
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      {step.number}
                    </span>
                    {step.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
