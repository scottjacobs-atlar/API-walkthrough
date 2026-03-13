'use client';

import { useCallback, useMemo } from 'react';
import { useCredentials } from '@/lib/credentials';
import { RunableCode } from './RunableCode';
import { type CodeTab } from './CodeBlock';

type Props = {
  tabs: CodeTab[];
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

export function CreditTransferForm({ tabs }: Props) {
  const { guideIds, saveGuideId, token } = useCredentials();

  const fetchApprovalStepId = useCallback(async (paymentId: string) => {
    if (!token) return;
    try {
      const resp = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-atlar-bearer-token': token.accessToken,
        },
        body: JSON.stringify({
          method: 'GET',
          path: `/payments/v2/credit-transfers/${paymentId}`,
        }),
      });
      const data = await resp.json();
      if (data.status >= 200 && data.status < 300 && data.body) {
        const ct = data.body as Record<string, unknown>;
        const steps = ct.approvalSteps as { id: string; status: string }[] | undefined;
        const pendingStep = steps?.find((s) => s.status === 'PENDING');
        if (pendingStep?.id) {
          saveGuideId('approvalStepId', pendingStep.id);
        }
      }
    } catch { /* best-effort */ }
  }, [token, saveGuideId]);

  const handleResult = useCallback((r: { status: number; body: unknown }) => {
    if (r.status >= 200 && r.status < 300 && r.body && typeof r.body === 'object') {
      const body = r.body as Record<string, unknown>;
      if (typeof body.id === 'string') {
        saveGuideId('paymentId', body.id);
        const amt = body.amount as { stringValue?: string; currency?: string } | undefined;
        const label = amt ? `${amt.currency} ${amt.stringValue}` : 'Credit transfer';
        saveGuideId('paymentLabel', label);

        const steps = body.approvalSteps as { id: string; status: string }[] | undefined;
        const pendingStep = steps?.find((s) => s.status === 'PENDING');
        if (pendingStep?.id) {
          saveGuideId('approvalStepId', pendingStep.id);
        } else {
          fetchApprovalStepId(body.id);
        }
      }
    }
  }, [saveGuideId, fetchApprovalStepId]);

  const externalParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (guideIds.sourceAccountId) params.sourceAccountId = guideIds.sourceAccountId;
    if (guideIds.externalAccountId) params.externalAccountId = guideIds.externalAccountId;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [guideIds.sourceAccountId, guideIds.externalAccountId]);

  const hasLinkedIds = guideIds.sourceAccountId || guideIds.externalAccountId;

  return (
    <div className="space-y-3">
      {hasLinkedIds && (
        <div className="space-y-2">
          <IdHint
            label={guideIds.sourceAccountLabel}
            id={guideIds.sourceAccountId}
            step="Step 4: Accounts"
          />
          <IdHint
            label={guideIds.externalAccountLabel}
            id={guideIds.externalAccountId}
            step="Step 5: Counterparties"
          />
        </div>
      )}
      <RunableCode
        tabs={tabs}
        authMode="bearer"
        apiCall={{
          method: 'POST',
          path: '/payments/v2/credit-transfers',
          body: {
            amount: {
              currency: '{{currency}}',
              value: '{{amount}}',
            },
            date: '{{today}}',
            scheme: '{{scheme}}',
            source: {
              type: 'ACCOUNT',
              id: '{{sourceAccountId}}',
            },
            destination: {
              type: 'EXTERNAL_ACCOUNT',
              id: '{{externalAccountId}}',
            },
            reference: '{{reference}}',
          },
        }}
        externalParams={externalParams}
        parameters={[
          {
            key: 'sourceAccountId',
            label: 'Source Account ID',
            placeholder: guideIds.sourceAccountId
              ? undefined
              : 'Paste an account ID or complete Step 4 first',
            helpUrl: 'https://app.atlar.com/accounts',
            helpLabel: 'Find in Dashboard',
          },
          {
            key: 'externalAccountId',
            label: 'Destination External Account ID',
            placeholder: guideIds.externalAccountId
              ? undefined
              : 'Paste an external account ID or complete Step 5 first',
            helpUrl: 'https://app.atlar.com/counterparties',
            helpLabel: 'Find in Dashboard',
          },
          {
            key: 'amount',
            label: 'Amount (minor units)',
            defaultValue: '2500',
            type: 'number',
            half: true,
          },
          {
            key: 'currency',
            label: 'Currency',
            defaultValue: 'EUR',
            type: 'select',
            options: [
              { value: 'EUR', label: 'EUR' },
              { value: 'SEK', label: 'SEK' },
              { value: 'DKK', label: 'DKK' },
              { value: 'GBP', label: 'GBP' },
              { value: 'USD', label: 'USD' },
            ],
            half: true,
          },
          {
            key: 'scheme',
            label: 'Scheme',
            defaultValue: 'SCT',
            type: 'select',
            options: [
              { value: 'SCT', label: 'SCT — SEPA Credit Transfer' },
              { value: 'SCT_INST', label: 'SCT_INST — SEPA Instant' },
              { value: 'CROSS_BORDER', label: 'CROSS_BORDER' },
              { value: 'DOMESTIC', label: 'DOMESTIC' },
            ],
            half: true,
          },
          {
            key: 'reference',
            label: 'Reference',
            defaultValue: 'payout-12345',
            half: true,
          },
        ]}
        onResult={handleResult}
        successMessage="Credit transfer created."
        successLink={{
          urlTemplate: 'https://app.atlar.com/credit-transfers/{{response.id}}/details',
          label: 'View in Dashboard',
        }}
      />
    </div>
  );
}
