type Props = {
  path: string;
  title: string;
  description: string;
};

export function DashboardCallout({ path, title, description }: Props) {
  return (
    <div className="my-6 flex items-start gap-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg dark:bg-indigo-900/50">
        🖥️
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
          {title}
        </h4>
        <p className="mt-1 text-sm text-indigo-800/80 dark:text-indigo-300/80">
          {description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-mono font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            app.atlar.com{path}
          </span>
        </div>
      </div>
    </div>
  );
}
