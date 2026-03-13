'use client';

import { useMemo } from 'react';
import { useCredentials } from '@/lib/credentials';
import { RunableCode } from './RunableCode';
import { type CodeTab } from './CodeBlock';

type Props = {
  approveTabs: CodeTab[];
  rejectTabs: CodeTab[];
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

export function ApprovalForm({ approveTabs, rejectTabs }: Props) {
  const { guideIds } = useCredentials();

  const externalParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (guideIds.paymentId) params.paymentId = guideIds.paymentId;
    if (guideIds.approvalStepId) params.approvalStepId = guideIds.approvalStepId;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [guideIds.paymentId, guideIds.approvalStepId]);

  const paymentParam = {
    key: 'paymentId',
    label: 'Payment ID',
    placeholder: guideIds.paymentId
      ? undefined
      : 'Paste a payment ID or create one in Step 6 first',
    helpUrl: 'https://app.atlar.com/approvals/credit-transfers',
    helpLabel: 'View pending approvals',
  };

  const approvalStepParam = {
    key: 'approvalStepId',
    label: 'Approval Step ID',
    placeholder: guideIds.approvalStepId
      ? undefined
      : 'From the credit transfer response (auto-filled from Step 6)',
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-4 text-2xl font-bold">Approve a payment via API</h2>

        {(guideIds.paymentId || guideIds.approvalStepId) && (
          <div className="mb-4 space-y-2">
            <IdHint
              label={guideIds.paymentLabel}
              id={guideIds.paymentId}
              step="Step 6: Credit Transfers"
            />
            <IdHint
              label="Pending approval step"
              id={guideIds.approvalStepId}
              step="Step 6: Credit Transfers"
            />
          </div>
        )}

        <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
            <span className="method-badge method-post mt-0.5">POST</span>
            <div className="min-w-0 flex-1">
              <code className="block break-all text-sm font-semibold text-[var(--color-text)]">
                /payments/v2/credit-transfers/&#123;id&#125;:approve
              </code>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Approve a pending credit transfer. The approving user must have the required role on the approval step.
              </p>
            </div>
          </div>
          <div className="p-5">
            <RunableCode
              tabs={approveTabs}
              authMode="bearer"
              apiCall={{
                method: 'POST',
                path: '/payments/v2/credit-transfers/{{paymentId}}:approve',
                body: {
                  approvalStepId: '{{approvalStepId}}',
                },
              }}
              externalParams={externalParams}
              parameters={[paymentParam, approvalStepParam]}
              successMessage="Payment approved."
              successLink={{
                urlTemplate: 'https://app.atlar.com/credit-transfers/{{paymentId}}/details',
                label: 'View in Dashboard',
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Reject a payment</h2>

        <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
            <span className="method-badge method-post mt-0.5">POST</span>
            <div className="min-w-0 flex-1">
              <code className="block break-all text-sm font-semibold text-[var(--color-text)]">
                /payments/v2/credit-transfers/&#123;id&#125;:reject
              </code>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Reject a pending credit transfer.
              </p>
            </div>
          </div>
          <div className="p-5">
            <RunableCode
              tabs={rejectTabs}
              authMode="bearer"
              apiCall={{
                method: 'POST',
                path: '/payments/v2/credit-transfers/{{paymentId}}:reject',
                body: {
                  approvalStepId: '{{approvalStepId}}',
                },
              }}
              externalParams={externalParams}
              parameters={[{
                ...paymentParam,
                helpUrl: 'https://app.atlar.com/credit-transfers',
                helpLabel: 'Find in Dashboard',
              }, approvalStepParam]}
              successMessage="Payment rejected."
              successLink={{
                urlTemplate: 'https://app.atlar.com/credit-transfers/{{paymentId}}/details',
                label: 'View in Dashboard',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
