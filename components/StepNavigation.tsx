import Link from 'next/link';
import type { Step } from '@/lib/steps';

type Props = {
  prev: Step | null;
  next: Step | null;
};

export function StepNavigation({ prev, next }: Props) {
  return (
    <div className="mt-16 flex items-stretch gap-4 border-t border-[var(--color-border)] pt-8">
      {prev ? (
        <Link
          href={prev.slug === 'welcome' ? '/' : `/steps/${prev.slug}`}
          className="group flex flex-1 flex-col rounded-xl border border-[var(--color-border)] p-5 transition-colors hover:border-atlar-400 hover:bg-atlar-50/50 dark:hover:bg-atlar-950/30"
        >
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
            ← Previous
          </span>
          <span className="mt-1 text-sm font-semibold text-[var(--color-text)] group-hover:text-atlar-600 dark:group-hover:text-atlar-400">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/steps/${next.slug}`}
          className="group flex flex-1 flex-col items-end rounded-xl border border-[var(--color-border)] p-5 text-right transition-colors hover:border-atlar-400 hover:bg-atlar-50/50 dark:hover:bg-atlar-950/30"
        >
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
            Next →
          </span>
          <span className="mt-1 text-sm font-semibold text-[var(--color-text)] group-hover:text-atlar-600 dark:group-hover:text-atlar-400">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
