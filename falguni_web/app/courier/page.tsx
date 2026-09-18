'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PageShell from '@/components/layout/PageShell';
import Link from 'next/link';
import { 
  Package, Plus, CheckCircle2, Clock, MapPin, Truck, 
  ArrowRight, ShieldCheck, Calculator, Scale, ArrowUpRight
} from 'lucide-react';
import type { CourierModel } from '@/types';

// ── Defined Shipping Plans ──
export interface ShippingPlan {
  id: 'local' | 'gujarat' | 'panindia' | 'international';
  name: string;
  badge: string;
  coverage: string;
  transitTime: string;
  basePrice: number;
  perKgRate: number;
  description: string;
  highlights: string[];
  packaging: string;
}

export const SHIPPING_PLANS: ShippingPlan[] = [
  {
    id: 'local',
    name: 'City Express',
    badge: '⚡ Same-Day Delivery',
    coverage: 'Ahmedabad & Gandhinagar twin cities',
    transitTime: '2 – 4 Hours',
    basePrice: 49,
    perKgRate: 20,
    description: 'Direct door-to-door courier for freshly prepared sweets, farsan, festive treats, and urgent parcels within the city.',
    highlights: ['Direct dedicated rider pickup', 'Temperature-safe packaging', 'Instant delivery confirmation'],
    packaging: 'Insulated moisture-safe carry bag',
  },
  {
    id: 'gujarat',
    name: 'Gujarat Regional',
    badge: '✨ Most Popular',
    coverage: 'Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Anand & all districts',
    transitTime: '24 – 48 Hours',
    basePrice: 89,
    perKgRate: 40,
    description: 'Overnight inter-district dispatch connecting loved ones across Gujarat with gentle handling for traditional sweets & snacks.',
    highlights: ['Next-day morning arrival', 'Shock-resistant outer packing', 'Daily regional linehauls'],
    packaging: 'Corrugated impact-safe mithai box',
  },
  {
    id: 'panindia',
    name: 'Pan-India Interstate',
    badge: '🇮🇳 19,000+ Pincodes',
    coverage: 'Mumbai, Delhi NCR, Bengaluru, Pune, Kolkata, Hyderabad, Chennai & all India',
    transitTime: '2 – 4 Business Days',
    basePrice: 149,
    perKgRate: 65,
    description: 'Express air & surface shipping ensuring authentic taste and aroma reach family and corporate clients nationwide.',
    highlights: ['Multi-layer vacuum sealing', 'Air-cargo priority clearance', 'Real-time SMS milestone alerts'],
    packaging: 'Nitrogen-flushed / vacuum-lock pouch + outer box',
  },
  {
    id: 'international',
    name: 'International Sweets Courier',
    badge: '✈️ Worldwide Export',
    coverage: 'USA, UK, Canada, Australia, UAE, Singapore & 50+ countries',
    transitTime: '4 – 7 Business Days',
    basePrice: 1250,
    perKgRate: 450,
    description: 'Global dispatch for traditional Gujarati sweets & farsan with customs documentation assistance and hermetic export seals.',
    highlights: ['Hermetic food-grade export packs', 'Customs declaration assistance', 'Door-to-door international airway tracking'],
    packaging: 'Export-grade tamper-evident hermetic packing',
  },
];

