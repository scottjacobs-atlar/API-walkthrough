export type Step = {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
};

export const steps: Step[] = [
  {
    slug: 'welcome',
    number: 0,
    title: 'Welcome & Overview',
    shortTitle: 'Welcome',
    description: 'What Atlar does and what you will learn in this guide.',
    icon: '👋',
  },
  {
    slug: 'sandbox-setup',
    number: 1,
    title: 'Sandbox Setup & Test Bank',
    shortTitle: 'Sandbox',
    description: 'Create an organization and connect the Atlar Testbank.',
    icon: '🏗️',
  },
  {
    slug: 'roles-and-access',
    number: 2,
    title: 'Roles & Programmatic Access',
    shortTitle: 'Access',
    description: 'Set up RBAC roles and create API credentials.',
    icon: '🔑',
  },
  {
    slug: 'authentication',
    number: 3,
    title: 'Authentication — OAuth 2.0',
    shortTitle: 'Auth',
    description: 'Obtain an access token using Client Credentials.',
    icon: '🔐',
  },
  {
    slug: 'accounts',
    number: 4,
    title: 'Explore Your Accounts',
    shortTitle: 'Accounts',
    description: 'List accounts and retrieve balances.',
    icon: '🏦',
  },
  {
    slug: 'counterparties',
    number: 5,
    title: 'Create a Counterparty',
    shortTitle: 'Counterparties',
    description: 'Register a payment destination with an external account.',
    icon: '👤',
  },
  {
    slug: 'credit-transfers',
    number: 6,
    title: 'Make Your First Payment',
    shortTitle: 'Payments',
    description: 'Create a SEPA Credit Transfer or cross-border payment.',
    icon: '💸',
  },
  {
    slug: 'approvals',
    number: 7,
    title: 'Approvals',
    shortTitle: 'Approvals',
    description: 'Approve or reject payments via API and dashboard.',
    icon: '✅',
  },
  {
    slug: 'transactions',
    number: 8,
    title: 'Track Transactions',
    shortTitle: 'Transactions',
    description: 'Retrieve transactions, balances, and simulate test data.',
    icon: '📊',
  },
  {
    slug: 'webhooks',
    number: 9,
    title: 'Webhooks — Real-Time Updates',
    shortTitle: 'Webhooks',
    description: 'Subscribe to events and verify webhook signatures.',
    icon: '🔔',
  },
  {
    slug: 'beyond',
    number: 10,
    title: 'Beyond the Basics',
    shortTitle: 'Beyond',
    description: 'Direct debits, batch payments, idempotency, and more.',
    icon: '🚀',
  },
];

export function getStep(slug: string): Step | undefined {
  return steps.find((s) => s.slug === slug);
}

export function getAdjacentSteps(slug: string) {
  const idx = steps.findIndex((s) => s.slug === slug);
  return {
    prev: idx > 0 ? steps[idx - 1] : null,
    next: idx < steps.length - 1 ? steps[idx + 1] : null,
  };
}
