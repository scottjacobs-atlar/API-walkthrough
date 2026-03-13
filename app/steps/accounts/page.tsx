import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { AccountExplorer } from '@/components/AccountExplorer';
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

  const balanceCurl = `curl 'https://api.atlar.com/financial-data/v2/accounts/{{accountId}}/balances?mostRecent=true&limit=100' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Accept: application/json'`;

  const balancePython = `account_id = "{{accountId}}"

BALANCE_URL = f"https://api.atlar.com/financial-data/v2/accounts/{account_id}/balances"

resp = session.get(BALANCE_URL, params={"mostRecent": "true", "limit": 100})
balances = resp.json()

import json
print(json.dumps(balances, indent=2))`;

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
  const balanceTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: balanceCurl, highlightedHtml: await highlight(balanceCurl, 'bash') },
    { label: 'Python', lang: 'python', code: balancePython, highlightedHtml: await highlight(balancePython, 'python') },
  ];
  const paginationTabs: CodeTab[] = [
    { label: 'Python', lang: 'python', code: paginationExample, highlightedHtml: await highlight(paginationExample, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <AccountExplorer listTabs={listTabs} balanceTabs={balanceTabs} />

      <DashboardCallout
        path="/accounts"
        title="Dashboard: Accounts"
        description="View all your bank accounts, their currencies, balances, and connected banks under the Accounts section."
      />

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
