import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';
import { InfoBox } from '@/components/InfoBox';

export default async function AccountsPage() {
  const step = getStep('accounts')!;
  const { prev, next } = getAdjacentSteps('accounts');

  const listCurl = `curl 'https://api.atlar.com/financial-data/v2/accounts?limit=10' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Accept: application/json'`;

  const listPython = `ACCOUNTS_URL = "https://api.atlar.com/financial-data/v2/accounts"

resp = session.get(ACCOUNTS_URL, params={"limit": 10})
payload = resp.json()

for account in payload["items"]:
    iban = account["identifiers"][0]["number"]
    bic = account["routing"][0]["number"]
    print(f'{account["currency"]} | {account["name"]} | {iban} | {bic}')
    print(f'  ID: {account["id"]}')`;

  const listResponse = `{
  "items": [
    {
      "id": "e4bca301-36c2-4957-bd49-a8f6487f6c6e",
      "name": "My EUR Account",
      "currency": "EUR",
      "identifiers": [
        { "type": "IBAN", "market": "DE", "number": "DE77500105179251553356" }
      ],
      "routing": [
        { "type": "BIC", "number": "ATLRSESSXXX" }
      ],
      "etag": "version:3",
      ...
    }
  ],
  "nextToken": "",
  "token": "",
  "limit": 10
}`;

  const balanceCurl = `curl 'https://api.atlar.com/financial-data/v2/accounts/ACCOUNT_ID/balances?mostRecent=true&limit=100' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Accept: application/json'`;

  const balancePython = `account_id = "e4bca301-36c2-4957-bd49-a8f6487f6c6e"

BALANCE_URL = f"https://api.atlar.com/financial-data/v2/accounts/{account_id}/balances"

resp = session.get(BALANCE_URL, params={"mostRecent": "true", "limit": 100})
balances = resp.json()

import json
print(json.dumps(balances, indent=2))`;

  const balanceResponse = `{
  "items": [
    {
      "type": "CLOSING_BOOKED",
      "amount": {
        "currency": "EUR",
        "value": 125000,
        "stringValue": "1250.00"
      },
      "localDate": "2025-11-06",
      "timestamp": "2025-11-06T23:59:59Z"
    }
  ],
  "nextToken": "",
  "limit": 100
}`;

  const paginationExample = `# Paginate through all accounts
all_accounts = []
token = ""

while True:
    params = {"limit": 100}
    if token:
        params["token"] = token

    resp = session.get(ACCOUNTS_URL, params=params)
    data = resp.json()
    all_accounts.extend(data["items"])

    if not data["nextToken"]:
        break
    token = data["nextToken"]

print(f"Total accounts: {len(all_accounts)}")`;

  const listTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: listCurl, highlightedHtml: await highlight(listCurl, 'bash') },
    { label: 'Python', lang: 'python', code: listPython, highlightedHtml: await highlight(listPython, 'python') },
  ];
  const listRespTabs: CodeTab[] = [
    { label: 'Response', lang: 'json', code: listResponse, highlightedHtml: await highlight(listResponse, 'json') },
  ];
  const balanceTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: balanceCurl, highlightedHtml: await highlight(balanceCurl, 'bash') },
    { label: 'Python', lang: 'python', code: balancePython, highlightedHtml: await highlight(balancePython, 'python') },
  ];
  const balanceRespTabs: CodeTab[] = [
    { label: 'Response', lang: 'json', code: balanceResponse, highlightedHtml: await highlight(balanceResponse, 'json') },
  ];
  const paginationTabs: CodeTab[] = [
    { label: 'Python', lang: 'python', code: paginationExample, highlightedHtml: await highlight(paginationExample, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">List your accounts</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          After connecting the Testbank, your sandbox organization will have several
          accounts. Use the accounts endpoint to list them and find the account IDs
          you will need for payments.
        </p>

        <ApiCall
          method="GET"
          path="/financial-data/v2/accounts"
          description="List all accounts in your organization. Returns IDs, currency, name, identifiers (IBAN/BBAN), and routing (BIC)."
        >
          <CodeBlock tabs={listTabs} />
          <h4 className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text-tertiary)]">Example response</h4>
          <CodeBlock tabs={listRespTabs} />
        </ApiCall>

        <DashboardCallout
          path="/accounts"
          title="Dashboard: Accounts"
          description="View all your bank accounts, their currencies, balances, and connected banks under the Accounts section."
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Retrieve balances</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          For any account, you can retrieve the most recent balance snapshot. The
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">mostRecent=true</code> parameter
          returns only the latest balance entry per type.
        </p>

        <ApiCall
          method="GET"
          path="/financial-data/v2/accounts/{id}/balances"
          description="Get balance snapshots for an account. Use mostRecent=true for the latest balance."
        >
          <CodeBlock tabs={balanceTabs} />
          <h4 className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text-tertiary)]">Example response</h4>
          <CodeBlock tabs={balanceRespTabs} />
        </ApiCall>

        <DashboardCallout
          path="/accounts/:id/details/balances"
          title="Dashboard: Account Balances"
          description="Click into any account and select the Balances tab to see historical and current balance data."
        />

        <InfoBox variant="info" title="Amount representation">
          <p>
            Atlar represents monetary amounts as integers in the smallest currency
            unit (e.g. cents for EUR). A <code>value</code> of <code>125000</code> in
            EUR means <strong>EUR 1,250.00</strong>. The <code>stringValue</code> field
            provides the human-readable representation.
          </p>
        </InfoBox>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Pagination</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          All list endpoints support pagination via <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">limit</code> (1-500, default 100)
          and <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">token</code>. The response
          includes <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">nextToken</code> &mdash;
          if it is non-empty, more pages exist.
        </p>

        <CodeBlock tabs={paginationTabs} />

        <InfoBox variant="warning" title="Pagination pitfall">
          <p>
            Never compare the length of <code>items</code> to <code>limit</code> to
            determine if more pages exist. There may be fewer items than the limit even
            when more data is available. Always check <code>nextToken</code>.
          </p>
        </InfoBox>
      </section>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
