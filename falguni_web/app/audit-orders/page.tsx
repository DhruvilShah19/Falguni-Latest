'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, where, or, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, Receipt, FileText, ShieldCheck, 
  CheckCircle2, AlertTriangle, Search, Loader2, ExternalLink, 
  Printer, X, Sparkles, Clock, CreditCard, RefreshCw, Copy, 
  Check, ShoppingBag
} from 'lucide-react';

interface TransactionItem {
  id: string;
  orderNumber: string;
  appOrderId: string;
  cashFreeOrderId: string;
  date: Date;
  amount: number;
  orderStatus: string;
  displayStatus: 'Debited' | 'Returned back' | 'Pending';
  paymentMethod: string;
  paymentType: string;
  itemsCount: number;
  customerName?: string;
  customerPhone?: string;
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
  const router = useRouter();
  const { firebaseUser, userDoc, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'tracking' | 'verification'>('tracking');

  // Tab 1: Tracking / Payment History State
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Debited' | 'Pending' | 'Returned back'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionItem | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

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

  // ── 1. FETCH TRANSACTIONS (TAB 1) ──
  useEffect(() => {
    const fetchTransactions = async () => {
      const uid = firebaseUser?.uid || userDoc?.uid;
      if (!uid) {
        setLoadingTracking(false);
        return;
      }

      try {
        let snap;
        try {
          // Attempt unified OR query across potential user ID fields
          const q = query(
            collection(db, 'Orders'),
            or(
              where('userID', '==', uid),
              where('userId', '==', uid),
              where('uid', '==', uid)
            )
          );
          snap = await getDocs(q);
        } catch (_orErr) {
          // Fallback to primary userID query
          const q = query(collection(db, 'Orders'), where('userID', '==', uid));
          snap = await getDocs(q);
        }

        const items: TransactionItem[] = [];
        const seenDocIds = new Set<string>();

        snap.forEach((docSnap) => {
          if (seenDocIds.has(docSnap.id)) return;
          seenDocIds.add(docSnap.id);

          const data = docSnap.data();
          let paymentType = data.paymentType || data.paymentMethod || '';
          if (paymentType === 'Cash on delivery') {
            paymentType = 'Cash Free';
          }

          const cfOrderId = data.cashFreeDetails?.order_id || data.cashFreeDetails?.cf_order_id || data.cashfreeOrderId || '';
          const isDigitalPayment = paymentType === 'Cash Free' || paymentType === 'Online' || !!cfOrderId;

          // Process records with digital payment or online order history
          if (isDigitalPayment) {
            let date = new Date();
            if (data.timeCreated?.toDate) {
              date = data.timeCreated.toDate();
            } else if (data.createdAt?.toDate) {
              date = data.createdAt.toDate();
            } else if (data.timeCreated?.seconds) {
              date = new Date(data.timeCreated.seconds * 1000);
            } else if (typeof data.timeCreated === 'string') {
              const d = new Date(data.timeCreated);
              if (!isNaN(d.getTime())) date = d;
            } else if (typeof data.date === 'string') {
              const d = new Date(data.date);
              if (!isNaN(d.getTime())) date = d;
            }

            const total = Number(data.total || data.subTotal || 0);
            const status = data.status || 'Received';
            const rawOrderId = data.orderID?.toString() || '';
            const orderNumber = rawOrderId ? `#${rawOrderId}` : `#${docSnap.id.slice(-6).toUpperCase()}`;

            let displayStatus: 'Debited' | 'Returned back' | 'Pending' = 'Debited';
            if (status === 'Cancelled') {
              displayStatus = 'Returned back';
            } else if (status === 'Pending Payment' || status === 'Pending') {
              displayStatus = 'Pending';
            } else if (status === 'Received' || status === 'Processing') {
              // Cashfree orders in Received state have completed digital payment
              displayStatus = 'Debited';
            }

            const itemsCount = (data.items?.length || data.orders?.length || 1);

            items.push({
              id: docSnap.id,
              orderNumber,
              appOrderId: rawOrderId || docSnap.id.slice(-8).toUpperCase(),
              cashFreeOrderId: cfOrderId,
              date,
              amount: total,
              orderStatus: status,
              displayStatus,
              paymentMethod: data.cashFreeDetails?.payment_group || data.paymentMethod || 'Cashfree Gateway',
              paymentType: data.paymentType || 'Cash Free',
              itemsCount,
              customerName: data.name || data.userName || userDoc?.fullname || firebaseUser?.displayName || '',
              customerPhone: data.phone || data.userPhone || userDoc?.phone || firebaseUser?.phoneNumber || '',
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
  }, [firebaseUser, userDoc, authLoading]);

  // ── 2. MANUAL CASHFREE LOOKUP ──
  const runManualLookup = async () => {
    const id = lookupOrderId.trim();
    if (!id) {
      setLookupError('Please enter a valid Cashfree Order ID.');
      return;
    }
    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/cashfree/verify?orderId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment verification failed');
      
      setLookupResult({ ...data, appOrderId: 'N/A' });
    } catch (err: any) {
      setLookupError(err.message || 'Unable to verify order with Cashfree. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // ── 3. BATCH VERIFICATION ──
  const runBatchVerification = async () => {
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (!uid) return;

    setIsBatchVerifying(true);
    setHasRunBatch(false);
    setBatchError(null);
    setBatchResults([]);
    
    let total = 0, paid = 0, notPaid = 0, noId = 0;
    const tempResults: AuditResult[] = [];

    try {
      const q = query(
        collection(db, 'Orders'),
        where('userID', '==', uid)
      );
      const snap = await getDocs(q);

      for (const docSnap of snap.docs) {
        const d = docSnap.data();
        const cfDetails = d.cashFreeDetails || {};
        const cfId = cfDetails.order_id || cfDetails.cf_order_id || d.cashfreeOrderId || '';
        const pType = (d.paymentType || d.paymentMethod || '').toLowerCase();
        
        if (!pType.includes('cash') && !pType.includes('online') && !cfId) continue;
        
        total++;

        const appOrderId = d.orderID?.toString() || docSnap.id.slice(-8).toUpperCase();
        const fallbackTime = d.timeCreated?.toString() || '';

        if (!cfId) {
          noId++;
          tempResults.push({
            appOrderId,
            cfOrderId: 'MISSING',
            cfStatus: 'NO ORDER ID',
            isPaid: false,
            amount: Number(d.total || 0),
            customerName: d.name || '',
            customerPhone: d.phone || '',
            paymentMethod: '',
            timeCreated: fallbackTime,
            cfPaymentTime: '',
          });
          continue;
        }

        // Verify with API sequentially to avoid rate limiting
        try {
          const res = await fetch(`/api/cashfree/verify?orderId=${encodeURIComponent(cfId)}`);
          if (res.ok) {
            const data = await res.json();
            const result: AuditResult = { ...data, appOrderId, timeCreated: fallbackTime };
            if (result.isPaid) paid++;
            else notPaid++;
            tempResults.push(result);
          } else {
            const errData = await res.json();
            tempResults.push({
              appOrderId,
              cfOrderId: cfId,
              cfStatus: 'API ERROR',
              isPaid: false,
              amount: Number(d.total || 0),
              customerName: d.name || '',
              customerPhone: d.phone || '',
              paymentMethod: errData.error || 'Verification Error',
              timeCreated: fallbackTime,
              cfPaymentTime: ''
            });
            notPaid++;
          }
        } catch (_e) {
          tempResults.push({
            appOrderId,
            cfOrderId: cfId,
            cfStatus: 'NETWORK ERROR',
            isPaid: false,
            amount: Number(d.total || 0),
            customerName: d.name || '',
            customerPhone: d.phone || '',
            paymentMethod: 'Fetch failed',
            timeCreated: fallbackTime,
            cfPaymentTime: ''
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
      setBatchError(err.message || 'Batch verification encountered an unexpected error.');
    } finally {
      setIsBatchVerifying(false);
    }
  };

  // ── FILTERED TRANSACTIONS ──
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Status Filter
      if (statusFilter !== 'All' && t.displayStatus !== statusFilter) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrder = t.orderNumber.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
        const matchesCf = t.cashFreeOrderId.toLowerCase().includes(q);
        const matchesAmount = t.amount.toString().includes(q);
        return matchesOrder || matchesCf || matchesAmount;
      }
      return true;
    });
  }, [transactions, statusFilter, searchQuery]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter((t) => t.displayStatus !== 'Returned back')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // ── LOADING STATE ──
  if (authLoading || (loadingTracking && activeTab === 'tracking')) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  // ── NOT LOGGED IN STATE ──
  if (!authLoading && !firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
          <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
              <Link href="/" className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors">
                Home
              </Link>
              <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
              <span className="text-[#733617] font-semibold" aria-current="page">Bills & Invoices</span>
            </nav>

            <div className="bg-white border border-[#EFE6DC] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] flex items-center justify-center mx-auto mb-4">
                <Receipt size={28} aria-hidden="true" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2D1508] mb-2">
                Sign In to View Bills
              </h2>
              <p className="text-[#65544A] text-sm mb-6 leading-relaxed">
                Please log in to your Falguni account to view and download your order invoices and digital payment receipts.
              </p>
              <button
                onClick={() => router.push('/login?redirect=/audit-orders')}
                className="bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                Log In to Account
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── AUDIT TILE HELPER (FOR TAB 2) ──
  const AuditTile = ({ r }: { r: AuditResult }) => {
    const isSuccess = r.isPaid;
    const borderClass = isSuccess ? 'border-emerald-200' : 'border-rose-200';
    const bgClass = isSuccess ? 'bg-emerald-50/50' : 'bg-rose-50/40';
    const textClass = isSuccess ? 'text-emerald-800' : 'text-rose-800';
    const badgeClass = isSuccess ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300';
    
    return (
      <div className={`p-4 sm:p-5 rounded-2xl border ${borderClass} ${bgClass} flex flex-col gap-3.5 shadow-xs transition-all`}>
        <div className="flex items-center justify-between border-b border-[#EFE6DC]/60 pb-3">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" aria-hidden="true" />
            )}
            <span className={`font-bold text-sm tracking-tight ${textClass}`}>
              {isSuccess ? 'Payment Confirmed • ચૂકવણી સફળ' : 'Payment Not Verified • ચૂકવણી અપૂર્ણ'}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${badgeClass}`}>
            {r.cfStatus}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2.5 gap-x-4 text-xs">
          {r.appOrderId !== 'N/A' && (
            <div className="flex items-center gap-2">
              <span className="text-[#8A796F] min-w-[70px]">Order No:</span>
              <span className="text-[#2D1508] font-semibold">#{r.appOrderId}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[#8A796F] min-w-[70px]">CF ID:</span>
            <span className="text-[#2D1508] font-mono text-[11px] truncate max-w-[160px]">{r.cfOrderId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8A796F] min-w-[70px]">Amount:</span>
            <span className="text-[#733617] font-bold text-sm">₹{r.amount.toFixed(2)}</span>
          </div>
          {r.customerName && (
            <div className="flex items-center gap-2">
              <span className="text-[#8A796F] min-w-[70px]">Customer:</span>
              <span className="text-[#2D1508] font-medium">{r.customerName}</span>
            </div>
          )}
          {r.paymentMethod && (
            <div className="flex items-center gap-2">
              <span className="text-[#8A796F] min-w-[70px]">Method:</span>
              <span className="text-[#2D1508]">{r.paymentMethod}</span>
            </div>
          )}
          {r.cfPaymentTime && (
            <div className="flex items-center gap-2">
              <span className="text-[#8A796F] min-w-[70px]">Paid At:</span>
              <span className="text-[#65544A]">{new Date(r.cfPaymentTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <span className="text-[#733617] font-semibold" aria-current="page">Bills & Invoices</span>
          </nav>

          {/* ── 2. Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              
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
                    <span>Falguni Parivar • ઓર્ડર બિલ અને પેમેન્ટ</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] tracking-tight">
                    Bills & Payment Receipts
                  </h1>
                  <p className="text-xs sm:text-sm text-[#65544A] mt-1 leading-relaxed max-w-2xl">
                    Review your digital payment receipts, check Cashfree payment verification status, and print order invoices.
                  </p>
                </div>
              </div>

              {/* Tab Navigation Controls */}
              <div 
                role="tablist" 
                aria-label="Bills navigation tabs"
                className="flex items-center p-1 bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl self-start lg:self-auto shrink-0"
              >
                <button
                  role="tab"
                  id="tab-tracking"
                  aria-selected={activeTab === 'tracking'}
                  aria-controls="panel-tracking"
                  onClick={() => setActiveTab('tracking')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'tracking'
                      ? 'bg-[#733617] text-white shadow-xs'
                      : 'text-[#65544A] hover:text-[#2D1508]'
                  } focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden`}
                >
                  <Receipt size={14} aria-hidden="true" />
                  <span>Payment History • ચૂકવણી</span>
                </button>
                <button
                  role="tab"
                  id="tab-verification"
                  aria-selected={activeTab === 'verification'}
                  aria-controls="panel-verification"
                  onClick={() => setActiveTab('verification')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'verification'
                      ? 'bg-[#733617] text-white shadow-xs'
                      : 'text-[#65544A] hover:text-[#2D1508]'
                  } focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden`}
                >
                  <ShieldCheck size={14} aria-hidden="true" />
                  <span>Verify Payment • તપાસો</span>
                </button>
              </div>

            </div>
          </header>

          {/* ========================================================================= */}
          {/* TAB 1: PAYMENT HISTORY & INVOICES */}
          {/* ========================================================================= */}
          {activeTab === 'tracking' && (
            <div id="panel-tracking" role="tabpanel" aria-labelledby="tab-tracking" className="space-y-6">
              
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Total Spend Card */}
                <div className="md:col-span-2 bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-[#733617]">
                    <ShieldCheck size={140} aria-hidden="true" />
                  </div>
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                          Total Online Paid • કુલ ઓનલાઇન ચૂકવણી
                        </span>
                      </div>
                      <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1508] tracking-tight">
                        ₹{totalSpent.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                        <CheckCircle2 size={13} className="text-emerald-600" aria-hidden="true" />
                        <span>Cashfree Payment Gateway Secured</span>
                      </div>
                      <span className="text-xs text-[#8A796F]">
                        {transactions.length} recorded payments
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cashfree Portal Hub Link */}
                <a 
                  href="https://www.cashfree.com/customer-hub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Visit official Cashfree customer portal (opens in new tab)"
                  className="bg-white border border-[#EFE6DC] hover:border-[#C88A2C] rounded-2xl p-6 flex flex-col justify-between group transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#733617]">
                        Banking Partner
                      </span>
                      <ExternalLink size={14} className="text-[#8A796F] group-hover:text-[#733617] transition-colors" aria-hidden="true" />
                    </div>
                    <h2 className="font-serif text-lg font-bold text-[#2D1508] mb-1 group-hover:text-[#733617] transition-colors">
                      Cashfree Portal • પોર્ટલ
                    </h2>
                    <p className="text-xs text-[#65544A] leading-relaxed">
                      Access official banking transaction statements and UPI / card payment slips directly.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#EFE6DC] flex items-center justify-between text-xs font-bold text-[#733617]">
                    <span>Open Customer Portal</span>
                    <span className="text-sm transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                  </div>
                </a>

              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#8A796F]">
                    <Search size={16} aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order ID or Amount..."
                    aria-label="Search transactions"
                    className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#2D1508] outline-hidden transition-colors placeholder-[#8A796F]/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute inset-y-0 right-3 flex items-center text-[#8A796F] hover:text-[#2D1508]"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {(['All', 'Debited', 'Pending', 'Returned back'] as const).map((filter) => {
                    const isActive = statusFilter === filter;
                    const labelMap: Record<string, string> = {
                      'All': 'All • બધા',
                      'Debited': 'Paid • ચૂકવેલ',
                      'Pending': 'Pending • પ્રક્રિયામાં',
                      'Returned back': 'Refunded • પરત',
                    };

                    return (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-[#733617] text-white shadow-2xs'
                            : 'bg-[#FAF7F2] text-[#65544A] hover:text-[#2D1508] border border-[#EFE6DC]'
                        } focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden`}
                      >
                        {labelMap[filter]}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Transactions List */}
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white border border-[#EFE6DC] rounded-2xl shadow-xs">
                  <div className="w-16 h-16 bg-[#FAF7F2] border border-[#EFE6DC] rounded-full flex items-center justify-center mx-auto mb-3 text-[#733617]">
                    <FileText size={26} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg text-[#2D1508] font-serif font-bold mb-1">
                    No Payment Records Found
                  </h3>
                  <p className="text-[#65544A] text-xs sm:text-sm max-w-md mx-auto mb-5">
                    {searchQuery || statusFilter !== 'All' 
                      ? 'No transactions matched your current search filters. Try clearing the filter.' 
                      : 'You do not have any digital payments recorded on your account yet.'}
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <ShoppingBag size={14} aria-hidden="true" />
                    <span>Explore Fresh Snacks</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => {
                    const isRefund = tx.displayStatus === 'Returned back';
                    const isPending = tx.displayStatus === 'Pending';

                    return (
                      <div
                        key={tx.id}
                        className="bg-white border border-[#EFE6DC] hover:border-[#C88A2C]/60 transition-all rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center shrink-0 text-[#733617] group-hover:scale-105 transition-transform">
                            <Receipt size={20} aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h3 className="text-[#2D1508] font-bold text-sm sm:text-base tracking-tight">
                                {tx.orderNumber}
                              </h3>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                isRefund 
                                  ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                  : isPending 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}>
                                {isRefund ? 'Refunded • પરત' : isPending ? 'Pending • પ્રક્રિયામાં' : 'Debited • સફળ'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8A796F]">
                              <span className="flex items-center gap-1">
                                <Clock size={12} aria-hidden="true" />
                                {tx.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1">
                                <CreditCard size={12} aria-hidden="true" />
                                {tx.paymentMethod}
                              </span>
                              {tx.cashFreeOrderId && (
                                <>
                                  <span>&bull;</span>
                                  <button
                                    onClick={() => handleCopyOrderId(tx.cashFreeOrderId)}
                                    title="Copy Cashfree ID"
                                    className="hover:text-[#733617] font-mono text-[11px] inline-flex items-center gap-1 focus-visible:outline-hidden"
                                  >
                                    <span>CF: {tx.cashFreeOrderId.slice(0, 14)}...</span>
                                    {copiedOrderId === tx.cashFreeOrderId ? (
                                      <Check size={11} className="text-emerald-600" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-3 sm:pt-0 border-t border-[#EFE6DC] sm:border-0">
                          <div className="sm:text-right">
                            <span className={`text-base sm:text-lg font-bold tracking-tight ${
                              isRefund ? 'text-blue-700' : 'text-[#733617]'
                            }`}>
                              {isRefund ? '+' : ''}₹{tx.amount.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-[#8A796F]">
                              {tx.itemsCount} item{tx.itemsCount > 1 ? 's' : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* View Receipt / Invoice Button */}
                            <button
                              onClick={() => setSelectedReceipt(tx)}
                              aria-label={`View receipt for ${tx.orderNumber}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EBE1] border border-[#EFE6DC] text-xs font-bold text-[#733617] transition-colors focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                            >
                              <FileText size={13} aria-hidden="true" />
                              <span>Bill Receipt</span>
                            </button>

                            {/* View Order Link */}
                            <Link
                              href={`/orders/${tx.id}`}
                              aria-label={`View order ${tx.orderNumber}`}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-xs font-bold text-white transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                            >
                              <span>Order</span>
                              <span aria-hidden="true">&rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CASHFREE PAYMENT VERIFICATION */}
          {/* ========================================================================= */}
          {activeTab === 'verification' && (
            <div id="panel-verification" role="tabpanel" aria-labelledby="tab-verification" className="space-y-6">
              {/* Section 1: Single Order Verification Lookup */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#733617]">
                    Instant Verification
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-2">
                  Check Single Payment • ઓર્ડર પેમેન્ટ તપાસો
                </h2>
                <p className="text-xs sm:text-sm text-[#65544A] mb-5 leading-relaxed">
                  Enter any Cashfree Order ID to verify live bank settlement and capture status with the Cashfree server.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#8A796F]">
                      <Search size={16} aria-hidden="true" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter Cashfree Order ID (e.g. order_12345)..."
                      value={lookupOrderId}
                      onChange={(e) => setLookupOrderId(e.target.value)}
                      aria-label="Cashfree Order ID"
                      className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] focus:bg-white rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-[#2D1508] outline-hidden transition-colors placeholder-[#8A796F]/60"
                    />
                  </div>
                  <button 
                    onClick={runManualLookup}
                    disabled={isLookingUp}
                    className="bg-[#733617] hover:bg-[#5A290F] text-white font-bold tracking-wider uppercase text-xs px-6 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                  >
                    {isLookingUp ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
                    <span>{isLookingUp ? 'Verifying...' : 'Verify Payment'}</span>
                  </button>
                </div>
                
                {lookupError && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2" role="alert">
                    <AlertTriangle size={16} className="shrink-0 text-rose-600" aria-hidden="true" />
                    <span>{lookupError}</span>
                  </div>
                )}

                {lookupResult && (
                  <div className="mt-5" aria-live="polite">
                    <AuditTile r={lookupResult} />
                  </div>
                )}
              </div>

              {/* Section 2: Batch Verification */}
              <div className="bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#733617]">
                    Automated Reconciliation
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-2">
                  Check All Recent Payments • બધા પેમેન્ટ વેરિફાય કરો
                </h2>
                <p className="text-xs sm:text-sm text-[#65544A] mb-5 leading-relaxed">
                  Cross-reference all your recent digital transactions against Cashfree servers to ensure every payment is correctly reconciled.
                </p>

                {hasRunBatch && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6" aria-live="polite">
                    <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-4 text-center">
                      <p className="text-[#2D1508] text-xl sm:text-2xl font-bold">{metrics.total}</p>
                      <p className="text-[#8A796F] text-[10px] uppercase font-bold tracking-wider mt-0.5">Orders Checked</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <p className="text-emerald-800 text-xl sm:text-2xl font-bold">{metrics.paid}</p>
                      <p className="text-emerald-900 text-[10px] uppercase font-bold tracking-wider mt-0.5">Paid ✅</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
                      <p className="text-rose-800 text-xl sm:text-2xl font-bold">{metrics.notPaid}</p>
                      <p className="text-rose-900 text-[10px] uppercase font-bold tracking-wider mt-0.5">Pending ⚠️</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <p className="text-amber-800 text-xl sm:text-2xl font-bold">{metrics.noId}</p>
                      <p className="text-amber-900 text-[10px] uppercase font-bold tracking-wider mt-0.5">No CF ID</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={runBatchVerification}
                  disabled={isBatchVerifying}
                  className="w-full bg-[#FAF7F2] border border-[#733617] text-[#733617] font-bold tracking-wider uppercase text-xs py-3.5 sm:py-4 rounded-xl hover:bg-[#F5EBE1] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-5 focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
                >
                  {isBatchVerifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      <span>Verifying with Cashfree Server...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} aria-hidden="true" />
                      <span>{hasRunBatch ? 'Re-verify All Transactions' : 'Verify All My Transactions'}</span>
                    </>
                  )}
                </button>

                {batchError && (
                  <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2" role="alert">
                    <AlertTriangle size={16} className="shrink-0 text-rose-600" aria-hidden="true" />
                    <span>{batchError}</span>
                  </div>
                )}

                {!hasRunBatch && !isBatchVerifying ? (
                  <div className="text-center py-10 px-4 text-[#8A796F] text-xs sm:text-sm bg-[#FAF7F2]/60 rounded-xl border border-dashed border-[#EFE6DC]">
                    Click &ldquo;Verify All My Transactions&rdquo; above to audit and reconcile all your online orders.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {batchResults.map((r, i) => <AuditTile key={i} r={r} />)}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRINTABLE BILL RECEIPT MODAL */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-receipt-title"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EFE6DC] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] border-b border-[#EFE6DC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                  <Receipt size={18} aria-hidden="true" />
                </div>
                <div>
                  <h3 id="modal-receipt-title" className="font-serif text-lg font-bold text-[#2D1508]">
                    Official Payment Receipt
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-[#8A796F] font-bold">
                    Falguni Gruh Udyog • અમદાવાદ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                aria-label="Close receipt modal"
                className="w-8 h-8 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#8A796F] hover:text-[#2D1508] transition-colors focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 sm:p-8 space-y-5 print:p-0">
              
              {/* Store Identity */}
              <div className="text-center pb-4 border-b border-[#EFE6DC]">
                <h4 className="font-serif text-xl font-bold text-[#2D1508]">
                  Falguni Gruh Udyog
                </h4>
                <p className="text-xs text-[#65544A] mt-0.5">
                  Authentic Gujarati Sweets & Namkeen
                </p>
                <p className="text-[11px] text-[#8A796F] mt-0.5">
                  Ahmedabad, Gujarat, India
                </p>
              </div>

              {/* Receipt Key Info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-4 rounded-xl border border-[#EFE6DC]">
                <div>
                  <span className="text-[#8A796F] block text-[10px] uppercase font-bold tracking-wider">Order No</span>
                  <span className="font-bold text-[#2D1508]">{selectedReceipt.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[#8A796F] block text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
                  <span className="font-semibold text-[#2D1508]">
                    {selectedReceipt.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A796F] block text-[10px] uppercase font-bold tracking-wider">Payment Method</span>
                  <span className="font-semibold text-[#2D1508]">{selectedReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[#8A796F] block text-[10px] uppercase font-bold tracking-wider">Status</span>
                  <span className="font-bold text-emerald-800">{selectedReceipt.displayStatus}</span>
                </div>
                {selectedReceipt.cashFreeOrderId && (
                  <div className="col-span-2 pt-2 border-t border-[#EFE6DC]">
                    <span className="text-[#8A796F] block text-[10px] uppercase font-bold tracking-wider">Cashfree Transaction Ref</span>
                    <span className="font-mono text-[11px] text-[#2D1508] break-all">{selectedReceipt.cashFreeOrderId}</span>
                  </div>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="pt-2 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#65544A]">
                  <span>Items Count</span>
                  <span>{selectedReceipt.itemsCount} Items</span>
                </div>
                <div className="flex items-center justify-between text-[#65544A]">
                  <span>Payment Gateway</span>
                  <span>Cashfree Payments India</span>
                </div>
                <div className="pt-3 border-t-2 border-dashed border-[#EFE6DC] flex items-center justify-between">
                  <span className="font-serif text-base font-bold text-[#2D1508]">Total Paid Amount</span>
                  <span className="font-serif text-xl font-bold text-[#733617]">
                    ₹{selectedReceipt.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-[#8A796F] italic">
                  Thank you for shopping with Falguni Gruh Udyog! 🙏
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#EFE6DC] flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE6DC] text-xs font-bold text-[#65544A] hover:text-[#2D1508] hover:bg-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-xs font-bold text-white uppercase tracking-wider transition-all shadow-xs"
              >
                <Printer size={14} aria-hidden="true" />
                <span>Print Bill</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </PageShell>
  );
}
