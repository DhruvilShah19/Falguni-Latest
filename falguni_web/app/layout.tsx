import type { Metadata, Viewport } from 'next';
import { Chivo, Playfair_Display } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/layout/AuthProvider';
import OnboardingGuard from '@/components/layout/OnboardingGuard';
import PromotionalPopup from '@/components/common/PromotionalPopup';

const chivo = Chivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chivo',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Falguni Gruh Udhyog | Authentic Homemade Gujarati Snacks & Sweets',
    template: '%s | Falguni Gruh Udhyog',
  },
  description: 'Authentic handcrafted Khakhra, Bhakhri, Namkeen, Sweets, and Spices from Ahmedabad. Made fresh with pure ingredients and zero artificial preservatives.',
  keywords: [
    'Falguni Gruh Udhyog',
    'Khakhra',
    'Bhakhri',
    'Gujarati Snacks',
    'Farsan',
    'Ahmedabad Sweets',
    'Homemade Indian Snacks',
  ],
  metadataBase: new URL('https://falgunigruhudhyog.com'),
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${chivo.className} ${playfair.variable}`}
    >
      <body className="min-h-dvh flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)] w-full">
        <AuthProvider>
          <OnboardingGuard>{children}</OnboardingGuard>
          <PromotionalPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
