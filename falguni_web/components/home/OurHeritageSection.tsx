'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function OurHeritageSection() {
  return (
    <section id="our-story" className="py-12 md:py-20 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ── Left Column: Vintage Framed Portrait & Brass Snacks Bowls ── */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#F5EBE1] group">
              {/* Authentic Heritage Photo */}
              <Image
                src="/onboarding/snacks.png"
                alt="Falguni Gruh Udhyog Heritage"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover sepia-[0.35] brightness-95 contrast-110 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D1508]/60 via-transparent to-transparent pointer-events-none" />

              {/* Framed Founders Inset Tag */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#EFE6DC] shadow-md flex items-center justify-between">
                <div>
                  <p className="font-serif font-bold text-sm text-[#2D1508]">
                    Falguni Gruh Udhyog
                  </p>
                  <p className="text-[11px] text-[#65544A]">
                    Ahmedabad, Gujarat • Since Inception
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#733617] px-3 py-1 bg-[#FAF7F2] rounded-full border border-[#EFE6DC]">
                  Pure Tradition
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column: The Story & CTA ── */}
          <div className="lg:col-span-6 flex flex-col items-start justify-center relative">

            {/* Traditional Grinder Watermark Icon */}
            <div className="absolute -top-10 right-0 opacity-5 pointer-events-none text-9xl">
              ⚙️
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#2D1508] leading-tight mb-6">
              A Legacy of Purity
            </h2>

            <p className="text-[#5C4D44] text-sm md:text-base leading-relaxed mb-4">
              Since our humble beginnings in Ahmedabad, Falguni Gruh Udhyog has been a beloved name dedicated to bringing the authentic taste of tradition to every home.
            </p>

            <p className="text-[#5C4D44] text-sm md:text-base leading-relaxed mb-8">
              We use handpicked ingredients, age-old family recipes and personally oversee every batch to ensure the quality and purity you trust.
            </p>

            <Link
              href="/our-story"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#733617] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5A290F] shadow-sm hover:shadow-md transition-all group"
            >
              <span>DISCOVER OUR STORY</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
