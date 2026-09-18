'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { 
  MapPin, Truck, PackageCheck, Info, Sparkles, 
  Calculator, Check, ArrowRight, ShieldCheck, Phone 
} from 'lucide-react';
import { DISTANCE_TIERS, OUTSTATION_TIERS } from '@/lib/deliveryPricing';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// Live pricing constants from lib/deliveryPricing.ts
const [hyperlocal, intercity, interstate] = DISTANCE_TIERS;
const { gujarat, panIndia } = OUTSTATION_TIERS;

const ZONES = [
  {
    badge: '⚡ Instant & Same Day',
    color: '#10B981', // emerald
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    tier: 'Hyperlocal Ahmedabad',
    range: `Within ${hyperlocal.maxDistanceKm} km`,
    charge: inr(hyperlocal.fee),
    chargeNote: 'Flat delivery fee',
    freeAbove: inr(hyperlocal.freeAbove),
    freeAboveVal: hyperlocal.freeAbove,
    feeVal: hyperlocal.fee,
    description: 'Direct store-to-doorstep dispatch from Vastrapur, Sindhubhavan, and Sargasan stores.',
    examples: [
      { label: 'Order Value ₹350', result: inr(hyperlocal.fee) },
      { label: `Order Value ${inr(hyperlocal.freeAbove + 50)}`, result: 'FREE Delivery' },
    ],
  },
  {
    badge: '🏙️ City Express',
    color: '#3B82F6', // blue
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    tier: 'Intercity Ahmedabad & Gandhinagar',
    range: `${hyperlocal.maxDistanceKm} – ${intercity.maxDistanceKm} km`,
    charge: inr(intercity.fee),
    chargeNote: 'Flat delivery fee',
    freeAbove: inr(intercity.freeAbove),
    freeAboveVal: intercity.freeAbove,
    feeVal: intercity.fee,
    description: 'Greater Ahmedabad municipal limits, Gandhinagar capital region, and peripheral suburbs.',
    examples: [
      { label: 'Order Value ₹850', result: inr(intercity.fee) },
      { label: `Order Value ${inr(intercity.freeAbove + 100)}`, result: 'FREE Delivery' },
    ],
  },
  {
    badge: '🚗 Regional Transit',
    color: '#F97316', // orange
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    tier: 'Extended Suburban & Interstate',
    range: `${intercity.maxDistanceKm} – ${interstate.maxDistanceKm} km`,
    charge: inr(interstate.fee),
    chargeNote: 'Flat delivery fee',
    freeAbove: inr(interstate.freeAbove),
    freeAboveVal: interstate.freeAbove,
    feeVal: interstate.fee,
    description: 'Outer ring-road corridors, Sanand, Kalol, Kadi, and nearby satellite districts.',
    examples: [
      { label: 'Order Value ₹1,400', result: inr(interstate.fee) },
      { label: `Order Value ${inr(interstate.freeAbove + 200)}`, result: 'FREE Delivery' },
    ],
  },
  {
    badge: '🏛️ Across Gujarat',
    color: '#D97706', // amber / gold
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    tier: 'Gujarat Outstation',
    range: `Above ${interstate.maxDistanceKm} km — Anywhere in Gujarat`,
    charge: `${inr(gujarat.feePerKg)} / kg`,
    chargeNote: 'Weight-based parcel dispatch',
    freeAbove: inr(gujarat.freeAbove),
    freeAboveVal: gujarat.freeAbove,
    feeVal: gujarat.feePerKg,
    description: 'Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Bhuj & all Gujarat pin codes via express surface logistics.',
    weightTable: [
      { weight: '2 kg', charge: inr(2 * gujarat.feePerKg) },
      { weight: '5 kg', charge: inr(5 * gujarat.feePerKg) },
      { weight: '8 kg', charge: inr(8 * gujarat.feePerKg) },
    ],
    examples: [
      { label: 'Order Value ₹1,800 (4 kg)', result: inr(4 * gujarat.feePerKg) },
      { label: `Order Value ${inr(gujarat.freeAbove + 300)} (any weight)`, result: 'FREE Delivery' },
    ],
  },
  {
    badge: '🇮🇳 PAN India Express',
    color: '#8B5CF6', // purple
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    tier: 'All India Delivery',
    range: `Above ${interstate.maxDistanceKm} km — All States & UTs`,
    charge: `${inr(panIndia.feePerKg)} / kg`,
    chargeNote: 'Air & surface food-grade transit',
    freeAbove: inr(panIndia.freeAbove),
    freeAboveVal: panIndia.freeAbove,
    feeVal: panIndia.feePerKg,
    description: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Kolkata, Chennai, and 19,000+ pin codes nationwide.',
    weightTable: [
      { weight: '1 kg', charge: inr(1 * panIndia.feePerKg) },
      { weight: '3 kg', charge: inr(3 * panIndia.feePerKg) },
      { weight: '5 kg', charge: inr(5 * panIndia.feePerKg) },
    ],
    examples: [
      { label: 'Order Value ₹2,800 (3 kg)', result: inr(3 * panIndia.feePerKg) },
      { label: `Order Value ${inr(panIndia.freeAbove + 500)} (any weight)`, result: 'FREE Delivery' },
    ],
  },
];

