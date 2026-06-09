'use client';

import { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Gift, Copy, Share2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ReferralPage() {
  const { userDoc, loading: authLoading } = useAuthStore();
  const [reward, setReward] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'ReferralSettings', 'settings'));
        if (snap.exists()) {
          setReward(snap.data().referralReward);
          setIsActive(snap.data().referralStatus ?? true);
        }
      } catch (err) {
        console.error('Failed to fetch referral settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const referralCode = userDoc?.personalReferralCode || 'FALGUNI-GUEST';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Falguni Gruh Udhyog',
          text: `Use my code ${referralCode} to get exclusive discounts on authentic Gujarati snacks & sweets!`,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      handleCopy();
    }
  };

  if (authLoading || loading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#2B1B17] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] relative pb-32 overflow-hidden">
        {/* ── Ultra Premium Editorial Hero ── */}
        <div className="relative w-full min-h-[40vh] flex flex-col items-center justify-center pt-32 pb-12 px-4 border-b border-[#D4AF37]/10 mb-8 z-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] animate-pulse-gold pointer-events-none" />

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
               SHARE & EARN
               <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
             </span>
             
             <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight" style={{ fontStyle: 'italic', textShadow: '0 0 30px rgba(212,175,55,0.15)' }}>
               Invite Friends
             </h1>
             
             {isActive ? (
               <p className="mt-8 text-white/50 font-light max-w-md mx-auto text-sm tracking-wide">
                 Share your exclusive referral code with friends and family. {reward ? `They get a discount, and you earn ₹${reward} towards your next purchase!` : 'You both earn rewards on their first order!'}
               </p>
             ) : (
               <p className="mt-8 text-white/50 font-light max-w-md mx-auto text-sm tracking-wide">
                 Our referral program is currently paused. Check back later for new rewards!
               </p>
             )}
           </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 relative z-10 flex flex-col items-center text-center">

          {isActive && (
            <div className="w-full max-w-md mx-auto">
              <div className="bg-[#1A110D] border border-[#D4AF37]/30 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
                
                <p className="text-[#D4AF37]/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Your Unique Code</p>
                
                <div className="bg-black/50 border border-white/5 rounded-2xl py-4 mb-6 flex justify-center items-center">
                  <span className="text-white text-3xl md:text-4xl font-serif font-bold tracking-wider drop-shadow-md selection:bg-[#D4AF37]/30">
                    {referralCode}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all ${
                      copied 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : 'bg-white/5 text-white/90 hover:bg-white/10 hover:text-[#D4AF37] border border-white/10'
                    }`}
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold tracking-wider uppercase text-xs bg-[#D4AF37] text-[#1A110D] hover:bg-[#E5C158] transition-colors border border-transparent shadow-[0_5px_15px_rgba(212,175,55,0.3)]"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
