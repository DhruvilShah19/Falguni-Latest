'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, ChevronRight, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import type { CourierModel } from '@/types';

export default function CourierPage() {
  const router = useRouter();
  const { firebaseUser, userDoc, loading } = useAuthStore();
  const [couriers, setCouriers] = useState<CourierModel[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
      return;
    }

    if (userDoc?.uid) {
      const q = query(
        collection(db, 'Courier'),
        where('userUID', '==', userDoc.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        })) as CourierModel[];
        
        // Sort by ID descending so newest is first
        fetched.sort((a, b) => b.parcelID - a.parcelID);
        
        setCouriers(fetched);
        setIsFetching(false);
      });

      return () => unsubscribe();
    }
  }, [firebaseUser, userDoc, loading, router]);

  if (loading || isFetching) {
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
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-[140px] relative overflow-hidden">
        
        {/* ── Ultra Premium Editorial Hero ── */}
        <div className="relative w-full min-h-[40vh] flex flex-col items-center justify-center pt-32 pb-12 px-4 border-b border-[#D4AF37]/10 mb-8 z-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />

           <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto animate-fade-up w-full">
             <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase text-xs mb-6 flex items-center justify-center gap-6">
               <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
               COURIER SYSTEM
               <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
             </span>
             
             <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight" style={{ fontStyle: 'italic' }}>
               Logistics
             </h1>
             
             <p className="mt-8 text-white/50 font-light max-w-md mx-auto text-sm tracking-wide">
               Track and manage your active shipments, delivery schedules, and acquisition history.
             </p>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full relative z-10 px-4 md:px-6">
          
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div>
              <h2 className="text-white text-2xl font-serif italic mb-2">Your Shipments</h2>
              <p className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">{couriers.length} ACTIVE RECORDS</p>
            </div>
            
            <Link 
              href="/courier/add" 
              className="group flex items-center justify-center gap-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-6 py-4 rounded-[20px] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#2B1B17]">
                <Plus size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[#D4AF37] font-bold tracking-widest text-xs uppercase">New Shipment</span>
            </Link>
          </div>

          {/* List Content */}
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            {couriers.length === 0 ? (
              /* Empty State */
              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-12 flex flex-col items-center text-center backdrop-blur-md">
                <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 border border-white/5">
                  <Package size={40} className="text-white/20" strokeWidth={1} />
                </div>
                <h3 className="text-white text-xl font-bold tracking-wide mb-3">No Active Shipments</h3>
                <p className="text-white/40 text-sm font-light max-w-sm mb-8 leading-relaxed">
                  Your logistics ledger is currently empty. Initiate a new shipment to begin tracking.
                </p>
                <Link 
                  href="/courier/add" 
                  className="bg-[#D4AF37] text-[#2B1B17] px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-[#2B1B17] transition-all"
                >
                  Create Shipment
                </Link>
              </div>
            ) : (
              /* Courier Cards */
              <div className="flex flex-col gap-4">
                {couriers.map((courier) => (
                  <Link 
                    key={courier.uid || courier.parcelID} 
                    href={`/courier/${courier.uid}`}
                    className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all group flex flex-col sm:flex-row sm:items-center gap-6"
                  >
                    {/* Icon Box */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-[#D4AF37]/20 transition-all group-hover:scale-105">
                      <Package size={24} className="text-white/40 group-hover:text-[#D4AF37] transition-colors" strokeWidth={1.5} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-bold tracking-wide truncate">Parcel #{courier.parcelID}</span>
                        {courier.status ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                            <CheckCircle2 size={12} className="text-[#D4AF37]" />
                            <span className="text-[#D4AF37] text-[9px] font-black uppercase tracking-widest">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                            <Clock size={12} className="text-white/60" />
                            <span className="text-white/60 text-[9px] font-black uppercase tracking-widest">In Transit</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-white/40 text-xs font-light">
                        <div className="flex items-center gap-2 truncate max-w-[200px]">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate">{courier.recipientName}</span>
                        </div>
                        {courier.deliveryDate && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Clock size={12} />
                            <span>{courier.deliveryDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 items-center justify-center group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-all">
                      <ChevronRight size={16} className="text-white/30 group-hover:text-[#D4AF37] transition-colors group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </PageShell>
  );
}
