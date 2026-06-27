'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Truck, CreditCard, CheckCircle, Info, MapPin, Map, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getDeliveryFee, clearCart, getUserDoc } from '@/lib/firestore';
import DeliveryAddressInput from '@/components/ui/DeliveryAddressInput';
import StorePickupCard from '@/components/cart/StorePickupCard';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { load } from '@cashfreepayments/cashfree-js';
import PageShell from '@/components/layout/PageShell';

import { ProductsModel } from '@/types';
import { limit } from 'firebase/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BackButton from '@/components/ui/BackButton';


const STEPS = [
  { id: 0, title: 'Delivery', icon: Truck },
  { id: 1, title: 'Payment', icon: CreditCard },
  { id: 2, title: 'Completed', icon: CheckCircle },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const { items, subTotal, discountedTotal, couponCode, couponDiscount, clearCoupon, isPickup, deliveryDetails } = useCartStore();

  const [address, setAddress] = useState(deliveryDetails?.address || '');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);

  // Initialize Cashfree SDK
  useEffect(() => {
    load({ mode: "production" }).then((cf: any) => setCashfree(cf));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) { router.push('/login'); return; }
    if (items.length === 0) { router.push('/cart'); return; }
    
    getUserDoc(firebaseUser.uid).then((doc: any) => {
      if (!isPickup && !deliveryDetails?.address) {
         // Fallback if somehow global store missed the address
         let fullAddress = (doc?.DeliveryAddress || doc?.deliveryAddress || '') as string;
         if (fullAddress && doc?.HouseNumber) {
           fullAddress = `${doc.HouseNumber}, ${fullAddress}`;
         }
         setAddress(fullAddress);
      }
      
      if (doc?.phone || doc?.Phone) setPhone((doc.phone || doc.Phone) as string);
      if (doc?.fullname || doc?.FullName || doc?.name) setFullName((doc.fullname || doc.FullName || doc.name) as string);
    });
  }, [firebaseUser, authLoading, items.length, router, isPickup, deliveryDetails]);

  const sub = subTotal();
  const discounted = discountedTotal();
  const deliveryFee = useCartStore(s => s.deliveryFee());
  const total = discounted + deliveryFee;


  
  

  const placeOrder = async () => {
    if (!firebaseUser) return;
    setPlacing(true);
    try {
      const generatedOrderId = Math.floor(Math.random() * 900000) + 100000;
      let cashfreeOrderId = 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      
      let paymentSessionId = null;

      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: cashfreeOrderId,
          customer_details: {
            customer_id: firebaseUser.uid,
            customer_name: fullName || 'Guest User',
            customer_email: firebaseUser.email || 'guest@example.com',
            customer_phone: phone.replace(/\D/g, '').slice(-10) || '9999999999',
          },
          cart_details: {
            isPickup: isPickup,
            couponCode: couponCode || '',
            deliveryAddress: isPickup ? '' : (deliveryDetails?.address || address || ''),
            deliveryLat: isPickup ? null : (deliveryDetails?.lat || null),
            deliveryLng: isPickup ? null : (deliveryDetails?.lng || null),
            deliveryTier: isPickup ? null : (deliveryDetails?.tier || null),
            phone: phone,
            fullName: fullName,
          },
          order_meta: {
            return_url: `${window.location.origin}/checkout/success?order_id={order_id}`
          },
          order_note: 'Falguni Web Order',
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        alert(`Payment Initialization Failed: ${data.message}`);
        setPlacing(false);
        return;
      }
      cashfreeOrderId = data.order_id;
      paymentSessionId = data.payment_session_id;

      // DraftOrder is now securely constructed on the backend inside create-order!

      // 2. Trigger Cashfree Embedded Checkout UI (Seamless Modal Overlay or Mobile Redirect)
      if (cashfree && paymentSessionId) {
        const isMobile = window.innerWidth < 768;
        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: isMobile ? "_self" : "_modal"
        }).then((result: any) => {
          if (result.error) {
            alert(result.error.message || 'Payment Failed or Cancelled');
            setPlacing(false);
          }
          if (result.paymentDetails) {
            // Payment completed successfully according to frontend, now verify server-to-server!
            verifyPayment(cashfreeOrderId);
          }
        });
      } else {
        alert("Payment Gateway failed to load or initialize. Please check your connection.");
        setPlacing(false);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while placing the order. Please try again.');
      setPlacing(false);
    }
  };

  const verifyPayment = async (orderIdToVerify: string) => {
    try {
      const res = await fetch(`/api/cashfree/verify?orderId=${orderIdToVerify}`);
      const verifyData = await res.json();

      if (verifyData.isPaid || verifyData.cfStatus === 'ACTIVE') {
        // Server-Side Update Confirmed! The draft has been moved to Orders (or will be soon via Webhook).
        await clearCart(firebaseUser!.uid);
        clearCoupon();
        setStep(2); // Show success screen
      } else {
        alert('Payment verification failed. Please contact support@falguni.com.');
      }
    } catch (e) {
      console.error('Verification error:', e);
      alert('Verification failed. Please contact support@falguni.com if money was deducted.');
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading || !firebaseUser || items.length === 0) return <PageShell><div className="min-h-screen bg-[#2B1B17] flex items-center justify-center"><LoadingSpinner /></div></PageShell>;

  
  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20">
        
        {/* Header Banner */}
        <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-24 pb-8 md:pt-32 md:pb-12 flex flex-col items-center justify-center mb-6 md:mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 text-center px-4 w-full">
            <h1 className="animate-fade-up font-serif text-3xl md:text-5xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              Review & Pay
            </h1>
            <p className="text-white/50 text-xs md:text-sm mt-3 uppercase tracking-widest">Final Step</p>
          </div>
        </div>

        <div className="container max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-10 backdrop-blur-sm shadow-2xl mb-8">
             
             {/* Order Details Header */}
             <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 border-b border-white/10 pb-4">
               <span className="w-6 md:w-8 h-[1px] bg-[#D4AF37]" />
               <h2 className="text-white text-xl md:text-2xl font-serif italic tracking-wide">Order Confirmation</h2>
             </div>

             {/* Items Review */}
             <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {items.map((item, idx) => (
                  <div key={item.cartDocId} className="p-3 md:p-4 mb-3 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 flex items-center gap-3 md:gap-4 group hover:bg-white/[0.03] hover:border-[#D4AF37]/20 transition-all">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-xs md:text-sm leading-tight truncate group-hover:text-[#D4AF37] transition-colors">{item.name}</h4>
                      <p className="text-white/40 text-[9px] md:text-[10px] mt-0.5 font-medium">{item.selected || 'Standard'}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-white font-black text-xs md:text-sm tracking-tight">₹{item.price}</span>
                       <span className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] md:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mt-1">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
             </div>

             {/* Delivery Status */}
             {isPickup ? (
               <div className="mb-8">
                 <StorePickupCard />
               </div>
             ) : (
               <div className="bg-black/20 rounded-2xl p-4 md:p-6 border border-white/5 mb-8">
                  <h3 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Fulfillment Method</h3>
                  <div>
                    <p className="text-white font-bold text-sm md:text-base">Delivery</p>
                    <p className="text-white/50 text-xs mt-1">{deliveryDetails?.address || address}</p>
                  </div>
               </div>
             )}

             {/* Financials */}
             <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-[#D4AF37]/20 rounded-2xl p-5 md:p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/50 text-sm font-medium">Subtotal</span>
                  <span className="text-white font-bold">₹{subTotal().toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-400 text-xs font-black uppercase tracking-wider">Discount ({couponCode})</span>
                    <span className="text-green-400 font-bold">-₹{(subTotal() - discounted).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/50 text-sm font-medium">{isPickup ? 'Pickup Fee' : 'Delivery Fee'}</span>
                  <span className="text-white font-bold">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent mb-4" />
                <div className="flex justify-between items-end">
                  <span className="text-white/70 font-black text-xs uppercase tracking-widest">Total to Pay</span>
                  <span className="text-[#D4AF37] text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">₹{total.toFixed(2)}</span>
                </div>
             </div>

             <button
               onClick={placeOrder}
               disabled={placing}
               className="w-full bg-[#D4AF37] hover:bg-white text-[#1A110D] py-4 md:py-5 rounded-xl md:rounded-[20px] font-black text-xs md:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-500 group disabled:opacity-50"
             >
               {placing ? <LoadingSpinner /> : 'Complete Secure Payment'}
             </button>
          </div>
        </div>
      </div>
    </PageShell>
  );

}
