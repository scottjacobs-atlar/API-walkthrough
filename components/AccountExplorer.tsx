'use client';

import { useCallback, useMemo, useState } from 'react';
import { type CodeTab } from './CodeBlock';
import { RunableCode } from './RunableCode';

type Account = {
  id: string;
  name: string;
  currency: string;
  identifiers?: { type: string; number: string }[];
};

type Props = {
  listTabs: CodeTab[];
  balanceTabs: CodeTab[];
};

export function AccountExplorer({ listTabs, balanceTabs }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [rawBody, setRawBody] = useState<unknown>(null);
  const [rawStatus, setRawStatus] = useState<number>(0);

  const handleListResult = useCallback((r: { status: number; body: unknown }) => {
    setRawBody(r.body);
    setRawStatus(r.status);
    if (r.status >= 200 && r.status < 300 && r.body && typeof r.body === 'object') {
      const body = r.body as { items?: unknown[] };
      if (Array.isArray(body.items)) {
        setAccounts(
          body.items.map((item: unknown) => {
            const a = item as Record<string, unknown>;
            const ids = a.identifiers as { type: string; number: string }[] | undefined;
            return {
              id: a.id as string,
              name: (a.name as string) ?? 'Unnamed',
              currency: (a.currency as string) ?? '—',
              identifiers: ids,
            };
          }),
        );
      }
    }
  }, []);

  const externalParams = useMemo(
    () => (selectedId ? { accountId: selectedId } : undefined),
    [selectedId],
  );

  const renderAccountList = useCallback(
    (result: { status: number; body: unknown }) => {
      const isOk = result.status >= 200 && result.status < 300;

      if (!isOk || accounts.length === 0) {
        return (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Response</span>
              <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                {result.status}
              </span>
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              <code>{typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}</code>
            </pre>
          </div>
        );
      }

      return (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} found
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {result.status}
            </span>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--color-bg-tertiary)] text-xs font-medium text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2 w-16">Currency</th>
                  <th className="px-4 py-2">IBAN</th>
                  <th className="px-4 py-2 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {accounts.map((acct) => {
                  const iban = acct.identifiers?.find((i) => i.type === 'IBAN')?.number ?? '—';
                  const isSelected = acct.id === selectedId;
                  return (
                    <tr
                      key={acct.id}
                      className={
                        isSelected
                          ? 'bg-atlar-50 dark:bg-atlar-950/20'
                          : 'hover:bg-[var(--color-bg-tertiary)] transition-colors'
                      }
                    >
                      <td className="px-4 py-2.5 font-medium text-[var(--color-text)]">{acct.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                          {acct.currency}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-secondary)]">{iban}</td>
                      <td className="px-4 py-2.5 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-atlar-600 dark:text-atlar-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Selected
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedId(acct.id)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-atlar-600 transition-colors hover:bg-atlar-50 dark:text-atlar-400 dark:hover:bg-atlar-900/30"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[var(--color-border)]">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
            >
              <svg
                className={`h-3 w-3 transition-transform ${showRaw ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {showRaw ? 'Hide' : 'Show'} raw response
            </button>
            {showRaw && (
              <pre className="max-h-[400px] overflow-auto border-t border-[var(--color-border)] p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                <code>{typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody, null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      );
    },
    [accounts, selectedId, showRaw, rawBody],
  );

  return (
    <div className="space-y-12">
      {/* List accounts */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">List your accounts</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          After connecting the Testbank, your sandbox organization will have several
          accounts. Use the accounts endpoint to list them and find the account IDs
          you will need for payments.
        </p>

        <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
            <span className="method-badge method-get mt-0.5">GET</span>
            <div className="min-w-0 flex-1">
              <code className="block break-all text-sm font-semibold text-[var(--color-text)]">
                /financial-data/v2/accounts
              </code>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                List all accounts in your organization. Returns IDs, currency, name, identifiers (IBAN/BBAN), and routing (BIC).
              </p>
            </div>
          </div>
          <div className="p-5">
            <RunableCode
              tabs={listTabs}
              authMode="bearer"
              apiCall={{
                method: 'GET',
                path: '/financial-data/v2/accounts?limit=10',
              }}
              onResult={handleListResult}
              renderResult={renderAccountList}
              successLink={{
                urlTemplate: 'https://app.atlar.com/accounts',
                label: 'View accounts in Dashboard',
              }}
            />
          </div>
        </div>
      </section>

      {/* Retrieve balances */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Retrieve balances</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          For any account, you can retrieve the most recent balance snapshot. The
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">mostRecent=true</code> parameter
          returns only the latest balance entry per type.
        </p>

        {accounts.length > 0 && !selectedId && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-atlar-200 bg-atlar-50 px-4 py-3 text-sm text-atlar-700 dark:border-atlar-800 dark:bg-atlar-950/20 dark:text-atlar-300">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Select an account from the list above to auto-fill the Account ID
          </div>
        )}

        <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
            <span className="method-badge method-get mt-0.5">GET</span>
            <div className="min-w-0 flex-1">
              <code className="block break-all text-sm font-semibold text-[var(--color-text)]">
                /financial-data/v2/accounts/&#123;id&#125;/balances
              </code>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Get balance snapshots for an account. Use mostRecent=true for the latest balance.
              </p>
            </div>
          </div>
          <div className="p-5">
            <RunableCode
              tabs={balanceTabs}
              authMode="bearer"
              apiCall={{
                method: 'GET',
                path: '/financial-data/v2/accounts/{{accountId}}/balances?mostRecent=true&limit=100',
              }}
              externalParams={externalParams}
              parameters={[
                {
                  key: 'accountId',
                  label: 'Account ID',
                  placeholder: 'Select an account above or paste an ID',
                  helpUrl: 'https://app.atlar.com/accounts',
                  helpLabel: 'Find your accounts',
                },
              ]}
              successLink={{
                urlTemplate: 'https://app.atlar.com/accounts/{{accountId}}/details/balances',
                label: 'View balances in Dashboard',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