export default function CourierPage() {
  const { firebaseUser, userDoc } = useAuthStore();
  const [couriers, setCouriers] = useState<CourierModel[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Rate Estimator State
  const [estimatorPlan, setEstimatorPlan] = useState<'local' | 'gujarat' | 'panindia'>('gujarat');
  const [estimatorWeight, setEstimatorWeight] = useState<number>(1);
  const [adminKgRate, setAdminKgRate] = useState<number | null>(null);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    // 1. Fetch Admin Courier pricing settings if available
    const fetchAdminSettings = async () => {
      try {
        const detailsDoc = await getDoc(doc(db, 'Courier System', 'Courier Details'));
        if (detailsDoc.exists() && detailsDoc.data()?.kg) {
          setAdminKgRate(Number(detailsDoc.data()?.kg));
        }
      } catch (err) {
        console.warn('Could not fetch admin courier details:', err);
      }
    };
    fetchAdminSettings();

    // 2. Fetch user consignments if logged in
    const uid = firebaseUser?.uid || userDoc?.uid;
    if (uid) {
      setIsFetching(true);
      const q = query(
        collection(db, 'Courier'),
        where('userUID', '==', uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(d => ({
          ...d.data(),
          uid: d.id
        })) as CourierModel[];
        
        // Sort newest first
        fetched.sort((a, b) => (Number(b.parcelID) || 0) - (Number(a.parcelID) || 0));
        
        setCouriers(fetched);
        setIsFetching(false);
      }, (err) => {
        console.warn('Notice: couriers snapshot error:', err);
        setIsFetching(false);
      });

      return () => unsubscribe();
    } else {
      setCouriers([]);
      setIsFetching(false);
    }
  }, [firebaseUser, userDoc]);

  // Estimator Calculations
  const calculatedEstimate = useMemo(() => {
    const plan = SHIPPING_PLANS.find(p => p.id === estimatorPlan) || SHIPPING_PLANS[1];
    const ratePerKg = adminKgRate && estimatorPlan === 'gujarat' ? adminKgRate : plan.perKgRate;
    const estimatedCost = Math.round(plan.basePrice + (Math.max(0, estimatorWeight - 0.5) * ratePerKg));
    return {
      plan,
      cost: estimatedCost,
    };
  }, [estimatorPlan, estimatorWeight, adminKgRate]);

  // Filtered shipments
  const filteredCouriers = useMemo(() => {
    if (statusFilter === 'active') return couriers.filter(c => !c.status);
    if (statusFilter === 'completed') return couriers.filter(c => c.status);
    return couriers;
  }, [couriers, statusFilter]);

  const activeCount = couriers.filter(c => !c.status).length;
  const completedCount = couriers.filter(c => c.status).length;

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
          
          {/* ── 1. Breadcrumbs (Matches Product / Cart Theme) ── */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <span className="text-[#733617] font-semibold">Express Shipping</span>
          </nav>

          {/* ── 2. Top Header Banner Card (Consistent with ShopHeaderBanner) ── */}
          <div className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-3 text-[#733617]">
                  <Truck size={13} className="text-[#733617]" />
                  <span className="text-[10px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                    Falguni Doorstep Shipping &amp; Parcel Service
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Falguni Express Shipping
                </h1>
                
                <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed">
                  Send authentic Gujarati sweets, fresh savories, festive gifting hampers, and personal packages across town or across India with food-grade protective packaging and real-time tracking.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                <Link
                  href="/courier/add"
                  className="inline-flex items-center gap-2.5 bg-[#733617] hover:bg-[#5A290F] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Book New Shipment</span>
                </Link>
                <a
                  href="#estimator"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF7F2] text-[#2D1508] border border-[#EFE6DC] px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
                >
                  <Calculator size={15} className="text-[#733617]" />
                  <span>Calculate Rate</span>
                </a>
              </div>

            </div>
          </div>
          
          {/* ── Feature Strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <FeatureBadge 
              icon={ShieldCheck} 
              title="Food-Safe Sealed" 
              subtitle="Vacuum packaging for freshness" 
            />
            <FeatureBadge 
              icon={Truck} 
              title="Doorstep Pickup" 
              subtitle="Rider collects from your home" 
            />
            <FeatureBadge 
              icon={Clock} 
              title="Express Timelines" 
              subtitle="From 2 hrs local to 48 hrs regional" 
            />
            <FeatureBadge 
              icon={MapPin} 
              title="Live Consignment Tracking" 
              subtitle="Real-time delivery milestones" 
            />
          </div>

          {/* ── SECTION 1: Shipping Plans ── */}
          <section id="plans" className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                  Guaranteed Transit & Care
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">
                  Our Shipping Plans
                </h2>
              </div>
              <p className="text-xs text-[#2D1508]/60 max-w-sm sm:text-right">
                Select the ideal speed and protective packaging tailored to your package destination.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {SHIPPING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-[#EFE6DC] rounded-2xl p-5 shadow-xs hover:border-[#733617]/40 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badge */}
                    <div className="inline-block px-2.5 py-1 rounded-full bg-[#F5EBE1] text-[#733617] text-[10px] font-bold uppercase tracking-wider mb-3">
                      {plan.badge}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#2D1508] mb-1 group-hover:text-[#733617] transition-colors">
                      {plan.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 text-xs text-[#2D1508]/80 mb-3">
                      <span className="font-serif text-xl font-bold text-[#733617]">₹{plan.basePrice}</span>
                      <span className="text-[11px] text-[#2D1508]/50">starting rate</span>
                    </div>

                    <p className="text-xs text-[#2D1508]/70 leading-relaxed mb-4">
                      {plan.description}
                    </p>

                    <div className="pt-3 border-t border-[#FAF7F2] flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-[#2D1508]">
                        <Clock size={13} className="text-[#733617] flex-shrink-0" />
                        <span className="font-semibold">{plan.transitTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#2D1508]/70">
                        <MapPin size={13} className="text-[#733617] flex-shrink-0" />
                        <span className="truncate">{plan.coverage}</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF7F2] rounded-xl p-2.5 mb-4 border border-[#EFE6DC]/60 text-[11px] text-[#733617]">
                      <span className="font-bold uppercase tracking-wider text-[9px] block text-[#733617]/80 mb-0.5">Packaging:</span>
                      {plan.packaging}
                    </div>
                  </div>

                  {plan.id === 'international' ? (
                    <Link
                      href="/contact"
                      className="w-full py-2.5 px-4 rounded-xl border border-[#733617]/40 text-[#733617] hover:bg-[#FAF7F2] font-bold uppercase tracking-wider text-[11px] transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Inquire Global Dispatch</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  ) : (
                    <Link
                      href={`/courier/add?plan=${plan.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#733617] hover:bg-[#5C2B12] text-white font-bold uppercase tracking-wider text-[11px] transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Book This Plan</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 2: Interactive Shipping Rate Estimator ── */}
          <section id="estimator" className="bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F5EBE1]/60 to-transparent pointer-events-none rounded-bl-full" />
            
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-3">
                <Calculator size={13} className="text-[#733617]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                  Instant Shipping Calculator
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508] mb-2">
                Estimate Shipping Cost & Delivery Time
              </h3>
              <p className="text-xs sm:text-sm text-[#2D1508]/70 leading-relaxed mb-6">
                Calculate transparent rates with zero hidden charges. Includes food-grade protective cushioning.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Controls */}
                <div className="flex flex-col gap-5">
                  
                  {/* Step 1: Destination Plan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1508] mb-2">
                      1. Select Destination Plan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'local', label: 'City Express', sub: 'Same Day' },
                        { id: 'gujarat', label: 'Gujarat', sub: '24-48 hrs' },
                        { id: 'panindia', label: 'Pan-India', sub: '2-4 days' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setEstimatorPlan(p.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            estimatorPlan === p.id 
                              ? 'border-[#733617] bg-[#FAF7F2] shadow-xs' 
                              : 'border-[#EFE6DC] bg-white hover:border-[#733617]/40'
                          }`}
                        >
                          <div className={`text-xs font-bold ${estimatorPlan === p.id ? 'text-[#733617]' : 'text-[#2D1508]'}`}>
                            {p.label}
                          </div>
                          <div className="text-[10px] text-[#2D1508]/50 mt-0.5">{p.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Weight Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#2D1508]">
                        2. Package Weight (Kg)
                      </label>
                      <span className="text-xs font-bold text-[#733617]">{estimatorWeight} kg</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {[0.5, 1, 2, 5, 10].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setEstimatorWeight(w)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            estimatorWeight === w
                              ? 'bg-[#733617] text-white border-[#733617]'
                              : 'bg-white border-[#EFE6DC] text-[#2D1508] hover:border-[#733617]/40'
                          }`}
                        >
                          {w} kg
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-[#FAF7F2] rounded-xl px-3 py-2 border border-[#EFE6DC]">
                      <Scale size={15} className="text-[#733617] flex-shrink-0" />
                      <input
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.5"
                        value={estimatorWeight}
                        onChange={(e) => setEstimatorWeight(Math.max(0.1, parseFloat(e.target.value) || 0.5))}
                        className="w-full bg-transparent text-xs font-bold text-[#2D1508] focus:outline-none"
                        placeholder="Custom weight in kg..."
                      />
                      <span className="text-xs text-[#2D1508]/50 font-bold">KG</span>
                    </div>
                  </div>

                </div>

                {/* Right Estimate Summary Box */}
                <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#733617] mb-1">
                      Estimated Quote
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1508]">
                        ₹{calculatedEstimate.cost}
                      </span>
                      <span className="text-xs text-[#2D1508]/60">all taxes included</span>
                    </div>

                    <div className="flex flex-col gap-2.5 pb-4 border-b border-[#EFE6DC] text-xs">
                      <div className="flex items-center justify-between text-[#2D1508]">
                        <span className="text-[#2D1508]/70">Selected Plan:</span>
                        <span className="font-bold">{calculatedEstimate.plan.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#2D1508]">
                        <span className="text-[#2D1508]/70">Estimated Transit:</span>
                        <span className="font-bold text-[#733617]">{calculatedEstimate.plan.transitTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#2D1508]">
                        <span className="text-[#2D1508]/70">Protective Packaging:</span>
                        <span className="font-bold text-emerald-700">₹0 (Free)</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#2D1508]/60 leading-relaxed mt-3">
                      Includes doorstep pickup, safe cushioning, and SMS dispatch tracking.
                    </p>
                  </div>

                  <Link
                    href={`/courier/add?plan=${estimatorPlan}&weight=${estimatorWeight}`}
                    className="mt-6 w-full py-3 px-4 rounded-xl bg-[#733617] hover:bg-[#5C2B12] text-white font-bold uppercase tracking-wider text-xs transition-all text-center flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Book Shipment for ₹{calculatedEstimate.cost}</span>
                    <ArrowRight size={14} />
                  </Link>

                </div>

              </div>

            </div>
          </section>

          {/* ── SECTION 3: Customer's Consignments & Tracking ── */}
          <section id="shipments">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617]">
                  Consignment Ledger
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">
                  Your Shipments
                </h2>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#EFE6DC] self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'all' 
                      ? 'bg-[#733617] text-white shadow-xs' 
                      : 'text-[#2D1508]/70 hover:text-[#2D1508]'
                  }`}
                >
                  All ({couriers.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'active' 
                      ? 'bg-[#733617] text-white shadow-xs' 
                      : 'text-[#2D1508]/70 hover:text-[#2D1508]'
                  }`}
                >
                  In Transit ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'completed' 
                      ? 'bg-[#733617] text-white shadow-xs' 
                      : 'text-[#2D1508]/70 hover:text-[#2D1508]'
                  }`}
                >
                  Delivered ({completedCount})
                </button>
              </div>
            </div>

            {/* List, Loading, or Empty State */}
            {isFetching ? (
              <div className="bg-white border border-[#EFE6DC] rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-xs">
                <div className="w-8 h-8 border-2 border-[#733617] border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-bold text-[#733617]">Retrieving your active shipments...</span>
              </div>
            ) : !firebaseUser ? (
              <div className="bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F5EBE1] flex items-center justify-center mb-4 text-[#733617]">
                  <Package size={32} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-2">
                  Track Your Active Shipments
                </h3>
                <p className="text-xs sm:text-sm text-[#2D1508]/70 max-w-md mb-6 leading-relaxed">
                  Sign in with your Falguni account to view real-time parcel dispatch status, tracking milestones, and delivery history.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login?redirect=/courier"
                    className="bg-[#733617] hover:bg-[#5C2B12] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Track Shipments</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/courier/add"
                    className="bg-white hover:bg-[#FAF7F2] text-[#2D1508] border border-[#EFE6DC] px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all inline-flex items-center justify-center"
                  >
                    Book New Shipment
                  </Link>
                </div>
              </div>
            ) : filteredCouriers.length === 0 ? (
              <div className="bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F5EBE1] flex items-center justify-center mb-4 text-[#733617]">
                  <Package size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-2">
                  {couriers.length === 0 ? 'No Active Shipments Yet' : 'No Shipments in This Category'}
                </h3>
                
                <p className="text-xs sm:text-sm text-[#2D1508]/70 max-w-md mb-6 leading-relaxed">
                  {couriers.length === 0 
                    ? 'Book your first shipment to send sweets, snacks, or gifts to your loved ones. Our doorstep courier will pick it up right from your address.'
                    : 'You have no parcels matching the selected status filter.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/courier/add"
                    className="bg-[#733617] hover:bg-[#5C2B12] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Initiate First Shipment</span>
                  </Link>
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="bg-white hover:bg-[#FAF7F2] text-[#2D1508] border border-[#EFE6DC] px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                    >
                      View All Shipments
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredCouriers.map((courier) => (
                  <ShipmentCard key={courier.uid || courier.parcelID} courier={courier} />
                ))}
              </div>
            )}
          </section>

        </div>

      </div>
    </PageShell>
  );
}

// ── Feature Trust Badge ──
function FeatureBadge({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="bg-white border border-[#EFE6DC] rounded-2xl p-4 shadow-xs flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#F5EBE1] text-[#733617] flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h4 className="text-xs font-bold text-[#2D1508] truncate">{title}</h4>
        <p className="text-[11px] text-[#2D1508]/60 leading-tight mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Shipment Card ──
function ShipmentCard({ courier }: { courier: CourierModel }) {
  return (
    <div className="bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 hover:border-[#733617]/40 hover:shadow-md transition-all shadow-xs flex flex-col gap-4 group">
      
      {/* Top Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#FAF7F2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5EBE1] text-[#733617] flex items-center justify-center font-serif font-bold text-sm">
            #{courier.parcelID}
          </div>
          <div>
            <div className="font-bold text-sm text-[#2D1508] tracking-wide">
              {courier.parcelName || `Consignment #${courier.parcelID}`}
            </div>
            <div className="text-[11px] text-[#2D1508]/50">
              Parcel ID: {courier.parcelID}
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {courier.status ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Delivered</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>In Transit / Dispatched</span>
            </span>
          )}
        </div>
      </div>

      {/* Sender to Recipient Route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] rounded-xl p-4 border border-[#EFE6DC]/60">
        {/* Pickup */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-white border border-[#EFE6DC] text-[#733617] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
            A
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1508]/50">
              Sender (Pickup)
            </span>
            <span className="block text-xs font-bold text-[#2D1508] truncate">
              {courier.sendersName || 'Pickup Origin'}
            </span>
            <span className="block text-[11px] text-[#2D1508]/70 line-clamp-2 mt-0.5">
              {courier.sendersAddress || 'Address on file'}
            </span>
          </div>
        </div>

        {/* Dropoff */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#733617] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
            B
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1508]/50">
              Recipient (Destination)
            </span>
            <span className="block text-xs font-bold text-[#2D1508] truncate">
              {courier.recipientName} {courier.recipientPhone ? `• ${courier.recipientPhone}` : ''}
            </span>
            <span className="block text-[11px] text-[#2D1508]/70 line-clamp-2 mt-0.5">
              {courier.recipientAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Details Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[#2D1508]/70">
          {courier.weight ? (
            <div className="flex items-center gap-1.5">
              <Scale size={14} className="text-[#733617]" />
              <span className="font-semibold">{courier.weight} kg</span>
            </div>
          ) : null}

          {courier.deliveryBoysName ? (
            <div className="flex items-center gap-1.5 text-xs text-[#2D1508]">
              <Truck size={14} className="text-[#733617]" />
              <span>Rider: <strong className="font-semibold">{courier.deliveryBoysName}</strong></span>
              {courier.deliveryBoysPhone && (
                <a href={`tel:${courier.deliveryBoysPhone}`} className="text-[#733617] underline ml-1">
                  {courier.deliveryBoysPhone}
                </a>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-[#2D1508]/50 italic">
              Rider assignment in progress
            </div>
          )}

          {courier.deliveryDate ? (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#733617]" />
              <span>Delivered on: {courier.deliveryDate}</span>
            </div>
          ) : null}
        </div>

        {courier.price ? (
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[#2D1508]/50">Total Paid:</span>
            <span className="font-serif text-lg font-bold text-[#733617]">₹{courier.price}</span>
          </div>
        ) : null}
      </div>

    </div>
  );
}

