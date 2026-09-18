'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Copy, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  Gift, 
  Sparkles, 
  Users, 
  Wallet, 
  ArrowRight, 
  LogIn, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';

export default function ReferralPage() {
  const { firebaseUser, userDoc, loading: authLoading } = useAuthStore();
  const { enableReferrals: isActive, referralAmount: reward, loading: settingsLoading } = useSettingsStore();
  const [copied, setCopied] = useState(false);

  const referralCode = userDoc?.personalReferralCode || (firebaseUser ? `FGU-${firebaseUser.uid.slice(0, 6).toUpperCase()}` : '');

  const shareText = `Use my referral code ${referralCode} to get special discounts on authentic Gujarati snacks & sweets from Falguni Gruh Udhyog! Order here:`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://falgunigruhudhyog.in';

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Falguni Gruh Udhyog Referral',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappMsg = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${whatsappMsg}`, '_blank');
  };

  if (authLoading || settingsLoading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 sm:pb-28">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <Link href="/profile" className="hover:text-[#733617] transition-colors">My Account</Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Refer & Earn</span>
          </nav>

          {/* Hero Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EBE1] via-[#FAF7F2] to-[#EFE6DC] border border-[#EFE6DC] p-6 sm:p-10 mb-10 shadow-xs">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 text-[#733617] text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[#EFE6DC]">
                <Gift size={13} className="text-[#733617]" />
                <span>મિત્રોને કહો અને મેળવો • REFERRAL PROGRAM</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2D1508] tracking-tight mb-3">
                {isActive ? `Invite Friends, Earn ₹${reward}` : 'Referral Program Paused'}
              </h1>
              <p className="text-sm sm:text-base text-[#733617]/85 leading-relaxed">
                {isActive
                  ? `Spread the love of authentic Gujarati delicacies! Share your unique referral code with family and friends. When they place their first order, they get a welcome treat and you earn ₹${reward} store credit.`
                  : 'Our customer referral rewards program is currently undergoing seasonal maintenance. Check back soon for new referral campaigns and rewards!'}
              </p>
            </div>

            {/* Decorative background embellishment */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 rounded-full bg-[#733617]/5 pointer-events-none blur-2xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left / Main Column: Referral Action Card */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {isActive ? (
                firebaseUser ? (
                  /* Authenticated Card */
                  <div className="bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#733617]">Your Personal Invitation</span>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D1508] mt-1">Exclusive Referral Code</h2>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                        <Gift size={22} />
                      </div>
                    </div>

                    {/* Code Display */}
                    <div className="bg-[#FAF7F2] border-2 border-dashed border-[#733617]/30 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#733617]/70">Your Code</span>
                        <div className="text-3xl sm:text-4xl font-mono font-black text-[#2D1508] tracking-widest select-all">
                          {referralCode}
                        </div>
                      </div>

                      <button
                        onClick={handleCopy}
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                          copied 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-[#733617] hover:bg-[#5c2b12] text-white'
                        }`}
                      >
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>

                    {/* Share Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleWhatsAppShare}
                        className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold tracking-wider uppercase text-xs bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors shadow-2xs cursor-pointer"
                      >
                        <FaWhatsapp size={18} />
                        Share on WhatsApp
                      </button>
                      <button
                        onClick={handleNativeShare}
                        className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold tracking-wider uppercase text-xs bg-[#FAF7F2] text-[#2D1508] hover:bg-[#F5EBE1] border border-[#EFE6DC] transition-colors cursor-pointer"
                      >
                        <Share2 size={16} className="text-[#733617]" />
                        Other Options
                      </button>
                    </div>

                    {/* Mini reassurance */}
                    <div className="mt-6 pt-5 border-t border-[#EFE6DC] flex items-center gap-2 text-xs text-[#733617]/80">
                      <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
                      <span>Reward of ₹{reward} is credited automatically upon successful delivery of your friend&apos;s order.</span>
                    </div>
                  </div>
                ) : (
                  /* Unauthenticated Card */
                  <div className="bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-10 shadow-xs text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4">
                      <Users size={30} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#733617] mb-1">Join Falguni Parivar</span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] mb-3">
                      Sign In to Get Your Unique Code
                    </h2>
                    <p className="text-sm text-[#733617]/80 max-w-md mb-6 leading-relaxed">
                      Log in to access your personal referral code, track your referral earnings, and share discounts with friends and family.
                    </p>
                    <Link
                      href="/login?redirect=/referral-page"
                      className="inline-flex items-center gap-2.5 bg-[#733617] hover:bg-[#5c2b12] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <LogIn size={16} />
                      Sign In or Register Now
                    </Link>
                  </div>
                )
              ) : (
                /* Program Inactive State */
                <div className="bg-white border border-[#EFE6DC] rounded-3xl p-8 text-center">
                  <h3 className="text-xl font-serif font-bold text-[#2D1508] mb-2">Program Temporarily Paused</h3>
                  <p className="text-sm text-[#733617]/80 max-w-md mx-auto">
                    Our referral program is undergoing seasonal maintenance. Check back soon for even bigger rewards!
                  </p>
                </div>
              )}

              {/* 3-Step "How It Works" Section */}
              <div className="bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#733617]">Simple Process</span>
                  <h3 className="text-xl font-serif font-bold text-[#2D1508] mt-1">How It Works</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2]/60 border border-[#EFE6DC] flex flex-col">
                    <div className="w-9 h-9 rounded-xl bg-[#733617] text-white font-bold text-sm flex items-center justify-center mb-3">
                      1
                    </div>
                    <h4 className="font-serif font-bold text-[#2D1508] text-sm mb-1">Share Your Code</h4>
                    <p className="text-xs text-[#733617]/80 leading-relaxed">
                      Send your link or code to friends & family across India via WhatsApp or social media.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2]/60 border border-[#EFE6DC] flex flex-col">
                    <div className="w-9 h-9 rounded-xl bg-[#733617] text-white font-bold text-sm flex items-center justify-center mb-3">
                      2
                    </div>
                    <h4 className="font-serif font-bold text-[#2D1508] text-sm mb-1">They Make a Purchase</h4>
                    <p className="text-xs text-[#733617]/80 leading-relaxed">
                      Your friend applies your code during checkout to receive special welcome savings.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2]/60 border border-[#EFE6DC] flex flex-col">
                    <div className="w-9 h-9 rounded-xl bg-[#733617] text-white font-bold text-sm flex items-center justify-center mb-3">
                      3
                    </div>
                    <h4 className="font-serif font-bold text-[#2D1508] text-sm mb-1">You Earn ₹{reward}</h4>
                    <p className="text-xs text-[#733617]/80 leading-relaxed">
                      Instant store credit is added to your Falguni account once their package arrives.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Benefits & FAQ */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Rewards Summary Highlight */}
              <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5EBE1] border border-[#EFE6DC] rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#733617] text-white flex items-center justify-center shadow-2xs">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#2D1508]">Reward Benefits</h3>
                    <p className="text-xs text-[#733617]/70">No limits on friends you can invite</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#733617]/85">
                  <div className="flex items-start gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#EFE6DC]">
                    <Sparkles size={14} className="text-[#733617] mt-0.5 flex-shrink-0" />
                    <span><strong>100% Redeemable:</strong> Use your credits on any sweets, namkeens, or pickles without restriction.</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#EFE6DC]">
                    <Sparkles size={14} className="text-[#733617] mt-0.5 flex-shrink-0" />
                    <span><strong>No Expiry Pressure:</strong> Referral credits remain safely associated with your verified phone number.</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-[#EFE6DC]">
                    <Sparkles size={14} className="text-[#733617] mt-0.5 flex-shrink-0" />
                    <span><strong>Pan-India Delivery:</strong> Friends anywhere across India can order authentic Vastrapur flavors.</span>
                  </div>
                </div>
              </div>

              {/* FAQ / Terms Box */}
              <div className="bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 text-[#2D1508] font-serif font-bold text-lg mb-4">
                  <HelpCircle size={18} className="text-[#733617]" />
                  <span>Frequently Asked Questions</span>
                </div>

                <div className="space-y-4 text-xs text-[#733617]/80">
                  <div>
                    <h5 className="font-bold text-[#2D1508] mb-1">Where can my friend enter the code?</h5>
                    <p className="leading-relaxed">They can paste your code into the "Apply Coupon / Referral" input field during checkout.</p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE6DC]">
                    <h5 className="font-bold text-[#2D1508] mb-1">Is there a minimum order requirement?</h5>
                    <p className="leading-relaxed">Referral discounts apply to all standard orders meeting the cart minimum of ₹200.</p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE6DC]">
                    <h5 className="font-bold text-[#2D1508] mb-1">Need help with your referral?</h5>
                    <p className="leading-relaxed">
                      Reach out to our customer care at <a href="tel:+919825382002" className="text-[#733617] font-bold hover:underline">+91 98253 82002</a> or visit our <Link href="/contact" className="text-[#733617] font-bold hover:underline">Contact Page</Link>.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#EFE6DC]">
                  <Link 
                    href="/shop" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617] hover:underline"
                  >
                    Browse Sweets & Snacks <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
