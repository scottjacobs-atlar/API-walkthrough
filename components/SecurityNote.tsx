type Props = {
  title?: string;
  children: React.ReactNode;
};

export function SecurityNote({ title = 'Security Note', children }: Props) {
  return (
    <div className="my-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-lg dark:bg-amber-900/50">
        🛡️
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {title}
        </h4>
        <div className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80 [&_code]:rounded [&_code]:bg-amber-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:dark:bg-amber-900/50">
          {children}
        </div>
      </div>
    </div>
  );
}
