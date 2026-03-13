import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { type CodeTab } from '@/components/CodeBlock';
import { TransactionForm } from '@/components/TransactionForm';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';

export default async function TransactionsPage() {
  const step = getStep('transactions')!;
  const { prev, next } = getAdjacentSteps('transactions');

  const listCurl = `curl 'https://api.atlar.com/financial-data/v2/transactions?accountId={{accountId}}&limit={{limit}}' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Accept: application/json'`;

  const listPython = `import json

account_id = "{{accountId}}"

TRANSACTIONS_URL = "https://api.atlar.com/financial-data/v2/transactions"

resp = session.get(TRANSACTIONS_URL, params={
    "accountId": account_id,
    "limit": {{limit}},
})

data = resp.json()
print(json.dumps(data, indent=2))

for txn in data["items"]:
    amount = txn["amount"]
    print(f'{amount["stringValue"]} {amount["currency"]} — {txn.get("remittanceInformation", {}).get("value", "N/A")}')`;

  const listTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: listCurl, highlightedHtml: await highlight(listCurl, 'bash') },
    { label: 'Python', lang: 'python', code: listPython, highlightedHtml: await highlight(listPython, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">List transactions</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          After payments are processed and bank statements are synced, transactions
          appear on your accounts. Query them filtered by account, date range, or
          reconciliation status.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold">Available filters</h3>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Parameter</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                ['accountId', 'Filter by account ID (required for most queries)'],
                ['reconciliationStatus', 'NOT_RECONCILED, RECONCILED, or PARTIALLY_RECONCILED'],
                ['fromDate / toDate', 'Date range filter (YYYY-MM-DD)'],
                ['limit', 'Results per page (1-500, default 100)'],
                ['token', 'Pagination continuation token'],
              ].map(([param, desc]) => (
                <tr key={param} className="border-b border-[var(--color-border-light)]">
                  <td className="py-2.5 pr-4"><code className="text-xs">{param}</code></td>
                  <td className="py-2.5">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ApiCall
          method="GET"
          path="/financial-data/v2/transactions"
          description="List transactions for an account. Supports filtering by accountId, date range, and reconciliation status."
        >
          <TransactionForm listTabs={listTabs} />
        </ApiCall>

        <DashboardCallout
          path="/transactions"
          title="Dashboard: Transactions"
          description="Browse all transactions across accounts. Use filters for date, amount, reconciliation status, and more."
        />
      </section>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
