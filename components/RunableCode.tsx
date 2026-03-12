'use client';

import { type ReactNode, useEffect, useState } from 'react';
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
  placeholder?: string;
  defaultValue?: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  half?: boolean;
  helpUrl?: string;
  helpLabel?: string;
};

type Props = {
  tabs: CodeTab[];
  filename?: string;
  apiCall: ApiCall;
  parameters?: ParamField[];
  authMode?: 'basic' | 'bearer';
  externalParams?: Record<string, string>;
  onResult?: (result: { status: number; body: unknown }) => void;
  renderResult?: (result: { status: number; body: unknown }) => ReactNode;
  successLink?: {
    urlTemplate: string;
    label: string;
  };
  successMessage?: string;
};

function getInitialValues(parameters: ParamField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of parameters) {
    if (p.defaultValue !== undefined) out[p.key] = p.defaultValue;
  }
  return out;
}

export function RunableCode({ tabs, filename, apiCall, parameters = [], authMode = 'basic', externalParams, onResult, renderResult, successLink, successMessage }: Props) {
  const { credentials, isSet, token } = useCredentials();
  const [paramValues, setParamValues] = useState<Record<string, string>>(
    () => getInitialValues(parameters),
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ status: number; body: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!externalParams) return;
    setParamValues((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(externalParams)) {
        if (v) next[k] = v;
      }
      return next;
    });
  }, [externalParams]);

  function setParam(key: string, value: string) {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }

  const paramTypeMap = Object.fromEntries(parameters.map((p) => [p.key, p.type ?? 'text']));

  function substituteParams(obj: unknown): unknown {
    if (typeof obj === 'string') {
      const allValues: Record<string, string> = {
        ...paramValues,
        today: new Date().toISOString().slice(0, 10),
      };

      const match = /^\{\{(\w+)\}\}$/.exec(obj);
      if (match) {
        const key = match[1];
        const replaced = allValues[key] ?? obj;
        if (paramTypeMap[key] === 'number') {
          const n = Number(replaced);
          if (!isNaN(n)) return n;
        }
        return replaced;
      }

      let out = obj;
      for (const [k, v] of Object.entries(allValues)) {
        out = out.replace(`{{${k}}}`, v);
      }
      return out;
    }
    if (typeof obj === 'number') return obj;
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

  const requiredParams = parameters.filter((p) => p.required !== false);
  const missingParams = requiredParams.filter((p) => !paramValues[p.key]?.trim());

  const useBearer = authMode === 'bearer';
  const canRun = useBearer
    ? !!(token && token.expiresAt > Date.now()) && missingParams.length === 0
    : isSet && missingParams.length === 0;

  async function run() {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const body = apiCall.body ? substituteParams(apiCall.body) : undefined;
      const resolvedPath = substituteParams(apiCall.path) as string;

      const proxyHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (useBearer) {
        proxyHeaders['x-atlar-bearer-token'] = token!.accessToken;
      } else {
        proxyHeaders['x-atlar-access-key'] = credentials!.accessKey;
        proxyHeaders['x-atlar-secret'] = credentials!.secret;
      }

      const resp = await fetch('/api/proxy', {
        method: 'POST',
        headers: proxyHeaders,
        body: JSON.stringify({
          method: apiCall.method,
          path: resolvedPath,
          headers: apiCall.headers,
          body,
        }),
      });

      const data = await resp.json();

      if (data.error) {
        setError(data.error);
      } else {
        const r = { status: data.status, body: data.body };
        setResult(r);
        onResult?.(r);
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

  const inputClass =
    'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-atlar-500 focus:outline-none focus:ring-1 focus:ring-atlar-500';

  return (
    <div className="space-y-3">
      {parameters.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
          <div className="grid grid-cols-2 gap-3">
            {parameters.map((p) => (
              <div
                key={p.key}
                className={p.half ? '' : 'col-span-2'}
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <label
                    htmlFor={`param-${p.key}`}
                    className="text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    {p.label}
                    {p.required === false && (
                      <span className="ml-1 font-normal text-[var(--color-text-tertiary)]">(optional)</span>
                    )}
                  </label>
                  {p.helpUrl && (
                    <a
                      href={p.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-atlar-600 hover:text-atlar-700 dark:text-atlar-400 dark:hover:text-atlar-300"
                    >
                      {p.helpLabel ?? 'Open in Dashboard'}
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {p.type === 'select' && p.options ? (
                  <select
                    id={`param-${p.key}`}
                    value={paramValues[p.key] ?? ''}
                    onChange={(e) => setParam(p.key, e.target.value)}
                    className={inputClass}
                  >
                    {p.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`param-${p.key}`}
                    type={p.type === 'number' ? 'number' : p.type === 'date' ? 'date' : 'text'}
                    value={paramValues[p.key] ?? ''}
                    onChange={(e) => setParam(p.key, e.target.value)}
                    placeholder={p.placeholder}
                    autoComplete="off"
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <CodeBlock tabs={tabs} filename={filename} />

      {/* Run bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={!canRun || running}
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
              Try it
            </>
          )}
        </button>

        {useBearer && (!token || token.expiresAt <= Date.now()) && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Get a token on the{' '}
            <a href="/steps/authentication" className="underline underline-offset-2">Authentication</a>{' '}
            step first
          </span>
        )}
        {!useBearer && !isSet && (
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Connect your credentials above to run this example
          </span>
        )}
        {canRun === false && missingParams.length > 0 && (useBearer ? !!token : isSet) && (
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
        <>
          {result.status >= 200 && result.status < 300 && successLink && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 dark:bg-emerald-950/20">
              <svg className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-emerald-800 dark:text-emerald-300">
                {successMessage ?? 'Success!'}{' '}
                <a
                  href={Object.entries(paramValues).reduce(
                    (url, [k, v]) => url.replace(`{{${k}}}`, encodeURIComponent(v)),
                    successLink.urlTemplate,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2"
                >
                  {successLink.label} &rarr;
                </a>
              </span>
            </div>
          )}
          {renderResult ? (
            renderResult(result)
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">Response</span>
                <span className={`font-mono text-xs font-semibold ${statusColor}`}>
                  {result.status}
                </span>
              </div>
              <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                <code>{typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}</code>
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
