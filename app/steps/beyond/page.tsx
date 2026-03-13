import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';
import { FinishGuide } from '@/components/FinishGuide';
import { InfoBox } from '@/components/InfoBox';

export default async function BeyondPage() {
  const step = getStep('beyond')!;
  const { prev, next } = getAdjacentSteps('beyond');

  const mandateCurl = `curl -X POST 'https://api.atlar.com/payments/v2/mandates' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "type": "CORE",
    "externalAccountId": "<external-account-id>",
    "signatureDate": "2025-12-01",
    "reference": "MANDATE-001"
  }'`;

  const directDebitCurl = `curl -X POST 'https://api.atlar.com/payments/v2/direct-debits' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "amount": {
      "currency": "EUR",
      "value": 5000
    },
    "date": "2025-12-15",
    "scheme": "SDD_CORE",
    "source": {
      "type": "ACCOUNT",
      "id": "<your-account-id>"
    },
    "mandateId": "<mandate-id>",
    "reference": "collection-001"
  }'`;

  const idempotencyCurl = `# Use Idempotency-Key to safely retry requests
curl -X POST 'https://api.atlar.com/payments/v2/credit-transfers' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -H 'Idempotency-Key: my-unique-key-12345' \\
  -d '{ ... }'

# Retrying with the same key returns the original response
# (no duplicate payment created)`;

  const etagCurl = `# 1. Get the resource and note its etag
curl 'https://api.atlar.com/payments/v2/counterparties/COUNTERPARTY_ID' \\
  -H 'Authorization: Bearer ACCESS_TOKEN'

# Response includes: "etag": "version:3"

# 2. Update using If-Match header
curl -X PATCH 'https://api.atlar.com/payments/v2/counterparties/COUNTERPARTY_ID' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -H 'If-Match: version:3' \\
  -d '[
    { "op": "replace", "path": "/alias", "value": "Updated Alias" }
  ]'`;

  const externalIdCurl = `# Create a counterparty with an externalId
curl -X POST 'https://api.atlar.com/payments/v2/counterparties' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "legalName": "Acme Corp",
    "partyType": "ORGANIZATION",
    "externalId": "acme-corp-123",
    "accounts": [...]
  }'

# Later, look it up by external ID
curl 'https://api.atlar.com/payments/v2/counterparties/external:acme-corp-123' \\
  -H 'Authorization: Bearer ACCESS_TOKEN'`;

  const paginationPython = `def paginate_all(session, url, params=None):
    """Generic paginator for any Atlar list endpoint."""
    all_items = []
    token = ""
    base_params = params or {}

    while True:
        p = {**base_params, "limit": 500}
        if token:
            p["token"] = token

        resp = session.get(url, params=p)
        resp.raise_for_status()
        data = resp.json()

        all_items.extend(data["items"])

        if not data["nextToken"]:
            break
        token = data["nextToken"]

    return all_items

# Usage
all_txns = paginate_all(
    session,
    "https://api.atlar.com/financial-data/v2/transactions",
    {"accountId": "..."},
)`;

  const mandateTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: mandateCurl, highlightedHtml: await highlight(mandateCurl, 'bash') },
  ];
  const ddTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: directDebitCurl, highlightedHtml: await highlight(directDebitCurl, 'bash') },
  ];
  const idempTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: idempotencyCurl, highlightedHtml: await highlight(idempotencyCurl, 'bash') },
  ];
  const etagTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: etagCurl, highlightedHtml: await highlight(etagCurl, 'bash') },
  ];
  const externalTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: externalIdCurl, highlightedHtml: await highlight(externalIdCurl, 'bash') },
  ];
  const paginationTabs: CodeTab[] = [
    { label: 'Python', lang: 'python', code: paginationPython, highlightedHtml: await highlight(paginationPython, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <p className="mb-10 text-lg text-[var(--color-text-secondary)]">
        You have completed the core API flow. Here are additional capabilities
        to explore as you build your integration.
      </p>

      {/* Direct Debits */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Direct Debits &amp; Mandates</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Direct debits let you <strong>collect</strong> money from a counterparty&apos;s
          account. They require a <strong>mandate</strong> &mdash; a pre-authorization
          from the payer.
        </p>

        <h3 className="mb-3 mt-6 text-lg font-semibold">Step 1: Create a mandate</h3>
        <ApiCall
          method="POST"
          path="/payments/v2/mandates"
          description="Create a SEPA Direct Debit mandate for an external account."
        >
          <CodeBlock tabs={mandateTabs} />
        </ApiCall>

        <h3 className="mb-3 mt-8 text-lg font-semibold">Step 2: Create a direct debit</h3>
        <ApiCall
          method="POST"
          path="/payments/v2/direct-debits"
          description="Collect funds from a counterparty using an active mandate."
        >
          <CodeBlock tabs={ddTabs} />
        </ApiCall>

        <DashboardCallout
          path="/direct-debits"
          title="Dashboard: Direct Debits"
          description="View and manage direct debit collections. Mandates are managed under the counterparty detail view."
        />
      </section>

      {/* Idempotency */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold">Idempotency</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Network failures can leave you unsure whether a request succeeded. The
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">Idempotency-Key</code> header
          lets you safely retry creation requests without risking duplicates. Keys are
          scoped to your organization and endpoint, and expire after 24 hours.
        </p>

        <CodeBlock tabs={idempTabs} />

        <InfoBox variant="info" title="425 Too Early">
          <p>
            If you retry while the original request is still processing, Atlar
            responds with <code>425 Too Early</code>. This status is always safe
            to retry after a short backoff.
          </p>
        </InfoBox>
      </section>

      {/* ETags */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold">Safe updates with ETags</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Updates use <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">PATCH</code> with
          {' '}<a href="https://jsonpatch.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-atlar-600 underline underline-offset-2 dark:text-atlar-400">JSON Patch</a> format.
          The <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">If-Match</code> header
          with the resource&apos;s <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">etag</code> prevents
          lost updates from concurrent modifications.
        </p>

        <CodeBlock tabs={etagTabs} />

        <InfoBox variant="warning" title="ETag format">
          <p>
            The <code>etag</code> value from the JSON response (e.g. <code>version:3</code>) should
            be sent <strong>as-is</strong> in the <code>If-Match</code> header &mdash; do
            not wrap it in double quotes.
          </p>
        </InfoBox>
      </section>

      {/* External IDs */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold">External IDs</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Many resources support an <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">externalId</code> field
          that lets you reference them by your own identifier. Valid format:
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">^[a-zA-Z0-9._\-+=]&#123;1,64&#125;$</code>
        </p>

        <CodeBlock tabs={externalTabs} />
      </section>

      {/* Pagination */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold">Pagination patterns</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Here is a reusable pagination helper that works with any Atlar list endpoint:
        </p>

        <CodeBlock tabs={paginationTabs} />
      </section>

      {/* Error codes */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold">Error codes reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Code</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                ['400', 'Bad Request', 'Invalid request body or parameters'],
                ['401', 'Unauthorized', 'Missing or invalid authentication'],
                ['403', 'Forbidden', 'Insufficient role permissions'],
                ['404', 'Not Found', 'Resource does not exist'],
                ['410', 'Gone', 'Resource was deleted'],
                ['425', 'Too Early', 'Idempotent request still processing (retry)'],
                ['429', 'Too Many Requests', 'Rate limit exceeded'],
                ['500', 'Server Error', 'Unexpected server-side issue'],
              ].map(([code, status, meaning]) => (
                <tr key={code} className="border-b border-[var(--color-border-light)]">
                  <td className="py-2.5 pr-4"><code className="text-xs font-semibold">{code}</code></td>
                  <td className="py-2.5 pr-4 font-medium">{status}</td>
                  <td className="py-2.5">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InfoBox variant="tip" title="Request IDs">
          <p>
            Every API response includes a <code>request-id</code> header. If you need
            to contact Atlar support about a request, include this ID for quick resolution.
          </p>
        </InfoBox>
      </section>

      {/* Further reading */}
      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold">Further reading</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'Full API Reference', href: 'https://docs.atlar.com/reference/post_payments-v2-credit-transfers-1', desc: 'Complete endpoint documentation' },
            { title: 'Atlar Documentation', href: 'https://docs.atlar.com/docs/welcome', desc: 'Guides, concepts, and tutorials' },
            { title: 'Webhook Examples', href: 'https://github.com/atlar-tech/atlar-webhook-examples', desc: 'Verification code in Go, Java, JS, Python' },
            { title: 'Atlar Support', href: 'https://support.atlar.com', desc: 'Get help from the Atlar team' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-[var(--color-border)] p-5 transition-colors hover:border-atlar-400 hover:bg-atlar-50/40 dark:hover:bg-atlar-950/20"
            >
              <h3 className="text-sm font-semibold group-hover:text-atlar-600 dark:group-hover:text-atlar-400">
                {link.title}
                <svg className="ml-1 inline h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <FinishGuide />
      </section>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
