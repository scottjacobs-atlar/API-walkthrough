import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { SecurityNote } from '@/components/SecurityNote';
import { InfoBox } from '@/components/InfoBox';

export default async function WebhooksPage() {
  const step = getStep('webhooks')!;
  const { prev, next } = getAdjacentSteps('webhooks');

  const createCurl = `curl -X POST 'https://api.atlar.com/v1/webhooks' \\
  -H 'Authorization: Bearer ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "Payment updates",
    "url": "https://your-server.example.com/webhooks/atlar",
    "filter": [
      {
        "apiVersion": 1,
        "resource": "credit_transfers",
        "events": ["CREATED", "UPDATED"]
      },
      {
        "apiVersion": 1,
        "resource": "transactions",
        "events": ["CREATED"]
      }
    ]
  }'`;

  const createPython = `WEBHOOKS_URL = "https://api.atlar.com/v1/webhooks"

payload = {
    "name": "Payment updates",
    "url": "https://your-server.example.com/webhooks/atlar",
    "filter": [
        {
            "apiVersion": 1,
            "resource": "credit_transfers",
            "events": ["CREATED", "UPDATED"],
        },
        {
            "apiVersion": 1,
            "resource": "transactions",
            "events": ["CREATED"],
        },
    ],
}

resp = session.post(WEBHOOKS_URL, json=payload)
webhook = resp.json()

print(f"Webhook ID: {webhook['id']}")
print(f"Key (save this!): {webhook.get('key', 'N/A')}")`;

  const payloadExample = `{
  "resource": "credit_transfers",
  "apiVersion": 1,
  "event": {
    "organizationId": "1f91e001-...",
    "entityId": "422a164c-...",
    "id": 3,
    "timestamp": "2025-11-06T07:26:56.837Z",
    "name": "UPDATED",
    "originator": "90b51164-..."
  },
  "entity": {
    "id": "422a164c-...",
    "status": "APPROVED",
    "amount": { "currency": "EUR", "value": 2500 },
    ...
  }
}`;

  const verifyGo = `func signatureIsValid(sigHeader, tsHeader, payload, base64Key string) (bool, error) {
    key, err := base64.StdEncoding.DecodeString(base64Key)
    if err != nil {
        return false, fmt.Errorf("failed to decode key: %w", err)
    }

    sig, err := hex.DecodeString(sigHeader)
    if err != nil {
        return false, nil
    }

    mac := hmac.New(sha256.New, key)
    mac.Write([]byte(payload + "." + tsHeader))

    return hmac.Equal(mac.Sum(nil), sig), nil
}`;

  const verifyPython = `import hmac, hashlib, base64

def verify_webhook(body: str, timestamp: str, signature: str, base64_key: str) -> bool:
    """Verify an Atlar webhook signature."""
    key = base64.b64decode(base64_key)
    message = f"{body}.{timestamp}".encode()
    expected = hmac.new(key, message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

# Usage in your webhook handler:
# is_valid = verify_webhook(
#     body=request.body.decode(),
#     timestamp=request.headers["Webhook-Request-Timestamp"],
#     signature=request.headers["Webhook-Signature"],
#     base64_key="your-webhook-key-from-creation",
# )`;

  const createTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: createCurl, highlightedHtml: await highlight(createCurl, 'bash') },
    { label: 'Python', lang: 'python', code: createPython, highlightedHtml: await highlight(createPython, 'python') },
  ];
  const payloadTabs: CodeTab[] = [
    { label: 'Webhook Payload', lang: 'json', code: payloadExample, highlightedHtml: await highlight(payloadExample, 'json') },
  ];
  const verifyTabs: CodeTab[] = [
    { label: 'Python', lang: 'python', code: verifyPython, highlightedHtml: await highlight(verifyPython, 'python') },
    { label: 'Go', lang: 'go', code: verifyGo, highlightedHtml: await highlight(verifyGo, 'go') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">Why webhooks?</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Instead of polling the API for changes, webhooks deliver real-time HTTP
          POST notifications when events occur. This lets you trigger downstream
          actions (updating your ERP, notifying your team) immediately when a payment
          changes state.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold">How it works</h3>
        <ol className="mb-6 space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-atlar-500">1.</span>
            You configure a webhook URL via the API
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-atlar-500">2.</span>
            Atlar sends HTTP POST to that URL whenever a matching event occurs
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-atlar-500">3.</span>
            Your server processes the payload and responds with <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">200 OK</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-atlar-500">4.</span>
            If delivery fails, Atlar retries 3 times every 15 minutes for up to 12 hours
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Create a webhook</h2>

        <ApiCall
          method="POST"
          path="/v1/webhooks"
          description="Subscribe to events. Specify resource types and event names in the filter array."
        >
          <CodeBlock tabs={createTabs} />
        </ApiCall>

        <InfoBox variant="tip" title="Testing without a server">
          <p>
            Use <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="font-medium text-atlar-600 underline underline-offset-2 dark:text-atlar-400">webhook.site</a> or
            {' '}<a href="https://pipedream.com" target="_blank" rel="noopener noreferrer" className="font-medium text-atlar-600 underline underline-offset-2 dark:text-atlar-400">Pipedream</a> to
            get a temporary URL that displays incoming webhook payloads in real time.
          </p>
        </InfoBox>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Webhook payload</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Each webhook delivers the <strong>resource in its state after the event</strong>.
          The payload includes event metadata and the full entity:
        </p>

        <CodeBlock tabs={payloadTabs} />

        <h3 className="mb-3 mt-8 text-lg font-semibold">Event types</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Event</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs font-semibold">CREATED</code></td>
                <td className="py-2.5">A new resource was created</td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs font-semibold">UPDATED</code></td>
                <td className="py-2.5">An existing resource was modified (e.g. status change)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs font-semibold">DELETED</code></td>
                <td className="py-2.5">A resource was removed (rare, typically data cleanup)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Webhook security</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Atlar sends two headers with each webhook for verification:
        </p>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-4 font-semibold">Header</th>
                <th className="pb-3 pr-4 font-semibold">Format</th>
                <th className="pb-3 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">Webhook-Signature</code></td>
                <td className="py-2.5 pr-4">HMAC-SHA256 hex</td>
                <td className="py-2.5">Verify authenticity and integrity</td>
              </tr>
              <tr className="border-b border-[var(--color-border-light)]">
                <td className="py-2.5 pr-4"><code className="text-xs">Webhook-Request-Timestamp</code></td>
                <td className="py-2.5 pr-4">RFC 3339 UTC</td>
                <td className="py-2.5">Prevent replay attacks</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-6 text-lg font-semibold">Signature verification</h3>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          The signature is computed as <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">HMAC-SHA256(key, body + &quot;.&quot; + timestamp)</code>.
          To verify:
        </p>
        <ol className="mb-6 space-y-1 text-sm text-[var(--color-text-secondary)]">
          <li>1. Base64-decode the webhook key into bytes</li>
          <li>2. Concatenate: <code className="text-xs">body + &quot;.&quot; + timestamp</code></li>
          <li>3. Compute HMAC-SHA256</li>
          <li>4. Hex-encode and compare using constant-time comparison</li>
          <li>5. Check the timestamp is recent (within ~5 minutes)</li>
        </ol>

        <CodeBlock tabs={verifyTabs} />
      </section>

      <SecurityNote title="Webhook best practices">
        <ul className="mt-1 space-y-1">
          <li>Always verify the HMAC signature before processing.</li>
          <li>Use constant-time comparison to prevent timing attacks.</li>
          <li>Make your handler <strong>idempotent</strong> &mdash; duplicate deliveries are possible.</li>
          <li>Respond with <code>200 OK</code> quickly; do heavy processing asynchronously.</li>
          <li>Use <code>event.id</code> + <code>entity.id</code> to deduplicate events.</li>
          <li>Rotate webhook keys if compromised via <code>/v1/webhooks/&#123;id&#125;/keys</code>.</li>
        </ul>
      </SecurityNote>

      <InfoBox variant="info" title="Going live">
        <p>
          Before receiving production webhooks, your endpoint must be <strong>verified</strong> by
          Atlar. Contact <a href="mailto:support@atlar.com" className="font-medium text-atlar-600 underline underline-offset-2 dark:text-atlar-400">support@atlar.com</a> to
          verify your webhook URL. Note: modifying the URL resets verification.
        </p>
      </InfoBox>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
