'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getDeliveryFee, clearCart, getUserDoc } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STEPS = ['Delivery', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { items, subTotal, discountedTotal, couponCode, couponDiscount, clearCoupon } = useCartStore();

  const [step, setStep] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!firebaseUser) { router.push('/login'); return; }
    if (items.length === 0) { router.push('/cart'); return; }
    getDeliveryFee().then(setDeliveryFee);
    // Pre-fill address from user doc
    getUserDoc(firebaseUser.uid).then(doc => {
      if (doc?.deliveryAddress) setAddress(doc.deliveryAddress as string);
      if (doc?.phone) setPhone(doc.phone as string);
    });
  }, [firebaseUser, items.length, router]);

  const discounted = discountedTotal();
  const total = discounted + deliveryFee;

  const placeOrder = async () => {
    if (!firebaseUser) return;
    setPlacing(true);
    try {
      await addDoc(collection(db, 'Orders'), {
        userId: firebaseUser.uid,
        userEmail: firebaseUser.email,
        items: items.map(i => ({
          name: i.name,
          image1: i.image1,
          quantity: i.quantity,
          price: i.price,
          selected: i.selected,
          vendorId: i.vendorId,
          productID: i.productID,
        })),
        subTotal: subTotal(),
        couponCode: couponCode || null,
        couponDiscount: couponDiscount || 0,
        discountedSubTotal: discounted,
        deliveryFee,
        total,
        deliveryAddress: address,
        phone,
        paymentMethod,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      await clearCart(firebaseUser.uid);
      clearCoupon();
      router.push('/checkout/success');
    } catch (e) {
      console.error(e);
      setPlacing(false);
    }
  };

  if (!firebaseUser || items.length === 0) return <PageShell><LoadingSpinner /></PageShell>;

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-xl font-bold mb-6 text-[var(--color-fg)]">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-1 flex-1 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  i < step
                    ? 'bg-[var(--color-gold)] text-black'
                    : i === step
                    ? 'bg-[var(--color-brown-dark)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-fg-muted)] border border-[var(--color-border)]'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${i === step ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-muted)]'}`}>
                  {s}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded ${i < step ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-border)]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Delivery ── */}
        {step === 0 && (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[var(--color-fg)]">
              <MapPin size={18} className="text-[var(--color-gold)]" />
              <h2 className="font-semibold">Delivery Address</h2>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1 block">Full Address *</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                  placeholder="House no., street, area, city, pincode..."
                  className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] resize-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-fg-muted)] mb-1 block">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-gold)] text-[var(--color-fg)] placeholder-[var(--color-fg-muted)] transition"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!address.trim() || !phone.trim()}
              className="w-full py-3 bg-[var(--color-brown-dark)] text-white font-bold rounded-2xl hover:bg-[var(--color-gold)] hover:text-black transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue to Payment <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 1: Payment ── */}
        {step === 1 && (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-[var(--color-gold)]" />
              <h2 className="font-semibold text-[var(--color-fg)]">Payment Method</h2>
            </div>

            <div className="flex flex-col gap-3">
              {(['COD', 'Online'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                    paymentMethod === method
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold-pale)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    paymentMethod === method
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold)]'
                      : 'border-[var(--color-border)]'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-fg)]">
                      {method === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                    </p>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      {method === 'COD' ? 'Pay when your order arrives' : 'UPI, card, net banking'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[var(--color-brown-dark)] text-white font-bold rounded-2xl hover:bg-[var(--color-gold)] hover:text-black transition flex items-center justify-center gap-2"
            >
              Review Order <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Order summary card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-3">
              <h2 className="font-semibold text-[var(--color-fg)] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[var(--color-gold)]" /> Order Summary
              </h2>

              {items.map(item => (
                <div key={item.cartDocId} className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--color-fg-muted)] flex-1 line-clamp-1">{item.name}</span>
                  <span className="text-[var(--color-fg-muted)]">x{item.quantity}</span>
                  <span className="font-semibold text-[var(--color-fg)]">₹{item.price}</span>
                </div>
              ))}

              <div className="border-t border-[var(--color-border)] pt-3 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-[var(--color-fg-muted)]">
                  <span>Subtotal</span><span>₹{subTotal()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({couponCode})</span><span>-₹{(subTotal() - discounted).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--color-fg-muted)]">
                  <span>Delivery</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-[var(--color-fg)] border-t border-[var(--color-border)] pt-2">
                  <span>Total</span><span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              <div className="text-sm text-[var(--color-fg-muted)] flex flex-col gap-1 border-t border-[var(--color-border)] pt-3">
                <p><span className="font-medium text-[var(--color-fg)]">Address:</span> {address}</p>
                <p><span className="font-medium text-[var(--color-fg)]">Phone:</span> {phone}</p>
                <p><span className="font-medium text-[var(--color-fg)]">Payment:</span> {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</p>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full py-4 bg-[var(--color-gold)] text-black font-bold text-base rounded-2xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {placing ? 'Placing Order...' : '🎉 Place Order'}
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
