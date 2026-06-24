'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, ShieldAlert, FileText, ArrowRightCircle, CheckCircle2, AlertTriangle, Search, Loader2 } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import Link from 'next/link';

interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  date: Date;
  amount: number;
  status: string;
}

interface AuditResult {
  appOrderId: string;
  cfOrderId: string;
  cfStatus: string;
  isPaid: boolean;
  amount: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  cfPaymentTime: string;
  timeCreated?: string;
}

export default function AuditOrdersPage() {
  const { userDoc, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'tracking' | 'verification'>('tracking');
  
  // Tab 1: Tracking State
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(true);

  // Tab 2: Verification State
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<AuditResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [batchResults, setBatchResults] = useState<AuditResult[]>([]);
  const [hasRunBatch, setHasRunBatch] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ total: 0, paid: 0, notPaid: 0, noId: 0 });

  // ── TRACKING FETCH (TAB 1) ──
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userDoc?.uid) {
        setLoadingTracking(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'Orders'),
          where('userID', '==', userDoc.uid)
        );
        const snap = await getDocs(q);

        const items: TransactionItem[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          let paymentType = data.paymentType || '';
          if (paymentType === 'Cash on delivery') {
            paymentType = 'Cash Free';
          }

          if (paymentType === 'Cash Free') {
            let date = new Date();
            if (data.timeCreated?.toDate) {
              date = data.timeCreated.toDate();
            } else if (typeof data.timeCreated === 'string') {
              date = new Date(data.timeCreated);
            }

            const total = data.total || 0;
            const status = data.status || 'Received';
            const orderID = data.orderID || '';

            let displayStatus = 'Debited';
            if (status === 'Cancelled') {
              displayStatus = 'Returned back';
            } else if (status === 'Received' || status === 'Processing') {
              displayStatus = 'Pending';
            }

            items.push({
              id: doc.id,
              title: `Order #${orderID}`,
              subtitle: status,
              date,
              amount: total,
              status: displayStatus,
            });
          }
        });

        items.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(items);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoadingTracking(false);
      }
    };

    if (!authLoading) {
      fetchTransactions();
    }
  }, [userDoc, authLoading]);

  // ── VERIFICATION FETCH (TAB 2) ──
  const runManualLookup = async () => {
    const id = lookupOrderId.trim();
    if (!id) {
      setLookupError('Please enter a Cashfree Order ID.');
      return;
    }
    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/cashfree/verify?orderId=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification Failed');
      
      setLookupResult({ ...data, appOrderId: 'N/A' });
    } catch (err: any) {
      setLookupError(err.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  const runBatchVerification = async () => {
    if (!userDoc?.uid) return;
    setIsBatchVerifying(true);
    setHasRunBatch(false);
    setBatchError(null);
    setBatchResults([]);
    
    let total = 0, paid = 0, notPaid = 0, noId = 0;
    const tempResults: AuditResult[] = [];

    try {
      const q = query(
        collection(db, 'Orders'),
        where('userID', '==', userDoc.uid)
      );
      const snap = await getDocs(q);
      
      const cutoff = new Date('2026-02-23T00:00:00Z');

      for (const doc of snap.docs) {
        const d = doc.data();
        
        let date = new Date(0);
        if (d.timeCreated?.toDate) date = d.timeCreated.toDate();
        else if (typeof d.timeCreated === 'string') date = new Date(d.timeCreated);

        if (date < cutoff) continue;
        
        let pType = d.paymentType || '';
        if (pType !== 'Cash Free') continue;
        
        total++;

        const cfDetails = d.cashFreeDetails || {};
        const cfId = cfDetails.order_id;
        const appOrderId = d.orderID?.toString() || 'N/A';
        const fallbackTime = d.timeCreated?.toString() || '';

        if (!cfId) {
          noId++;
          tempResults.push({
            appOrderId,
            cfOrderId: 'MISSING',
            cfStatus: 'NO ORDER ID',
            isPaid: false,
            amount: 0,
            customerName: '',
            customerPhone: '',
            paymentMethod: '',
            timeCreated: fallbackTime,
            cfPaymentTime: '',
          });
          continue;
        }

        // Verify with API sequentially to not overload
        try {
          const res = await fetch(`/api/cashfree/verify?orderId=${cfId}`);
          if (res.ok) {
            const data = await res.json();
            const result: AuditResult = { ...data, appOrderId, timeCreated: fallbackTime };
            if (result.isPaid) paid++;
            else notPaid++;
            tempResults.push(result);
          } else {
            const errData = await res.json();
            tempResults.push({
              appOrderId, cfOrderId: cfId, cfStatus: 'API ERROR', isPaid: false, amount: 0,
              customerName: '', customerPhone: '', paymentMethod: errData.error || 'Unknown Error',
              timeCreated: fallbackTime, cfPaymentTime: ''
            });
            notPaid++;
          }
        } catch (e) {
          tempResults.push({
            appOrderId, cfOrderId: cfId, cfStatus: 'NETWORK ERROR', isPaid: false, amount: 0,
            customerName: '', customerPhone: '', paymentMethod: 'Fetch failed',
            timeCreated: fallbackTime, cfPaymentTime: ''
          });
          notPaid++;
        }
      }

      tempResults.sort((a, b) => {
        if (a.isPaid === b.isPaid) return 0;
        return a.isPaid ? 1 : -1;
      });

      setMetrics({ total, paid, notPaid, noId });
      setBatchResults(tempResults);
      setHasRunBatch(true);
    } catch (err: any) {
      setBatchError(err.message);
    } finally {
      setIsBatchVerifying(false);
    }
  };


  const totalSpent = transactions
    .filter((t) => t.status !== 'Returned back')
    .reduce((sum, t) => sum + t.amount, 0);

  if (authLoading || (loadingTracking && activeTab === 'tracking')) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#2B1B17] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  // ── RENDER HELPERS ──
  const AuditTile = ({ r }: { r: AuditResult }) => {
    const sc = r.isPaid ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30';
    const bg = r.isPaid ? 'bg-green-500/5' : 'bg-red-500/5';
    
    return (
      <div className={`mb-4 p-5 rounded-2xl border ${sc} ${bg} flex flex-col gap-4 shadow-md`}>
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            {r.isPaid ? <CheckCircle2 className="text-green-400" /> : <AlertTriangle className="text-red-400" />}
            <span className={`font-bold tracking-wide ${r.isPaid ? 'text-green-400' : 'text-red-400'}`}>
              {r.isPaid ? 'Payment Verified' : 'Payment Not Verified'}
            </span>
          </div>
          <div className={`px-3 py-1 rounded border text-[10px] uppercase font-black tracking-widest ${sc}`}>
            {r.cfStatus}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
          {r.appOrderId !== 'N/A' && <div className="flex gap-2"><span className="text-white/40 min-w-[80px]">App Order:</span> <span className="text-white/80">#{r.appOrderId}</span></div>}
          <div className="flex gap-2"><span className="text-white/40 min-w-[80px]">CF ID:</span> <span className="text-white/80 truncate">{r.cfOrderId}</span></div>
          <div className="flex gap-2"><span className="text-white/40 min-w-[80px]">Amount:</span> <span className="text-white/80">₹{r.amount.toFixed(2)}</span></div>
          {r.customerName && <div className="flex gap-2"><span className="text-white/40 min-w-[80px]">Name:</span> <span className="text-white/80">{r.customerName}</span></div>}
          {r.paymentMethod && <div className="flex gap-2"><span className="text-white/40 min-w-[80px]">Via:</span> <span className="text-white/80">{r.paymentMethod}</span></div>}
          {r.cfPaymentTime && <div className="flex gap-2"><span className="text-white/40 min-w-[80px]">Paid At:</span> <span className="text-white/80">{new Date(r.cfPaymentTime).toLocaleString()}</span></div>}
        </div>
      </div>
    );
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

        {/* ── Premium Header Banner ── */}
        <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-20 flex flex-col items-center justify-center mb-6 md:mb-12">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

           {/* Back Button */}
           <div className="absolute top-28 md:top-36 left-4 md:left-8 z-50">
             <BackButton href="/profile" label="Back" />
           </div>

           <div className="relative z-10 text-center px-4 w-full mt-4 md:mt-0">
             <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
               SECURE LEDGER
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
             </div>
             
             <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
               Transaction Data
             </h1>
             
             <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
               Review your complete digital transaction history and verify your Cashfree payments securely.
             </p>
           </div>
           {/* Tab Navigation */}
           <div className="relative z-10 flex gap-4 mt-8 pb-4">
             <button
               onClick={() => setActiveTab('tracking')}
               className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                 activeTab === 'tracking' 
                  ? 'bg-[#D4AF37] text-[#1A110D] shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
               }`}
             >
               Tracking
             </button>
             <button
               onClick={() => setActiveTab('verification')}
               className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                 activeTab === 'verification' 
                  ? 'bg-[#D4AF37] text-[#1A110D] shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
               }`}
             >
               Verification
             </button>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full px-5 md:px-8 relative z-10">
          
          {/* ========================================= */}
          {/* TAB 1: TRACKING */}
          {/* ========================================= */}
          {activeTab === 'tracking' && (
            <div className="animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Total Spent Card */}
                <div className="md:col-span-2 bg-white/[0.02] border border-[#D4AF37]/20 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <ShieldAlert size={120} className="text-[#D4AF37] -rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[#D4AF37]/80 text-xs font-black uppercase tracking-[0.3em] mb-4">Total Digital Spend</h3>
                    <p className="text-white text-5xl md:text-6xl font-serif italic tracking-tight">
                      ₹{totalSpent.toFixed(2)}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-bold tracking-widest">
                      Recorded via Cashfree
                    </div>
                  </div>
                </div>

                {/* Portal Link Card */}
                <a 
                  href="https://www.cashfree.com/customer-hub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/40 rounded-3xl p-8 flex flex-col justify-between group hover:border-[#D4AF37] transition-all"
                >
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">Customer Hub</h3>
                    <p className="text-white/60 text-sm font-light leading-relaxed">View all your transactions on Cashfree's official portal.</p>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                      <ArrowRightCircle size={24} className="text-[#2B1B17]" />
                    </div>
                  </div>
                </a>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-white text-2xl font-serif italic tracking-wide">Transaction Ledger</h2>
                <span className="text-white/40 text-xs uppercase tracking-widest font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {transactions.length} Records
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={32} className="text-[#D4AF37]/50" />
                  </div>
                  <h3 className="text-xl text-white font-serif mb-2">No Transactions Found</h3>
                  <p className="text-white/40">You don't have any digital payments recorded yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id}
                      className="bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-[#D4AF37]/30 transition-all rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#D4AF37]/20 transition-colors">
                          <FileText size={20} className="text-white/50 group-hover:text-[#D4AF37]" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold tracking-wide mb-1 text-lg">{tx.title}</h4>
                          <p className="text-white/40 text-xs tracking-wider uppercase font-medium">
                            {tx.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 pl-16 sm:pl-0 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                        <span className={`text-xl font-bold tracking-tight ${tx.status === 'Returned back' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.status === 'Returned back' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
                          tx.status === 'Returned back' ? 'bg-green-500/10 text-green-400' :
                          tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-white/5 text-white/50'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 2: VERIFICATION */}
          {/* ========================================= */}
          {activeTab === 'verification' && (
            <div className="animate-fade-up">
              
              {/* Feature Notice */}
              <div className="mb-10 bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex gap-4">
                <AlertTriangle className="text-[#D4AF37] flex-shrink-0" />
                <p className="text-white/70 text-sm leading-relaxed">
                  Note: Deep programmatic verification via Cashfree is supported for orders placed after <strong className="text-white">Feb 23rd, 2026</strong>. Older orders may not successfully verify via the automated batch processor.
                </p>
              </div>

              {/* Manual Lookup */}
              <div className="mb-10">
                <h2 className="text-white text-xl font-serif italic mb-4">Lookup Specific Order</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-[#D4AF37]/50" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter Cashfree Order ID..."
                      value={lookupOrderId}
                      onChange={(e) => setLookupOrderId(e.target.value)}
                      className="w-full bg-white/[0.07] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-colors placeholder:text-white/30"
                    />
                  </div>
                  <button 
                    onClick={runManualLookup}
                    disabled={isLookingUp}
                    className="bg-[#D4AF37] text-[#1A110D] font-bold tracking-widest uppercase text-xs px-8 py-4 rounded-xl hover:bg-[#E5C158] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLookingUp && <Loader2 size={16} className="animate-spin" />}
                    Verify
                  </button>
                </div>
                
                {lookupError && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {lookupError}
                  </div>
                )}

                {lookupResult && (
                  <div className="mt-6">
                    <AuditTile r={lookupResult} />
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-white/10 mb-10" />

              {/* Batch Verification */}
              <div className="mb-6">
                <h2 className="text-white text-xl font-serif italic mb-4">Batch Verification</h2>
                
                {hasRunBatch && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-white text-2xl font-bold">{metrics.total}</p>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">My Orders</p>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
                      <p className="text-green-400 text-2xl font-bold">{metrics.paid}</p>
                      <p className="text-green-400/60 text-[10px] uppercase tracking-widest mt-1">Paid ✅</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                      <p className="text-red-400 text-2xl font-bold">{metrics.notPaid}</p>
                      <p className="text-red-400/60 text-[10px] uppercase tracking-widest mt-1">Not Paid ⚠️</p>
                    </div>
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-center">
                      <p className="text-orange-400 text-2xl font-bold">{metrics.noId}</p>
                      <p className="text-orange-400/60 text-[10px] uppercase tracking-widest mt-1">No ID</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={runBatchVerification}
                  disabled={isBatchVerifying}
                  className="w-full bg-[#1A110D] border border-[#D4AF37] text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs py-5 rounded-2xl hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 mb-8"
                >
                  {isBatchVerifying ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying Server-Side...</>
                  ) : (
                    <><ShieldAlert size={18} /> {hasRunBatch ? 'Re-verify All Transactions' : 'Verify All My Transactions'}</>
                  )}
                </button>

                {batchError && (
                  <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {batchError}
                  </div>
                )}

                {!hasRunBatch && !isBatchVerifying ? (
                  <div className="text-center py-16 text-white/40 text-sm">
                    Tap "Verify All My Transactions" to cross-reference your Falguni orders securely against the Cashfree Payment Gateway.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {batchResults.map((r, i) => <AuditTile key={i} r={r} />)}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
