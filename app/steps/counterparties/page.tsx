import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { DashboardCallout } from '@/components/DashboardCallout';
import { SecurityNote } from '@/components/SecurityNote';
import { InfoBox } from '@/components/InfoBox';

export default async function CounterpartiesPage() {
  const step = getStep('counterparties')!;
  const { prev, next } = getAdjacentSteps('counterparties');

  const createCurl = `curl -X POST 'https://api.atlar.com/payments/v2/counterparties' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "legalName": "Example Company GmbH",
    "alias": "Customer #1234",
    "partyType": "INDIVIDUAL",
    "email": "john.smith@example.com",
    "phone": "+46123456789",
    "address": {
      "country": "DE",
      "city": "Berlin",
      "postalCode": "10115",
      "streetName": "Example Strasse",
      "streetNumber": "47"
    },
    "nationalIdentifier": {
      "type": "CIVIC",
      "market": "DE",
      "number": "2012121212"
    },
    "metadata": { "segment": "trial" },
    "accounts": [
      {
        "market": "DE",
        "identifiers": [
          {
            "type": "IBAN",
            "market": "DE",
            "number": "DE64500105173198833324"
          }
        ]
      }
    ]
  }'`;

  const createPython = `COUNTERPARTY_URL = "https://api.atlar.com/payments/v2/counterparties"

payload = {
    "legalName": "Example Company GmbH",
    "alias": "Customer #1234",
    "partyType": "INDIVIDUAL",
    "email": "john.smith@example.com",
    "phone": "+46123456789",
    "address": {
        "country": "DE",
        "city": "Berlin",
        "postalCode": "10115",
        "streetName": "Example Strasse",
        "streetNumber": "47",
    },
    "nationalIdentifier": {
        "type": "CIVIC",
        "market": "DE",
        "number": "2012121212",
    },
    "metadata": {"segment": "trial"},
    "accounts": [
        {
            "market": "DE",
            "identifiers": [
                {"type": "IBAN", "market": "DE",
                 "number": "DE64500105173198833324"}
            ],
        }
    ],
}

resp = session.post(COUNTERPARTY_URL, json=payload)
counterparty = resp.json()

external_account_id = counterparty["accounts"][0]["id"]
counterparty_id = counterparty["id"]

print(f"Counterparty ID: {counterparty_id}")
print(f"External Account ID: {external_account_id}")`;

  const createResponse = `{
  "id": "7af0ea0b-7366-42aa-ad83-49e93e41ce5d",
  "legalName": "Example Company GmbH",
  "alias": "Customer #1234",
  "partyType": "INDIVIDUAL",
  "accounts": [
    {
      "id": "e80de5e0-1b05-4974-8c73-084027185c7f",
      "identifiers": [
        { "type": "IBAN", "market": "DE",
          "number": "DE64500105173198833324" }
      ],
      "market": "DE"
    }
  ],
  "etag": "version:1",
  ...
}`;

  const createTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: createCurl, highlightedHtml: await highlight(createCurl, 'bash') },
    { label: 'Python', lang: 'python', code: createPython, highlightedHtml: await highlight(createPython, 'python') },
  ];
  const respTabs: CodeTab[] = [
    { label: 'Response', lang: 'json', code: createResponse, highlightedHtml: await highlight(createResponse, 'json') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">What is a Counterparty?</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          A <strong>counterparty</strong> represents a person or organization you
          send money to or receive money from. Each counterparty has one or more
          <strong> external accounts</strong> (their bank accounts) identified by
          IBAN, BBAN, or account number.
        </p>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Counterparties must be created <strong>before</strong> initiating any
          credit transfers or direct debits.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Create a Counterparty</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          The request below creates a counterparty with a single external account.
          Save the returned <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">accounts[0].id</code> &mdash;
          you will use it as the payment destination in the next step.
        </p>

        <ApiCall
          method="POST"
          path="/payments/v2/counterparties"
          description="Create a counterparty with an external account. Returns the counterparty and external account IDs."
        >
          <CodeBlock tabs={createTabs} />
          <h4 className="mb-2 mt-6 text-sm font-semibold text-[var(--color-text-tertiary)]">Example response</h4>
          <CodeBlock tabs={respTabs} />
        </ApiCall>

        <DashboardCallout
          path="/counterparties"
          title="Dashboard: Counterparties"
          description="View and manage all counterparties. Click into any counterparty to see its external accounts, mandates, and metadata."
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Key fields explained</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Field</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                ['legalName', 'Full legal name of the counterparty (required)'],
                ['alias', 'Friendly display name for internal reference'],
                ['partyType', 'INDIVIDUAL or ORGANIZATION'],
                ['accounts[].identifiers', 'Bank account identifiers (IBAN, BBAN, or account number)'],
                ['accounts[].market', 'ISO country code for the account (e.g. "DE")'],
                ['metadata', 'Arbitrary key-value pairs for your own tagging'],
                ['externalId', 'Optional: your own ID (regex: ^[a-zA-Z0-9._\\-+=]{1,64}$)'],
              ].map(([field, desc]) => (
                <tr key={field} className="border-b border-[var(--color-border-light)]">
                  <td className="py-2.5 pr-4">
                    <code className="text-xs">{field}</code>
                  </td>
                  <td className="py-2.5">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SecurityNote title="Use fictitious data for testing">
        <p>
          In your sandbox, always use fictitious names, addresses, and test IBANs.
          The example above uses <code>Example Company GmbH</code> and a generated
          IBAN &mdash; no real personal data is needed.
        </p>
      </SecurityNote>

      <InfoBox variant="tip" title="External IDs">
        <p>
          Use the <code>externalId</code> field to link counterparties to your own
          systems. You can then look up the counterparty
          with <code>GET /payments/v2/counterparties/external:YOUR_ID</code>.
        </p>
      </InfoBox>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
