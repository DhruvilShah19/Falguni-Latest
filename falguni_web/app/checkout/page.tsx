'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { clearCart } from '@/lib/firestore';
import { load } from '@cashfreepayments/cashfree-js';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import DeliveryAddressSection from '@/components/checkout/DeliveryAddressSection';
import { type PickupStoreInfo } from '@/components/cart/StorePickupCard';
import OrderNotesSection from '@/components/checkout/OrderNotesSection';
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary';
import WhyShopWithFalguni from '@/components/checkout/WhyShopWithFalguni';
import CheckoutBottomBar from '@/components/checkout/CheckoutBottomBar';
import type { ExtendedAddress } from '@/components/checkout/AddressModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading: authLoading } = useAuthStore();
  const {
    items,
    subTotal,
    couponCode,
    couponDiscount,
    clearCoupon,
    giftNote,
    isPickup,
    setIsPickup,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<ExtendedAddress | null>(null);
  const [pickupStore, setPickupStore] = useState<PickupStoreInfo | null>(null);
  const [pickupContact, setPickupContact] = useState({
    name: userDoc?.fullname || (userDoc as any)?.FullName || (userDoc as any)?.name || '',
    phone: userDoc?.phone || (userDoc as any)?.Phone || '',
  });
  const [orderNotes, setOrderNotes] = useState(giftNote || '');
  const [placing, setPlacing] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);
  const { isOpen: storeOpen, closedMessage: storeClosedMsg, openTime } = useStoreStatusStore();

  // Sync userDoc contact to pickupContact once userDoc is ready
  useEffect(() => {
    if (userDoc) {
      setPickupContact((prev) => ({
        name: prev.name || userDoc.fullname || (userDoc as any)?.FullName || (userDoc as any)?.name || '',
        phone: prev.phone || userDoc.phone || (userDoc as any)?.Phone || '',
      }));
    }
  }, [userDoc]);

  // 2. Initialize Cashfree SDK
  useEffect(() => {
    load({ mode: 'production' })
      .then((cf: any) => setCashfree(cf))
      .catch((err) => console.error('Cashfree SDK load error:', err));
  }, []);

  // 3. Auth & Cart Guard
  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [firebaseUser, authLoading, items.length, router]);

  // Keep notes synced if giftNote changes from cart
  useEffect(() => {
    if (giftNote && !orderNotes) {
      setOrderNotes(giftNote);
    }
  }, [giftNote, orderNotes]);

  // 4. Verify payment with server
  const verifyPayment = useCallback(
    async (orderIdToVerify: string) => {
      try {
        const res = await fetch(`/api/cashfree/verify?orderId=${orderIdToVerify}`);
        const verifyData = await res.json();

        if (verifyData.isPaid || verifyData.cfStatus === 'ACTIVE') {
          if (firebaseUser) {
            await clearCart(firebaseUser.uid);
          }
          clearCoupon();
          router.push(`/checkout/success?order_id=${orderIdToVerify}`);
        } else {
          alert('Payment verification failed. Please contact support@falguni.com.');
        }
      } catch (e) {
        console.error('Verification error:', e);
        alert('Verification failed. Please contact support@falguni.com if amount was deducted.');
      } finally {
        setPlacing(false);
      }
    },
    [firebaseUser, clearCoupon, router]
  );

  // 5. Place order & trigger payment gateway
  const handlePlaceOrder = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    if (!storeOpen) {
      alert(`Live order intake is currently paused: ${storeClosedMsg}`);
      return;
    }

    if (isPickup) {
      if (!pickupContact.phone || !pickupContact.phone.trim()) {
        alert('Please provide a mobile phone number for store pickup verification.');
        return;
      }
    } else {
      if (!selectedAddress) {
        alert('Please select or add a delivery address to proceed.');
        return;
      }
    }

    const storeLabel = pickupStore
      ? `${pickupStore.title} - ${pickupStore.address}`
      : 'Falguni Gruh Udhyog - Vastrapur Flagship, Shop No 1, Hirak Complex, Vastrapur, Ahmedabad 380015';

    const fullAddrString = isPickup
      ? `Store Pickup: ${storeLabel}`
      : [
          selectedAddress?.houseNumber,
          selectedAddress?.address || (selectedAddress as any)?.Addresses,
          selectedAddress?.closestbusStop ? `Near ${selectedAddress.closestbusStop}` : '',
        ]
          .filter(Boolean)
          .join(', ');

    if (!isPickup && !fullAddrString.trim()) {
      alert('Selected address is incomplete. Please edit or choose another address.');
      return;
    }

    setPlacing(true);

    try {
      const recipientPhone = isPickup
        ? pickupContact.phone
        : selectedAddress?.phone || userDoc?.phone || (userDoc as any)?.Phone || '9999999999';
      const cleanPhone = recipientPhone.replace(/\D/g, '').slice(-10) || '9999999999';
      const recipientName = isPickup
        ? pickupContact.name || userDoc?.fullname || 'Valued Customer'
        : selectedAddress?.fullName ||
          userDoc?.fullname ||
          (userDoc as any)?.FullName ||
          (userDoc as any)?.name ||
          'Valued Customer';

      const initialOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: initialOrderId,
          customer_details: {
            customer_id: firebaseUser.uid,
            customer_name: recipientName,
            customer_email: firebaseUser.email || 'customer@falguni.com',
            customer_phone: cleanPhone,
          },
          cart_details: {
            isPickup,
            pickupStoreTitle: pickupStore?.title || 'Falguni Gruh Udhyog - Vastrapur Flagship',
            pickupStoreAddress:
              pickupStore?.address ||
              'Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad, Gujarat 380015',
            pickupContactPhone: pickupContact.phone || cleanPhone,
            deliverySpeed: 'standard',
            couponCode: couponCode || '',
            deliveryAddress: fullAddrString,
            phone: cleanPhone,
            fullName: recipientName,
          },
          order_meta: {
            return_url: `${window.location.origin}/checkout/success?order_id={order_id}`,
          },
          order_note: orderNotes.trim() || (isPickup ? 'Store Pickup Order' : 'Falguni Gourmet Order'),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Payment Initialization Failed: ${data.message || 'Please try again.'}`);
        setPlacing(false);
        return;
      }

      const verifiedOrderId = data.order_id || initialOrderId;
      const paymentSessionId = data.payment_session_id;

      if (cashfree && paymentSessionId) {
        const isMobile = window.innerWidth < 768;
        cashfree
          .checkout({
            paymentSessionId,
            redirectTarget: isMobile ? '_self' : '_modal',
          })
          .then((result: any) => {
            if (result.error) {
              alert(result.error.message || 'Payment was cancelled or failed.');
              setPlacing(false);
            }
            if (result.paymentDetails) {
              verifyPayment(verifiedOrderId);
            }
          });
      } else {
        alert('Payment Gateway could not initialize. Please check your internet connection.');
        setPlacing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An unexpected error occurred while preparing your checkout. Please try again.');
      setPlacing(false);
    }
  };

  if (authLoading || !firebaseUser || items.length === 0) {
    return (
      <PageShell>
        <div className="min-h-[60vh] bg-[#FAF7F2] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const sub = subTotal();

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* ── 1. Breadcrumbs ── */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-6 sm:mb-8 font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <Link href="/cart" className="hover:text-[#733617] transition-colors">
              Cart
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <span className="text-[#733617] font-semibold">Checkout</span>
          </nav>

          {/* ── 2. Stepper Progress Tracker ── */}
          <CheckoutStepper currentStep={1} />

          {/* ── Store Closed Alert ── */}
          {!storeOpen && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FFF8EE] border border-[#F3DFC1] text-[#733617] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3.5">
                <span className="text-2xl">🌙</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="font-bold text-sm sm:text-base text-[#2D1508]">Store Orders Currently Paused</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#733617] text-white px-2 py-0.5 rounded">
                      Reopening at {openTime}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#65544A] block mt-0.5">{storeClosedMsg}</span>
                </div>
              </div>
              <Link
                href="/cart"
                className="px-4 py-2 rounded-xl bg-white border border-[#EFE6DC] text-[#733617] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider text-center shrink-0 shadow-2xs"
              >
                Return to Cart
              </Link>
            </div>
          )}

          {/* ── 3. Main 2-Column Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column (8 cols): Address, Delivery Options, Order Notes */}
            <div className="lg:col-span-8 w-full space-y-6">
              {/* 1. Delivery Address / Store Pickup */}
              <DeliveryAddressSection
                userId={firebaseUser.uid}
                userDoc={userDoc}
                isPickup={isPickup}
                onFulfillmentChange={setIsPickup}
                selectedAddressId={selectedAddress?.uid || selectedAddress?.id || null}
                onSelectAddress={setSelectedAddress}
                pickupContact={pickupContact}
                onPickupContactChange={setPickupContact}
                onPickupStoreChange={setPickupStore}
              />

              {/* 2. Order Notes (Optional) */}
              <OrderNotesSection
                notes={orderNotes}
                onNotesChange={setOrderNotes}
                stepNumber={2}
              />
            </div>

            {/* Right Column (4 cols): Order Summary, Trust Badges, Why Shop */}
            <div className="lg:col-span-4 w-full">
              <div className="sticky top-28 space-y-6">
                <CheckoutOrderSummary
                  items={items}
                  subtotal={sub}
                  isPickup={isPickup}
                  freeShippingThreshold={699}
                  couponDiscount={couponDiscount}
                  couponCode={couponCode}
                />

                <WhyShopWithFalguni />
              </div>
            </div>
          </div>

          {/* ── 4. Bottom 100% Secure Checkout Action Bar ── */}
          <CheckoutBottomBar
            onProceed={handlePlaceOrder}
            loading={placing}
            disabled={isPickup ? !pickupContact.phone.trim() : !selectedAddress}
            storeOpen={storeOpen}
          />
        </div>
      </div>
    </PageShell>
  );
}
