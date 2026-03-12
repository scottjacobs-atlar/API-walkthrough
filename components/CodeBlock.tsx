'use client';

import { useState } from 'react';

export type CodeTab = {
  label: string;
  lang: string;
  code: string;
  highlightedHtml: string;
};

type Props = {
  tabs: CodeTab[];
  filename?: string;
};

export function CodeBlock({ tabs, filename }: Props) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(tabs[active].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-1">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActive(i)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                i === active
                  ? 'border-b-2 border-atlar-500 text-[var(--color-text)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-2">
          {filename && (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              {filename}
            </span>
          )}
          <button
            onClick={copy}
            className="rounded-md px-2.5 py-1.5 text-[10px] font-medium text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-text-secondary)]"
            aria-label="Copy code"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <div
        className="overflow-x-auto p-4 text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: tabs[active].highlightedHtml }}
      />
    </div>
  );
}
