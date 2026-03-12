# Atlar API Guide

A step-by-step interactive tutorial website for the [Atlar](https://atlar.com) treasury management API. Built with Next.js 14, Tailwind CSS, and Shiki syntax highlighting.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This project uses `output: 'export'` for static site generation, making it deployable to any static host.

**Option 1: Vercel CLI**

```bash
npx vercel
```

**Option 2: Git-based deploy**

Push to a GitHub repo and import it at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js and builds with zero configuration.

## What's covered

| Step | Topic | API Endpoint |
|------|-------|--------------|
| 0 | Welcome & Overview | — |
| 1 | Sandbox Setup & Test Bank | `POST /v1/testbank/transactions` |
| 2 | Roles & Programmatic Access | Dashboard setup |
| 3 | Authentication (OAuth 2.0) | `POST /iam/v2beta/oauth2/token` |
| 4 | Explore Accounts | `GET /financial-data/v2/accounts` |
| 5 | Create Counterparty | `POST /payments/v2/counterparties` |
| 6 | Make a Payment | `POST /payments/v2/credit-transfers` |
| 7 | Approvals | `POST /payments/v2beta/credit-transfers/{id}/approve` |
| 8 | Track Transactions | `GET /financial-data/v2/transactions` |
| 9 | Webhooks | `POST /v1/webhooks` |
| 10 | Beyond the Basics | Direct debits, mandates, idempotency, ETags |

## Tech stack

- **Next.js 14** with App Router and static export
- **Tailwind CSS 3** with dark mode support
- **Shiki** for server-side syntax highlighting
- **TypeScript** throughout

## Project structure

```
app/
  layout.tsx          Root layout with sidebar
  page.tsx            Welcome page (Step 0)
  globals.css         Tailwind base styles + CSS variables
  steps/
    sandbox-setup/    Step 1
    roles-and-access/ Step 2
    authentication/   Step 3
    accounts/         Step 4
    counterparties/   Step 5
    credit-transfers/ Step 6
    approvals/        Step 7
    transactions/     Step 8
    webhooks/         Step 9
    beyond/           Step 10
components/
  ApiCall.tsx         API endpoint display
  CodeBlock.tsx       Tabbed code viewer with copy
  DashboardCallout.tsx  Dashboard path reference
  InfoBox.tsx         Info/tip/warning callout
  MobileNav.tsx       Responsive mobile navigation
  SecurityNote.tsx    Security best-practice callout
  Sidebar.tsx         Desktop sidebar navigation
  StepHeader.tsx      Step page header
  StepNavigation.tsx  Prev/next navigation
  ThemeProvider.tsx    Dark/light mode context
lib/
  highlight.ts        Shiki highlighter setup
  steps.ts            Step metadata and ordering
```
