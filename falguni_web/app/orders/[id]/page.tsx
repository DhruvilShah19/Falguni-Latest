'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, Package, MapPin, CreditCard, ShoppingBag, Truck, CheckCircle2, Clock, MessageCircle, ExternalLink, Activity, Eye, EyeOff, Download } from 'lucide-react';
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

const STATUS_STYLE: Record<string, string> = {
  'Pending Payment': 'border-orange-500 text-orange-500 bg-orange-500/10',
  Pending:    'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10',
  Received:   'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10',
  Processing: 'border-blue-400 text-blue-400 bg-blue-400/10',
  Shipped:    'border-purple-400 text-purple-400 bg-purple-400/10',
  Delivered:  'border-green-400 text-green-400 bg-green-400/10',
  Completed:  'border-green-400 text-green-400 bg-green-400/10',
  Cancelled:  'border-red-400 text-red-400 bg-red-400/10',
};

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
  const [showOrderRef, setShowOrderRef] = useState(false);

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
    return <PageShell><div className="py-32 flex justify-center bg-[#2B1B17] min-h-screen"><LoadingSpinner /></div></PageShell>;
  }

  if (errorMsg) {
    return <PageShell><div className="py-32 flex flex-col items-center text-center bg-[#2B1B17] min-h-screen"><h2 className="text-red-400 font-serif text-2xl mb-4">{errorMsg}</h2><Link href="/orders" className="text-[#D4AF37] underline">Return to Orders</Link></div></PageShell>;
  }

  if (!order) return null;

  const orderMillis = getOrderTimeMillis(order);
  const dateStr = orderMillis ? new Date(orderMillis).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : order.timeCreated ?? order.date ?? 'Unknown Date';

  const statusClass = STATUS_STYLE[order.status] ?? 'border-white/20 text-white/60 bg-white/5';
  const itemsList = order.items || order.orders || [];
  
  const rawPayment = order.paymentMethod || order.paymentType || 'Unknown';
  const payment = rawPayment === 'Cash Free' ? 'Cashfree' : rawPayment === 'COD' ? 'Cash on Delivery' : rawPayment;
  const finalTotal = order.total ?? 0;
  const delivery = order.deliveryFee ?? 0;
  const discount = order.couponDiscount ?? 0;
  const calculatedSubTotal = order.subTotal ?? (finalTotal > 0 ? (finalTotal - delivery + discount) : 0);
  const isPickup = !!order.pickupAddress;
  const cf = order.cashFreeDetails;

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] relative pb-20">
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-24 md:pt-32 relative z-10 animate-fade-up">
          
          {/* Back Navigation & Actions */}
          <div className="flex justify-between items-center mb-8 print:hidden">
            <Link href="/orders" className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-colors uppercase tracking-[0.3em] text-[10px] font-bold group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Archives
            </Link>
            
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E8C252] transition-colors uppercase tracking-[0.2em] text-[10px] font-bold border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:bg-[#D4AF37]/10"
            >
              <Download size={14} /> Download Receipt
            </button>
          </div>

          {/* Certificate Container (Screen Only) */}
          <div className="relative bg-white/[0.02] border border-[#D4AF37]/20 rounded-[2rem] p-6 md:p-12 lg:p-16 shadow-[0_0_50px_rgba(212,175,55,0.03)] backdrop-blur-xl overflow-hidden print:hidden">
            
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            {order.status === 'Pending Payment' && (
              <div className="mb-10 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center animate-fade-in relative z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 mb-3">
                  <CreditCard size={20} className="text-orange-400" />
                </div>
                <h3 className="text-orange-400 font-bold text-lg mb-1 tracking-wide">Awaiting Payment</h3>
                <p className="text-orange-400/70 text-sm">
                  This order was not fully paid and has not been confirmed. It will not be processed until payment is received.
                </p>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-16 relative z-10">
              <div className="inline-flex px-5 py-2 rounded-full border mb-6 text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg bg-black/40 backdrop-blur-md print:border-black/20 print:bg-white print:text-black">
                <span className={statusClass.split(' ').filter(c => c.startsWith('text-')).join(' ')}>{order.status}</span>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 tracking-tight italic print:text-black">
                Receipt {order.orderID ? `#${order.orderID}` : `#${order.id.slice(-8).toUpperCase()}`}
              </h1>
              <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-bold print:text-black/60">{dateStr}</p>
            </div>

            {/* Logistics & Tracking with Map UI */}
            {order.status !== 'Cancelled' && (
              <div className="mb-12 relative z-10 overflow-hidden rounded-3xl border border-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] print:hidden">
                {/* Map Background Wrapper */}
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '100% 100%, 20px 20px, 20px 20px'
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 bg-[#2B1B17]/80 backdrop-blur-md p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] relative">
                    {order.status === 'Shipped' && (
                      <span className="absolute inset-0 rounded-full animate-ping border border-[#D4AF37] opacity-50"></span>
                    )}
                    <MapPin size={24} className="text-[#D4AF37]" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
                      <Activity size={12} className={order.status === 'Shipped' ? "animate-pulse" : ""} /> Logistics & Tracking
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                      Your acquisition is currently <strong className="text-white">{order.status.toLowerCase()}</strong>. 
                      {order.status === 'Shipped' && order.trackingLink ? " Follow its journey on the live map via our logistics partner." : 
                       order.status === 'Delivered' || order.status === 'Completed' ? " This package has been successfully delivered." :
                       " We will notify you and activate live tracking once it has been dispatched."}
                    </p>
                  </div>
                  
                  {order.trackingLink && (
                    <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center gap-1 group">
                      <div className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                        {order.status === 'Delivered' || order.status === 'Completed' ? "View Proof of Delivery" : "Open Live Map"} <ExternalLink size={14} />
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Address & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
              <div>
                <h3 className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-3 flex items-center gap-2 print:text-black/60">
                  <MapPin size={12} className="text-[#D4AF37] print:text-black" /> {isPickup ? 'Pickup Location' : 'Shipping Destination'}
                </h3>
                <p className="text-white text-sm leading-relaxed font-light pl-5 border-l border-white/10 print:text-black print:border-black/20">
                  {order.pickupAddress || order.deliveryAddress || 'No address provided'}
                  {order.houseNumber ? `, ${order.houseNumber}` : ''}
                </p>
              </div>
              
              <div>
                <h3 className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-3 flex items-center gap-2 print:text-black/60">
                  <CreditCard size={12} className="text-[#D4AF37] print:text-black" /> Transaction Method
                </h3>
                <div className="pl-5 border-l border-white/10 print:border-black/20">
                  <p className="text-white text-sm font-light mb-2 print:text-black">{payment}</p>
                  {order.status === 'Completed' || order.status === 'Delivered' ? (
                    <p className="text-emerald-400/80 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 print:text-black"><CheckCircle2 size={12} /> Payment Received</p>
                  ) : (
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold print:text-black/60">Awaiting Clearance</p>
                  )}
                </div>
              </div>
            </div>

            {/* Refund Status Details */}
            {order.refundStatus === 'Success' && (
              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 mb-12 relative z-10 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <h3 className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-5 flex items-center gap-2">
                  <CheckCircle2 size={12} /> Refund Processed
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  The amount for this cancelled order has been successfully refunded. It may take 5-7 business days for the funds to reflect in your original payment method.
                </p>
                {order.refundId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-4 pt-4 border-t border-[#D4AF37]/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[#D4AF37]/60 text-[10px] tracking-widest uppercase">Refund ID</span>
                      <span className="text-white/80 font-mono text-xs">{order.refundId}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cashfree Transaction Details */}
            {cf && (
              <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 mb-12 relative z-10">
                <h3 className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-5 flex items-center gap-2">
                  <CreditCard size={12} className="text-[#D4AF37]" /> Digital Transaction Receipt
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {cf.cf_order_id && (
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-white/40 text-[10px] tracking-widest uppercase">Payment ID</span>
                      <span className="text-white/80 font-mono text-xs">{cf.cf_order_id}</span>
                    </div>
                  )}
                  {cf.order_id && (
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-white/40 text-[10px] tracking-widest uppercase">Order Ref</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#D4AF37] font-mono text-xs">
                          {showOrderRef ? cf.order_id : '••••••••••••'}
                        </span>
                        <button 
                          onClick={() => setShowOrderRef(!showOrderRef)}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          {showOrderRef ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                  {cf.order_amount !== undefined && (
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-white/40 text-[10px] tracking-widest uppercase">Amount Charged</span>
                      <span className="text-white font-serif text-sm">{cf.order_currency ?? '₹'} {cf.order_amount}</span>
                    </div>
                  )}
                  {cf.order_status && (
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-white/40 text-[10px] tracking-widest uppercase">Status</span>
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${cf.order_status === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {cf.order_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Line Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent mb-12 relative z-10 print:bg-black/10 print:bg-none" />

            {/* Items */}
            <div className="mb-12 relative z-10">
              <h3 className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 text-center flex items-center justify-center gap-3 print:text-black/60">
                <span className="w-8 h-px bg-white/10 print:bg-black/20" /> Acquired Items <span className="w-8 h-px bg-white/10 print:bg-black/20" />
              </h3>
              
              <div className="flex flex-col gap-6">
                {itemsList.map((item, i) => {
                  const img = item.image1 || item.image;
                  const unitPrice = item.selectedPrice ?? (item.quantity ? (item.price ?? 0) / item.quantity : (item.price ?? 0));
                  const rowTotal = item.price ?? (unitPrice * (item.quantity || 1));
                  const itemName = item.name || item.productName || 'Unknown Item';
                  
                  return (
                    <div key={i} className="flex items-center gap-6 group print:border-b print:border-black/10 print:pb-4">
                      <div className="relative w-24 h-24 bg-black/40 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 group-hover:border-[#D4AF37]/30 transition-colors print:hidden">
                        {img ? (
                          <Image src={img} alt={itemName} fill className="object-cover" sizes="96px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-30">✨</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-base line-clamp-2 leading-relaxed mb-2 print:text-black">{itemName}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase print:text-black/60">Qty {item.quantity}</span>
                          {item.selected && item.selected !== 'Standard' && (
                            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase border border-[#D4AF37]/30 px-3 py-1 rounded-full print:border-black/20 print:text-black">
                              {item.selected}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-serif text-xl tracking-wider">₹{rowTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Line Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent mb-12 relative z-10 print:hidden" />

            {/* Invoice Total */}
            <div className="max-w-sm ml-auto relative z-10">
              <div className="flex justify-between text-white/60 text-sm font-light mb-4">
                <span className="uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                <span>₹{calculatedSubTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#D4AF37] text-sm mb-4">
                  <span className="uppercase tracking-widest text-[10px] font-bold">Discount Applied</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60 text-sm font-light pb-6 border-b border-white/10 mb-6">
                <span className="uppercase tracking-widest text-[10px] font-bold">{isPickup ? 'Handling' : 'Logistics'}</span>
                <span>{delivery > 0 ? `₹${delivery.toFixed(2)}` : 'Complimentary'}</span>
              </div>
              <div className="flex justify-between items-end text-white">
                <span className="text-[#D4AF37] uppercase tracking-widest text-xs font-bold">Total Paid</span>
                <span className="font-serif text-4xl tracking-wide">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* WhatsApp Support - Hidden on Print */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-green-900/20 to-transparent border border-green-500/20 rounded-3xl p-6 md:p-8 relative z-10 mt-12 print:hidden">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                  <MessageCircle size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-green-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-1">Need Assistance?</h3>
                  <p className="text-white/60 text-sm font-light">Get real-time updates and support on WhatsApp.</p>
                </div>
              </div>
              <a 
                href="https://wa.me/919328299680" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 border border-green-500/30 text-green-400 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-green-500/10 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                Chat with us <ExternalLink size={12} />
              </a>
            </div>

          </div>

          {/* Printable Formal Invoice (Print Only) */}
          <div className="hidden print:block bg-white text-black p-8 font-sans w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">Tax Invoice</h1>
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
