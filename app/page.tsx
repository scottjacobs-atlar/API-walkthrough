import Link from 'next/link';
import { steps } from '@/lib/steps';
import { StepNavigation } from '@/components/StepNavigation';

export default function WelcomePage() {
  return (
    <>
      {/* Hero */}
      <div className="mb-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-atlar-100 px-4 py-1.5 text-xs font-semibold text-atlar-700 dark:bg-atlar-950 dark:text-atlar-300">
          Interactive Tutorial
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Atlar API Guide
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)] leading-relaxed">
          A hands-on, step-by-step walkthrough of the Atlar treasury management
          API. You will learn how to authenticate, explore accounts, make payments,
          track transactions, and receive real-time webhook notifications &mdash;
          all within a safe sandbox environment.
        </p>
      </div>

      {/* What you'll learn */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">What you will learn</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'OAuth 2.0 Authentication', desc: 'Securely obtain tokens using Client Credentials flow.' },
            { title: 'Account & Balance Data', desc: 'Query bank accounts, balances, and identifiers.' },
            { title: 'Payments End-to-End', desc: 'Create counterparties, credit transfers, and approvals.' },
            { title: 'Transactions & Webhooks', desc: 'Track transactions and receive real-time events.' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5"
            >
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prerequisites */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold">Prerequisites</h2>
        <ul className="space-y-2 text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="mt-1 text-atlar-500">●</span>
            <span>
              An Atlar account &mdash;{' '}
              <a
                href="https://app.atlar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-atlar-600 underline decoration-atlar-300 underline-offset-2 hover:text-atlar-700 dark:text-atlar-400"
              >
                sign up at app.atlar.com
              </a>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 text-atlar-500">●</span>
            <span>A sandbox organization with the Atlar Testbank connected</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 text-atlar-500">●</span>
            <span>
              A terminal, REST client, or Python/Node.js environment for making API calls
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 text-atlar-500">●</span>
            <span>
              Familiarity with REST APIs and JSON
            </span>
          </li>
        </ul>
      </section>

      {/* API at a glance */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold">The Atlar API at a glance</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          The Atlar API is resource-oriented JSON REST. Endpoints are grouped into namespaces:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-3 pr-6 font-semibold">Namespace</th>
                <th className="pb-3 pr-6 font-semibold">Base Path</th>
                <th className="pb-3 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                { ns: 'Financial Data', path: '/financial-data/v2/', purpose: 'Accounts, transactions, balances' },
                { ns: 'Payments', path: '/payments/v2/', purpose: 'Credit transfers, direct debits, counterparties, mandates' },
                { ns: 'Connectivity', path: '/connectivity/v2beta/', purpose: 'Bank connections and configuration' },
                { ns: 'IAM', path: '/iam/v2beta/', purpose: 'Organizations, memberships, OAuth tokens' },
              ].map((r) => (
                <tr key={r.ns} className="border-b border-[var(--color-border-light)]">
                  <td className="py-3 pr-6 font-medium text-[var(--color-text)]">{r.ns}</td>
                  <td className="py-3 pr-6">
                    <code className="rounded bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-xs">{r.path}</code>
                  </td>
                  <td className="py-3">{r.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Step map */}
      <section className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Guide roadmap</h2>
        <div className="space-y-2">
          {steps.slice(1).map((step) => (
            <Link
              key={step.slug}
              href={`/steps/${step.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-4 transition-colors hover:border-atlar-400 hover:bg-atlar-50/40 dark:hover:bg-atlar-950/20"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-sm font-bold text-[var(--color-text-secondary)] group-hover:bg-atlar-100 group-hover:text-atlar-700 dark:group-hover:bg-atlar-950 dark:group-hover:text-atlar-300">
                {step.number}
              </span>
              <div>
                <h3 className="text-sm font-semibold group-hover:text-atlar-600 dark:group-hover:text-atlar-400">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">{step.description}</p>
              </div>
              <svg className="ml-auto h-4 w-4 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      <StepNavigation prev={null} next={steps[1]} />
    </>
  );
}
