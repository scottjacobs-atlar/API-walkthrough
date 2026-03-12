import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';
import { InfoBox } from '@/components/InfoBox';

export default async function CreditTransfersPage() {
  const step = getStep('credit-transfers')!;
  const { prev, next } = getAdjacentSteps('credit-transfers');

  const sctCurl = `curl -X POST 'https://api.atlar.com/payments/v2/credit-transfers' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "amount": {
      "currency": "EUR",
      "value": 2500
    },
    "date": "2025-12-01",
    "scheme": "SCT",
    "source": {
      "type": "ACCOUNT",
      "id": "<source-account-id>"
    },
    "destination": {
      "type": "EXTERNAL_ACCOUNT",
      "id": "<external-account-id>"
    },
    "reference": "payout-12345"
  }'`;

  const sctPython = `CREDIT_TRANSFERS_URL = "https://api.atlar.com/payments/v2/credit-transfers"

payload = {
    "amount": {
        "currency": "EUR",
        "value": 2500,       # EUR 25.00
    },
    "date": "2025-12-01",    # YYYY-MM-DD
    "scheme": "SCT",          # SEPA Credit Transfer
    "source": {
        "type": "ACCOUNT",
        "id": source_account_id,
    },
    "destination": {
        "type": "EXTERNAL_ACCOUNT",
        "id": external_account_id,
    },
    "reference": "payout-12345",
}

resp = session.post(CREDIT_TRANSFERS_URL, json=payload)
payment = resp.json()

print(f"Payment ID: {payment['id']}")
print(f"Status: {payment['status']}")`;

  const sctResponse = `{
  "id": "422a164c-4548-11ed-8d31-0a58a9feac02",
  "status": "CREATED",
  "amount": {
    "currency": "EUR",
    "value": 2500,
    "stringValue": "25.00"
  },
  "date": "2025-12-01",
  "paymentScheme": { "type": "SCT", "displayName": "Sepa Credit Transfer" },
  "sourceAccount": {
    "id": "cf010f90-83e2-420d-b16e-eb68dbfd7047",
    "name": "My EUR Account",
    "bank": { "bic": "ATLRSESSXXX", "name": "Testbank" }
  },
  "approvalChain": {
    "approvalSteps": [
      {
        "id": "b698ab4e-...",
        "requiredRole": { "name": "Owner", "owner": true },
        "status": "PENDING"
      }
    ]
  },
  "etag": "version:1",
  ...
}`;

  const batchCurl = `curl -X POST 'https://api.atlar.com/payments/v2beta/credit-transfer-batches' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "treatment": "INDIVIDUAL_PAYMENTS",
    "payments": [
      {
        "amount": { "currency": "USD", "value": 3333 },
        "date": "2025-12-01",
        "scheme": "CROSS_BORDER",
        "source": {
          "type": "ACCOUNT",
          "id": "<source-account-id>"
        },
        "destination": {
          "type": "INLINE",
          "market": "US",
          "identifiers": [
            { "type": "Number", "number": "458003278449", "market": "US" }
          ],
          "routing": [
            { "type": "US_ABA", "number": "026009593" },
            { "type": "BIC", "number": "BOFAUS6S" }
          ],
          "holder": { "legalName": "Acme Inc." }
        },
        "reference": "invoice-789"
      }
    ],
    "skipValidationErrors": true
  }'`;

  const batchPython = `BATCH_URL = "https://api.atlar.com/payments/v2beta/credit-transfer-batches"

payload = {
    "treatment": "INDIVIDUAL_PAYMENTS",
    "payments": [
        {
            "amount": {"currency": "USD", "value": 3333},
            "date": "2025-12-01",
            "scheme": "CROSS_BORDER",
            "source": {"type": "ACCOUNT", "id": source_account_id},
            "destination": {
                "type": "INLINE",
                "market": "US",
                "identifiers": [
                    {"type": "Number", "number": "458003278449", "market": "US"}
                ],
                "routing": [
                    {"type": "US_ABA", "number": "026009593"},
                    {"type": "BIC", "number": "BOFAUS6S"},
                ],
                "holder": {"legalName": "Acme Inc."},
            },
            "reference": "invoice-789",
        }
    ],
    "skipValidationErrors": True,
}

resp = session.post(BATCH_URL, json=payload)
batch = resp.json()
print(f"Batch ID: {batch['id']}, Status: {batch['status']}")`;

  const sctTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: sctCurl, highlightedHtml: await highlight(sctCurl, 'bash') },
    { label: 'Python', lang: 'python', code: sctPython, highlightedHtml: await highlight(sctPython, 'python') },
  ];
  const sctRespTabs: CodeTab[] = [
    { label: 'Response', lang: 'json', code: sctResponse, highlightedHtml: await highlight(sctResponse, 'json') },
  ];
  const batchTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: batchCurl, highlightedHtml: await highlight(batchCurl, 'bash') },
    { label: 'Python', lang: 'python', code: batchPython, highlightedHtml: await highlight(batchPython, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">Creating a SEPA Credit Transfer</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          With a source account ID (from Step 4) and a destination external account
          ID (from Step 5), you can create your first payment. The example below
          creates a SEPA Credit Transfer (SCT) for EUR 25.00.
        </p>

        <ApiCall
          method="POST"
          path="/payments/v2/credit-transfers"
          description="Create a single credit transfer payment. Requires source account ID and destination external account ID."
        >
          <CodeBlock tabs={sctTabs} />
          <h4 className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text-tertiary)]">Example response</h4>
          <CodeBlock tabs={sctRespTabs} />
        </ApiCall>

        <DashboardCallout
          path="/credit-transfers"
          title="Dashboard: Credit Transfers"
          description="View all credit transfers, their statuses, and approval states. Click into any payment to see the full audit trail."
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Payment schemes</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          The <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">scheme</code> field
          determines the payment rail used:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Scheme</th>
                <th className="pb-3 pr-4 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Use case</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                ['SCT', 'SEPA Credit Transfer', 'EUR payments within SEPA zone'],
                ['SCT_INST', 'SEPA Instant', 'Real-time EUR payments'],
                ['CROSS_BORDER', 'Cross-border', 'International / multi-currency payments'],
                ['DOMESTIC', 'Domestic', 'Local payment schemes (Faster Payments, BGC, etc.)'],
              ].map(([scheme, name, use]) => (
                <tr key={scheme} className="border-b border-[var(--color-border-light)]">
                  <td className="py-2.5 pr-4"><code className="text-xs font-semibold">{scheme}</code></td>
                  <td className="py-2.5 pr-4">{name}</td>
                  <td className="py-2.5">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Batch payments</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          For multiple payments at once, use the batch endpoint. You can include
          <strong> inline destinations</strong> (no pre-existing counterparty needed)
          with full routing details. The example below creates a cross-border USD payment:
        </p>

        <ApiCall
          method="POST"
          path="/payments/v2beta/credit-transfer-batches"
          description="Create a batch of credit transfers. Supports inline destinations with full routing details."
        >
          <CodeBlock tabs={batchTabs} />
        </ApiCall>

        <InfoBox variant="info" title="Inline destinations">
          <p>
            Inline destinations let you specify account identifiers, routing, and
            holder name directly in the payment request &mdash; without creating a
            counterparty first. This is useful for one-off or batch payments.
          </p>
        </InfoBox>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">What happens next?</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          After creation, the payment has status <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">CREATED</code>.
          It must be <strong>approved</strong> before Atlar sends it to the bank. By
          default (security-first), the organization owner must approve every payment.
          See the next step to learn about approvals.
        </p>
      </section>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
