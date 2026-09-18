'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, or, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ListFilter, 
  X, 
  Search, 
  ArrowRight, 
  PackageOpen, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  Calendar,
  ArrowLeft
} from 'lucide-react';

interface OrderItem {
  name?: string; 
  productName?: string; 
  quantity: number;
  price?: number; 
  selectedPrice?: number; 
  image1?: string; 
  image?: string;
  selected?: string; 
  vendorId?: string; 
  productID?: string;
}

interface Order {
  id: string; 
  orderID?: number; 
  total?: number; 
  subTotal?: number;
  status: string;
  createdAt?: any; 
  timeCreated?: any; 
  date?: string;
  items?: OrderItem[]; 
  orders?: OrderItem[];
  userId?: string; 
  userID?: string; 
  uid?: string;
}

const STATUS: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  'Pending Payment': { dot: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  Pending: { dot: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  Received: { dot: 'bg-amber-600', text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  Processing: { dot: 'bg-sky-500', text: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-200' },
  Shipped: { dot: 'bg-purple-500', text: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
  'On the way': { dot: 'bg-purple-500', text: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
  Delivered: { dot: 'bg-emerald-500', text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Completed: { dot: 'bg-emerald-500', text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Cancelled: { dot: 'bg-rose-500', text: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const Sx = (s: string) => STATUS[s] ?? { dot: 'bg-[#733617]', text: 'text-[#733617]', bg: 'bg-[#FAF7F2]', border: 'border-[#EFE6DC]' };

const STATUS_TABS = ['All', 'Processing', 'Delivered', 'Cancelled'] as const;
const DATE_OPTIONS = ['All time', 'Last 30 days', 'Last 3 months', 'Last 6 months', '2024', '2023'];
const SORT_OPTIONS = ['Newest to Oldest', 'Oldest to Newest'];

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
  if (ms) return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return o.timeCreated?.toString?.() ?? o.date ?? 'Recent Order';
};

const oid = (o: Order) => o.orderID ? `#${o.orderID}` : `#${o.id.slice(-8).toUpperCase()}`;

export default function OrdersPage() {
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All time');
  const [sortFilter, setSortFilter] = useState('Newest to Oldest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) { router.push('/login?redirect=/orders'); return; }

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
            fetched.push({ ...data, id: d.id });
          }
        });
        setOrders(fetched);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [firebaseUser, authLoading, router]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Processing') {
        result = result.filter(o => ['Received', 'Processing', 'Shipped', 'On the way'].includes(o.status));
      } else {
        result = result.filter(o => o.status === statusFilter);
      }
    }

    // Search Query (by Order ID or Product Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(o => {
        const idMatch = (o.orderID?.toString() || '').includes(q) || o.id.toLowerCase().includes(q);
        const items = o.items || o.orders || [];
        const itemMatch = items.some(i => (i.name || i.productName || '').toLowerCase().includes(q));
        return idMatch || itemMatch;
      });
    }

    // Date Filter
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

    // Sort Order
    result.sort((a, b) => {
      const ta = getMs(a), tb = getMs(b);
      return sortFilter === 'Newest to Oldest' ? tb - ta : ta - tb;
    });

    return result;
  }, [orders, statusFilter, searchQuery, dateFilter, sortFilter]);

  const hasActiveFilters = dateFilter !== 'All time' || sortFilter !== 'Newest to Oldest';

  if (authLoading || loading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-20">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <Link href="/profile" className="hover:text-[#733617] transition-colors">
              My Account
            </Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Order History</span>
          </nav>

          {/* ── Header Banner Card ── */}
          <div className="bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              <div className="flex items-start gap-4">
                <Link
                  href="/profile"
                  aria-label="Back to My Account"
                  className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center hover:bg-white text-[#733617] transition-all shadow-xs shrink-0 mt-0.5"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[11px] font-bold uppercase tracking-wider text-[#733617] mb-2">
                    <Sparkles size={12} className="text-[#D49B4B]" />
                    <span>FALGUNI PARIVAR • મારા ઓર્ડર</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] tracking-tight">
                    Order History &amp; Tracking
                  </h1>
                  <p className="text-xs sm:text-sm text-[#65544A] mt-1 leading-relaxed">
                    Review your past purchases, track live dispatches, and download GST receipts.
                  </p>
                </div>
              </div>

              {/* Order Stats Pill */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="bg-[#FAF7F2] border border-[#EFE6DC] px-4 py-2.5 rounded-2xl text-center">
                  <span className="block text-lg font-serif font-bold text-[#733617]">
                    {orders.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#65544A]">
                    Total Orders
                  </span>
                </div>
              </div>

            </div>

            {/* ── Search & Quick Filters Bar ── */}
            <div className="mt-6 pt-6 border-t border-[#EFE6DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#733617]/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID or item name..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-xs text-[#2D1508] placeholder-[#733617]/50 outline-none focus:border-[#733617] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#733617]/60 hover:text-[#733617]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Tab Filters & Advanced Options */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#733617] text-white shadow-xs'
                          : 'bg-[#FAF7F2] border border-[#EFE6DC] text-[#65544A] hover:text-[#2D1508] hover:bg-white'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowFilters(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    hasActiveFilters
                      ? 'bg-[#733617]/10 text-[#733617] border border-[#733617]/30'
                      : 'bg-[#FAF7F2] border border-[#EFE6DC] text-[#65544A] hover:bg-white'
                  }`}
                  title="Filter by date range and sort order"
                >
                  <ListFilter size={14} />
                  <span className="hidden sm:inline">More Filters</span>
                </button>
              </div>

            </div>
          </div>

          {/* ── Order Listing Grid ── */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-[#EFE6DC] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center mx-auto mb-4 text-[#733617]">
                <PackageOpen size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2D1508] mb-2">
                No Orders Found
              </h3>
              <p className="text-xs text-[#65544A] mb-6 leading-relaxed">
                {searchQuery || statusFilter !== 'All'
                  ? "We couldn't find any orders matching your selected filters. Try clearing your search query or selecting a different status."
                  : "You haven't placed any orders with Falguni Gruh Udhyog yet. Explore our handcrafted khakhras, namkeens, and sweets!"}
              </p>
              {searchQuery || statusFilter !== 'All' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setDateFilter('All time');
                    setSortFilter('Newest to Oldest');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#733617] text-white text-xs font-bold hover:bg-[#5A290F] transition-colors"
                >
                  Reset All Filters
                </button>
              ) : (
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#733617] text-white text-xs font-bold hover:bg-[#5A290F] transition-colors shadow-sm"
                >
                  <ShoppingBag size={14} />
                  <span>Start Shopping</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5">
              {filteredOrders.map((order, idx) => {
                const st = Sx(order.status);
                const items = order.items || order.orders || [];
                const firstItemImg = items[0]?.image1 || items[0]?.image;
                const total = order.total ?? 0;

                return (
                  <Link
                    href={`/orders/${order.id}`}
                    key={order.id}
                    className="block group bg-white border border-[#EFE6DC] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#733617]/40 transition-all duration-300"
                    style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                        {/* Image Thumbnail */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE6DC] flex-shrink-0">
                          {firstItemImg ? (
                            <Image
                              src={firstItemImg}
                              alt="Order Item"
                              fill
                              sizes="96px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#733617]">
                              <PackageOpen size={24} />
                            </div>
                          )}
                        </div>

                        {/* Order Meta */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                            <span className="font-serif font-bold text-base sm:text-lg text-[#2D1508] group-hover:text-[#733617] transition-colors">
                              Order {oid(order)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${st.text} ${st.bg} ${st.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {order.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#65544A] mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-[#733617]" />
                              {fmtDate(order)}
                            </span>
                            <span>•</span>
                            <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                          </div>

                          <p className="text-xs text-[#65544A] line-clamp-1">
                            {items.map(i => `${i.quantity}x ${i.name || i.productName || 'Delicacy'}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Price & CTA */}
                      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#EFE6DC]">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-[#65544A] block">
                            Total Paid
                          </span>
                          <span className="font-serif text-lg sm:text-xl font-bold text-[#2D1508]">
                            ₹{total.toFixed(2)}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs font-bold text-[#733617] group-hover:text-[#5A290F] transition-colors">
                          <span>View Details</span>
                          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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

      {/* ── Advanced Filter Modal ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#EFE6DC] shadow-2xl p-6 overflow-hidden">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6DC] mb-5">
              <h3 className="font-serif text-lg font-bold text-[#2D1508] flex items-center gap-2">
                <ListFilter size={18} className="text-[#733617]" />
                <span>Filter Orders</span>
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] hover:bg-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#733617] block mb-2">
                  Time Period
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setDateFilter(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        dateFilter === opt
                          ? 'bg-[#733617] text-white'
                          : 'bg-[#FAF7F2] border border-[#EFE6DC] text-[#65544A] hover:bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#733617] block mb-2">
                  Sort Order
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortFilter(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        sortFilter === opt
                          ? 'bg-[#733617] text-white'
                          : 'bg-[#FAF7F2] border border-[#EFE6DC] text-[#65544A] hover:bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EFE6DC] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setDateFilter('All time');
                  setSortFilter('Newest to Oldest');
                }}
                className="text-xs font-bold text-[#733617] hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-5 py-2.5 rounded-xl bg-[#733617] text-white text-xs font-bold hover:bg-[#5A290F] transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </PageShell>
  );
}
