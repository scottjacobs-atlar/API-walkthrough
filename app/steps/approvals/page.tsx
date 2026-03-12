import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';
import { InfoBox } from '@/components/InfoBox';
import { SecurityNote } from '@/components/SecurityNote';

export default async function ApprovalsPage() {
  const step = getStep('approvals')!;
  const { prev, next } = getAdjacentSteps('approvals');

  const approveCurl = `curl -X POST 'https://api.atlar.com/payments/v2beta/credit-transfers/PAYMENT_ID/approve' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json'`;

  const approvePython = `payment_id = "422a164c-4548-11ed-8d31-0a58a9feac02"

APPROVE_URL = f"https://api.atlar.com/payments/v2beta/credit-transfers/{payment_id}/approve"

resp = session.post(APPROVE_URL)

if resp.ok:
    print(f"Payment approved! Status: {resp.json()['status']}")
else:
    print(f"Error: {resp.status_code} — {resp.text}")`;

  const rejectCurl = `curl -X POST 'https://api.atlar.com/payments/v2beta/credit-transfers/PAYMENT_ID/reject' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json'`;

  const rejectPython = `REJECT_URL = f"https://api.atlar.com/payments/v2beta/credit-transfers/{payment_id}/reject"

resp = session.post(REJECT_URL)
print(f"Payment rejected. Status: {resp.json()['status']}")`;

  const approveTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: approveCurl, highlightedHtml: await highlight(approveCurl, 'bash') },
    { label: 'Python', lang: 'python', code: approvePython, highlightedHtml: await highlight(approvePython, 'python') },
  ];
  const rejectTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: rejectCurl, highlightedHtml: await highlight(rejectCurl, 'bash') },
    { label: 'Python', lang: 'python', code: rejectPython, highlightedHtml: await highlight(rejectPython, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">How approvals work</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Atlar takes a <strong>security-first</strong> approach to payments. When a
          credit transfer or direct debit is created:
        </p>
        <ul className="mb-6 space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-atlar-500">1.</span>
            If no approval chains are configured, the <strong>organization owner</strong> must approve the payment.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-atlar-500">2.</span>
            If approval chains exist but the payment does not match any chain&apos;s conditions, the owner must also approve.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-atlar-500">3.</span>
            Approval chains can be configured for <strong>auto-approval</strong> (straight-through processing) for certain conditions.
          </li>
        </ul>

        <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Payment lifecycle</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              { status: 'CREATED', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
              { status: 'APPROVED', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
              { status: 'SENT_TO_BANK', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
              { status: 'RECONCILED', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
            ].map((s, i) => (
              <div key={s.status} className="flex items-center gap-2">
                {i > 0 && <span className="text-[var(--color-text-tertiary)]">→</span>}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            Rejected payments get status REJECTED. Returned payments get status RETURNED.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Approve a payment via API</h2>

        <ApiCall
          method="POST"
          path="/payments/v2beta/credit-transfers/{id}/approve"
          description="Approve a pending credit transfer. The approving user must have the required role on the approval step."
        >
          <CodeBlock tabs={approveTabs} />
        </ApiCall>

        <DashboardCallout
          path="/approvals/credit-transfers"
          title="Dashboard: Approvals"
          description="The Approvals page shows all payments pending your approval. Click 'Approve' or 'Reject' directly from the list or detail view."
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Reject a payment</h2>

        <ApiCall
          method="POST"
          path="/payments/v2beta/credit-transfers/{id}/reject"
          description="Reject a pending credit transfer."
        >
          <CodeBlock tabs={rejectTabs} />
        </ApiCall>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Configuring approval chains</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Approval chains let you define rules for when payments need approval and who
          can approve them. Common patterns:
        </p>
        <ul className="mb-6 space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500">●</span>
            <strong>Auto-approve</strong> payments below a certain amount threshold
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">●</span>
            Require <strong>dual approval</strong> for payments above EUR 10,000
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">●</span>
            Require specific <strong>role-based approval</strong> for certain currencies or accounts
          </li>
        </ul>

        <DashboardCallout
          path="/approval-chains"
          title="Dashboard: Approval Chains"
          description="Configure approval chains under Settings > Approval Chains. Define conditions (amount, currency, account) and approval steps."
        />
      </section>

      <SecurityNote title="Default: manual approval required">
        <p>
          Auto-approval is an opt-in feature. Atlar defaults to requiring manual
          approval by the organization owner for every payment. This security-first
          approach ensures no funds leave without explicit authorization.
        </p>
      </SecurityNote>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
