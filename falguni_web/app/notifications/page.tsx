'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Bell, Trash2, Package, Sparkles, 
  ArrowRight, ShoppingBag 
} from 'lucide-react';
import Link from 'next/link';

interface NotificationModel {
  uid: string;
  message: string;
  timeCreated: any;
}

export default function NotificationsPage() {
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'orders' | 'alerts'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!firebaseUser) return;
      try {
        const q = query(
          collection(db, 'users', firebaseUser.uid, 'Notifications'),
          orderBy('timeCreated', 'desc')
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => ({
          uid: d.id,
          ...d.data()
        })) as NotificationModel[];
        setNotifications(fetched);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (firebaseUser) {
        fetchNotifications();
      } else {
        setLoading(false);
      }
    }
  }, [firebaseUser, authLoading]);

  const handleDelete = async (id: string) => {
    if (!firebaseUser || deletingId) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'Notifications', id));
      setNotifications(prev => prev.filter(n => n.uid !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!firebaseUser || notifications.length === 0 || clearingAll) return;
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    setClearingAll(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'users', firebaseUser.uid, 'Notifications', n.uid));
      });
      await batch.commit();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setClearingAll(false);
    }
  };

  const parseDate = (raw: any): string => {
    if (!raw) return 'Recently';
    let d: Date | null = null;
    if (raw.toDate) d = raw.toDate();
    else if (typeof raw === 'number') d = new Date(raw);
    else if (typeof raw === 'string') {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    
    if (d) {
      const now = Date.now();
      const diffMin = Math.floor((now - d.getTime()) / (1000 * 60));
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    return String(raw);
  };

  const isOrderNotif = (msg: string) => {
    const lower = (msg || '').toLowerCase();
    return lower.includes('order') || lower.includes('dispatch') || lower.includes('shipped') || lower.includes('delivered') || lower.includes('courier');
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'orders') return notifications.filter(n => isOrderNotif(n.message));
    if (filter === 'alerts') return notifications.filter(n => !isOrderNotif(n.message));
    return notifications;
  }, [notifications, filter]);

  if (authLoading || loading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  // ── Unauthenticated State ──
  if (!firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
          <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
            
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
              <Link href="/" className="hover:text-[#733617] transition-colors">Home</Link>
              <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
              <span className="text-[#733617] font-semibold" aria-current="page">Notifications</span>
            </nav>

            <div className="bg-white border border-[#EFE6DC] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs max-w-lg mx-auto w-full">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4 shadow-xs">
                <Bell size={28} className="text-[#733617]" aria-hidden="true" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] mb-2">
                Sign In to View Notifications
              </h1>
              <p className="text-xs sm:text-sm text-[#65544A] max-w-sm mb-6 leading-relaxed">
                Log in to stay updated on your fresh order dispatches, live delivery milestones, and exclusive seasonal offers.
              </p>
              <Link
                href="/login?redirect=/notifications"
                className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
              >
                <span>Sign In to Account</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

          </div>
        </div>
      </PageShell>
    );
  }

  const orderCount = notifications.filter(n => isOrderNotif(n.message)).length;
  const alertCount = notifications.length - orderCount;

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Left-aligned Breadcrumbs ── */}
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
            <span className="text-[#733617] font-semibold" aria-current="page">
              Notifications
            </span>
          </nav>

          {/* ── 2. Signature Top Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 text-[#733617]">
                  <Sparkles size={12} className="text-[#C88A2C]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    Falguni Parivar • સૂચનાઓ
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Notifications &amp; Alerts
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] max-w-2xl leading-relaxed">
                  Real-time shipping progress, dispatch milestone alerts, festive announcements, and account updates.
                </p>
              </div>

              {/* Action Chip / Clear All */}
              <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-xs font-bold text-[#2D1508]">
                  <Bell size={14} className="text-[#733617]" />
                  <span>{notifications.length} {notifications.length === 1 ? 'Notice' : 'Notices'}</span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={clearingAll}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/70 text-red-700 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{clearingAll ? 'Clearing...' : 'Clear All'}</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* ── 3. Quick Filter Tabs ── */}
          <div className="flex items-center gap-2 border-b border-[#EFE6DC] pb-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#733617] text-white shadow-xs'
                  : 'bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'orders'
                  ? 'bg-[#733617] text-white shadow-xs'
                  : 'bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]'
              }`}
            >
              <Package size={13} />
              <span>Orders &amp; Shipping ({orderCount})</span>
            </button>
            <button
              onClick={() => setFilter('alerts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'alerts'
                  ? 'bg-[#733617] text-white shadow-xs'
                  : 'bg-white text-[#65544A] hover:bg-[#FAF7F2] border border-[#EFE6DC]'
              }`}
            >
              <Bell size={13} />
              <span>Announcements ({alertCount})</span>
            </button>
          </div>

          {/* ── 4. Notifications List / Empty State ── */}
          <div className="max-w-4xl mx-auto w-full">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white border border-[#EFE6DC] rounded-2xl shadow-xs">
                <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EFE6DC] rounded-full flex items-center justify-center mx-auto mb-4 text-[#733617] shadow-xs">
                  <Bell size={26} />
                </div>
                <h2 className="text-xl sm:text-2xl text-[#2D1508] font-serif font-bold mb-2">
                  You&apos;re All Caught Up!
                </h2>
                <p className="text-[#65544A] text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  No new notifications at this time. We will notify you here as soon as your orders are placed, dispatched, or when special festive items arrive.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
                >
                  <ShoppingBag size={14} />
                  <span>Browse Fresh Delicacies</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredNotifications.map((notif) => {
                  const isOrder = isOrderNotif(notif.message);
                  const isBeingDeleted = deletingId === notif.uid;

                  return (
                    <article 
                      key={notif.uid}
                      className={`group bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 hover:border-[#733617]/50 transition-all flex items-start gap-3.5 sm:gap-4 shadow-xs relative overflow-hidden ${
                        isBeingDeleted ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      {/* Left Icon Badge */}
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOrder 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-[#FAF7F2] text-[#733617] border border-[#EFE6DC]'
                      }`}>
                        {isOrder ? (
                          <Package size={18} />
                        ) : (
                          <Bell size={18} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                            isOrder 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : 'bg-[#FAF7F2] text-[#733617]'
                          }`}>
                            {isOrder ? 'Order Update' : 'Announcement'}
                          </span>
                          <span className="text-[11px] text-[#8A796F] font-medium">
                            {parseDate(notif.timeCreated)}
                          </span>
                        </div>
                        <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed mt-1 font-medium">
                          {notif.message}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(notif.uid)}
                        disabled={isBeingDeleted}
                        className="opacity-70 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-50 text-[#8A796F] hover:text-red-600 self-center sm:self-start cursor-pointer"
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}

