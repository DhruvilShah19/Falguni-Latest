'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, or, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addToCart } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, ListFilter, X, Search, ArrowRight, PackageOpen } from 'lucide-react';

interface OrderItem {
  name?: string; productName?: string; quantity: number;
  price?: number; selectedPrice?: number; image1?: string; image?: string;
  selected?: string; vendorId?: string; productID?: string;
}

interface Order {
  id: string; orderID?: number; total?: number; subTotal?: number;
  status: string;
  createdAt?: any; timeCreated?: any; date?: string;
  items?: OrderItem[]; orders?: OrderItem[];
  userId?: string; userID?: string; uid?: string;
}

const STATUS: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  'Pending Payment': { dot: 'bg-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  Pending:      { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30'   },
  Received:     { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30'   },
  Processing:   { dot: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/30'     },
  Shipped:      { dot: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/30'  },
  'On the way': { dot: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/30'  },
  Delivered:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  Completed:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  Cancelled:    { dot: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/30'    },
};
const Sx = (s: string) => STATUS[s] ?? { dot: 'bg-white/20', text: 'text-white/50', bg: 'bg-white/5', border: 'border-white/15' };

const STATUS_OPTIONS = ['All', 'Pending Payment', 'Received', 'Processing', 'Completed', 'Cancelled'];
const DATE_OPTIONS   = ['Last 30 days', 'Last 3 months', 'Last 6 months', '2024', '2023', 'All time'];
const SORT_OPTIONS   = ['Newest to Oldest', 'Oldest to Newest'];

const getMs = (o: Order): number => {
  if (o.createdAt) {
    if (typeof o.createdAt.toMillis === 'function') return o.createdAt.toMillis();
    if (o.createdAt.seconds) return o.createdAt.seconds * 1000;
  }
  if (o.timeCreated) {
    if (typeof o.timeCreated.toMillis === 'function') return o.timeCreated.toMillis();
    if (o.timeCreated.seconds) return o.timeCreated.seconds * 1000;
    const d = new Date(o.timeCreated); if (!isNaN(d.getTime())) return d.getTime();
  }
  if (o.date) { const d = new Date(o.date); if (!isNaN(d.getTime())) return d.getTime(); }
  return 0;
};
const fmtDate = (o: Order) => {
  const ms = getMs(o);
  if (ms) return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return o.timeCreated?.toString?.() ?? o.date ?? 'Unknown Date';
};
const oid = (o: Order) => o.orderID ? `#${o.orderID}` : `#${o.id.slice(-8).toUpperCase()}`;

export default function OrdersPage() {
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All time');
  const [sortFilter, setSortFilter] = useState('Newest to Oldest');

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) { router.push('/login'); return; }

    const fetchOrders = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, 'Orders'),
            or(
              where('userId', '==', firebaseUser.uid),
              where('userID', '==', firebaseUser.uid),
              where('uid', '==', firebaseUser.uid)
            )
          )
        );
        const fetched: Order[] = [];
        snap.forEach(d => {
          const data = d.data() as Order;
          if (data.status !== 'Pending Payment' && data.status !== 'Pending') {
            fetched.push({ id: d.id, ...data });
          }
        });
        setOrders(fetched);
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [firebaseUser, authLoading, router]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    const now = new Date();
    let cutoff: Date | null = null;
    let endCutoff: Date | null = null;
    if (dateFilter === 'Last 30 days') cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    else if (dateFilter === 'Last 3 months') cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    else if (dateFilter === 'Last 6 months') cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    else if (dateFilter === '2024') { cutoff = new Date(2024, 0, 1); endCutoff = new Date(2025, 0, 1); }
    else if (dateFilter === '2023') { cutoff = new Date(2023, 0, 1); endCutoff = new Date(2024, 0, 1); }

    if (cutoff) {
      result = result.filter(o => {
        const ms = getMs(o);
        if (!ms) return true;
        const d = new Date(ms);
        if (d < cutoff!) return false;
        if (endCutoff && d >= endCutoff) return false;
        return true;
      });
    }

    result.sort((a, b) => {
      const ta = getMs(a), tb = getMs(b);
      return sortFilter === 'Newest to Oldest' ? tb - ta : ta - tb;
    });

    return result;
  }, [orders, statusFilter, dateFilter, sortFilter]);

  const hasActiveFilters = statusFilter !== 'All' || dateFilter !== 'All time' || sortFilter !== 'Newest to Oldest';

  if (authLoading || loading) {
    return <PageShell><div className="min-h-screen bg-[#2B1B17] flex justify-center pt-40"><LoadingSpinner /></div></PageShell>;
  }

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
               YOUR ACQUISITIONS
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
             </div>
             
             <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
               The Archives
             </h1>
             
             <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
               Review your past acquisitions and digital receipts.
             </p>
           </div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 relative z-10">
          
          {/* Filters Toggle */}
          <div className="flex justify-end mb-12 animate-fade-up">

            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#D4AF37]/30 transition-all text-xs font-bold tracking-widest uppercase text-white/80 group"
            >
              <ListFilter size={16} className="text-[#D4AF37]" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              )}
            </button>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm animate-fade-up">
              <div className="w-20 h-20 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center mb-6">
                <Search size={32} className="text-[#D4AF37]/40" />
              </div>
              <h3 className="text-2xl font-serif text-white mb-2 italic">No acquisitions found</h3>
              <p className="text-white/40 text-sm max-w-sm mb-8">Your archives are empty for this selection. Try adjusting your filters or making a new purchase.</p>
              {hasActiveFilters && (
                <button 
                  onClick={() => { setStatusFilter('All'); setDateFilter('All time'); setSortFilter('Newest to Oldest'); }}
                  className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-8 py-3 hover:bg-[#D4AF37]/10 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {filteredOrders.map((order, idx) => {
                const st = Sx(order.status);
                const items = order.items || order.orders || [];
                const firstItemImg = items[0]?.image1 || items[0]?.image;
                const total = order.total ?? 0;
                const otherItemsCount = items.length - 1;

                return (
                  <Link href={`/orders/${order.id}`} key={order.id} className="block group animate-fade-up" style={{ animationDelay: `${Math.min(idx, 10) * 50}ms` }}>
                    <div className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:border-[#D4AF37]/40 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.1)]">
                      
                      {/* Image Left Pane (Desktop) / Top Pane (Mobile) */}
                      <div className="w-full md:w-[35%] h-[200px] md:h-auto relative bg-black/40 overflow-hidden">
                        {firstItemImg ? (
                          <>
                            <Image 
                              src={firstItemImg} 
                              alt="Order Item" 
                              fill 
                              className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
                              sizes="(max-width: 768px) 100vw, 35vw"
                            />
                            {/* Gradient overlay to blend into the card color */}
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#2B1B17]/40 to-[#2B1B17]" />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                            <PackageOpen size={48} className="mb-4 text-[#D4AF37]" />
                            <span className="font-serif italic text-2xl">Maison Falguni</span>
                          </div>
                        )}
                        
                        {/* Items badge overlay */}
                        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
                          <div className={`inline-flex px-3 py-1 rounded-full border backdrop-blur-md text-[9px] font-bold tracking-[0.2em] uppercase shadow-lg ${st.text} ${st.bg} ${st.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${st.dot}`} />
                            {order.status}
                          </div>
                          {otherItemsCount > 0 && (
                            <div className="inline-flex px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] text-white/90 shadow-lg">
                              +{otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Right Pane */}
                      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative z-10 bg-[#2B1B17]/40 md:bg-transparent">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase">
                            {fmtDate(order)}
                          </p>
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 group-hover:-rotate-45 transition-all duration-300 text-white/50 group-hover:text-[#D4AF37]">
                            <ArrowRight size={14} />
                          </div>
                        </div>

                        <h2 className="font-serif text-3xl text-white mb-6 italic tracking-tight group-hover:text-[#D4AF37] transition-colors">
                          Order {oid(order)}
                        </h2>

                        <div className="flex items-end justify-between border-t border-white/5 pt-6 mt-auto">
                          <div>
                            <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Total Value</p>
                            <p className="text-white font-serif text-2xl">₹{total.toFixed(2)}</p>
                          </div>
                          
                          <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            View Receipt
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowFilters(false)} />
          <div className="relative w-full sm:max-w-md bg-[#2B1B17] rounded-t-3xl sm:rounded-3xl border border-[#D4AF37]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] animate-fade-up">
            
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white flex items-center gap-3">
                <ListFilter size={16} className="text-[#D4AF37]" /> Filter Archives
              </h3>
              <button onClick={() => setShowFilters(false)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white/60">
                <X size={14} />
              </button>
            </div>

            <div className="relative z-10 p-6 overflow-y-auto flex flex-col gap-8">
              {[
                { label: 'Status', opts: STATUS_OPTIONS, val: statusFilter, set: setStatusFilter },
                { label: 'Time Period', opts: DATE_OPTIONS, val: dateFilter, set: setDateFilter },
                { label: 'Sort Order', opts: SORT_OPTIONS, val: sortFilter, set: setSortFilter },
              ].map(({ label, opts, val, set }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#D4AF37]/60 mb-3">{label}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {opts.map(o => {
                      const active = val === o;
                      return (
                        <button key={o} onClick={() => set(o)}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.1em] uppercase transition-all ${
                            active 
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#E8C252] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                              : 'bg-white/[0.03] border border-white/10 text-white/60 hover:bg-white/[0.08] hover:border-[#D4AF37]/30 hover:text-white'
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 p-6 border-t border-white/5 bg-black/20">
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full py-4 rounded-2xl font-bold tracking-[0.2em] uppercase text-sm bg-gradient-to-r from-[#D4AF37] to-[#E8C252] text-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
