import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';
import { InfoBox } from '@/components/InfoBox';

export default async function TransactionsPage() {
  const step = getStep('transactions')!;
  const { prev, next } = getAdjacentSteps('transactions');

  const listCurl = `curl 'https://api.atlar.com/financial-data/v2/transactions?accountId=ACCOUNT_ID&limit=20' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Accept: application/json'`;

  const listPython = `import json

account_id = "e4bca301-36c2-4957-bd49-a8f6487f6c6e"

TRANSACTIONS_URL = "https://api.atlar.com/financial-data/v2/transactions"

resp = session.get(TRANSACTIONS_URL, params={
    "accountId": account_id,
    "limit": 20,
})

data = resp.json()
print(json.dumps(data, indent=2))

for txn in data["items"]:
    amount = txn["amount"]
    print(f'{amount["stringValue"]} {amount["currency"]} — {txn.get("remittanceInformation", {}).get("value", "N/A")}')`;

  const listResponse = `{
  "items": [
    {
      "id": "tx-12345-abcde",
      "accountId": "e4bca301-36c2-4957-bd49-a8f6487f6c6e",
      "amount": {
        "currency": "EUR",
        "value": -2500,
        "stringValue": "-25.00"
      },
      "date": "2025-11-06",
      "reconciliation": { "status": "NOT_RECONCILED" },
      "remittanceInformation": {
        "type": "UNSTRUCTURED",
        "value": "payout-12345"
      },
      "counterparty": {
        "name": "Example Company GmbH",
        "accountIdentifier": "DE64500105173198833324"
      },
      "etag": "version:1"
    }
  ],
  "nextToken": "...",
  "limit": 20
}`;

  const filterCurl = `# Filter by reconciliation status
curl 'https://api.atlar.com/financial-data/v2/transactions?accountId=ACCOUNT_ID&reconciliationStatus=NOT_RECONCILED' \\
  -H 'Authorization: Bearer ACCESS_TOKEN'

# Filter by date range
curl 'https://api.atlar.com/financial-data/v2/transactions?accountId=ACCOUNT_ID&fromDate=2025-11-01&toDate=2025-11-30' \\
  -H 'Authorization: Bearer ACCESS_TOKEN'`;

  const testbankCurl = `# Create a synthetic transaction on a Testbank account
curl -X POST 'https://api.atlar.com/v1/testbank/transactions' \\
  -u 'ACCESS_KEY:SECRET' \\
  -H 'X-Testbank-Authorization: Basic dXNlcjM6cGFzczM=' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "accountId": "TESTBANK_ACCOUNT_ID",
    "date": "2025-12-01",
    "valueDate": "2025-12-01",
    "amount": {
      "currency": "EUR",
      "value": 5000
    },
    "remittanceInformation": {
      "type": "UNSTRUCTURED",
      "value": "Incoming payment from client"
    }
  }'`;

  const testbankPython = `import requests

url = "https://api.atlar.com/v1/testbank/transactions"

payload = {
    "accountId": "TESTBANK_ACCOUNT_ID",
    "date": "2025-12-01",
    "valueDate": "2025-12-01",
    "amount": {"currency": "EUR", "value": 5000},
    "remittanceInformation": {
        "type": "UNSTRUCTURED",
        "value": "Incoming payment from client",
    },
}

resp = requests.post(
    url, json=payload,
    auth=("ACCESS_KEY", "SECRET"),
    headers={"X-Testbank-Authorization": "Basic dXNlcjM6cGFzczM="},
)
print(resp.json())`;

  const listTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: listCurl, highlightedHtml: await highlight(listCurl, 'bash') },
    { label: 'Python', lang: 'python', code: listPython, highlightedHtml: await highlight(listPython, 'python') },
  ];
  const respTabs: CodeTab[] = [
    { label: 'Response', lang: 'json', code: listResponse, highlightedHtml: await highlight(listResponse, 'json') },
  ];
  const filterTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: filterCurl, highlightedHtml: await highlight(filterCurl, 'bash') },
  ];
  const testbankTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: testbankCurl, highlightedHtml: await highlight(testbankCurl, 'bash') },
    { label: 'Python', lang: 'python', code: testbankPython, highlightedHtml: await highlight(testbankPython, 'python') },
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

        <ApiCall
          method="GET"
          path="/financial-data/v2/transactions"
          description="List transactions for an account. Supports filtering by accountId, date range, and reconciliation status."
        >
          <CodeBlock tabs={listTabs} />
          <h4 className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text-tertiary)]">Example response</h4>
          <CodeBlock tabs={respTabs} />
        </ApiCall>

        <DashboardCallout
          path="/transactions"
          title="Dashboard: Transactions"
          description="Browse all transactions across accounts. Use filters for date, amount, reconciliation status, and more."
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Filtering transactions</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          The transactions endpoint supports several query parameters for filtering:
        </p>
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

        <CodeBlock tabs={filterTabs} />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Simulate transactions via Testbank</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          In your sandbox, you can create synthetic transactions on Testbank accounts.
          Use <strong>positive</strong> values for incoming payments and
          <strong> negative</strong> values for expenses. Transactions appear after
          refreshing bank data.
        </p>

        <ApiCall
          method="POST"
          path="/v1/testbank/transactions"
          description="Create a synthetic transaction on a Testbank account. Requires the X-Testbank-Authorization header."
        >
          <CodeBlock tabs={testbankTabs} />
        </ApiCall>

        <InfoBox variant="tip" title="Sync after creating">
          <p>
            Testbank transactions appear in Atlar after the next sync &mdash; either
            click <strong>Refresh</strong> on the account in the Dashboard, or wait
            for the hourly cron. You can also filter the account transactions to confirm
            the new data appeared.
          </p>
        </InfoBox>
      </section>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
