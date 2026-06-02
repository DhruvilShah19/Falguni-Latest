import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';

export default function OrderSuccessPage() {
  return (
    <PageShell>
      <div className="max-w-md mx-auto px-4 py-24 flex flex-col items-center text-center gap-5">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-5xl">
          ✅
        </div>
        <h1 className="text-2xl font-black text-[var(--color-fg)]">Order Placed!</h1>
        <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">
          Your order has been placed successfully. We'll update you as it gets prepared and dispatched.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
          <Link
            href="/orders"
            className="flex-1 py-3 bg-[var(--color-brown-dark)] text-white font-semibold rounded-2xl hover:bg-[var(--color-gold)] hover:text-black transition text-sm text-center"
          >
            Track My Orders
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-fg)] font-semibold rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-fg-muted)] transition text-sm text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
