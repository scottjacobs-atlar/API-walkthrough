'use client';

import { useState } from 'react';
import { useCredentials } from '@/lib/credentials';
import { CodeBlock, type CodeTab } from './CodeBlock';

export type ApiCall = {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
};

export type ParamField = {
  key: string;
  label: string;
  placeholder: string;
};

type Props = {
  tabs: CodeTab[];
  filename?: string;
  apiCall: ApiCall;
  parameters?: ParamField[];
};

export function RunableCode({ tabs, filename, apiCall, parameters = [] }: Props) {
  const { credentials, isSet } = useCredentials();
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ status: number; body: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setParam(key: string, value: string) {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }

  function substituteParams(obj: unknown): unknown {
    if (typeof obj === 'string') {
      let out = obj;
      for (const [k, v] of Object.entries(paramValues)) {
        out = out.replace(`{{${k}}}`, v);
      }
      return out;
    }
    if (Array.isArray(obj)) return obj.map(substituteParams);
    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        result[k] = substituteParams(v);
      }
      return result;
    }
    return obj;
  }

  const missingParams = parameters.filter((p) => !paramValues[p.key]?.trim());

  async function run() {
    if (!credentials || missingParams.length > 0) return;
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const body = apiCall.body ? substituteParams(apiCall.body) : undefined;

      const resp = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-atlar-access-key': credentials.accessKey,
          'x-atlar-secret': credentials.secret,
        },
        body: JSON.stringify({
          method: apiCall.method,
          path: apiCall.path,
          headers: apiCall.headers,
          body,
        }),
      });

      const data = await resp.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult({ status: data.status, body: data.body });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setRunning(false);
    }
  }

  const statusColor =
    result && result.status >= 200 && result.status < 300
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-3">
      {/* Parameter inputs */}
      {parameters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {parameters.map((p) => (
            <div key={p.key} className="flex-1" style={{ minWidth: 200 }}>
              <label
                htmlFor={`param-${p.key}`}
                className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
              >
                {p.label}
              </label>
              <input
                id={`param-${p.key}`}
                type="text"
                value={paramValues[p.key] ?? ''}
                onChange={(e) => setParam(p.key, e.target.value)}
                placeholder={p.placeholder}
                autoComplete="off"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-atlar-500 focus:outline-none focus:ring-1 focus:ring-atlar-500"
              />
            </div>
          ))}
        </div>
      )}

      <CodeBlock tabs={tabs} filename={filename} />

      {/* Run bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={!isSet || running || missingParams.length > 0}
          className="inline-flex items-center gap-2 rounded-lg bg-atlar-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-atlar-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              Run
            </>
          )}
        </button>

        {!isSet && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Connect your credentials above to run this example
          </span>
        )}
        {isSet && missingParams.length > 0 && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Fill in {missingParams.map((p) => p.label).join(', ')} to run
          </span>
        )}
      </div>

      {/* Response */}
      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400/80">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Response</span>
            <span className={`text-xs font-mono font-semibold ${statusColor}`}>
              {result.status}
            </span>
          </div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            <code>{typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
