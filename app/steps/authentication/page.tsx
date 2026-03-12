import { getStep, getAdjacentSteps } from '@/lib/steps';
import { highlight } from '@/lib/highlight';
import { StepHeader } from '@/components/StepHeader';
import { StepNavigation } from '@/components/StepNavigation';
import { CodeBlock, type CodeTab } from '@/components/CodeBlock';
import { ApiCall } from '@/components/ApiCall';
import { SecurityNote } from '@/components/SecurityNote';
import { InfoBox } from '@/components/InfoBox';

export default async function AuthenticationPage() {
  const step = getStep('authentication')!;
  const { prev, next } = getAdjacentSteps('authentication');

  const tokenCurl = `curl -X POST 'https://api.atlar.com/iam/v2beta/oauth2/token' \\
  -H 'Accept: application/json' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -u 'ACCESS_KEY:SECRET' \\
  -d 'grant_type=client_credentials'`;

  const tokenPython = `import os, base64, requests
from dotenv import load_dotenv

load_dotenv("AtlarCreds.env")

ACCESS_KEY = os.getenv("ATLAR_ACCESS_KEY")
SECRET = os.getenv("ATLAR_SECRET")

TOKEN_URL = "https://api.atlar.com/iam/v2beta/oauth2/token"

basic = base64.b64encode(f"{ACCESS_KEY}:{SECRET}".encode()).decode()
headers = {
    "accept": "application/json",
    "content-type": "application/x-www-form-urlencoded",
    "authorization": f"Basic {basic}",
}

resp = requests.post(TOKEN_URL, headers=headers,
                     data={"grant_type": "client_credentials"})
resp.raise_for_status()

token_data = resp.json()
access_token = token_data["access_token"]
expires_in = token_data["expires_in"]

print(f"Token acquired, expires in {expires_in}s")`;

  const tokenJs = `const TOKEN_URL = "https://api.atlar.com/iam/v2beta/oauth2/token";

const credentials = btoa(\`\${ACCESS_KEY}:\${SECRET}\`);

const resp = await fetch(TOKEN_URL, {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": \`Basic \${credentials}\`,
  },
  body: "grant_type=client_credentials",
});

const { access_token, expires_in } = await resp.json();
console.log(\`Token acquired, expires in \${expires_in}s\`);`;

  const responseJson = `{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 300
}`;

  const sessionPython = `session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {access_token}",
    "Accept": "application/json",
})

# Now use session.get(), session.post(), etc.
resp = session.get("https://api.atlar.com/financial-data/v2/accounts")`;

  const basicAuthCurl = `# Simpler alternative: HTTP Basic auth on every request
curl 'https://api.atlar.com/financial-data/v2/accounts' \\
  -u 'ACCESS_KEY:SECRET'`;

  const tokenTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: tokenCurl, highlightedHtml: await highlight(tokenCurl, 'bash') },
    { label: 'Python', lang: 'python', code: tokenPython, highlightedHtml: await highlight(tokenPython, 'python') },
    { label: 'JavaScript', lang: 'javascript', code: tokenJs, highlightedHtml: await highlight(tokenJs, 'javascript') },
  ];

  const responseTabs: CodeTab[] = [
    { label: 'Response', lang: 'json', code: responseJson, highlightedHtml: await highlight(responseJson, 'json') },
  ];

  const sessionTabs: CodeTab[] = [
    { label: 'Python', lang: 'python', code: sessionPython, highlightedHtml: await highlight(sessionPython, 'python') },
  ];

  const basicTabs: CodeTab[] = [
    { label: 'curl', lang: 'bash', code: basicAuthCurl, highlightedHtml: await highlight(basicAuthCurl, 'bash') },
  ];

  return (
    <>
      <StepHeader step={step} />

      <section>
        <h2 className="mb-4 text-2xl font-bold">OAuth 2.0 Client Credentials flow</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Atlar supports the <strong>OAuth 2.0 Client Credentials</strong> grant type.
          You exchange your <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">ACCESS_KEY</code> and
          {' '}<code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">SECRET</code> for a short-lived
          Bearer token via the token endpoint.
        </p>

        <ApiCall
          method="POST"
          path="/iam/v2beta/oauth2/token"
          description="Exchange credentials for an access token using Basic auth and the client_credentials grant type."
        >
          <CodeBlock tabs={tokenTabs} />
        </ApiCall>

        <h3 className="mb-3 mt-8 text-lg font-semibold">Token response</h3>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          A successful response returns a JWT access token that expires in
          {' '}<strong>300 seconds (5 minutes)</strong>:
        </p>

        <CodeBlock tabs={responseTabs} />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Using the token</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Attach the access token as a <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">Bearer</code> token
          in the <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">Authorization</code> header of
          every subsequent API call. In Python, creating a reusable <code className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-xs">Session</code> makes
          this effortless:
        </p>

        <CodeBlock tabs={sessionTabs} />

        <InfoBox variant="warning" title="Token expiry">
          <p>
            Tokens expire every <strong>5 minutes</strong>. In production code, implement
            automatic token refresh &mdash; request a new token before the current one
            expires. Never cache tokens beyond their <code>expires_in</code> window.
          </p>
        </InfoBox>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Alternative: HTTP Basic auth</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          For quick testing, the Atlar API also accepts HTTP Basic authentication
          directly on any endpoint &mdash; no token exchange needed:
        </p>

        <CodeBlock tabs={basicTabs} />

        <InfoBox variant="info" title="When to use which">
          <p>
            <strong>Basic auth</strong> is convenient for ad-hoc testing and curl commands.
            <strong> OAuth tokens</strong> are recommended for production integrations
            since they minimize how often secrets are transmitted over the wire.
          </p>
        </InfoBox>
      </section>

      <SecurityNote>
        <p>
          Never log or expose your access tokens. Treat them with the same care as your
          secret key. If you suspect a token has been compromised, rotate your programmatic
          access user credentials immediately.
        </p>
      </SecurityNote>

      <StepNavigation prev={prev} next={next} />
    </>
  );
}
