'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { Package, Heart, MapPin, LogOut, ChevronRight, User } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !firebaseUser) router.push('/login');
  }, [firebaseUser, loading, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading || !firebaseUser) return <PageShell><LoadingSpinner /></PageShell>;

  const name = userDoc?.fullname || firebaseUser.displayName || 'User';
  const email = firebaseUser.email ?? '';
  const wallet = userDoc?.wallet ?? 0;

  return (
    <PageShell>
      <div className="max-w-lg mx-auto px-4 md:px-6 py-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-[var(--color-brown-mid)] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[var(--color-fg)] truncate">{name}</h2>
            <p className="text-sm text-[var(--color-fg-muted)] truncate">{email}</p>
          </div>
        </div>

        {/* Wallet balance */}
        <div className="mb-4 p-4 gradient-brand rounded-2xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-wide">Wallet Balance</p>
            <p className="text-2xl font-black text-[var(--color-gold)]">₹{wallet}</p>
          </div>
          <span className="text-3xl">👛</span>
        </div>

        {/* Menu items */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden divide-y divide-[var(--color-border)]">
          <MenuItem href="/orders" icon={Package} label="My Orders" />
          <MenuItem href="/favorites" icon={Heart} label="Saved Items" />
          <MenuItem href="/profile/addresses" icon={MapPin} label="Delivery Addresses" />
        </div>

        <button
          onClick={handleSignOut}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 transition text-sm font-semibold"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </PageShell>
  );
}

function MenuItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface)] transition">
      <Icon size={18} className="text-[var(--color-fg-muted)]" />
      <span className="flex-1 text-sm font-medium text-[var(--color-fg)]">{label}</span>
      <ChevronRight size={15} className="text-[var(--color-fg-muted)]" />
    </Link>
  );
}
