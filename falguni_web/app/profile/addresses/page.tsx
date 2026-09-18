'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, MapPin, Star, Trash2, Plus, Home, 
  Navigation, Map, CheckCircle2, AlertCircle, 
  ShieldCheck, Truck, Sparkles, Check, X
} from 'lucide-react';
import Link from 'next/link';
import type { AddressModel } from '@/types';

export default function DeliveryAddressesPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();

  const [addresses, setAddresses] = useState<AddressModel[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/profile/addresses');
      return;
    }
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (uid) {
      const unsub = onSnapshot(
        collection(db, 'users', uid, 'DeliveryAddress'), 
        (snap) => {
          setAddresses(snap.docs.map(d => ({ ...d.data(), uid: d.id })) as AddressModel[]);
          setIsFetching(false);
        }, 
        (err) => {
          console.warn('Address fetch error:', err);
          setIsFetching(false);
        }
      );
      return () => unsub();
    } else if (!loading) {
      setIsFetching(false);
    }
  }, [firebaseUser, userDoc, loading, router]);

  // Dismiss status messages after 4 seconds
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleMakeDefault = async (address: AddressModel) => {
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (!uid) return;
    try {
      await setDoc(doc(db, 'users', uid), {
        DeliveryAddress: address.address || address.Addresses || '',
        HouseNumber: address.houseNumber || (address as any).HouseNumber || '',
        ClosestBustStop: address.closestbusStop || (address as any).ClosestBustStop || '',
        DeliveryAddressID: address.id || address.uid || '',
        uid,
      }, { merge: true });
      setStatusMessage({ text: 'Default delivery address updated successfully.', type: 'success' });
    } catch (e) {
      console.error(e);
      setStatusMessage({ text: 'Failed to update default address. Please try again.', type: 'error' });
    }
  };

  const handleDelete = async (address: AddressModel) => {
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (!uid || !address.uid) return;
    setDeletingId(address.uid);
    try {
      await deleteDoc(doc(db, 'users', uid, 'DeliveryAddress', address.uid));
      if (userDoc?.DeliveryAddressID === address.id) {
        await setDoc(doc(db, 'users', uid), {
          DeliveryAddress: '',
          HouseNumber: '',
          ClosestBustStop: '',
          DeliveryAddressID: '',
        }, { merge: true });
      }
      setStatusMessage({ text: 'Address removed from your saved list.', type: 'success' });
      setConfirmDeleteId(null);
    } catch (e) {
      console.error(e);
      setStatusMessage({ text: 'Failed to remove address. Please try again.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || isFetching) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const defaultId = userDoc?.DeliveryAddressID || '';

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Breadcrumbs ── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link 
              href="/" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Home
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <Link 
              href="/profile" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              My Account
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">Saved Addresses</span>
          </nav>

          {/* ── 2. Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              
              <div className="flex items-start sm:items-center gap-4">
                <Link
                  href="/profile"
                  aria-label="Back to My Account"
                  className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center hover:bg-white text-[#733617] transition-all shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </Link>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[10px] font-bold uppercase tracking-[0.15em] text-[#733617] mb-1.5">
                    <Sparkles size={11} className="text-[#C88A2C]" aria-hidden="true" />
                    <span>Falguni Parivar • સરનામા</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] tracking-tight">
                    Saved Delivery Addresses
                  </h1>
                  <p className="text-xs sm:text-sm text-[#65544A] mt-1 leading-relaxed">
                    Manage delivery destinations for your sweets, snacks orders, and family gift deliveries.
                  </p>
                </div>
              </div>

              {/* Add Address CTA Button */}
              <Link
                href="/profile/addresses/add"
                aria-label="Add new delivery address"
                className="inline-flex items-center justify-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs shrink-0 self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                <span>Add New Address</span>
              </Link>

            </div>
          </header>

          {/* ── Accessible Live Status Message ── */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {statusMessage?.text}
          </div>

          {statusMessage && (
            <div 
              role={statusMessage.type === 'error' ? 'alert' : 'status'}
              className={`flex items-center justify-between p-4 rounded-xl border text-xs font-medium transition-all ${
                statusMessage.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusMessage.type === 'error' ? (
                  <AlertCircle size={16} className="text-red-600 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" aria-hidden="true" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                aria-label="Dismiss message"
                className="p-1 rounded-md hover:bg-black/5 text-current focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* ── Main Layout (Address List + Helpful Sidebar) ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* ── Address Cards Section ── */}
            <main className="flex-1 w-full flex flex-col gap-5">
              
              {/* Count & Status Heading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#733617]" aria-hidden="true" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2D1508]">
                    Your Addresses ({addresses.length})
                  </h2>
                </div>
                {addresses.length > 0 && (
                  <span className="text-[11px] text-[#65544A]">
                    {addresses.some(a => a.id === defaultId) ? '1 Default Set' : 'Select a default address'}
                  </span>
                )}
              </div>

              {/* Empty State */}
              {addresses.length === 0 ? (
                <div 
                  className="bg-white border border-[#EFE6DC] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs"
                  role="region"
                  aria-label="No addresses found"
                >
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4 shadow-xs">
                    <Map size={28} aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-2">
                    No Saved Addresses Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-[#65544A] max-w-md mb-6 leading-relaxed">
                    Add your home, office, or relatives' delivery location so we can deliver fresh sweets, snacks, and farsan right to your doorstep.
                  </p>
                  <Link
                    href="/profile/addresses/add"
                    className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:ring-offset-2 focus-visible:outline-hidden"
                  >
                    <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                    <span>Add Your First Address</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr, idx) => {
                    const isDefault = defaultId === addr.id;
                    const addrText = addr.address || (addr as any).Addresses || '';
                    const houseNo = addr.houseNumber || (addr as any).HouseNumber || '';
                    const landmark = addr.closestbusStop || (addr as any).ClosestBustStop || '';
                    const isConfirmingDelete = confirmDeleteId === addr.uid;
                    const isDeletingThis = deletingId === addr.uid;

                    return (
                      <article
                        key={addr.uid || idx}
                        aria-label={`Address ${idx + 1}: ${houseNo ? houseNo + ', ' : ''}${addrText}`}
                        className={`bg-white rounded-2xl border transition-all shadow-xs flex flex-col justify-between relative overflow-hidden ${
                          isDefault 
                            ? 'border-[#733617] ring-1 ring-[#733617]/30 shadow-sm' 
                            : 'border-[#EFE6DC] hover:border-[#733617]/40'
                        }`}
                      >
                        {/* Default Pill Header */}
                        {isDefault && (
                          <div className="bg-[#FAF7F2] border-b border-[#EFE6DC] px-4 py-2 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#733617]">
                              <Star size={12} className="text-[#C88A2C] fill-[#C88A2C]" aria-hidden="true" />
                              Default Delivery Destination
                            </span>
                            <span className="text-[10px] text-[#65544A] font-medium">Selected for checkout</span>
                          </div>
                        )}

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isDefault 
                                  ? 'bg-[#733617] text-white' 
                                  : 'bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617]'
                              }`}
                              aria-hidden="true"
                            >
                              <MapPin size={17} />
                            </div>

                            <div className="flex-1 min-w-0">
                              {houseNo && (
                                <p className="font-serif font-bold text-sm text-[#2D1508] mb-0.5">
                                  {houseNo}
                                </p>
                              )}
                              <p className="text-xs text-[#65544A] leading-relaxed break-words">
                                {addrText}
                              </p>

                              {landmark && (
                                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EFE6DC] text-[11px] text-[#733617]">
                                  <Navigation size={11} aria-hidden="true" className="shrink-0" />
                                  <span className="truncate">Landmark: {landmark}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* In-Card Delete Confirmation Panel (Accessible alternative to window.confirm) */}
                        {isConfirmingDelete ? (
                          <div 
                            role="dialog"
                            aria-labelledby={`delete-title-${addr.uid}`}
                            className="bg-red-50 border-t border-red-200 p-4 flex flex-col gap-2.5"
                          >
                            <p id={`delete-title-${addr.uid}`} className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                              <AlertCircle size={14} className="text-red-600 shrink-0" aria-hidden="true" />
                              Remove this address?
                            </p>
                            <p className="text-[11px] text-red-700 leading-snug">
                              This will remove this location from your saved address book.
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(addr)}
                                disabled={isDeletingThis}
                                aria-label="Confirm remove address"
                                className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-hidden"
                              >
                                {isDeletingThis ? (
                                  <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                ) : (
                                  <>
                                    <Check size={13} aria-hidden="true" />
                                    <span>Yes, Remove</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeletingThis}
                                aria-label="Cancel removal"
                                className="py-1.5 px-3 rounded-lg bg-white border border-red-200 text-red-800 hover:bg-red-100/60 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-hidden"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Card Footer Actions */
                          <div className="px-5 py-3.5 bg-[#FAF7F2]/50 border-t border-[#EFE6DC] flex items-center justify-between gap-3">
                            <div>
                              {!isDefault ? (
                                <button
                                  type="button"
                                  onClick={() => handleMakeDefault(addr)}
                                  aria-label={`Set ${houseNo || addrText} as your default delivery address`}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#733617] hover:text-[#5A290F] hover:underline transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs"
                                >
                                  <Star size={13} aria-hidden="true" />
                                  <span>Set as Default</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 size={13} aria-hidden="true" />
                                  <span>Primary Address</span>
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(addr.uid || null)}
                              aria-label={`Delete address ${houseNo || addrText}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A796F] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-hidden"
                              title="Delete address"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

            </main>

            {/* ── RIGHT COLUMN: Helpful Information & Delivery Guarantees ── */}
            <aside aria-label="Delivery information" className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
              
              {/* Default Address Policy Card */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-[#2D1508]">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                    <Home size={15} aria-hidden="true" />
                  </div>
                  <h3 className="font-serif font-bold text-sm">Delivery Tips</h3>
                </div>
                <p className="text-xs text-[#65544A] leading-relaxed">
                  Your default address will be automatically selected during cart checkout. You can also pick any other saved address or add a new one anytime.
                </p>
              </div>

              {/* Delivery Assurance Strip */}
              <div className="bg-[#F5EBE1]/60 border border-[#EFE6DC] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D1508]">
                  <Truck size={15} className="text-[#733617] shrink-0" aria-hidden="true" />
                  <span>Pan-India Doorstep Delivery</span>
                </div>
                <p className="text-[11px] text-[#65544A] leading-relaxed">
                  We deliver authentic Gujarati sweets &amp; savories across 19,000+ pincodes in India with protective food-grade packaging.
                </p>
                <div className="pt-2 border-t border-[#EFE6DC] flex items-center gap-2 text-xs font-bold text-[#2D1508]">
                  <ShieldCheck size={15} className="text-[#733617] shrink-0" aria-hidden="true" />
                  <span>Food Freshness Guaranteed</span>
                </div>
              </div>

              {/* Quick Navigation link back to Profile */}
              <Link
                href="/profile"
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#EFE6DC] hover:border-[#733617]/40 text-[#733617] text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                Back to My Account
              </Link>

            </aside>

          </div>

        </div>
      </div>
    </PageShell>
  );
}
