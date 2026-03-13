'use client';

import { useCallback, useMemo, useState } from 'react';
import { useCredentials } from '@/lib/credentials';
import { RunableCode } from './RunableCode';
import { type CodeTab } from './CodeBlock';

type Props = {
  listTabs: CodeTab[];
};

type Transaction = {
  id: string;
  date: string;
  amount: { currency: string; stringValue: string; value: number };
  remittanceInformation?: { value?: string };
  reconciliation?: { status?: string };
  counterparty?: { name?: string };
  raw: unknown;
};

function IdHint({ label, id, step }: { label?: string; id?: string; step: string }) {
  if (!id) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-atlar-200 bg-atlar-50 px-3 py-2 text-xs dark:border-atlar-800 dark:bg-atlar-950/20">
      <svg className="h-3.5 w-3.5 shrink-0 text-atlar-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
      </svg>
      <span className="text-atlar-700 dark:text-atlar-300">
        {'ID from '}
        <span className="font-medium">{step}</span>
        {': '}
        <code className="rounded bg-atlar-100 px-1 py-0.5 font-mono text-[11px] dark:bg-atlar-900/40">{id}</code>
        {label && (
          <span className="ml-1 text-atlar-600 dark:text-atlar-400">({label})</span>
        )}
      </span>
    </div>
  );
}

const reconColors: Record<string, string> = {
  NOT_RECONCILED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  RECONCILED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PARTIALLY_RECONCILED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function TransactionForm({ listTabs }: Props) {
  const { guideIds } = useCredentials();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showRaw, setShowRaw] = useState(false);
  const [rawBody, setRawBody] = useState<unknown>(null);
  const [rawStatus, setRawStatus] = useState(0);

  const externalParams = useMemo(() => {
    if (guideIds.sourceAccountId) return { accountId: guideIds.sourceAccountId };
    return undefined;
  }, [guideIds.sourceAccountId]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResult = useCallback((r: { status: number; body: unknown }) => {
    setRawBody(r.body);
    setRawStatus(r.status);
    setExpandedRows(new Set());
    if (r.status >= 200 && r.status < 300 && r.body && typeof r.body === 'object') {
      const body = r.body as { items?: unknown[] };
      if (Array.isArray(body.items)) {
        setTransactions(
          body.items.map((item: unknown) => {
            const t = item as Record<string, unknown>;
            return {
              id: t.id as string,
              date: (t.date as string) ?? '',
              amount: t.amount as Transaction['amount'],
              remittanceInformation: t.remittanceInformation as Transaction['remittanceInformation'],
              reconciliation: t.reconciliation as Transaction['reconciliation'],
              counterparty: t.counterparty as Transaction['counterparty'],
              raw: item,
            };
          }),
        );
      }
    }
  }, []);

  const renderResult = useCallback(
    (result: { status: number; body: unknown }) => {
      const isOk = result.status >= 200 && result.status < 300;

      if (!isOk || transactions.length === 0) {
        return (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Response</span>
              <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                {result.status}
              </span>
            </div>
            <pre className="max-h-[400px] overflow-auto p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              <code>{typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}</code>
            </pre>
          </div>
        );
      }

      const totalItems = (rawBody as { items?: unknown[] })?.items?.length ?? 0;
      const nextToken = (rawBody as { nextToken?: string })?.nextToken;

      return (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {totalItems} transaction{totalItems !== 1 ? 's' : ''} returned
              {nextToken ? ' (more available)' : ''}
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {rawStatus}
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--color-bg-tertiary)] text-xs font-medium text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="w-8 px-3 py-2" />
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2 hidden sm:table-cell">Description</th>
                  <th className="px-3 py-2 hidden md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {transactions.map((txn) => {
                  const isExpanded = expandedRows.has(txn.id);
                  const amtColor = txn.amount.value < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400';
                  const reconStatus = txn.reconciliation?.status ?? 'UNKNOWN';
                  const reconClass = reconColors[reconStatus] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
                  const desc = txn.remittanceInformation?.value ?? txn.counterparty?.name ?? '—';

                  return (
                    <tr key={txn.id} className="group">
                      <td colSpan={5} className="p-0">
                        <button
                          onClick={() => toggleRow(txn.id)}
                          className="flex w-full items-center text-left transition-colors hover:bg-[var(--color-bg-tertiary)]"
                        >
                          <span className="flex w-8 shrink-0 items-center justify-center px-3 py-2.5 text-[var(--color-text-tertiary)]">
                            <ChevronIcon open={isExpanded} />
                          </span>
                          <span className="px-3 py-2.5 text-[var(--color-text-secondary)]">{txn.date}</span>
                          <span className={`px-3 py-2.5 font-mono text-xs font-semibold ${amtColor}`}>
                            {txn.amount.stringValue} {txn.amount.currency}
                          </span>
                          <span className="hidden px-3 py-2.5 truncate text-[var(--color-text-secondary)] sm:block max-w-[200px]">
                            {desc}
                          </span>
                          <span className="hidden px-3 py-2.5 md:block">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${reconClass}`}>
                              {reconStatus}
                            </span>
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                            <pre className="max-h-[300px] overflow-auto p-4 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                              <code>{JSON.stringify(txn.raw, null, 2)}</code>
                            </pre>
                          </div>
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
              <ChevronIcon open={showRaw} />
              {showRaw ? 'Hide' : 'Show'} full raw response
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
    [transactions, expandedRows, showRaw, rawBody, rawStatus],
  );

  return (
    <div className="space-y-3">
      {guideIds.sourceAccountId && (
        <IdHint
          label={guideIds.sourceAccountLabel}
          id={guideIds.sourceAccountId}
          step="Step 4: Accounts"
        />
      )}
      <RunableCode
        tabs={listTabs}
        authMode="bearer"
        apiCall={{
          method: 'GET',
          path: '/financial-data/v2/transactions?accountId={{accountId}}&limit={{limit}}&reconciliationStatus={{reconciliationStatus}}',
        }}
        externalParams={externalParams}
        onResult={handleResult}
        renderResult={renderResult}
        parameters={[
          {
            key: 'accountId',
            label: 'Account ID',
            placeholder: guideIds.sourceAccountId
              ? undefined
              : 'Paste an account ID or select one in Step 4',
            helpUrl: 'https://app.atlar.com/accounts',
            helpLabel: 'Find in Dashboard',
          },
          {
            key: 'limit',
            label: 'Limit',
            defaultValue: '20',
            type: 'number',
            half: true,
          },
          {
            key: 'reconciliationStatus',
            label: 'Reconciliation Status',
            defaultValue: '',
            type: 'select',
            options: [
              { value: '', label: 'All' },
              { value: 'NOT_RECONCILED', label: 'NOT_RECONCILED' },
              { value: 'RECONCILED', label: 'RECONCILED' },
              { value: 'PARTIALLY_RECONCILED', label: 'PARTIALLY_RECONCILED' },
            ],
            half: true,
            required: false,
          },
        ]}
        successLink={{
          urlTemplate: 'https://app.atlar.com/accounts/{{accountId}}/details/transactions',
          label: 'View in Dashboard',
        }}
      />
    </div>
  );
}
