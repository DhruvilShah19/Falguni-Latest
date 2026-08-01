'use client';

import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { ArrowLeft, MapPin, Truck, PackageCheck, Info } from 'lucide-react';

// Keep this in sync with the actual pricing logic in lib/deliveryPricing.ts --
// this page is customer-facing copy, not a live calculation, so if the real
// thresholds/fees ever change there, update the numbers below to match.
const ZONES = [
  {
    color: '#4ADE80', // green
    tier: 'Hyperlocal Delivery',
    range: 'Within 5 km',
    charge: '₹50',
    chargeNote: 'flat fee',
    freeAbove: '₹400',
    examples: [
      { label: 'Order Value ₹300', result: 'Delivery ₹50' },
      { label: 'Order Value ₹650', result: 'FREE Delivery' },
    ],
  },
  {
    color: '#60A5FA', // blue
    tier: 'Intercity Delivery',
    range: '5 – 10 km',
    charge: '₹100',
    chargeNote: 'flat fee',
    freeAbove: '₹1,200',
    examples: [
      { label: 'Order Value ₹900', result: 'Delivery ₹100' },
      { label: 'Order Value ₹1,500', result: 'FREE Delivery' },
    ],
  },
  {
    color: '#FB923C', // orange
    tier: 'Interstate Delivery',
    range: '10 – 15 km',
    charge: '₹150',
    chargeNote: 'flat fee',
    freeAbove: '₹1,800',
    examples: [
      { label: 'Order Value ₹1,400', result: 'Delivery ₹150' },
      { label: 'Order Value ₹2,000', result: 'FREE Delivery' },
    ],
  },
  {
    color: '#D4AF37', // gold
    tier: 'Gujarat Outstation',
    range: 'Above 15 km — anywhere in Gujarat',
    charge: '₹40',
    chargeNote: 'per kg',
    freeAbove: '₹2,000',
    weightTable: [
      { weight: '2 kg', charge: '₹80' },
      { weight: '5 kg', charge: '₹200' },
      { weight: '8 kg', charge: '₹320' },
    ],
    examples: [
      { label: 'Order Value ₹1,700 (4 kg)', result: 'Delivery ₹160' },
      { label: 'Order Value ₹2,300 (4 kg)', result: 'FREE Delivery' },
    ],
  },
  {
    color: '#F87171', // red
    tier: 'PAN India Delivery',
    range: 'Above 15 km — outside Gujarat',
    charge: '₹100',
    chargeNote: 'per kg',
    freeAbove: '₹3,500',
    weightTable: [
      { weight: '1 kg', charge: '₹100' },
      { weight: '3 kg', charge: '₹300' },
      { weight: '5 kg', charge: '₹500' },
    ],
    examples: [
      { label: 'Order Value ₹2,800 (3 kg)', result: 'Delivery ₹300' },
      { label: 'Order Value ₹3,800 (3 kg)', result: 'FREE Delivery' },
    ],
  },
];

const NOTES = [
  'Distance is calculated from the Falguni Gruh Udhyog store to the delivery address.',
  'Weight-based shipping is calculated on the final packed weight.',
  'Free delivery is automatically applied when your order meets the eligible value.',
  'Orders above the free-delivery threshold are delivered free irrespective of weight.',
];

