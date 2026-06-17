'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingCart, CheckCircle, TrendingDown, Tag, ArrowRight, Info, Flashlight, Gift, Share2, Link as LinkIcon } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { removeFromCart, updateCartItem, validateCoupon, getDeliveryFee, getCoupons } from '@/lib/firestore';
import type { CouponModel } from '@/types';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const { items, subTotal, discountedTotal, couponCode, couponDiscount, setCoupon, clearCoupon } = useCartStore();
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [popularCoupons, setPopularCoupons] = useState<CouponModel[]>([]);

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee);
    getCoupons(3).then(setPopularCoupons);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && firebaseUser === null) {
      router.push('/login');
    }
  }, [firebaseUser, authLoading, router]);

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
      setCouponInput('');
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
    setCouponLoading(false);
  };

  const sub = subTotal();
  const discounted = discountedTotal();
  const total = discounted + deliveryFee;

  if (authLoading || !firebaseUser) return <PageShell><div className="min-h-screen bg-[#2B1B17] flex items-center justify-center"><LoadingSpinner /></div></PageShell>;

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-[140px] relative overflow-hidden">
        
        {/* ── Ultra Premium Editorial Hero ── */}
        <div className="relative w-full flex flex-col items-center justify-center pt-32 pb-12 px-4 border-b border-[#D4AF37]/10 mb-8 z-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />

           <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto animate-fade-up w-full">
             <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase text-xs mb-6 flex items-center justify-center gap-6">
               <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
               YOUR SELECTION
               <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
             </span>
             
             <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight" style={{ fontStyle: 'italic', textShadow: '0 0 30px rgba(212,175,55,0.15)' }}>
               The Cart
             </h1>
           </div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 px-4 md:px-8">
          {items.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-[#D4AF37]/10 rounded-3xl backdrop-blur-sm animate-fade-up max-w-3xl mx-auto">
              <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <ShoppingCart size={40} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-4xl font-serif text-white mb-4 italic tracking-tight">Your cart is empty</h3>
              <p className="text-white/50 text-base max-w-md mb-10 leading-relaxed">
                You haven't added any creations to your cart. Explore our curated collections to discover your next obsession.
              </p>
              <Link 
                href="/products"
                className="group relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
                <div className="relative bg-[#D4AF37] text-[#2B1B17] font-bold tracking-[0.2em] uppercase text-xs px-10 py-4 rounded-full transition-transform group-hover:scale-[1.02]">
                  Explore Collections
                </div>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 animate-fade-up">
              
              {/* ── LEFT COLUMN: ITEMS ── */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-white text-2xl font-serif italic tracking-wide">
                    Cart Items ({items.length})
                  </h2>
                </div>

                <div className="flex flex-col gap-6">
                  {items.map((item, idx) => {
                    const pricePerUnit = item.selectedPrice ?? item.unitPrice1 ?? 0;
                    return (
                      <div 
                        key={item.cartDocId} 
                        className="group bg-transparent border-b border-white/5 pb-6 flex flex-col sm:flex-row gap-6 animate-fade-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Image */}
                        <Link href={`/products/${item.uid}`} className="flex-shrink-0">
                          <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-black/40 relative border border-white/5 group-hover:border-[#D4AF37]/30 transition-colors">
                            {item.image1 ? (
                              <Image src={item.image1} alt={item.name} fill sizes="(max-width: 768px) 100vw, 150px" className="object-cover group-hover:scale-110 transition duration-700" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center opacity-30"><ShoppingCart size={32} className="text-[#D4AF37]" /></div>
                            )}
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                              {item.selected && (
                                <span className="inline-block bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2">
                                  {item[`unitname${item.selected.replace('unit', '')}` as keyof typeof item] as string}
                                </span>
                              )}
                              <p className="text-white/40 text-xs font-medium">₹{pricePerUnit} each</p>
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                              ₹{item.price ?? 0}
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl overflow-hidden h-10">
                              <button
                                onClick={() => handleQtyChange(item.cartDocId, -1, item.quantity ?? 1, pricePerUnit)}
                                className="w-10 h-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2B1B17] transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-12 text-center text-sm font-bold text-white">{item.quantity ?? 1}</span>
                              <button
                                onClick={() => handleQtyChange(item.cartDocId, 1, item.quantity ?? 1, pricePerUnit)}
                                className="w-10 h-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2B1B17] transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemove(item.cartDocId)}
                              disabled={removingId === item.cartDocId}
                              className="text-white/40 hover:text-red-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT COLUMN: SUMMARY ── */}
              <div className="lg:col-span-5 xl:col-span-4 relative">
                <div className="lg:sticky lg:top-32 flex flex-col gap-6">
                  
                  {/* Order Summary Card */}
                  <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-[#D4AF37]/20 rounded-[32px] p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <ShoppingCart size={150} className="text-[#D4AF37] -rotate-12" />
                    </div>

                    <h2 className="text-white text-2xl font-serif italic mb-8 relative z-10">Order Summary</h2>

                    <div className="flex justify-between items-center mb-5 relative z-10">
                      <span className="text-white/60 font-medium text-sm">Subtotal</span>
                      <span className="text-white font-bold tracking-wide">₹{sub.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <span className="text-white/60 font-medium text-sm">Delivery Fee</span>
                      <span className="text-white font-bold tracking-wide">{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent mb-6" />

                    <div className="flex justify-between items-end mb-4 relative z-10">
                      <span className="text-white/80 text-base font-bold uppercase tracking-widest">Total</span>
                      <div className="flex flex-col items-end">
                        {couponDiscount > 0 && (
                          <span className="text-white/40 text-sm font-bold line-through decoration-red-400/50 mb-1">
                            ₹{(sub + deliveryFee).toFixed(2)}
                          </span>
                        )}
                        <span className="text-[#D4AF37] text-4xl font-black tracking-tight drop-shadow-md">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Applied Coupon Info INSIDE Order Summary (Matches App) */}
                    {couponDiscount > 0 && (
                      <div className="mt-2 mb-4 bg-gradient-to-r from-green-500/15 to-green-500/5 border border-green-500/40 rounded-xl p-4 flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                          <TrendingDown size={18} className="text-green-500" />
                          <span className="text-green-500 text-sm font-bold uppercase tracking-wide">You're saving big!</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500/20 px-2 py-1 rounded text-green-400 font-black text-sm">
                            -{couponDiscount}%
                          </div>
                          <button onClick={clearCoupon} className="text-red-400 text-xs font-bold uppercase tracking-wider hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20">
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Desktop Checkout Button */}
                    <div className="hidden lg:block mt-8 relative z-10">
                      <Link href="/checkout" className="group relative block w-full">
                        <div className="absolute inset-0 bg-[#D4AF37] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                        <div className="relative bg-[#D4AF37] text-[#1A110D] font-black tracking-[0.2em] uppercase text-sm py-5 rounded-2xl flex justify-center items-center gap-3 transition-transform group-hover:scale-[1.02]">
                          Checkout Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>

                    {/* Guarantee Badge */}
                    <div className="hidden lg:flex items-center justify-center gap-2 mt-6 text-white/40 text-xs font-medium">
                      <Info size={14} /> Secure Checkout Guarantee
                    </div>
                  </div>

                  {/* Conditional Cards */}
                  {!couponCode ? (
                    <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-[#D4AF37]/20 rounded-[24px] p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <Tag size={18} className="text-[#D4AF37]" />
                        <h3 className="text-[#D4AF37] font-extrabold tracking-wide text-sm uppercase">Apply Coupon</h3>
                      </div>
                      <div className="flex gap-3 mb-6">
                        <input
                          type="text"
                          placeholder="ENTER CODE"
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          className="flex-1 bg-black/50 border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none font-bold uppercase tracking-widest text-xs transition"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="bg-white/10 text-white hover:bg-[#D4AF37] hover:text-[#1A110D] border border-white/10 px-6 rounded-xl font-bold tracking-widest uppercase text-xs transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className="text-red-400 text-xs mt-[-10px] mb-4 font-medium ml-1 flex items-center gap-1"><Info size={12} />{couponError}</p>}

                      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent mb-5" />

                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-4 bg-[#D4AF37] rounded-full" />
                        <h4 className="text-white/80 font-bold text-xs uppercase tracking-widest">Popular Offers</h4>
                      </div>

                      {popularCoupons.length === 0 ? (
                        <p className="text-white/40 text-xs text-center py-4">No offers available</p>
                      ) : (
                        <div className="flex flex-col gap-3 mb-4">
                          {popularCoupons.map((c, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center group hover:border-[#D4AF37]/30 transition-colors">
                              <div className="flex flex-col gap-1">
                                <span className="text-[#D4AF37] font-black text-sm">{c.percentage}% OFF</span>
                                <span className="text-white/50 text-xs truncate max-w-[150px]">{c.title || 'Special Discount'}</span>
                              </div>
                              <button 
                                onClick={() => setCouponInput(c.coupon)}
                                className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest group-hover:bg-[#D4AF37] group-hover:text-[#1A110D] transition-colors"
                              >
                                {c.coupon}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <Link href="/coupon" className="flex items-center justify-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-2">
                        View all offers <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* Refer a Friend Block (Only shows when Coupon is Applied, matching App) */}
                      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 rounded-[24px] p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                          <Gift size={120} className="text-purple-400 -rotate-12" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-5 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Share2 size={18} className="text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm tracking-wide">Refer & Earn</h3>
                            <p className="text-white/60 text-xs">Invite friends & earn rewards</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10 mb-6">
                          <div className="bg-white/5 border border-purple-500/20 rounded-xl p-3 flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">You Share</span>
                              <span className="text-purple-300 font-bold text-xs mt-0.5">Your unique link</span>
                            </div>
                            <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                              <LinkIcon size={14} className="text-purple-300" />
                            </div>
                          </div>
                          <div className="bg-white/5 border border-green-500/20 rounded-xl p-3 flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">They Get</span>
                              <span className="text-green-400 font-bold text-xs mt-0.5">Special discount</span>
                            </div>
                            <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                              <Gift size={14} className="text-green-400" />
                            </div>
                          </div>
                        </div>

                        <Link href="/referral-page" className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all z-10 overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                          View Referral Program <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}
        </div>

        {/* Sticky Checkout Bottom Bar (Mobile Only) */}
        {items.length > 0 && (
          <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#1A110D] via-[#1A110D]/95 to-transparent pt-16 pb-6 px-4 md:px-8 pointer-events-none lg:hidden border-t border-white/5">
            <div className="w-full pointer-events-auto">
              <Link href="/checkout" className="group relative block w-full">
                <div className="absolute inset-0 bg-[#D4AF37] rounded-2xl blur opacity-30 transition duration-500" />
                <div className="relative bg-[#D4AF37] text-[#1A110D] font-black tracking-[0.2em] uppercase text-sm py-5 rounded-2xl flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  Checkout Now <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
