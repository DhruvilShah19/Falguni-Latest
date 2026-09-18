'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, MessageCircle, ExternalLink, Activity, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name?: string; productName?: string; quantity: number;
  price?: number; selectedPrice?: number; image1?: string; image?: string;
  selected?: string; vendorId?: string; productID?: string;
}

interface Order {
  id: string; orderID?: number; total?: number; subTotal?: number;
  discountedSubTotal?: number; deliveryFee?: number; couponDiscount?: number;
  status: string; createdAt?: any; timeCreated?: any; date?: string;
  items?: OrderItem[]; orders?: OrderItem[];
  paymentMethod?: string; paymentType?: string; cashFreeDetails?: any;
  deliveryAddress?: string; pickupAddress?: string; houseNumber?: string;
  trackingLink?: string; vendorID?: string; userId?: string; userID?: string; uid?: string;
  refundStatus?: string; refundId?: string;
}

const getOrderTimeMillis = (o: Order): number => {
  if (o.createdAt) {
    if (typeof o.createdAt.toMillis === 'function') return o.createdAt.toMillis();
    if (o.createdAt.seconds) return o.createdAt.seconds * 1000;
  }
  if (o.timeCreated) {
    const d = new Date(o.timeCreated);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  if (o.date) {
    const d = new Date(o.date);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return 0;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const unwrappedParamsId = params?.id as string;
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) { router.push('/login'); return; }
    if (!unwrappedParamsId) return;
    getDoc(doc(db, 'Orders', decodeURIComponent(unwrappedParamsId))).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as Order;
        if (data.userId === firebaseUser.uid || data.userID === firebaseUser.uid || data.uid === firebaseUser.uid) {
          setOrder({ ...data, id: snap.id });
        } else {
          console.error("User ID mismatch:", { data, uid: firebaseUser.uid });
          setErrorMsg("Access Denied: This order belongs to a different account.");
        }
      } else {
        console.error("Document does not exist:", unwrappedParamsId);
        setErrorMsg("Order not found. It may have been deleted.");
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to fetch order:', err);
      setErrorMsg("Error fetching order: " + err.message);
      setLoading(false);
    });
  }, [firebaseUser, authLoading, router, unwrappedParamsId]);

  if (loading) {
    return <PageShell><div className="py-32 flex justify-center bg-[#FAF7F2] min-h-screen"><LoadingSpinner /></div></PageShell>;
  }

  if (errorMsg) {
    return <PageShell><div className="py-32 flex flex-col items-center text-center bg-[#FAF7F2] min-h-screen"><h2 className="text-red-700 font-serif text-2xl mb-4">{errorMsg}</h2><Link href="/orders" className="text-[#733617] underline">Return to Orders</Link></div></PageShell>;
  }

  if (!order) return null;

  const orderMillis = getOrderTimeMillis(order);
  const dateStr = orderMillis ? new Date(orderMillis).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : order.timeCreated ?? order.date ?? 'Unknown Date';

  const itemsList = order.items || order.orders || [];
  
  const rawPayment = order.paymentMethod || order.paymentType || 'Unknown';
  const payment = rawPayment === 'Cash Free' ? 'Cashfree' : rawPayment === 'COD' ? 'Cash on Delivery' : rawPayment;
  const finalTotal = order.total ?? 0;
  const delivery = order.deliveryFee ?? 0;
  const discount = order.couponDiscount ?? 0;
  const calculatedSubTotal = order.subTotal ?? (finalTotal > 0 ? (finalTotal - delivery + discount) : 0);
  const isPickup = !!order.pickupAddress;
  const cf = order.cashFreeDetails;

  // Status badge style resolver (consistent with /orders page)
  const getStatusBadgeStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (s.includes('ship') || s.includes('dispatch')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (s.includes('process') || s.includes('pack')) {
      return 'bg-sky-50 text-sky-800 border-sky-200';
    }
    if (s.includes('cancel')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  const statusBadgeClass = getStatusBadgeStyle(order.status);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Left-aligned Breadcrumbs ── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium print:hidden">
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
            <Link 
              href="/orders" 
              className="hover:text-[#733617] focus-visible:ring-2 focus-visible:ring-[#733617] focus-visible:outline-hidden rounded-xs transition-colors"
            >
              Order History
            </Link>
            <span className="text-[#B5A599]" aria-hidden="true">&gt;</span>
            <span className="text-[#733617] font-semibold" aria-current="page">
              Order {order.orderID ? `#${order.orderID}` : `#${order.id.slice(-8).toUpperCase()}`}
            </span>
          </nav>

          {/* ── 2. Top Header / Actions Bar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617] mb-1">
                <span>Falguni Parivar • ઓર્ડર વિગતો</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">
                Order Receipt {order.orderID ? `#${order.orderID}` : `#${order.id.slice(-8).toUpperCase()}`}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 bg-white border border-[#EFE6DC] hover:bg-[#FAF7F2] text-[#2D1508] px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
              >
                <ChevronLeft size={15} />
                <span>All Orders</span>
              </Link>
              <button 
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>

          {/* ── 3. Main Receipt Container ── */}
          <div className="relative bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs overflow-hidden max-w-4xl mx-auto w-full">

            {order.status === 'Pending Payment' && (
              <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center animate-fade-in relative z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 mb-3 text-amber-800">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-amber-900 font-bold text-base mb-1">Awaiting Payment Confirmation</h3>
                <p className="text-amber-800/80 text-xs sm:text-sm">
                  This order was not fully confirmed by your bank yet. It will be dispatched once verified.
                </p>
              </div>
            )}

            {/* Receipt Top Header */}
            <div className="text-center mb-8 pb-6 border-b border-[#EFE6DC] relative z-10">
              <div className="inline-flex px-4 py-1.5 rounded-full border mb-3 text-[11px] font-bold tracking-wider uppercase shadow-xs">
                <span className={`px-3 py-0.5 rounded-full ${statusBadgeClass}`}>
                  {order.status}
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2D1508] font-bold mb-1 tracking-tight">
                Falguni Gruh Udhyog
              </h2>
              <p className="text-xs text-[#65544A] tracking-wider uppercase font-semibold">
                Placed on {dateStr}
              </p>
            </div>

            {/* Logistics & Tracking */}
            {order.status !== 'Cancelled' && (
              <div className="mb-8 relative z-10 overflow-hidden rounded-2xl border border-[#EFE6DC] bg-[#FAF7F2] p-5 sm:p-6 flex flex-col md:flex-row items-center gap-5 text-center md:text-left print:hidden shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-[#EFE6DC] shadow-xs">
                  <MapPin size={22} className="text-[#733617]" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-[#733617] text-[10px] font-bold tracking-[0.2em] uppercase mb-1 flex items-center justify-center md:justify-start gap-2">
                    <Activity size={12} className={order.status === 'Shipped' ? "animate-pulse" : ""} /> Logistics &amp; Shipping Status
                  </h3>
                  <p className="text-[#65544A] text-xs sm:text-sm leading-relaxed">
                    Your package is currently <strong className="text-[#2D1508]">{order.status.toLowerCase()}</strong>. 
                    {order.status === 'Shipped' && order.trackingLink ? " Follow its journey on the live map via our logistics partner." : 
                     order.status === 'Delivered' || order.status === 'Completed' ? " This delicacy box was successfully delivered to your doorstep." :
                     " Our kitchen prepares all dry farsan and sweets fresh before parcel handover."}
                  </p>
                </div>
                
                {order.trackingLink && (
                  <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#733617] hover:bg-[#5A290F] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs shrink-0">
                    <span>{order.status === 'Delivered' || order.status === 'Completed' ? "View Delivery Proof" : "Track Live Location"}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}

            {/* Address & Payment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-5">
                <h3 className="text-[#8A796F] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                  <MapPin size={13} className="text-[#733617]" /> {isPickup ? 'Pickup Store' : 'Delivery Destination'}
                </h3>
                <p className="text-[#2D1508] text-xs sm:text-sm leading-relaxed font-medium">
                  {order.pickupAddress || order.deliveryAddress || 'No address provided'}
                  {order.houseNumber ? `, ${order.houseNumber}` : ''}
                </p>
              </div>
              
              <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-5">
                <h3 className="text-[#8A796F] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                  <CreditCard size={13} className="text-[#733617]" /> Payment Method &amp; Settlement
                </h3>
                <p className="text-[#2D1508] text-xs sm:text-sm font-bold mb-1">{payment}</p>
                {order.status === 'Completed' || order.status === 'Delivered' ? (
                  <p className="text-emerald-700 text-[11px] font-bold flex items-center gap-1.5"><CheckCircle2 size={13} /> Payment Confirmed</p>
                ) : (
                  <p className="text-[#65544A] text-[11px] font-medium">Payment status: {order.status}</p>
                )}
                {cf?.order_id && (
                  <p className="text-[10px] text-[#8A796F] mt-1 font-mono">CF: {cf.order_id}</p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="mb-8 relative z-10">
              <h3 className="text-[#8A796F] text-[10px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center gap-2">
                <span>Items Ordered ({itemsList.length})</span>
              </h3>
              
              <div className="flex flex-col gap-3">
                {itemsList.map((item, i) => {
                  const img = item.image1 || item.image;
                  const unitPrice = item.selectedPrice ?? (item.quantity ? (item.price ?? 0) / item.quantity : (item.price ?? 0));
                  const rowTotal = item.price ?? (unitPrice * (item.quantity || 1));
                  const itemName = item.name || item.productName || 'Traditional Delicacy';
                  
                  return (
                    <div key={i} className="flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EFE6DC] hover:border-[#733617]/40 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#EFE6DC] shrink-0">
                          {img ? (
                            <Image src={img} alt={itemName} fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs opacity-40">✨</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[#2D1508] font-bold text-xs sm:text-sm line-clamp-1 leading-snug">{itemName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#8A796F] text-[11px] font-medium">Qty: {item.quantity}</span>
                            {item.selected && item.selected !== 'Standard' && (
                              <span className="text-[#733617] text-[10px] font-bold bg-[#FAF7F2] border border-[#EFE6DC] px-2 py-0.5 rounded-md">
                                {item.selected}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#2D1508] font-bold text-sm sm:text-base">₹{rowTotal.toFixed(2)}</p>
                        <p className="text-[10px] text-[#8A796F]">₹{unitPrice.toFixed(2)} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="max-w-xs ml-auto relative z-10 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-5 mb-8">
              <div className="flex justify-between text-xs text-[#65544A] mb-2.5">
                <span>Subtotal</span>
                <span className="font-bold text-[#2D1508]">₹{calculatedSubTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 mb-2.5">
                  <span>Coupon Savings</span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#65544A] pb-3 border-b border-[#EFE6DC] mb-3">
                <span>{isPickup ? 'Store Pickup' : 'Doorstep Delivery'}</span>
                <span className="font-bold text-[#2D1508]">{delivery > 0 ? `₹${delivery.toFixed(2)}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#2D1508] uppercase tracking-wider">Total Amount</span>
                <span className="font-serif text-2xl font-black text-[#733617]">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* WhatsApp Concierge Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 relative z-10 print:hidden">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-emerald-900 text-xs font-bold uppercase tracking-wider">Need Order Support?</h3>
                  <p className="text-emerald-800/80 text-xs">Message our boutique concierge directly on WhatsApp.</p>
                </div>
              </div>
              <a 
                href={`https://wa.me/919925206969?text=${encodeURIComponent(`Hello Falguni Gruh Udhyog! I need assistance with Order #${order.orderID || order.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0"
              >
                <span>WhatsApp Us</span>
                <ArrowRight size={13} />
              </a>
            </div>

          </div>

          {/* Printable Formal Invoice (Print Only) */}
          <div className="hidden print:block bg-white text-black p-8 font-sans w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Tax Invoice</h2>
                <p className="text-sm text-gray-600">Receipt {order.orderID ? `#${order.orderID}` : `#${order.id.slice(-8).toUpperCase()}`}</p>
                <p className="text-sm text-gray-600">Date: {dateStr}</p>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <div className="w-1/2 pr-4">
                <h3 className="font-bold text-sm uppercase mb-2 border-b border-gray-300 pb-1">Billed To</h3>
                <p className="text-sm">
                  {order.deliveryAddress || order.pickupAddress || 'Address not provided'}
                  {order.houseNumber ? `, ${order.houseNumber}` : ''}
                </p>
              </div>
              <div className="w-1/2 pl-4">
                <h3 className="font-bold text-sm uppercase mb-2 border-b border-gray-300 pb-1">Payment Details</h3>
                <p className="text-sm"><span className="font-semibold">Method:</span> {payment}</p>
                {cf?.cf_order_id && <p className="text-sm"><span className="font-semibold">Transaction ID:</span> {cf.cf_order_id}</p>}
                <p className="text-sm"><span className="font-semibold">Status:</span> {order.status}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-8 border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="py-2 font-bold uppercase">Item Description</th>
                  <th className="py-2 font-bold uppercase text-center">Qty</th>
                  <th className="py-2 font-bold uppercase text-right">Price</th>
                  <th className="py-2 font-bold uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {itemsList.map((item, i) => {
                  const unitPrice = item.selectedPrice ?? (item.quantity ? (item.price ?? 0) / item.quantity : (item.price ?? 0));
                  const rowTotal = item.price ?? (unitPrice * (item.quantity || 1));
                  return (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-3">
                        <p className="font-semibold">{item.name || item.productName || 'Unknown Item'}</p>
                        {item.selected && item.selected !== 'Standard' && <p className="text-xs text-gray-500">Variant: {item.selected}</p>}
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">₹{unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right">₹{rowTotal.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-1/2">
                <div className="flex justify-between py-1 text-sm">
                  <span>Subtotal</span>
                  <span>₹{calculatedSubTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-sm border-b border-gray-300 pb-2 mb-2">
                  <span>{isPickup ? 'Handling' : 'Logistics'}</span>
                  <span>{delivery > 0 ? `₹${delivery.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
              <p>This is a computer-generated document. No signature is required.</p>
              <p>Thank you for shopping with Maison Falguni.</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
