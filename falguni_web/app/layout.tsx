import type { Metadata, Viewport } from 'next';
import { Chivo } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/layout/AuthProvider';
import OnboardingGuard from '@/components/layout/OnboardingGuard';

const chivo = Chivo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Falguni Gruh Udhyog',
  description: 'Shop fresh, homemade products delivered to your door.',
  // No explicit `icons` here on purpose: it used to point at
  // `/favicon.ico`, which doesn't exist in `public/` and 404'd, so Chrome
  // fell back to its default globe tab icon. Next.js auto-detects
  // `app/icon.png` (and `app/apple-icon.png`) and wires up the right
  // <link rel="icon"> tags on its own -- an explicit `icons` entry here
  // would override that and needs to stay removed unless it points to a
  // real file.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={chivo.className}>
      <body className="min-h-dvh flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)] w-full">
        <AuthProvider>
          <OnboardingGuard>{children}</OnboardingGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