export default function DeliveryChargesPage() {
  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

        {/* ── Header Banner ── */}
        <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-20 flex flex-col items-center justify-center mb-6 md:mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

          <div className="absolute top-28 md:top-36 left-4 md:left-8 z-50">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4AF37] transition-colors text-[9px] md:text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back
            </Link>
          </div>

          <div className="relative z-10 text-center px-4 w-full mt-4 md:mt-0">
            <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
              <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
              SHIPPING & DELIVERY
              <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
            </div>

            <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
              Delivery Charges
            </h1>

            <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
              A simple breakdown of how delivery fees are worked out, wherever you're ordering from.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 relative z-10 flex flex-col gap-6 sm:gap-8">

          {/* ── Zone Cards ── */}
          {ZONES.map((zone) => (
            <div
              key={zone.tier}
              className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[24px] p-6 sm:p-8 backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: zone.color, boxShadow: `0 0 12px ${zone.color}80` }}
                  />
                  <div>
                    <h2 className="text-white font-serif italic text-xl sm:text-2xl">{zone.tier}</h2>
                    <p className="text-white/50 text-xs sm:text-sm flex items-center gap-1.5 mt-1">
                      <MapPin size={12} className="text-[#D4AF37]/70" /> {zone.range}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 flex flex-col items-center min-w-[90px]">
                    <span className="text-[#D4AF37] font-black text-lg">{zone.charge}</span>
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">{zone.chargeNote}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 flex flex-col items-center min-w-[90px]">
                    <span className="text-green-400 font-black text-sm">{zone.freeAbove}</span>
                    <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Free above</span>
                  </div>
                </div>
              </div>

              {zone.weightTable && (
                <div className="mb-5 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-white/40 text-[9px] uppercase tracking-widest font-bold pb-2 pr-4">Order Weight</th>
                        <th className="text-white/40 text-[9px] uppercase tracking-widest font-bold pb-2">Delivery Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zone.weightTable.map((row) => (
                        <tr key={row.weight} className="border-b border-white/5 last:border-0">
                          <td className="text-white/80 text-xs sm:text-sm py-2 pr-4">{row.weight}</td>
                          <td className="text-white/80 text-xs sm:text-sm py-2">{row.charge}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

              <div className="flex flex-col gap-2">
                {zone.examples.map((ex) => (
                  <div key={ex.label} className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                    <span className="text-white/60">{ex.label}</span>
                    <span className={`font-bold ${ex.result === 'FREE Delivery' ? 'text-green-400' : 'text-[#D4AF37]'}`}>
                      {ex.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Comparison Table ── */}
          <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[24px] p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-white font-serif italic text-xl sm:text-2xl mb-1 flex items-center gap-2">
              <Truck size={20} className="text-[#D4AF37]" /> How We Calculate Delivery
            </h2>
            <p className="text-white/50 text-xs sm:text-sm mb-6">A quick side-by-side of every zone.</p>

            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-white/40 text-[9px] uppercase tracking-widest font-bold pb-3 px-2">Delivery Zone</th>
                    <th className="text-white/40 text-[9px] uppercase tracking-widest font-bold pb-3 px-2">Distance</th>
                    <th className="text-white/40 text-[9px] uppercase tracking-widest font-bold pb-3 px-2">Delivery Charge</th>
                    <th className="text-white/40 text-[9px] uppercase tracking-widest font-bold pb-3 px-2">Free Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map((zone) => (
                    <tr key={zone.tier} className="border-b border-white/5 last:border-0">
                      <td className="text-white/90 text-xs sm:text-sm font-bold py-3 px-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: zone.color }} />
                        {zone.tier.replace(' Delivery', '')}
                      </td>
                      <td className="text-white/70 text-xs sm:text-sm py-3 px-2">{zone.range}</td>
                      <td className="text-white/70 text-xs sm:text-sm py-3 px-2">{zone.charge} {zone.chargeNote}</td>
                      <td className="text-green-400/90 text-xs sm:text-sm py-3 px-2">Above {zone.freeAbove}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Notes ── */}
          <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[24px] p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-white font-serif italic text-xl sm:text-2xl mb-5 flex items-center gap-2">
              <Info size={20} className="text-[#D4AF37]" /> Notes
            </h2>
            <ul className="flex flex-col gap-3">
              {NOTES.map((note) => (
                <li key={note} className="flex items-start gap-3 text-white/60 text-xs sm:text-sm leading-relaxed">
                  <PackageCheck size={14} className="text-[#D4AF37]/70 mt-0.5 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
