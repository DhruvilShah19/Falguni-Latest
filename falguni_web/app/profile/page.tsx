'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Heart, MapPin, LogOut, ChevronRight, 
  Gift, Tag, HelpCircle, Phone, Truck, UserCheck, 
  ArrowRight, ShieldCheck, Mail, Sparkles, Receipt,
  Bell, Calculator, LogIn, UserPlus, ShoppingBag, User as UserIcon
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [stats, setStats] = useState({
    orders: 0,
    couriers: 0,
    addresses: 0,
    favorites: 0,
    notifications: 0,
    loading: true,
  });

  // Safety fallback: Never leave the user stuck on an infinite spinner if auth takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimedOut(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Smooth automatic redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !firebaseUser) {
      const redirectTimer = setTimeout(() => {
        router.push('/login?redirect=/profile');
      }, 1800);
      return () => clearTimeout(redirectTimer);
    }
  }, [firebaseUser, loading, router]);

  // Fetch live account statistics from Firestore
  useEffect(() => {
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (!uid) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }
    let active = true;

    const fetchStats = async () => {
      try {
        const [ordersSnap, couriersSnap, addressesSnap, favoritesSnap, notifSnap] = await Promise.allSettled([
          getDocs(query(collection(db, 'Orders'), where('userID', '==', uid))),
          getDocs(query(collection(db, 'Courier'), where('userUID', '==', uid))),
          getDocs(collection(db, 'users', uid, 'DeliveryAddress')),
          getDocs(collection(db, 'users', uid, 'Favorite')),
          getDocs(collection(db, 'users', uid, 'Notifications')),
        ]);

        if (active) {
          setStats({
            orders: ordersSnap.status === 'fulfilled' ? ordersSnap.value.size : 0,
            couriers: couriersSnap.status === 'fulfilled' ? couriersSnap.value.size : 0,
            addresses: addressesSnap.status === 'fulfilled' ? addressesSnap.value.size : 0,
            favorites: favoritesSnap.status === 'fulfilled' ? favoritesSnap.value.size : 0,
            notifications: notifSnap.status === 'fulfilled' ? notifSnap.value.size : 0,
            loading: false,
          });
        }
      } catch (err) {
        console.warn('Could not fetch user stats:', err);
        if (active) setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
    return () => { active = false; };
  }, [firebaseUser?.uid, userDoc?.uid]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  // ── Loading or Signing Out Spinner State ──
  if ((loading && !authTimedOut) || isSigningOut) {
    return (
      <PageShell>
        <div className="min-h-[60vh] bg-[#FAF7F2] flex flex-col items-center justify-center gap-4">
          <LoadingSpinner />
          <p className="text-xs text-[#8A796F] font-medium tracking-wide">
            {isSigningOut ? 'Signing out of your account...' : 'Loading your account...'}
          </p>
        </div>
      </PageShell>
    );
  }

  // ── Unauthenticated / Guest View (Never stuck in an infinite blank spinner) ──
  if (!firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
          <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-6 font-medium">
              <Link href="/" className="hover:text-[#733617] transition-colors">
                Home
              </Link>
              <span className="text-[#B5A599]">&gt;</span>
              <span className="text-[#733617] font-semibold">My Account</span>
            </nav>

            {/* Guest Card */}
            <div className="bg-white border border-[#EFE6DC] rounded-3xl p-7 sm:p-10 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#733617] via-[#C88A2C] to-[#733617]" />
              
              <div className="w-18 h-18 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mx-auto mb-5 shadow-xs">
                <UserIcon size={34} className="stroke-[1.6]" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-3 text-[#733617]">
                <Sparkles size={12} className="text-[#C88A2C]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                  Falguni Parivar
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] mb-2.5">
                Sign In to Your Account
              </h1>
              
              <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-7 max-w-md mx-auto">
                Sign in to track sweets &amp; snacks delivery, send courier parcels, manage saved Indian addresses, and redeem festive rewards.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Link
                  href="/login?redirect=/profile"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#733617] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C2B12] transition-colors shadow-sm"
                >
                  <LogIn size={15} />
                  <span>Sign In to Account</span>
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#733617]/30 text-[#733617] font-bold text-xs uppercase tracking-wider hover:bg-[#FAF7F2] transition-colors"
                >
                  <UserPlus size={15} />
                  <span>Create New Account</span>
                </Link>
              </div>

              <div className="pt-6 border-t border-[#EFE6DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8A796F]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#733617]" />
                  Secure 256-Bit Authentication
                </span>
                <Link href="/" className="inline-flex items-center gap-1 font-semibold text-[#733617] hover:underline">
                  <ShoppingBag size={13} />
                  Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        </div>
      </PageShell>
    );
  }

  // ── Authenticated User Profile ──
  const name = String(userDoc?.fullname || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Friend');
  const email = String(firebaseUser.email || userDoc?.email || 'No email registered');
  const phone = String(userDoc?.phone || firebaseUser.phoneNumber || 'No phone registered');
  const address = String(userDoc?.DeliveryAddress || userDoc?.deliveryAddress || userDoc?.address || '');
  const userPic = typeof userDoc?.userPic === 'string' && userDoc.userPic.trim()
    ? userDoc.userPic
    : (typeof firebaseUser.photoURL === 'string' && firebaseUser.photoURL.trim() ? firebaseUser.photoURL : '');

  const getInitials = (str: string) => {
    if (!str || typeof str !== 'string') return 'FP';
    const parts = str.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'FP';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          {/* ── 1. Breadcrumbs (Matches Product / Cart Theme) ── */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-4 sm:mb-6 font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <span className="text-[#733617] font-semibold">My Account</span>
          </nav>

          {/* ── 2. Top Account Header Banner (Consistent with ShopHeaderBanner) ── */}
          <div className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 text-[#733617]">
                  <Sparkles size={12} className="text-[#C88A2C]" />
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em]">
                    Falguni Parivar • ફાલ્ગુની પરિવાર
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-bold text-[#2D1508] tracking-tight leading-tight mb-1.5">
                  Kem Cho, {name.split(' ')[0] || 'Ji'}! 🙏
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] max-w-2xl leading-relaxed">
                  Track your sweets &amp; snacks orders, send parcels anywhere, view saved delivery addresses, and manage your account.
                </p>
              </div>

              {/* Member ID Quick Chip */}
              <div className="flex items-center gap-3.5 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-3 sm:px-4 sm:py-3 self-start md:self-auto flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center font-serif font-bold text-base text-[#733617] shadow-xs flex-shrink-0">
                  {getInitials(name)}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#2D1508] truncate max-w-[180px]">{name}</span>
                  <span className="block text-[11px] text-[#65544A] truncate max-w-[180px]">{email}</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── 3. Live Metric Stats Strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <StatCard 
              label="Total Orders" 
              count={stats.orders} 
              loading={stats.loading} 
              href="/orders" 
              icon={Package} 
              subtext="Mithai & snacks"
            />
            <StatCard 
              label="Shipments" 
              count={stats.couriers} 
              loading={stats.loading} 
              href="/courier" 
              icon={Truck} 
              subtext="Parcel consignments"
            />
            <StatCard 
              label="Addresses" 
              count={stats.addresses} 
              loading={stats.loading} 
              href="/profile/addresses" 
              icon={MapPin} 
              subtext="Saved destinations"
            />
            <StatCard 
              label="Curated Wishlist" 
              count={stats.favorites} 
              loading={stats.loading} 
              href="/favorites" 
              icon={Heart} 
              subtext="Saved delicacies"
            />
          </div>

          {/* ── 4. Main Two-Column Layout ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* ── LEFT COLUMN: Member Profile Card & Actions ── */}
            <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
              
              {/* Member Card */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs relative overflow-hidden">
                {/* Decorative header backdrop */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#F5EBE1]/70 to-transparent pointer-events-none" />

                <div className="relative flex flex-col items-center text-center">
                  
                  {/* Avatar Frame */}
                  <div className="relative w-24 h-24 rounded-full p-1.5 bg-white shadow-sm border border-[#EFE6DC] mb-4">
                    <div className="w-full h-full rounded-full bg-[#FAF7F2] flex items-center justify-center overflow-hidden border border-[#EFE6DC]">
                      {userPic ? (
                        <Image 
                          src={userPic} 
                          alt={name} 
                          width={96} 
                          height={96} 
                          className="object-cover w-full h-full" 
                        />
                      ) : (
                        <span className="font-serif font-bold text-2xl text-[#733617] tracking-wider">
                          {getInitials(name)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Tier */}
                  <h2 className="font-serif text-xl font-bold text-[#2D1508] mb-1">
                    {name}
                  </h2>
                  
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] mb-4">
                    <Sparkles size={12} className="text-[#C88A2C]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Falguni Parivar Member
                    </span>
                  </div>

                  {/* Contact Badges */}
                  <div className="w-full flex flex-col gap-2.5 text-left pt-3 border-t border-[#EFE6DC]">
                    <div className="flex items-center gap-2.5 text-xs text-[#65544A]">
                      <Mail size={14} className="text-[#733617] flex-shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#65544A]">
                      <Phone size={14} className="text-[#733617] flex-shrink-0" />
                      <span className="truncate">{phone}</span>
                    </div>

                    {address ? (
                      <div className="flex items-start gap-2.5 text-xs text-[#65544A] pt-1">
                        <MapPin size={14} className="text-[#733617] flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-[11px] leading-relaxed text-[#65544A]">
                          {address}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Edit Profile CTA */}
                  <Link 
                    href="/profile/edit"
                    className="mt-5 w-full py-2.5 px-4 rounded-xl border border-[#733617]/30 text-[#733617] hover:bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all text-center"
                  >
                    Edit Profile Details
                  </Link>

                </div>
              </div>

              {/* Security & Authenticity Trust Badge */}
              <div className="bg-[#F5EBE1]/60 border border-[#EFE6DC] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D1508]">Verified Account</h4>
                  <p className="text-[11px] text-[#65544A]">Your account and orders are completely safe.</p>
                </div>
              </div>

              {/* Sign Out Action */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border border-red-200/80 bg-red-50/60 hover:bg-red-100/70 transition-all group disabled:opacity-50 text-left shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                    <LogOut size={14} />
                  </div>
                  <div>
                    <span className="block text-red-800 font-bold uppercase text-[11px] tracking-wider">Sign Out</span>
                    <span className="block text-red-600/80 text-[10px]">Log out of this device</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-red-400 group-hover:translate-x-1 transition-transform" />
              </button>

            </aside>

            {/* ── RIGHT COLUMN: Categorized Boutique Navigation Hub ── */}
            <main className="flex-1 w-full flex flex-col gap-8">
              
              {/* Category 1: Orders & Delivery Services */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                      Orders & Tracking
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
                      My Orders & Shipping
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <HubCard
                    href="/orders"
                    icon={Package}
                    title="My Orders"
                    badge={stats.orders > 0 ? `${stats.orders} Total` : undefined}
                    description="Track your sweets & snacks delivery, check order details, or re-order."
                  />
                  <HubCard
                    href="/courier"
                    icon={Truck}
                    badge="Parcel Dispatch"
                    title="Falguni Courier"
                    description="Send sweets, snacks, or parcels anywhere with easy doorstep pickup."
                  />
                  <HubCard
                    href="/delivery-charges"
                    icon={Calculator}
                    title="Delivery Rates & Zones"
                    description="Distance-based charges and free delivery eligibility across India."
                  />
                  <HubCard
                    href="/audit-orders"
                    icon={Receipt}
                    title="Bills & Invoices"
                    description="View and download bills, GST invoices, and payment receipts."
                  />
                </div>
              </section>

              {/* Category 2: Addresses & Personal Preferences */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                      My Details
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
                      Saved Addresses & Details
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <HubCard
                    href="/profile/addresses"
                    icon={MapPin}
                    badge={stats.addresses > 0 ? `${stats.addresses} Saved` : undefined}
                    title="Saved Addresses"
                    description="Manage home, office, and family delivery addresses across India."
                  />
                  <HubCard
                    href="/profile/edit"
                    icon={UserCheck}
                    title="Profile Details"
                    description="Update your phone number, full name, email, and photo."
                  />
                  <HubCard
                    href="/favorites"
                    icon={Heart}
                    badge={stats.favorites > 0 ? `${stats.favorites} Items` : undefined}
                    title="My Favorites"
                    description="Quickly view and add your favorite sweets and savories to cart."
                  />
                </div>
              </section>

              {/* Category 3: Offers, Help & Support */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                      Discounts & Help
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
                      Offers, Alerts & Customer Support
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <HubCard
                    href="/notifications"
                    icon={Bell}
                    badge={stats.notifications > 0 ? `${stats.notifications} New` : undefined}
                    title="Notifications & Alerts"
                    description="Track order dispatches, live delivery milestones, and festive offers."
                  />
                  <HubCard
                    href="/coupon"
                    icon={Tag}
                    title="Offers & Coupons"
                    description="View active discount coupons and festive season offers."
                  />
                  <HubCard
                    href="/referral-page"
                    icon={Gift}
                    title="Refer Friends & Family"
                    description="Invite your friends and relatives to Falguni and get rewards."
                  />
                  <HubCard
                    href="/faq"
                    icon={HelpCircle}
                    title="Help & FAQs"
                    description="Questions about food packaging, freshness, and order delivery."
                  />
                  <HubCard
                    href="/contact"
                    icon={Phone}
                    title="Call or WhatsApp Help"
                    description="Need help? Call or message our customer care team directly on WhatsApp."
                  />
                </div>
              </section>

            </main>

          </div>

        </div>

      </div>
    </PageShell>
  );
}

// ── Quick Metric Stat Card ──
function StatCard({ 
  label, 
  count, 
  loading, 
  href, 
  icon: Icon, 
  subtext 
}: { 
  label: string; 
  count: number; 
  loading: boolean; 
  href: string; 
  icon: any; 
  subtext: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 hover:border-[#733617]/40 hover:shadow-md transition-all group shadow-xs flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#F5EBE1] text-[#733617] flex items-center justify-center group-hover:bg-[#733617] group-hover:text-white transition-colors">
          <Icon size={18} />
        </div>
        <ArrowRight size={14} className="text-[#2D1508]/30 group-hover:text-[#733617] group-hover:translate-x-1 transition-all" />
      </div>
      <div>
        <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">
          {loading ? (
            <span className="inline-block w-8 h-7 bg-[#FAF7F2] animate-pulse rounded" />
          ) : (
            count
          )}
        </div>
        <div className="text-xs font-bold text-[#2D1508] mt-0.5">{label}</div>
        <div className="text-[11px] text-[#2D1508]/50 truncate">{subtext}</div>
      </div>
    </Link>
  );
}

// ── Hub Action Card ──
function HubCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: any;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#EFE6DC] rounded-2xl p-5 hover:border-[#733617]/40 hover:shadow-md transition-all group shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] flex items-center justify-center group-hover:bg-[#733617] group-hover:text-white transition-all shadow-xs">
            <Icon size={19} />
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#F5EBE1] text-[#733617] text-[10px] font-bold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <h4 className="font-serif font-bold text-base text-[#2D1508] mb-1 group-hover:text-[#733617] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-[#2D1508]/70 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#FAF7F2] flex items-center justify-between text-[11px] font-bold text-[#733617] uppercase tracking-wider">
        <span>View Details</span>
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
