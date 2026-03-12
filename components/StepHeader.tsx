import type { Step } from '@/lib/steps';

type Props = {
  step: Step;
};

export function StepHeader({ step }: Props) {
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-atlar-100 text-sm font-bold text-atlar-700 dark:bg-atlar-950 dark:text-atlar-300">
          {step.number}
        </span>
        <span className="text-sm font-medium text-[var(--color-text-tertiary)]">
          Step {step.number} of 10
        </span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
        {step.title}
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
        {step.description}
      </p>
    </div>
  );
}
