import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CredentialProvider } from '@/lib/credentials';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atlar API Guide — Interactive Tutorial',
  description:
    'Step-by-step guide to the Atlar treasury management API. Learn authentication, payments, transactions, and webhooks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CredentialProvider>
            <Sidebar />
            <MobileNav />
            <main className="min-h-screen lg:ml-72">
              <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12 lg:py-16">
                {children}
              </div>
            </main>
          </CredentialProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
