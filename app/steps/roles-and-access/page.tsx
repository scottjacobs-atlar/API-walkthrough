import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { DashboardCallout } from '@/components/DashboardCallout';
import { SecurityNote } from '@/components/SecurityNote';
import { InfoBox } from '@/components/InfoBox';

export default async function RolesAndAccessPage() {
  const step = getStep('roles-and-access')!;
  const { prev, next } = getAdjacentSteps('roles-and-access');

  const testbankCurl = `curl -X POST 'https://api.atlar.com/v1/testbank/transactions' \\
  -u '<YOUR_ACCESS_KEY>:<YOUR_SECRET>' \\
  -H 'X-Testbank-Authorization: Basic dXNlcjM6cGFzczM=' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "accountId": "<YOUR_ACCOUNT_ID>",
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
    "accountId": "<YOUR_ACCOUNT_ID>",
    "date": "2025-12-01",
    "valueDate": "2025-12-01",
    "amount": {"currency": "EUR", "value": 1500},
    "remittanceInformation": {
        "type": "UNSTRUCTURED",
        "value": "Test deposit of EUR 15",
    },
}

resp = requests.post(url, json=payload, headers=headers,
                     auth=("<YOUR_ACCESS_KEY>", "<YOUR_SECRET>"))
print(resp.json())`;

  const testbankTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: testbankCurl, highlightedHtml: await highlight(testbankCurl, 'bash') },
    { label: 'Python', lang: 'python', code: testbankPython, highlightedHtml: await highlight(testbankPython, 'python') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">Role-Based Access Control (RBAC)</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          The Atlar API and Dashboard use RBAC to define user permissions. Each user is
          assigned one or more <strong>roles</strong> that control which resources they
          can read or modify. Attempting to access a resource without the proper role
          results in a <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">403 Forbidden</code> response.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold">1. Create a Role</h3>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Navigate to <strong>Settings &gt; Roles</strong> in the Dashboard and create a
          new role. For this getting-started guide, grant full access to:
        </p>
        <ul className="mb-6 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
          {['Accounts', 'Counterparties', 'External Accounts', 'Credit Transfers', 'Direct Debits', 'Mandates'].map((scope) => (
            <li key={scope} className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> {scope}
            </li>
          ))}
        </ul>

        <DashboardCallout
          path="/roles"
          title="Dashboard: Roles"
          description="Create and manage roles under Settings > Roles. Each role specifies the scope of features and functionality a user can access."
        />
      </section>

      <section className="mt-12">
        <h3 className="mb-3 text-lg font-semibold">2. Create a Programmatic Access user</h3>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          With your role created, go to <strong>Settings &gt; Users</strong> and create a
          new <strong>Programmatic Access</strong> user. Assign the role you just created.
        </p>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Upon creation, Atlar displays your <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">ACCESS_KEY</code> and
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">SECRET</code>.
          <strong> The secret is shown only once</strong> &mdash; store it immediately in
          a secure location. If lost, delete the user and create a new one.
        </p>

        <DashboardCallout
          path="/users"
          title="Dashboard: Users"
          description="Create programmatic access users under Settings > Users. These generate the API key pair used for authentication."
        />
      </section>

      <section className="mt-12">
        <h3 className="mb-3 text-lg font-semibold">3. Store credentials securely</h3>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Create a local <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">AtlarCreds.env</code> file
          in your project directory:
        </p>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
          <pre className="text-sm text-[var(--color-text-secondary)]">
{`ATLAR_ACCESS_KEY=your_access_key_here
ATLAR_SECRET=your_secret_here`}
          </pre>
        </div>

        <SecurityNote title="Credential safety">
          <p>
            <strong>Never</strong> hardcode your access key or secret in notebooks,
            scripts, or code you commit to version control. Always use environment
            variables and add your <code>.env</code> files to <code>.gitignore</code>.
          </p>
        </SecurityNote>

        <InfoBox variant="tip" title="Using python-dotenv">
          <p>
            The Python examples in this guide use <code>python-dotenv</code> to load
            credentials from an <code>AtlarCreds.env</code> file. Install it
            with <code>pip install python-dotenv</code>.
          </p>
        </InfoBox>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Try it: simulate a Testbank transaction</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Now that you have API credentials, you can create synthetic transactions on
          Testbank accounts via the API. These appear in Atlar after the next sync
          (either the hourly cron job or clicking <strong>Refresh</strong> in the
          Dashboard). Use negative amounts for expenses.
        </p>

        <InfoBox variant="info" title="Replace placeholders before running">
          <p>
            Replace <code>&lt;YOUR_ACCESS_KEY&gt;</code> and <code>&lt;YOUR_SECRET&gt;</code> with
            the credentials you just created above.
            Replace <code>&lt;YOUR_ACCOUNT_ID&gt;</code> with a Testbank account ID from your Dashboard.
          </p>
        </InfoBox>

        <CodeBlock tabs={testbankTabs} />

        <InfoBox variant="tip" title="Refreshing data">
          <p>
            After creating a Testbank transaction, go to your account in the Dashboard and
            click the <strong>Refresh</strong> button, or wait for the hourly sync. The
            transaction will then appear in your account&apos;s transaction list.
          </p>
        </InfoBox>
      </section>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
