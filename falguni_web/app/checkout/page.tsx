'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Truck, CreditCard, CheckCircle, Info, MapPin, Map, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getDeliveryFee, clearCart, getUserDoc } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { load } from '@cashfreepayments/cashfree-js';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STEPS = [
  { id: 0, title: 'Delivery', icon: Truck },
  { id: 1, title: 'Payment', icon: CreditCard },
  { id: 2, title: 'Completed', icon: CheckCircle },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { items, subTotal, discountedTotal, couponCode, couponDiscount, clearCoupon } = useCartStore();

  const [step, setStep] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [pickupBool, setPickupBool] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);

  // Initialize Cashfree SDK
  useEffect(() => {
    load({ mode: "production" }).then((cf: any) => setCashfree(cf));
  }, []);

  // Using Cashfree embedded Drop-in UI. Validation is handled via Promise.

  useEffect(() => {
    if (!firebaseUser) { router.push('/login'); return; }
    if (items.length === 0) { router.push('/cart'); return; }
    getDeliveryFee().then(setDeliveryFee);
    // Pre-fill user data
    getUserDoc(firebaseUser.uid).then((doc: any) => {
      if (doc?.deliveryAddress) setAddress(doc.deliveryAddress as string);
      if (doc?.phone) setPhone(doc.phone as string);
      if (doc?.fullname) setFullName(doc.fullname as string);
    });
  }, [firebaseUser, items.length, router]);

  const discounted = discountedTotal();
  const total = discounted + (pickupBool ? 0 : deliveryFee);

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
            isPickup: pickupBool,
            couponCode: couponCode || '',
            deliveryAddress: address,
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

      if (verifyData.isPaid) {
        // Server-Side Update Confirmed! The draft has been moved to Orders.
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

  if (!firebaseUser || items.length === 0) return <PageShell><div className="min-h-screen bg-[#2B1B17] flex items-center justify-center"><LoadingSpinner /></div></PageShell>;

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-[140px] relative overflow-hidden">
        
        {/* ── Ultra Premium Editorial Hero ── */}
        <div className="relative w-full flex flex-col items-center justify-center pt-32 pb-12 px-4 border-b border-[#D4AF37]/10 mb-12 z-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />

           <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto animate-fade-up w-full">
             <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase text-xs mb-6 flex items-center justify-center gap-6">
               <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
               SECURE ENCRYPTED
               <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
             </span>
             
             <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight" style={{ fontStyle: 'italic', textShadow: '0 0 30px rgba(212,175,55,0.15)' }}>
               Checkout
             </h1>
           </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10">
          
          {/* Custom Stepper */}
          <div className="mb-16 relative">
            <div className="flex items-center justify-between relative z-10">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isPast = step > s.id;
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-4 relative z-10 w-1/3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-700 shadow-2xl ${
                      isActive ? 'bg-[#D4AF37] border-[#D4AF37] scale-110 shadow-[0_0_30px_rgba(212,175,55,0.3)]' : 
                      isPast ? 'bg-[#2B1B17] border-[#D4AF37] text-[#D4AF37]' : 
                      'bg-[#2B1B17] border-white/10 text-white/20'
                    }`}>
                      <Icon size={24} className={isActive ? 'text-[#1A110D]' : ''} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                      isActive ? 'text-[#D4AF37]' : isPast ? 'text-white/80' : 'text-white/20'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Connecting Lines */}
            <div className="absolute top-8 left-[16.6%] right-[16.6%] h-[1px] bg-white/10 z-0">
              <div 
                className="h-full bg-[#D4AF37] transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{ width: `${(step / (STEPS.length - 1)) * 100}%`, boxShadow: '0 0 10px rgba(212,175,55,0.5)' }}
              />
            </div>
          </div>
          
          {/* ── STEP 0: DELIVERY ── */}
          {step === 0 && (
            <div className="animate-fade-up">
              {/* Delivery Types */}
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-[#D4AF37]/20 rounded-[32px] p-8 shadow-2xl backdrop-blur-md mb-12">
                <h2 className="text-white text-2xl font-serif italic mb-6">Fulfillment Method</h2>
                
                {/* Disabled Delivery Option */}
                <button 
                  onClick={() => setShowDeliveryModal(true)}
                  className="w-full text-left bg-black/20 border-2 border-white/5 rounded-2xl p-5 flex items-center gap-5 opacity-50 cursor-pointer hover:border-white/10 transition-all mb-4 group"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                      <Truck size={18} /> Delivery (Unavailable)
                    </h3>
                    <p className="text-white/40 text-xs mt-1 font-medium">Tap for more info regarding delivery services</p>
                  </div>
                </button>

                {/* Pickup Option */}
                <button 
                  onClick={() => setPickupBool(true)}
                  className={`w-full text-left bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-2 rounded-2xl p-5 flex items-center gap-5 transition-all ${
                    pickupBool ? 'border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'border-white/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${pickupBool ? 'border-[#D4AF37]' : 'border-white/50'}`}>
                    {pickupBool && <div className="w-3.5 h-3.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                      <MapPin size={18} className={pickupBool ? 'text-[#D4AF37]' : 'text-white/70'} /> Pick Up
                    </h3>
                    <p className="text-[#D4AF37] text-xs mt-1 font-bold tracking-widest uppercase">Studio Falguni, Ahmedabad</p>
                  </div>
                </button>
              </div>

              {/* Order Summary */}
              <div className="flex items-center gap-4 mb-6 px-2">
                <span className="w-8 h-[1px] bg-[#D4AF37]" />
                <h2 className="text-white text-2xl font-serif italic tracking-wide">Order Details</h2>
              </div>

              <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[32px] p-6 backdrop-blur-sm shadow-2xl mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={item.cartDocId} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-4 group hover:bg-white/[0.03] hover:border-[#D4AF37]/20 transition-all">
                      <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-black/40 border border-white/5 group-hover:border-[#D4AF37]/30 flex items-center justify-center overflow-hidden relative transition-colors">
                         {item.image1 ? (
                            <Image src={item.image1} alt={item.name} fill className="object-cover group-hover:scale-110 transition duration-700" />
                         ) : (
                            <ShoppingBag size={20} className="text-[#D4AF37]/50" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm leading-tight truncate group-hover:text-[#D4AF37] transition-colors">{item.name}</h4>
                        <p className="text-white/40 text-[10px] mt-0.5 font-medium">{item.selected || 'Standard'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="inline-block bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md px-2 py-0.5 text-[#D4AF37] text-[9px] font-black uppercase tracking-wider">Qty: {item.quantity}</span>
                          <span className="text-white font-black text-sm tracking-tight">₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-[#D4AF37] hover:bg-white text-[#1A110D] py-6 rounded-[20px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-500 group"
              >
                Proceed to Payment <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>
          )}

          {/* ── STEP 1: PAYMENT ── */}
          {step === 1 && (
            <div className="animate-fade-up">
              {/* Header */}
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-[#D4AF37]/20 rounded-[32px] p-8 mb-10 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none -translate-y-1/4 translate-x-1/4">
                   <CreditCard size={150} className="text-[#D4AF37] -rotate-12" />
                </div>
                <div className="bg-[#D4AF37] p-4 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] relative z-10">
                  <CreditCard size={28} className="text-[#1A110D]" />
                </div>
                <div className="text-center sm:text-left relative z-10">
                  <h2 className="text-white font-serif italic text-3xl mb-2">Secure Checkout</h2>
                  <p className="text-white/50 text-sm font-medium">Select how you want to pay for your premium order</p>
                </div>
              </div>

              <h3 className="text-white/80 font-bold text-xs uppercase tracking-widest mb-6 px-2 flex items-center gap-3">
                <span className="w-4 h-[1px] bg-[#D4AF37]" /> Available Methods
              </h3>
              
              <div className="flex flex-col gap-5 mb-12">
                {/* Online Payment */}
                <div 
                  className="w-full text-left bg-gradient-to-r from-white/[0.02] to-transparent border-2 border-[#D4AF37] bg-[#D4AF37]/[0.02] shadow-[0_0_30px_rgba(212,175,55,0.15)] rounded-[24px] p-6 flex items-center gap-6"
                >
                  <div className="p-4 rounded-xl bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <CreditCard size={24} className="text-[#1A110D]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg tracking-wide mb-1">Online Payment</h3>
                    <p className="text-white/50 text-xs font-medium">Pay securely using Cards, UPI, or Net Banking</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                    <div className="w-3.5 h-3.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                  </div>
                </div>
              </div>

              {/* Order Summary Pricing */}
              <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-[#D4AF37]/20 rounded-[32px] p-8 backdrop-blur-sm shadow-2xl mb-12">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60 text-base font-medium">Subtotal</span>
                  <span className="text-white font-bold text-lg tracking-wide">₹{subTotal().toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center mb-6 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                    <span className="text-green-400 text-sm font-black uppercase tracking-wider flex items-center gap-2">Discount (-{couponDiscount}%)</span>
                    <span className="text-green-400 font-bold text-lg tracking-wide">-₹{(subTotal() - discounted).toFixed(2)}</span>
                  </div>
                )}
                {!pickupBool && (
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/60 text-base font-medium">Delivery Fee</span>
                    <span className="text-white font-bold text-lg tracking-wide">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-8" />
                <div className="flex justify-between items-end">
                  <span className="text-white/80 font-black text-sm uppercase tracking-widest">Total Amount</span>
                  <span className="text-[#D4AF37] text-5xl font-black tracking-tight drop-shadow-md">₹{total.toFixed(0)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={() => setStep(0)}
                  className="w-full sm:w-1/3 py-6 bg-transparent hover:bg-white/5 border-2 border-white/20 hover:border-white/40 text-white rounded-[20px] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="flex-1 bg-[#D4AF37] hover:bg-white text-[#1A110D] py-6 rounded-[20px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all duration-500 disabled:opacity-50 group"
                >
                  {placing ? 'Processing...' : 'Pay Securely'}
                  {!placing && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: COMPLETED ── */}
          {step === 2 && (
            <div className="animate-fade-up text-center py-10">
              <div className="w-32 h-32 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                <CheckCircle size={64} className="text-green-400 relative z-10 animate-bounce" />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-4">Order Placed Successfully!</h1>
              <p className="text-white/50 text-sm md:text-base mb-12 max-w-md mx-auto leading-relaxed">
                Thank you for your purchase. Your premium order is now being processed by Studio Falguni.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/profile')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">
                  Track Order
                </button>
                <button onClick={() => router.push('/products')} className="px-8 py-4 bg-[#D4AF37] hover:bg-[#C5A028] text-[#1A110D] font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Delivery Unavailable Modal */}
        {showDeliveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#2B1B17] border border-[#D4AF37]/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
              <h3 className="text-[#D4AF37] text-lg font-bold mb-4">Delivery Service Update</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Sorry, Porter is currently not working and we are working on this.
                <br/><br/>
                Please add your desired location and contact info to <strong>falgunigruhudhyog@gmail.com</strong> and we will help you with delivery.
              </p>
              <button 
                onClick={() => setShowDeliveryModal(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-[#D4AF37] font-bold py-3 rounded-xl transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
