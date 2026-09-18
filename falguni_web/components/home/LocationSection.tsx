'use client';
import React from 'react';
import Image from 'next/image';
import { Store } from 'lucide-react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

export default function LocationSection() {
  return (
    <section id="visit-store" className="py-10 md:py-16 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* ── Left Card: Visit Falguni Flagship Store ── */}
          <div className="bg-white rounded-3xl border border-[#EFE6DC] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-[0_2px_14px_rgba(45,21,8,0.03)] hover:shadow-md transition-all">
            <div className="flex-1 flex flex-col items-start">
              {/* Store Icon */}
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4">
                <Store size={22} />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2D1508] mb-1">
                Visit Falguni
              </h3>
              <p className="text-xs font-semibold text-[#733617] uppercase tracking-wider mb-3">
                Vastrapur, Ahmedabad
              </p>

              <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-6">
                Visit our flagship store to experience the rich aroma of freshly prepared Gujarati snacks and authentic traditional sweets.
              </p>

              <a
                href="https://www.google.com/maps/place/Falguni+Gruh+Udhyog+(Vastrapur)/@23.035607,72.5251858,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617] hover:text-[#5A290F] group"
              >
                <span>GET DIRECTIONS</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            {/* Storefront Image */}
            <div className="relative w-full sm:w-[180px] h-[180px] rounded-2xl overflow-hidden shrink-0 border border-[#EFE6DC] bg-[#FAF7F2]">
              <Image
                src="/onboarding/snacks.png"
                alt="Falguni Gruh Udhyog Storefront"
                fill
                sizes="200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-2 left-2 bg-[#241208]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                FLAGSHIP STORE
              </div>
            </div>
          </div>

          {/* ── Right Card: Falguni Wherever You Go (Mobile App) ── */}
          <div className="bg-white rounded-3xl border border-[#EFE6DC] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-[0_2px_14px_rgba(45,21,8,0.03)] hover:shadow-md transition-all overflow-hidden relative">
            <div className="flex-1 flex flex-col items-start z-10">
              <h3 className="font-serif text-2xl font-bold text-[#2D1508] mb-2">
                Falguni, Wherever You Go
              </h3>
              <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-6">
                Your favourite Falguni products, just a tap away.
              </p>

              {/* App Store / Play Store Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2D1508] text-white hover:bg-[#733617] transition-colors shadow-xs"
                >
                  <FaGooglePlay size={16} />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[8px] uppercase tracking-wider opacity-70">Get it on</span>
                    <span className="text-xs font-bold mt-0.5">Google Play</span>
                  </div>
                </a>

                <a
                  href="https://apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2D1508] text-white hover:bg-[#733617] transition-colors shadow-xs"
                >
                  <FaApple size={18} />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[8px] uppercase tracking-wider opacity-70">Download on the</span>
                    <span className="text-xs font-bold mt-0.5">App Store</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Smartphone Mockup */}
            <div className="relative w-28 sm:w-32 h-[180px] sm:h-[200px] shrink-0 rounded-2xl border-4 border-[#2D1508] bg-[#FAF7F2] overflow-hidden shadow-xl flex flex-col p-1.5">
              <div className="w-8 h-1 bg-[#2D1508]/40 rounded-full mx-auto mb-1.5" />
              <div className="flex-1 rounded-xl overflow-hidden relative bg-white border border-[#EFE6DC] p-1 flex flex-col gap-1.5">
                <div className="h-4 bg-[#F5EBE1] rounded flex items-center px-1">
                  <span className="text-[7px] font-bold text-[#733617]">Falguni</span>
                </div>
                <div className="relative w-full h-14 rounded overflow-hidden">
                  <Image src="/4_1.webp" alt="App Preview" fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-[#FAF7F2] rounded w-3/4" />
                  <div className="h-1.5 bg-[#733617]/20 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
