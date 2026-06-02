'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { removeFromCart, updateCartItem, validateCoupon, getDeliveryFee } from '@/lib/firestore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { items, subTotal, discountedTotal, couponCode, couponDiscount, setCoupon, clearCoupon } = useCartStore();
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (firebaseUser === null) router.push('/login');
  }, [firebaseUser, router]);

  const handleQtyChange = async (cartDocId: string, delta: number, current: number, pricePerUnit: number) => {
    if (!firebaseUser) return;
    const newQty = Math.max(1, current + delta);
    await updateCartItem(firebaseUser.uid, cartDocId, {
      quantity: newQty,
      price: pricePerUnit * newQty,
    });
  };

  const handleRemove = async (cartDocId: string) => {
    if (!firebaseUser) return;
    setRemovingId(cartDocId);
    await removeFromCart(firebaseUser.uid, cartDocId);
    setRemovingId(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const coupon = await validateCoupon(couponInput.trim().toUpperCase());
    if (coupon) {
      setCoupon(couponInput.trim().toUpperCase(), coupon.percentage);
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
    setCouponLoading(false);
  };

  const sub = subTotal();
  const discounted = discountedTotal();
  const total = discounted + deliveryFee;

  if (!firebaseUser) return <PageShell><LoadingSpinner /></PageShell>;

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto px-4 py-20 flex flex-col items-center text-center gap-4">
          <ShoppingBag size={64} className="text-[var(--color-border)]" />
          <h2 className="text-xl font-bold text-[var(--color-fg)]">Your cart is empty</h2>
          <p className="text-sm text-[var(--color-fg-muted)]">Add some products to get started</p>
          <Link
            href="/products"
            className="px-6 py-3 bg-[var(--color-brown-dark)] text-white rounded-2xl font-semibold hover:bg-[var(--color-gold)] hover:text-black transition"
          >
            Browse Products
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-5 text-[var(--color-fg)]">
          My Cart ({items.length} item{items.length > 1 ? 's' : ''})
        </h1>

        {/* Layout: stacked on mobile, two columns on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Cart Items ── */}
          <div className="flex-1 flex flex-col gap-3">
            {items.map(item => {
              const pricePerUnit = item.selectedPrice ?? item.unitPrice1 ?? 0;
              return (
                <div
                  key={item.cartDocId}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-3 flex gap-3 items-start"
                >
                  {/* Image */}
                  <Link href={`/products/${item.uid}`} className="flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-[var(--color-surface)]">
                      {item.image1 ? (
                        <Image src={item.image1} alt={item.name} width={96} height={96} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🛍</div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--color-fg)] line-clamp-2 leading-snug">{item.name}</h3>
                    {item.selected && (
                      <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                        {item[`unitname${item.selected.replace('unit', '')}` as keyof typeof item] as string}
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">₹{pricePerUnit} each</p>

                    {/* Qty + price row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQtyChange(item.cartDocId, -1, item.quantity ?? 1, pricePerUnit)}
                          className="px-2 py-1 hover:bg-[var(--color-surface)] transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold">{item.quantity ?? 1}</span>
                        <button
                          onClick={() => handleQtyChange(item.cartDocId, 1, item.quantity ?? 1, pricePerUnit)}
                          className="px-2 py-1 hover:bg-[var(--color-surface)] transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-fg)]">₹{item.price ?? 0}</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.cartDocId)}
                    disabled={removingId === item.cartDocId}
                    className="p-1.5 text-[var(--color-fg-muted)] hover:text-red-500 transition disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 sticky top-24 flex flex-col gap-4">
              <h2 className="font-bold text-[var(--color-fg)]">Order Summary</h2>

              {/* Coupon */}
              <div>
                <p className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1.5 uppercase tracking-wide">Coupon Code</p>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <Tag size={13} />
                      <span className="text-sm font-semibold">{couponCode} ({couponDiscount}% off)</span>
                    </div>
                    <button onClick={clearCoupon} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      className="flex-1 px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-3 py-2 text-sm bg-[var(--color-brown-dark)] text-white rounded-xl hover:bg-[var(--color-gold)] hover:text-black transition disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2 text-sm border-t border-[var(--color-border)] pt-3">
                <Row label="Subtotal" value={`₹${sub}`} />
                {couponDiscount > 0 && (
                  <Row label={`Discount (${couponDiscount}%)`} value={`-₹${(sub - discounted).toFixed(0)}`} green />
                )}
                <Row label="Delivery Fee" value={deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'} />
                <div className="flex items-center justify-between font-bold text-base border-t border-[var(--color-border)] pt-2 mt-1">
                  <span className="text-[var(--color-fg)]">Total</span>
                  <span className="text-[var(--color-fg)]">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--color-gold)] text-black font-bold rounded-2xl hover:opacity-90 transition text-sm"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-fg-muted)]">{label}</span>
      <span className={green ? 'text-green-600 font-medium' : 'text-[var(--color-fg)] font-medium'}>{value}</span>
    </div>
  );
}
