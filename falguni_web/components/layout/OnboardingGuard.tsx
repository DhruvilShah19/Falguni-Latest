'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Pages that don't need onboarding check
const EXEMPT = ['/onboarding', '/login', '/signup', '/forgot-password'];

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (EXEMPT.some(p => pathname.startsWith(p))) return;
    const seen = localStorage.getItem('falguniOnboarded');
    if (!seen) {
      router.replace('/onboarding');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
