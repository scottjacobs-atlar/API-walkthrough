type Props = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  children?: React.ReactNode;
};

const methodColors: Record<string, string> = {
  GET: 'method-get',
  POST: 'method-post',
  PATCH: 'method-patch',
  DELETE: 'method-delete',
};

export function ApiCall({ method, path, description, children }: Props) {
  return (
    <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <span className={`method-badge ${methodColors[method]} mt-0.5`}>
          {method}
        </span>
        <div className="min-w-0 flex-1">
          <code className="block break-all text-sm font-semibold text-[var(--color-text)]">
            {path}
          </code>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      {children && <div className="p-5">{children}</div>}
    </div>
  );
}
