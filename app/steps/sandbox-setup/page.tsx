import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { DashboardCallout } from '@/components/DashboardCallout';
import { SecurityNote } from '@/components/SecurityNote';
import { InfoBox } from '@/components/InfoBox';

export default async function SandboxSetupPage() {
  const step = getStep('sandbox-setup')!;
  const { prev, next } = getAdjacentSteps('sandbox-setup');

  const testbankCurl = `curl -X POST 'https://api.atlar.com/v1/testbank/transactions' \\
  -u 'ACCESS_KEY:SECRET' \\
  -H 'X-Testbank-Authorization: Basic dXNlcjM6cGFzczM=' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "accountId": "ACCOUNT_ID",
    "date": "2025-12-01",
    "valueDate": "2025-12-01",
    "amount": {
      "currency": "EUR",
      "value": 1500
    },
    "remittanceInformation": {
      "type": "UNSTRUCTURED",
      "value": "Test deposit of EUR 15"
    }
  }'`;

  const testbankPython = `import requests

url = "https://api.atlar.com/v1/testbank/transactions"
headers = {
    "X-Testbank-Authorization": "Basic dXNlcjM6cGFzczM=",
    "Content-Type": "application/json",
}
payload = {
    "accountId": "ACCOUNT_ID",
    "date": "2025-12-01",
    "valueDate": "2025-12-01",
    "amount": {"currency": "EUR", "value": 1500},
    "remittanceInformation": {
        "type": "UNSTRUCTURED",
        "value": "Test deposit of EUR 15",
    },
}

resp = requests.post(url, json=payload, headers=headers,
                     auth=("ACCESS_KEY", "SECRET"))
print(resp.json())`;

  const tabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: testbankCurl, highlightedHtml: await highlight(testbankCurl, 'bash') },
    { label: 'Python', lang: 'python', code: testbankPython, highlightedHtml: await highlight(testbankPython, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section className="prose-custom">
        <h2 className="mb-4 text-2xl font-bold">Creating your organization</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Atlar uses a multi-tenant model where each <strong>organization</strong> is
          an isolated tenant. When you register at{' '}
          <a href="https://app.atlar.com" target="_blank" rel="noopener noreferrer" className="font-medium text-atlar-600 underline underline-offset-2 dark:text-atlar-400">
            app.atlar.com
          </a>, you create an organization that can be treated as either a sandbox or
          production environment depending on what bank connections you add.
        </p>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          For this guide, keep your organization in <strong>sandbox mode</strong> by
          only connecting the Atlar Testbank &mdash; never real bank credentials.
        </p>

        <DashboardCallout
          path="/test-data"
          title="Dashboard: Test Data"
          description="After creating your organization, navigate to Settings > Test Data to connect the Atlar Testbank and populate sample data."
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">The Atlar Testbank</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          The Testbank simulates a real bank, using fake BICs that start with <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">ATLR</code> (e.g.
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">ATLRSESSXXX</code>,
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">ATLRGB2LXXX</code>).
          When you connect it during organization setup, Atlar populates your sandbox with
          test accounts and transactions.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold">Pre-configured Testbank users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">User</th>
                <th className="pb-3 pr-4 font-semibold">Password</th>
                <th className="pb-3 pr-4 font-semibold">Auth Header</th>
                <th className="pb-3 font-semibold">Accounts</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">user1</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">pass1</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">Basic dXNlcjE6cGFzczE=</code></td>
                <td className="py-2.5">3 Swedish SEK, 2 Danish DKK + transactions</td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">user2</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">pass2</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">Basic dXNlcjI6cGFzczI=</code></td>
                <td className="py-2.5">3 German EUR + transactions</td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">user3</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">pass3</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">Basic dXNlcjM6cGFzczM=</code></td>
                <td className="py-2.5">1 empty Swedish SEK</td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">user4</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">pass4</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">Basic dXNlcjQ6cGFzczQ=</code></td>
                <td className="py-2.5">1 GBP, 1 USD + transactions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h3 className="mb-3 text-lg font-semibold">Special test identifiers</h3>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Certain IBANs trigger special behavior in the Testbank, useful for testing
          error flows:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Number</th>
                <th className="pb-3 font-semibold">Behavior</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">IBAN</code></td>
                <td className="py-2.5 pr-4"><code className="text-xs">DE40500105176499974616</code></td>
                <td className="py-2.5">Payments to/from this account will be <strong>returned</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Simulating Testbank transactions</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          You can create synthetic transactions on Testbank accounts via API. These
          appear in Atlar after the next sync (either the hourly cron job or clicking
          <strong> Refresh</strong> in the Dashboard). Use negative amounts for expenses.
        </p>

        <CodeBlock tabs={tabs} />

        <InfoBox variant="tip" title="Refreshing data">
          <p>
            After creating a Testbank transaction, go to your account in the Dashboard and
            click the <strong>Refresh</strong> button, or wait for the hourly sync. The
            transaction will then appear in your account&apos;s transaction list.
          </p>
        </InfoBox>
      </section>

      <SecurityNote title="Sandbox safety">
        <p>
          The sandbox uses entirely fictitious data. Never enter real personal information,
          bank credentials, or production secrets into a sandbox organization. The Testbank
          accounts use fake IBANs and BICs that cannot route real money.
        </p>
      </SecurityNote>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
