'use client';
import React from 'react';
import Image from 'next/image';
import { Store } from 'lucide-react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

export default function LocationSection() {
  return (
    <section id="visit-store" className="py-12 md:py-20 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D1508] mb-3">Our Locations</h2>
          <p className="text-sm text-[#65544A]">Experience the rich aroma of freshly prepared Gujarati snacks at a store near you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
          
          {/* Store 1: Vastrapur */}
          <div className="bg-white rounded-3xl border border-[#EFE6DC] p-6 flex flex-col items-start shadow-[0_2px_14px_rgba(45,21,8,0.03)] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4">
              <Store size={22} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2D1508] mb-1">Vastrapur Flagship</h3>
            <p className="text-[10px] font-bold text-[#733617] uppercase tracking-wider mb-3">Ahmedabad</p>
            <p className="text-xs text-[#65544A] leading-relaxed mb-6 flex-1">
              Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad
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

          {/* Store 2: Sargasan */}
          <div className="bg-white rounded-3xl border border-[#EFE6DC] p-6 flex flex-col items-start shadow-[0_2px_14px_rgba(45,21,8,0.03)] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4">
              <Store size={22} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2D1508] mb-1">Sargasan Branch</h3>
            <p className="text-[10px] font-bold text-[#733617] uppercase tracking-wider mb-3">Gandhinagar</p>
            <p className="text-xs text-[#65544A] leading-relaxed mb-6 flex-1">
              Highstreet, Nr, Swagat Twin City, GF-32, 33, Aashka Hospital Rd, Sargasan, Gandhinagar, Gujarat 382421
            </p>
            <a
              href="https://maps.google.com/?q=Highstreet,+Nr,+Swagat+Twin+City,+GF-32,+33,+Aashka+Hospital+Rd,+Sargasan,+Gandhinagar,+Gujarat+382421,+India"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617] hover:text-[#5A290F] group"
            >
              <span>GET DIRECTIONS</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {/* Store 3: Airport */}
          <div className="bg-white rounded-3xl border border-[#EFE6DC] p-6 flex flex-col items-start shadow-[0_2px_14px_rgba(45,21,8,0.03)] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#733617] mb-4">
              <Store size={22} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2D1508] mb-1">Terminal 2 Kiosk</h3>
            <p className="text-[10px] font-bold text-[#733617] uppercase tracking-wider mb-3">Ahmedabad Airport</p>
            <p className="text-xs text-[#65544A] leading-relaxed mb-6 flex-1">
              Sardar Vallabhbhai Patel International Airport, Terminal 2, Hansol, Ahmedabad, Gujarat
            </p>
            <a
              href="https://maps.google.com/?q=Ahmedabad+Airport+Terminal+2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617] hover:text-[#5A290F] group"
            >
              <span>GET DIRECTIONS</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

        </div>

        {/* ── Falguni Wherever You Go (Mobile App) ── */}
        <div className="bg-white max-w-4xl mx-auto rounded-3xl border border-[#EFE6DC] p-6 sm:p-10 flex flex-col sm:flex-row gap-8 items-center justify-between shadow-[0_2px_14px_rgba(45,21,8,0.03)] hover:shadow-md transition-all overflow-hidden relative">
          <div className="flex-1 flex flex-col items-start z-10">
            <h3 className="font-serif text-3xl font-bold text-[#2D1508] mb-2">
              Falguni, Wherever You Go
            </h3>
            <p className="text-sm text-[#65544A] leading-relaxed mb-8">
              Your favourite Falguni products, just a tap away.
            </p>

            {/* App Store / Play Store Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#2D1508] text-white hover:bg-[#733617] transition-colors shadow-xs"
              >
                <FaGooglePlay size={18} />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider opacity-70">Get it on</span>
                  <span className="text-sm font-bold mt-0.5">Google Play</span>
                </div>
              </a>

              <a
                href="https://apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#2D1508] text-white hover:bg-[#733617] transition-colors shadow-xs"
              >
                <FaApple size={20} />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider opacity-70">Download on the</span>
                  <span className="text-sm font-bold mt-0.5">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Smartphone Mockup */}
          <div className="relative w-32 sm:w-40 h-[220px] sm:h-[240px] shrink-0 rounded-2xl border-4 border-[#2D1508] bg-[#FAF7F2] overflow-hidden shadow-xl flex flex-col p-1.5 rotate-3">
            <div className="w-8 h-1 bg-[#2D1508]/40 rounded-full mx-auto mb-1.5" />
            <div className="flex-1 rounded-xl overflow-hidden relative bg-white border border-[#EFE6DC] p-1 flex flex-col gap-1.5">
              <div className="h-5 bg-[#F5EBE1] rounded flex items-center px-1.5">
                <span className="text-[8px] font-bold text-[#733617]">Falguni</span>
              </div>
              <div className="relative w-full h-20 rounded overflow-hidden">
                <Image src="/4_1.webp" alt="App Preview" fill className="object-cover" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-[#FAF7F2] rounded w-3/4" />
                <div className="h-2 bg-[#733617]/20 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
