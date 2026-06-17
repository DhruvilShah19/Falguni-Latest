'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Heart, MapPin, LogOut, ChevronRight, 
  ShieldAlert, Gift, Tag, HelpCircle, Bell, Truck, UserCircle, Phone
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) router.push('/login');
  }, [firebaseUser, loading, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut(auth);
    router.push('/');
  };

  if (loading || !firebaseUser || isSigningOut) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#2B1B17] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const name = userDoc?.fullname || firebaseUser.displayName || 'Guest Member';
  const email = firebaseUser.email ?? 'Login to sync data';
  const address = userDoc?.deliveryAddress ?? '';
  const userPic = userDoc?.userPic || firebaseUser.photoURL || '';

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-[140px] relative">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-16 md:pt-20">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-8">
            
            {/* ── LEFT SIDEBAR: User Identity ── */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-6 flex flex-col items-center text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />
                
                {/* Avatar Frame */}
                <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] mb-5 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  <div className="w-full h-full rounded-full bg-[#2F2525] flex items-center justify-center overflow-hidden border-2 border-[#2B1B17]">
                    {userPic ? (
                      <Image src={userPic} alt={name} width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-[#D4AF37] text-2xl font-black tracking-widest">{getInitials(name)}</span>
                    )}
                  </div>
                </div>

                {/* Info Details */}
                <h2 className="text-white text-lg font-bold tracking-wide mb-1">{name}</h2>
                <p className="text-white/40 text-[11px] font-light mb-5 tracking-wider">{email}</p>
                
                {address && (
                  <div className="w-full flex items-start gap-3 text-left bg-white/5 rounded-xl p-3 border border-white/5">
                    <MapPin size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span className="text-white/60 text-[10px] leading-relaxed">{address}</span>
                  </div>
                )}
              </div>

              {/* Sign Out Button in Sidebar */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-[16px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
                  <span className="text-red-400 group-hover:text-red-500 font-bold tracking-widest uppercase text-[10px] transition-colors">Sign Out</span>
                </div>
                <ChevronRight size={14} className="text-red-400/50 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* ── RIGHT CONTENT: Dashboard Grid ── */}
            <div className="flex-1 flex flex-col">
              <h1 className="text-white text-2xl md:text-3xl font-serif italic mb-8 font-light tracking-wide">Account Overview</h1>
              
              {/* Account Settings Grid */}
              <div className="mb-10">
                <h3 className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.2em] mb-4 ml-1 opacity-80">Settings & Logs</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 animate-fade-up">
                  <DashboardCard href="/orders" icon={Package} label="Orders" description="Track acquisitions" />
                  <DashboardCard href="/courier" icon={Truck} label="Logistics" description="Active shipments" />
                  <DashboardCard href="/profile/edit" icon={UserCircle} label="Profile Details" description="Personal info" />
                  <DashboardCard href="/profile/addresses" icon={MapPin} label="Addresses" description="Shipping destinations" />
                  <DashboardCard href="/favorites" icon={Heart} label="Favorites" description="Curated wishlist" />
                  <DashboardCard href="/audit-orders" icon={ShieldAlert} label="Transaction Data" description="Detailed ledger" />
                </div>
              </div>

              {/* Promotions & Support Grid */}
              <div className="mb-8">
                <h3 className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.2em] mb-4 ml-1 opacity-80">Promotions & Support</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
                  <DashboardCard href="/referral-page" icon={Gift} label="Share & Earn" description="Invite friends" />
                  <DashboardCard href="/coupon" icon={Tag} label="Promo Codes" description="Manage discounts" />
                  <DashboardCard href="/faq" icon={HelpCircle} label="F.A.Q." description="Common inquiries" />
                  <DashboardCard href="/contact" icon={Phone} label="Contact Us" description="Get in touch" />
                  <DashboardCard href="/notifications" icon={Bell} label="Notifications" description="Manage alerts" />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </PageShell>
  );
}

function DashboardCard({ href, icon: Icon, label, description }: { href: string; icon: any; label: string; description: string }) {
  return (
    <Link href={href} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all group flex flex-col items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors border border-white/5 group-hover:border-[#D4AF37]/20 shadow-inner">
        <Icon size={16} className="text-white/60 group-hover:text-[#D4AF37] transition-colors" />
      </div>
      <div>
        <h4 className="text-white font-semibold text-sm tracking-wide mb-0.5 group-hover:text-[#D4AF37] transition-colors">{label}</h4>
        <p className="text-white/40 text-[10px] leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
