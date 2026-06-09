'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Bell, Trash2, Package } from 'lucide-react';
import Link from 'next/link';

interface NotificationModel {
  uid: string;
  message: string;
  timeCreated: any; // Firestore Timestamp or string or number
}

export default function NotificationsPage() {
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!authLoading) {
      if (firebaseUser) {
        fetchNotifications();
      } else {
        setLoading(false);
      }
    }
  }, [firebaseUser, authLoading]);

  const handleDelete = async (id: string) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'Notifications', id));
      setNotifications(prev => prev.filter(n => n.uid !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const parseDate = (raw: any): string => {
    if (!raw) return 'Recently';
    if (raw.toDate) return raw.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (typeof raw === 'number') return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return String(raw);
  };

  const isOrderNotif = (msg: string) => msg.toLowerCase().includes('order');

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
      <div className="min-h-screen bg-[#2B1B17] relative pb-32">
        {/* ── Ultra Premium Editorial Hero ── */}
        <div className="relative w-full min-h-[40vh] flex flex-col items-center justify-center pt-32 pb-12 px-4 border-b border-[#D4AF37]/10 mb-8 z-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />

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
               ALERTS
               <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
             </span>
             
             <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-tight" style={{ fontStyle: 'italic', textShadow: '0 0 30px rgba(212,175,55,0.15)' }}>
               Notifications
             </h1>
             
             <p className="mt-8 text-white/50 font-light max-w-md mx-auto text-sm tracking-wide">
               Stay updated on your orders and exclusive offers.
             </p>
           </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 relative z-10">

          {/* Timeline Content */}
          {notifications.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[32px]">
              <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell size={32} className="text-[#D4AF37]/50" />
              </div>
              <h3 className="text-xl text-white font-serif mb-2">No new notifications</h3>
              <p className="text-white/40">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notifications.map((notif) => {
                const isOrder = isOrderNotif(notif.message);
                return (
                  <div 
                    key={notif.uid}
                    className="group bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all flex items-start gap-5 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                      isOrder 
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/20' 
                        : 'bg-white/5 border-white/10 group-hover:bg-white/10'
                    }`}>
                      {isOrder ? (
                        <Package size={20} className="text-[#D4AF37]" />
                      ) : (
                        <Bell size={20} className="text-white/60 group-hover:text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className={`text-sm font-bold tracking-wide uppercase ${isOrder ? 'text-[#D4AF37]' : 'text-white/70'}`}>
                          {isOrder ? 'Order Update' : 'Alert'}
                        </h4>
                        <span className="text-[10px] text-white/40 tracking-wider">
                          {parseDate(notif.timeCreated)}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium">
                        {notif.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(notif.uid)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
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
