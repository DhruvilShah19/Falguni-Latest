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
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={chivo.className}>
      <body className="min-h-dvh flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)] overflow-x-hidden w-full">
        <AuthProvider>
          <OnboardingGuard>{children}</OnboardingGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
