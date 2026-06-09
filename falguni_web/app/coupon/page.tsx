'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Tag, Copy, CheckCircle2, Scissors } from 'lucide-react';
import Link from 'next/link';

interface CouponModel {
  uid: string;
  coupon: string;
  percentage: number;
  title?: string;
}

export default function PromoCodesPage() {
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
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] relative pb-32">
        {/* ── Ultra Premium Editorial Hero ── */}
        <div className="relative w-full min-h-[40vh] flex flex-col items-center justify-center pt-32 pb-12 px-4 border-b border-[#D4AF37]/10 mb-8 z-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />

           <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto animate-fade-up w-full">
             {/* Back Button */}
             <div className="absolute top-0 left-0 -mt-16 md:-mt-20">
               <Link 
                 href="/profile" 
                 className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4AF37] transition-colors text-xs font-bold uppercase tracking-widest"
               >
                 <ArrowLeft size={16} /> Back to Profile
               </Link>
             </div>

             <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase text-xs mb-6 flex items-center justify-center gap-6">
               <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
               PROMOTIONS
               <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
             </span>
             
             <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight" style={{ fontStyle: 'italic', textShadow: '0 0 30px rgba(212,175,55,0.15)' }}>
               Exclusive Offers
             </h1>
             
             <p className="mt-8 text-white/50 font-light max-w-md mx-auto text-sm tracking-wide">
               Unlock premium savings on your favorite authentic delicacies. Apply these codes at checkout.
             </p>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full px-5 md:px-8 relative z-10">

          {/* Content */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[32px]">
              <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag size={32} className="text-[#D4AF37]/50" />
              </div>
              <h3 className="text-xl text-white font-serif mb-2">No active promotions</h3>
              <p className="text-white/40">Check back later for exclusive Falguni offers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.uid}
                  className="relative group overflow-hidden bg-[#1A110D] rounded-3xl border border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-[#D4AF37]/50 transition-all duration-500"
                >
                  {/* Dashed Gold Border (Ticket Style) */}
                  <div className="absolute inset-2 border-2 border-dashed border-[#D4AF37]/20 rounded-2xl pointer-events-none group-hover:border-[#D4AF37]/40 transition-colors" />
                  
                  {/* Scissor Icon Decor */}
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#1A110D] px-2 opacity-50">
                    <Scissors size={14} className="text-[#D4AF37]" />
                  </div>

                  <div className="p-8 relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-[#D4AF37] text-4xl md:text-5xl font-serif italic mb-1 drop-shadow-md">
                          {coupon.percentage}% <span className="text-2xl">OFF</span>
                        </h2>
                        {coupon.title && (
                          <p className="text-white/60 text-sm font-medium tracking-wide">
                            {coupon.title}
                          </p>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/30 shadow-inner">
                        <Tag size={20} className="text-[#D4AF37]" />
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-dashed border-[#D4AF37]/20 flex items-center justify-between gap-4">
                      <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 flex-1 text-center">
                        <span className="text-white font-bold tracking-[0.2em] text-lg uppercase drop-shadow-sm">
                          {coupon.coupon}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleCopy(coupon.coupon, coupon.uid)}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          copiedId === coupon.uid 
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                            : 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A110D]'
                        }`}
                        title="Copy Code"
                      >
                        {copiedId === coupon.uid ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
