'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Package, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentMethod: string;
}

const STATUS_COLOR: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Confirmed:  'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { firebaseUser } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) { router.push('/login'); return; }
    getDocs(
      query(
        collection(db, 'Orders'),
        where('userId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc')
      )
    ).then(snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [firebaseUser, router]);

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-5 text-[var(--color-fg)]">My Orders</h1>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Package size={56} className="text-[var(--color-border)]" />
            <h2 className="font-bold text-[var(--color-fg)]">No orders yet</h2>
            <p className="text-sm text-[var(--color-fg-muted)]">Your order history will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const date = order.createdAt?.toDate?.()?.toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) ?? '—';
              const statusClass = STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600';

              return (
                <div key={order.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-[var(--color-fg-muted)] font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{date}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-[var(--color-fg-muted)]">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <p key={i} className="line-clamp-1">{item.name} × {item.quantity}</p>
                    ))}
                    {(order.items?.length ?? 0) > 2 && (
                      <p className="text-xs mt-0.5">+{order.items.length - 2} more items</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
                    <div>
                      <p className="text-xs text-[var(--color-fg-muted)]">{order.paymentMethod}</p>
                      <p className="font-bold text-[var(--color-fg)]">₹{order.total?.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
