'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSettingsStore } from '@/store/settingsStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Tag, 
  Copy, 
  CheckCircle2, 
  Scissors, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Percent,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface CouponModel {
  uid: string;
  coupon?: string;
  code?: string;
  percentage?: number;
  discount?: number;
  title?: string;
  description?: string;
  minOrder?: number;
  expiry?: string;
}

export default function PromoCodesPage() {
  const { enableCoupons } = useSettingsStore();
  const [coupons, setCoupons] = useState<CouponModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const snap = await getDocs(collection(db, 'Coupons'));
        const fetched = snap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as CouponModel[];
        setCoupons(fetched);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 sm:pb-28">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Exclusive Offers & Coupons</span>
          </nav>

          {/* Hero Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EBE1] via-[#FAF7F2] to-[#EFE6DC] border border-[#EFE6DC] p-6 sm:p-10 mb-10 shadow-xs">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[#EFE6DC]">
                <Sparkles size={13} className="text-[#733617]" />
                <span>કૂપન અને ઑફર્સ • EXCLUSIVE VOUCHERS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2D1508] tracking-tight mb-3">
                {enableCoupons ? 'Exclusive Offers & Coupons' : 'Coupons Temporarily Paused'}
              </h1>
              <p className="text-sm sm:text-base text-[#733617]/85 leading-relaxed">
                {enableCoupons
                  ? 'Enjoy hand-curated savings on our authentic Gujarati sweets, savory namkeens, and festive specials. Copy any code below and apply it directly at checkout!'
                  : 'Promotional coupon codes are currently paused by the store. Exclusive seasonal savings and festive offers will return soon!'}
              </p>
            </div>

            {/* Decorative background embellishment */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 rounded-full bg-[#733617]/5 pointer-events-none blur-2xl" />
          </div>

          {/* Main Content */}
          {!enableCoupons ? (
            <div className="text-center py-20 bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 shadow-xs max-w-xl mx-auto">
              <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#733617]">
                <Tag size={28} />
              </div>
              <h3 className="text-2xl text-[#2D1508] font-serif font-bold mb-2">Coupons Currently Paused</h3>
              <p className="text-[#733617]/80 text-sm leading-relaxed mb-6">
                Promotional coupon codes are currently paused by the store. You can still explore our entire catalog of handcrafted snacks and sweets!
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5c2b12] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                <ShoppingBag size={15} />
                Explore Delicacies
              </Link>
            </div>
          ) : loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner />
              <p className="text-xs font-medium text-[#733617]/70">Checking available offers...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 shadow-xs max-w-xl mx-auto">
              <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#733617]">
                <Tag size={28} />
              </div>
              <h3 className="text-2xl text-[#2D1508] font-serif font-bold mb-2">No Active Promotions Today</h3>
              <p className="text-[#733617]/80 text-sm leading-relaxed mb-6">
                We are preparing exciting festive offers! Follow our updates or explore our everyday fresh assortment now.
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5c2b12] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                <ShoppingBag size={15} />
                Explore Specialties
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Vouchers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => {
                  const codeString = coupon.coupon || coupon.code || 'FALGUNI';
                  const discountVal = coupon.percentage ?? coupon.discount ?? 10;
                  const isCopied = copiedId === coupon.uid;

                  return (
                    <div 
                      key={coupon.uid}
                      className="relative group bg-white rounded-3xl border border-[#EFE6DC] shadow-xs hover:shadow-md hover:border-[#733617]/50 transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      {/* Left and Right Perforation Notches */}
                      <div className="absolute top-[65%] -left-3 w-6 h-6 rounded-full bg-[#FAF7F2] border-r border-[#EFE6DC] z-10 pointer-events-none" />
                      <div className="absolute top-[65%] -right-3 w-6 h-6 rounded-full bg-[#FAF7F2] border-l border-[#EFE6DC] z-10 pointer-events-none" />

                      {/* Card Header & Discount Badge */}
                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#733617] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#EFE6DC] mb-3">
                              <Tag size={11} />
                              Verified Voucher
                            </span>
                            <div className="flex items-baseline gap-1 text-[#733617]">
                              <span className="text-4xl sm:text-5xl font-serif font-black tracking-tight">{discountVal}%</span>
                              <span className="text-xl sm:text-2xl font-serif font-bold uppercase">OFF</span>
                            </div>
                          </div>
                          
                          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] group-hover:scale-105 transition-transform">
                            <Percent size={22} />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-[#2D1508] font-serif font-bold text-lg mb-1">
                            {coupon.title || `Special ${discountVal}% Discount`}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#733617]/80 line-clamp-2 leading-relaxed">
                            {coupon.description || `Valid on authentic Gujarati sweets, fresh namkeens, and gourmet grocery items.`}
                          </p>
                        </div>
                      </div>

                      {/* Perforated Divider */}
                      <div className="relative px-6 flex items-center">
                        <div className="w-full border-t border-dashed border-[#EFE6DC]" />
                        <span className="absolute right-6 -top-2.5 bg-white px-1 text-[#733617]/50">
                          <Scissors size={12} />
                        </span>
                      </div>

                      {/* Card Footer: Voucher Code & Copy Action */}
                      <div className="p-6 sm:p-7 pt-5 bg-gradient-to-b from-white to-[#FAF7F2]/50 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl px-4 py-2.5 flex items-center justify-between group-hover:border-[#733617]/30 transition-colors">
                            <span className="text-xs text-[#733617]/70 font-semibold uppercase tracking-wider">Code</span>
                            <span className="text-base sm:text-lg font-mono font-bold text-[#2D1508] tracking-widest select-all">
                              {codeString}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(codeString, coupon.uid)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                              isCopied 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-[#733617] hover:bg-[#5a2a12] text-white'
                            }`}
                            title="Copy Promo Code"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle2 size={15} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={15} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#733617]/70 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> Limited Period Offer
                          </span>
                          <Link 
                            href="/shop"
                            className="font-bold text-[#733617] hover:underline inline-flex items-center gap-1"
                          >
                            Shop Now <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* "How to Redeem" Guide Section */}
              <div className="mt-14 rounded-3xl bg-white border border-[#EFE6DC] p-8 sm:p-10 shadow-xs">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#733617] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFE6DC]">
                    Easy Savings
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] mt-3 mb-2">
                    How to Redeem Your Voucher
                  </h2>
                  <p className="text-xs sm:text-sm text-[#733617]/80">
                    Claim your savings in three simple steps when shopping with Falguni Gruh Udhyog.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#FAF7F2]/60 border border-[#EFE6DC]">
                    <div className="w-12 h-12 rounded-2xl bg-[#733617] text-white font-serif font-bold text-lg flex items-center justify-center mb-4 shadow-2xs">
                      1
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2D1508] mb-1.5">Pick Your Delicacies</h3>
                    <p className="text-xs text-[#733617]/80 leading-relaxed">
                      Explore our handpicked collection of fresh namkeens, authentic sweets, and spices, and add items to your cart.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#FAF7F2]/60 border border-[#EFE6DC]">
                    <div className="w-12 h-12 rounded-2xl bg-[#733617] text-white font-serif font-bold text-lg flex items-center justify-center mb-4 shadow-2xs">
                      2
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2D1508] mb-1.5">Copy the Promo Code</h3>
                    <p className="text-xs text-[#733617]/80 leading-relaxed">
                      Tap the "Copy" button on any active coupon above to copy the voucher code instantly to your clipboard.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#FAF7F2]/60 border border-[#EFE6DC]">
                    <div className="w-12 h-12 rounded-2xl bg-[#733617] text-white font-serif font-bold text-lg flex items-center justify-center mb-4 shadow-2xs">
                      3
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2D1508] mb-1.5">Apply at Checkout</h3>
                    <p className="text-xs text-[#733617]/80 leading-relaxed">
                      Paste the code in the 'Have a coupon?' section on the checkout page to enjoy immediate savings on your order.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#EFE6DC] text-center">
                  <Link 
                    href="/shop"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#733617] hover:underline"
                  >
                    Start Shopping Authentic Delicacies <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