const NOTES = [
  'Distance is accurately calculated from the nearest Falguni Gruh Udhyog store to your doorstep address.',
  'Weight-based courier shipping is calculated on the actual packed weight with nitrogen-flushed protective seals.',
  'FREE delivery applies automatically during checkout whenever your cart meets the eligible minimum order value.',
  'Eligible free-delivery orders enjoy 100% complimentary shipping regardless of parcel weight.',
  'All packages are vacuum-sealed with food-grade moisture barriers ensuring peak freshness upon arrival.',
];

export default function DeliveryChargesPage() {
  // ── Interactive Rate Calculator State ──
  const [calcDistance, setCalcDistance] = useState<number>(8);
  const [calcOrderValue, setCalcOrderValue] = useState<number>(650);
  const [calcWeight, setCalcWeight] = useState<number>(2);

  // Compute calculated estimate
  const calculation = useMemo(() => {
    const dist = Math.max(0, calcDistance);
    const val = Math.max(0, calcOrderValue);
    const weight = Math.max(0.5, calcWeight);

    let tier = ZONES[0];
    let fee = 0;
    let isFree = false;
    let freeAbove = hyperlocal.freeAbove;

    if (dist <= hyperlocal.maxDistanceKm) {
      tier = ZONES[0];
      freeAbove = hyperlocal.freeAbove;
      if (val >= freeAbove) {
        isFree = true;
      } else {
        fee = hyperlocal.fee;
      }
    } else if (dist <= intercity.maxDistanceKm) {
      tier = ZONES[1];
      freeAbove = intercity.freeAbove;
      if (val >= freeAbove) {
        isFree = true;
      } else {
        fee = intercity.fee;
      }
    } else if (dist <= interstate.maxDistanceKm) {
      tier = ZONES[2];
      freeAbove = interstate.freeAbove;
      if (val >= freeAbove) {
        isFree = true;
      } else {
        fee = interstate.fee;
      }
    } else {
      // Outstation: Defaults to Gujarat unless user selects All India
      tier = ZONES[3];
      freeAbove = gujarat.freeAbove;
      if (val >= freeAbove) {
        isFree = true;
      } else {
        fee = Math.round(weight * gujarat.feePerKg);
      }
    }

    const diffForFree = Math.max(0, freeAbove - val);

    return {
      tier,
      fee,
      isFree,
      freeAbove,
      diffForFree,
    };
  }, [calcDistance, calcOrderValue, calcWeight]);

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
            <span className="text-[#733617] font-semibold" aria-current="page">
              Delivery Charges &amp; Zones
            </span>
          </nav>

          {/* ── 2. Signature Top Header Banner Card ── */}
          <header className="relative w-full overflow-hidden bg-white border border-[#EFE6DC] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] mb-3 text-[#733617]">
                  <Sparkles size={12} className="text-[#C88A2C]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                    Falguni Parivar • શિપિંગ અને ડિલિવરી
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight mb-2">
                  Delivery Charges &amp; Shipping Zones
                </h1>

                <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed">
                  Transparent distance-based and weight-based delivery rates. Free doorstep delivery on qualifying orders across Ahmedabad, Gujarat, and all over India.
                </p>
              </div>

              {/* Free Shipping Highlight Chip */}
              <div className="flex items-center gap-3.5 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 self-start md:self-auto flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shadow-xs flex-shrink-0">
                  <Truck size={22} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-[#733617]">
                    Complimentary Shipping
                  </span>
                  <span className="block text-sm font-bold text-[#2D1508]">
                    FREE Delivery from {inr(hyperlocal.freeAbove)}*
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ── 3. Interactive Rate Estimator Tool ── */}
          <section className="bg-white border border-[#EFE6DC] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-[#EFE6DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617]">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
                    Instant Delivery Rate Estimator
                  </h2>
                  <p className="text-xs text-[#65544A]">
                    Simulate your order distance and cart value to see exact delivery charges.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#733617] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFE6DC]">
                Real-Time Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Inputs (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                
                {/* Distance Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#2D1508] mb-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#733617]" />
                      Distance from Falguni Store:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold">
                      {calcDistance} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full h-2 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#733617]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A796F] mt-1 font-medium">
                    <span>1 km (Local)</span>
                    <span>15 km (Intercity)</span>
                    <span>30 km (Interstate)</span>
                    <span>50+ km (Outstation)</span>
                  </div>
                </div>

                {/* Cart Value Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#2D1508] mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#733617]" />
                      Estimated Order Value:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold">
                      ₹{calcOrderValue}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={calcOrderValue}
                    onChange={(e) => setCalcOrderValue(Number(e.target.value))}
                    className="w-full h-2 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#733617]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A796F] mt-1 font-medium">
                    <span>₹100</span>
                    <span>₹500 (Free Local)</span>
                    <span>₹1,500</span>
                    <span>₹3,000</span>
                  </div>
                </div>

                {/* Weight Input (For Outstation) */}
                {calcDistance > interstate.maxDistanceKm && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2D1508] mb-2">
                      <span>Package Weight (Outstation):</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold">
                        {calcWeight} kg
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      step={0.5}
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full h-2 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#733617]"
                    />
                  </div>
                )}

              </div>

              {/* Live Output Card (5 cols) */}
              <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A796F] block mb-1">
                    Applicable Delivery Zone
                  </span>
                  <div className="font-serif text-lg font-bold text-[#2D1508] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: calculation.tier.color }} />
                    {calculation.tier.tier}
                  </div>
                  <p className="text-xs text-[#65544A] mt-1">
                    {calculation.tier.range}
                  </p>
                </div>

                <div className="my-5 py-4 border-y border-[#EFE6DC]">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold text-[#2D1508]">Estimated Delivery Fee:</span>
                    <span className={`text-2xl font-black ${calculation.isFree ? 'text-emerald-700' : 'text-[#733617]'}`}>
                      {calculation.isFree ? 'FREE' : `₹${calculation.fee}`}
                    </span>
                  </div>
                  {calculation.isFree ? (
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 mt-1">
                      <Check size={14} strokeWidth={2.5} />
                      Your order qualifies for complimentary delivery!
                    </p>
                  ) : (
                    <p className="text-xs text-[#65544A] mt-1">
                      Add <strong className="text-[#733617]">₹{calculation.diffForFree}</strong> more to get <strong>FREE Delivery</strong>!
                    </p>
                  )}
                </div>

                <Link
                  href="/products"
                  className="w-full py-3 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Explore Fresh Snacks</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </section>

          {/* ── 4. Delivery Zone Cards Grid ── */}
          <section className="flex flex-col gap-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617] mb-1">
                Official Shipping Tiers
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">
                Standard Delivery Zones &amp; Thresholds
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ZONES.map((zone) => (
                <div
                  key={zone.tier}
                  className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#733617]/40 transition-all group"
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617]">
                        {zone.badge}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: zone.color }}
                        title={zone.tier}
                      />
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D1508] group-hover:text-[#733617] transition-colors">
                      {zone.tier}
                    </h3>
                    
                    <p className="text-xs text-[#65544A] flex items-center gap-1.5 mt-1 mb-3">
                      <MapPin size={13} className="text-[#733617] flex-shrink-0" />
                      {zone.range}
                    </p>

                    <p className="text-xs text-[#65544A] leading-relaxed mb-4">
                      {zone.description}
                    </p>
                  </div>

                  <div>
                    {/* Rate & Free Delivery Block */}
                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] mb-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8A796F] font-bold block">
                          Delivery Fee
                        </span>
                        <span className="text-base font-black text-[#733617]">
                          {zone.charge}
                        </span>
                        <span className="text-[9px] text-[#8A796F] block">
                          {zone.chargeNote}
                        </span>
                      </div>
                      <div className="border-l border-[#EFE6DC] pl-3">
                        <span className="text-[9px] uppercase tracking-wider text-[#8A796F] font-bold block">
                          Free Above
                        </span>
                        <span className="text-base font-black text-emerald-700">
                          {zone.freeAbove}
                        </span>
                        <span className="text-[9px] text-emerald-700/80 block">
                          Cart Subtotal
                        </span>
                      </div>
                    </div>

                    {/* Worked Examples */}
                    <div className="flex flex-col gap-1.5 pt-3 border-t border-[#EFE6DC]">
                      {zone.examples.map((ex) => (
                        <div key={ex.label} className="flex items-center justify-between text-[11px]">
                          <span className="text-[#65544A]">{ex.label}</span>
                          <span className={`font-bold ${ex.result === 'FREE Delivery' ? 'text-emerald-700' : 'text-[#733617]'}`}>
                            {ex.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </section>

          {/* ── 5. Full Side-by-Side Comparison Table ── */}
          <section className="bg-white border border-[#EFE6DC] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-1 flex items-center gap-2">
              <Truck size={20} className="text-[#733617]" />
              Quick Side-by-Side Comparison
            </h2>
            <p className="text-xs text-[#65544A] mb-6">
              Compare rates and free shipping limits for every territory.
            </p>

            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#EFE6DC]">
                    <th className="text-[10px] uppercase tracking-wider font-bold text-[#733617] pb-3 px-3">Delivery Tier</th>
                    <th className="text-[10px] uppercase tracking-wider font-bold text-[#733617] pb-3 px-3">Distance / Reach</th>
                    <th className="text-[10px] uppercase tracking-wider font-bold text-[#733617] pb-3 px-3">Standard Charge</th>
                    <th className="text-[10px] uppercase tracking-wider font-bold text-[#733617] pb-3 px-3">Free Delivery Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map((zone) => (
                    <tr key={zone.tier} className="border-b border-[#FAF7F2] last:border-0 hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="text-xs sm:text-sm font-bold text-[#2D1508] py-3.5 px-3 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: zone.color }} />
                        {zone.tier}
                      </td>
                      <td className="text-xs text-[#65544A] py-3.5 px-3">{zone.range}</td>
                      <td className="text-xs font-bold text-[#733617] py-3.5 px-3">{zone.charge}</td>
                      <td className="text-xs font-bold text-emerald-700 py-3.5 px-3">Above {zone.freeAbove}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── 6. Fulfillment Commitments & Notes ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Notes List */}
            <div className="bg-white border border-[#EFE6DC] rounded-2xl p-6 shadow-xs">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D1508] mb-4 flex items-center gap-2">
                <Info size={18} className="text-[#733617]" />
                Important Shipping Information
              </h2>
              <ul className="flex flex-col gap-3">
                {NOTES.map((note) => (
                  <li key={note} className="flex items-start gap-2.5 text-xs text-[#65544A] leading-relaxed">
                    <PackageCheck size={15} className="text-[#733617] mt-0.5 flex-shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Packaging & Safety Pledge */}
            <div className="bg-[#F5EBE1]/70 border border-[#EFE6DC] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#EFE6DC] text-[10px] font-bold uppercase tracking-wider text-[#733617] mb-3">
                  <ShieldCheck size={12} />
                  <span>Falguni Food-Safe Seal</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2D1508] mb-2">
                  Artisanal Freshness, Intact in Every Transit
                </h3>
                <p className="text-xs text-[#65544A] leading-relaxed mb-4">
                  Whether traveling 2 km across Vastrapur or 2,000 km to Bangalore, all dry farsan, vacuum khakhra, and handmade sweets are packed in multi-layered, food-grade barrier pouches that preserve crispness, aroma, and authentic taste.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[#EFE6DC]">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#733617] hover:underline"
                >
                  <Phone size={13} />
                  <span>Have questions? Contact Delivery Concierge</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}

