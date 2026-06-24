'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, MapPin, Star, Trash2, Plus, Home, Navigation, Map } from 'lucide-react';
import Link from 'next/link';
import type { AddressModel } from '@/types';

export default function DeliveryAddressesPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();

  const [addresses, setAddresses] = useState<AddressModel[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) { router.push('/login'); return; }
    if (userDoc?.uid) {
      const unsub = onSnapshot(collection(db, 'users', userDoc.uid, 'DeliveryAddress'), snap => {
        setAddresses(snap.docs.map(d => ({ ...d.data(), uid: d.id })) as AddressModel[]);
        setIsFetching(false);
      });
      return () => unsub();
    }
  }, [firebaseUser, userDoc, loading, router]);

  const handleMakeDefault = async (address: AddressModel) => {
    if (!userDoc?.uid) return;
    try {
      await updateDoc(doc(db, 'users', userDoc.uid), {
        DeliveryAddress: address.address || address.Addresses,
        HouseNumber: address.houseNumber,
        ClosestBustStop: address.closestbusStop,
        DeliveryAddressID: address.id,
      });
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (address: AddressModel) => {
    if (!userDoc?.uid || !address.uid) return;
    if (!window.confirm('Remove this address?')) return;
    setDeletingId(address.uid);
    try {
      await deleteDoc(doc(db, 'users', userDoc.uid, 'DeliveryAddress', address.uid));
      if (userDoc.DeliveryAddressID === address.id) {
        await updateDoc(doc(db, 'users', userDoc.uid), {
          DeliveryAddress: '', HouseNumber: '', ClosestBustStop: '', DeliveryAddressID: '',
        });
      }
    } catch (e) { console.error(e); }
    setDeletingId(null);
  };

  if (loading || isFetching || !userDoc) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#2B1B17' }}>
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const defaultId = userDoc.DeliveryAddressID || '';

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

        {/* ── Premium Header Banner ── */}
        <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-20 flex flex-col items-center justify-center mb-6 md:mb-12">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />



           <div className="relative z-10 text-center px-4 w-full">
             <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
               YOUR ADDRESSES
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
             </div>
             
             <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
               Delivery Locations
             </h1>
             
             <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
               Manage your delivery destinations for seamless acquisitions.
             </p>
           </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 pb-24">

          {/* Add New — prominent CTA */}
          <Link href="/profile/addresses/add"
            className="flex items-center gap-4 w-full rounded-2xl px-6 py-4 mb-8 transition-all group"
            style={{
              border: '1px solid rgba(212,175,55,0.2)',
              background: 'rgba(212,175,55,0.05)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.4)';
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.2)';
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.05)';
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F0CF6B, #B8952A)', color: '#2B1B17' }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-wide" style={{ color: '#F0EDE8' }}>Add New Address</p>
              <p className="text-xs mt-0.5" style={{ color: '#9A8878' }}>Pin your location on the map</p>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(212,175,55,0.5)' }}
            >
              <ChevronLeft size={13} className="rotate-180" />
            </div>
          </Link>

          {/* Empty state */}
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6 rounded-3xl"
              style={{ border: '1px solid rgba(212,175,55,0.08)', background: 'rgba(92,64,51,0.06)' }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ border: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.04)' }}
              >
                <Map size={32} strokeWidth={1.2} style={{ color: 'rgba(212,175,55,0.3)' }} />
              </div>
              <h3 className="font-serif text-xl mb-2" style={{ color: '#F0EDE8' }}>No saved addresses</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#9A8878', maxWidth: 280 }}>
                Add a delivery location so we know exactly where to send your order.
              </p>
              <Link href="/profile/addresses/add"
                className="px-8 py-3.5 rounded-2xl text-sm font-bold tracking-[0.2em] uppercase transition-all"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F0CF6B, #B8952A)', color: '#2B1B17' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 28px rgba(212,175,55,0.35)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'}
              >
                Add Your First Address
              </Link>
            </div>
          ) : (
            /* Address cards */
            <div className="flex flex-col gap-3">
              {/* Count label */}
              <div className="flex items-center gap-3 mb-1">
                <span className="w-6 h-px" style={{ background: 'rgba(212,175,55,0.35)' }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>
                  {addresses.length} Saved Location{addresses.length !== 1 ? 's' : ''}
                </span>
              </div>

              {addresses.map(addr => {
                const isDefault = defaultId === addr.id;
                const addrText  = addr.address || (addr as any).Addresses || '';
                const isDeleting = deletingId === addr.uid;

                return (
                  <div key={addr.uid}
                    className="rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      border: isDefault ? '1.5px solid rgba(212,175,55,0.4)' : '1px solid rgba(212,175,55,0.08)',
                      background: isDefault ? 'rgba(212,175,55,0.04)' : 'rgba(92,64,51,0.08)',
                      boxShadow: isDefault ? '0 0 24px rgba(212,175,55,0.06)' : 'none',
                    }}
                  >
                    {/* Default banner */}
                    {isDefault && (
                      <div className="flex items-center gap-2 px-5 py-2"
                        style={{ background: 'rgba(212,175,55,0.08)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}
                      >
                        <Star size={10} style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                        <span className="text-[9px] font-bold tracking-[0.35em] uppercase" style={{ color: '#D4AF37' }}>
                          Default Delivery Address
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-4 p-5">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                        style={{
                          border: isDefault ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          background: isDefault ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <MapPin size={16} style={{ color: isDefault ? '#D4AF37' : 'rgba(154,136,120,0.6)' }} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug mb-2" style={{ color: '#F0EDE8' }}>{addrText}</p>
                        <div className="flex flex-wrap gap-3">
                          {addr.houseNumber && (
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9A8878' }}>
                              <Home size={11} style={{ color: 'rgba(212,175,55,0.4)' }} />
                              {addr.houseNumber}
                            </span>
                          )}
                          {addr.closestbusStop && (
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9A8878' }}>
                              <Navigation size={11} style={{ color: 'rgba(212,175,55,0.4)' }} />
                              {addr.closestbusStop}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isDefault && (
                          <button onClick={() => handleMakeDefault(addr)}
                            className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-2 rounded-xl transition-all"
                            style={{
                              border: '1px solid rgba(212,175,55,0.2)',
                              background: 'rgba(212,175,55,0.05)',
                              color: 'rgba(212,175,55,0.7)',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.45)';
                              (e.currentTarget as HTMLButtonElement).style.color = '#D4AF37';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.2)';
                              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,175,55,0.7)';
                            }}
                          >
                            Set default
                          </button>
                        )}
                        <button onClick={() => handleDelete(addr)} disabled={isDeleting}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          style={{ border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.05)', color: 'rgba(239,68,68,0.5)' }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.35)';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.15)';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.05)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.5)';
                          }}
                        >
                          {isDeleting
                            ? <div className="w-3 h-3 rounded-full border animate-spin" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#f87171' }} />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
