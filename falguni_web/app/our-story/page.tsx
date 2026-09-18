'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Clock, 
  Globe, 
  Smartphone, 
  Sparkles, 
  Heart, 
  Wheat, 
  Leaf, 
  Users, 
  Home, 
  Infinity as InfinityIcon,
  ArrowRight
} from 'lucide-react';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

interface TimelineItem {
  year: string;
  title: string;
  image?: string;
  isInfinity?: boolean;
  description: string;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    year: 'THE START',
    title: 'BEGINNING',
    image: '/story/timeline-1978.jpg',
    description: 'Our journey started as a small home business in Zaveri Vas (Old City), Ahmedabad with a simple goal – to bring homemade taste to every home.',
  },
  {
    year: '1985',
    title: 'OUR FIRST STORE',
    image: '/story/timeline-1985.jpg',
    description: 'Took our first step beyond home with a small cart on C.G. Road near Girish Cold Drink.',
  },
  {
    year: '1999',
    title: 'BRAND TAKES SHAPE',
    image: '/story/timeline-1999.jpg',
    description: 'Devendrabhai Zaveri and his two sons, Kartik Zaveri and Mitesh Zaveri, gave a brand name to the home grown business – Falguni Gruh Udhyog.',
  },
  {
    year: '2012',
    title: 'EXPANDED & BECAME A HOUSEHOLD NAME',
    image: '/story/timeline-2012.jpg',
    description: 'Expanded our store size in Vastrapur and by then Falguni Gruh Udhyog had already been famous across Ahmedabad.',
  },
  {
    year: '2023',
    title: 'SINDHUBHAVAN & ONLINE',
    image: '/story/timeline-2023.jpg',
    description: 'New store at Sindhubhavan and established online presence through website. Third generation entrepreneur Het Zaveri joined the journey.',
  },
  {
    year: '2025',
    title: 'APP & QUICK COMMERCE',
    image: '/story/timeline-2025.jpg',
    description: "Introduced our own application and also entered into quick commerce platforms such as Swiggy Instamart, Zepto etc. (Kartik Zaveri's wife and Rutu's bhai [Het Zaveri's wife] joined the family business).",
  },
  {
    year: '2026',
    title: 'NEW DESTINATIONS',
    image: '/story/timeline-2026.jpg',
    description: 'New stores at Sargasan, Gandhinagar and Airport Terminal 2. Grew our online presence through Amazon, Flipkart, First Club and JioMart.',
  },
  {
    year: 'JOURNEY TO BE',
    title: 'CONTINUED... →',
    isInfinity: true,
    description: "The story doesn't end here. More stores. More products. More homes. More generations. And the best chapters are still to come.",
  },
];

const CORE_VALUES = [
  { icon: Wheat, label: 'Homemade Quality' },
  { icon: Leaf, label: 'Pure Ingredients' },
  { icon: Users, label: 'Generations of Trust' },
  { icon: Home, label: 'Taste Like Home' },
  { icon: Heart, label: 'With Love, Always' },
  { icon: Sparkles, label: 'And the Journey Continues...' },
];

const STORES_DATA = [
  {
    name: 'Vastrapur (Head Store)',
    image: '/story/store-vastrapur.jpg',
    address: 'Shop No. 1, Hirak Complex, Opp. Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad - 380015',
    phone: '+91 98253 82002',
    phoneHref: 'tel:+919825382002',
    timing: '10:00 AM – 9:00 PM (Everyday)',
    mapUrl: 'https://www.google.com/maps/place/Falguni+Gruh+Udhyog+(Vastrapur)/@23.035607,72.5251858,17z',
  },
  {
    name: 'Sindhubhavan Store',
    image: '/story/store-sindhubhavan.jpg',
    address: 'Shop No. GF-6, Sindhubhavan Road, Near Thaltej Cross Road, Ahmedabad - 380054',
    phone: '+91 70330 14365',
    phoneHref: 'tel:+917033014365',
    timing: '10:00 AM – 9:00 PM (Everyday)',
    mapUrl: 'https://www.google.com/maps/search/Falguni+Gruh+Udhyog+Sindhubhavan',
  },
  {
    name: 'Sargasan (Gandhinagar)',
    image: '/story/store-sargasan.jpg',
    address: 'Shop No. 1, Aadhya Aura, Sargasan, Gandhinagar - 382421',
    phone: '+91 63590 14365',
    phoneHref: 'tel:+916359014365',
    timing: '10:00 AM – 9:00 PM (Everyday)',
    mapUrl: 'https://www.google.com/maps/search/Falguni+Gruh+Udhyog+Sargasan',
  },
];

const ONLINE_PLATFORMS = [
  {
    name: 'Our Website',
    subtitle: 'www.falgunigruhudhyog.in',
    buttonText: 'SHOP NOW',
    href: '/products',
    type: 'web',
  },
  {
    name: 'Falguni App',
    subtitle: 'Download our app',
    buttonText: 'DOWNLOAD',
    href: '/onboarding',
    type: 'app',
  },
  {
    name: 'Amazon',
    subtitle: 'Shop on Amazon',
    buttonText: 'SHOP NOW',
    href: 'https://www.amazon.in/s?k=falguni+gruh+udhyog',
    type: 'amazon',
  },
  {
    name: 'Flipkart',
    subtitle: 'Shop on Flipkart',
    buttonText: 'SHOP NOW',
    href: 'https://www.flipkart.com/search?q=falguni+gruh+udhyog',
    type: 'flipkart',
  },
  {
    name: 'Jio Mart',
    subtitle: 'Shop on JioMart',
    buttonText: 'SHOP NOW',
    href: 'https://www.jiomart.com/search/falguni%20gruh%20udhyog',
    type: 'jiomart',
  },
  {
    name: 'Swiggy Instamart',
    subtitle: 'Get it on Swiggy',
    buttonText: 'SHOP NOW',
    href: 'https://www.swiggy.com/instamart',
    type: 'swiggy',
  },
  {
    name: 'Zepto',
    subtitle: 'Get it on Zepto',
    buttonText: 'SHOP NOW',
    href: 'https://www.zeptonow.com',
    type: 'zepto',
  },
];

export default function OurStoryPage() {
  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] pt-4 sm:pt-6 pb-16 sm:pb-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#733617]/70 font-medium mb-6">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-[#733617]/40" />
            <span className="text-[#2D1508] font-bold">Our Story & Journey</span>
          </nav>

          {/* ══════════════════════════════════════════════════════════════
              HERO HEADER SECTION: A Journey of Taste, Trust & Tradition
          ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-12 lg:mb-16 pt-2">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7">
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#8B2E15] uppercase block mb-2">
                OUR JOURNEY
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-serif font-bold text-[#2D1508] tracking-tight leading-[1.15] mb-4">
                A Journey of <br className="hidden sm:inline" />
                Taste, Trust &amp; Tradition
              </h1>
              <p className="text-sm sm:text-base text-[#65544A] leading-relaxed max-w-xl font-normal">
                From a small home business to thousands of homes, our journey continues with the same homemade taste, quality and values.
              </p>
            </div>

            {/* Right Illustrated Storefront & Sketch Card */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#EFE6DC] p-5 shadow-xs flex items-center justify-between gap-4 overflow-hidden">
                <div className="relative w-36 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE6DC]">
                  <Image
                    src="/story/hero-sketch.jpg"
                    alt="Falguni Gruh Udhyog Storefront Sketch"
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col text-right">
                  <p className="font-serif italic text-base sm:text-lg text-[#8B2E15] leading-tight mb-2">
                    Tastes like home <br />
                    in every bite. ♡
                  </p>
                  <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#2D1508]/80 uppercase space-y-0.5 border-t border-[#EFE6DC] pt-2">
                    <div>SAME TASTE</div>
                    <div>SAME QUALITY</div>
                    <div>SAME TRUST</div>
                    <div className="text-[#8B2E15]">ALWAYS...</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              INTERACTIVE TIMELINE: The 8 Epochs of Falguni Gruh Udhyog
          ══════════════════════════════════════════════════════════════ */}
          <div className="mb-16 lg:mb-20 bg-white rounded-3xl border border-[#EFE6DC] p-6 sm:p-8 lg:p-10 shadow-xs overflow-hidden">
            
            {/* Continuous Horizontal Timeline Bar on Desktop */}
            <div className="relative">
              
              {/* Connected Track Line behind the dots */}
              <div className="hidden lg:block absolute top-[18px] left-[4%] right-[4%] h-[3px] bg-[#8B2E15]/80 rounded-full z-0" />

              {/* Milestones Grid / Horizontal Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-3.5 relative z-10">
                {TIMELINE_DATA.map((item, idx) => (
                  <div key={idx} className="flex flex-col relative group">
                    
                    {/* Milestone Header (Year & Node Dot) */}
                    <div className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-1.5 mb-3">
                      {/* Red Node Marker */}
                      <div className="relative w-9 h-9 rounded-full bg-white border-[3px] border-[#8B2E15] flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-110 group-hover:border-[#733617] transition-transform">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#8B2E15]" />
                      </div>

                      {/* Year & Title */}
                      <div className="flex flex-col pt-0.5 lg:pt-1">
                        <span className="text-[11px] font-bold text-[#8B2E15] tracking-wider uppercase">
                          {item.year}
                        </span>
                        <h3 className="text-xs font-serif font-bold text-[#2D1508] uppercase tracking-tight leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Milestone Image / Visual Card */}
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFE6DC] mb-2.5 relative shadow-2xs group-hover:shadow-md transition-shadow">
                      {item.isInfinity ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF7F2] to-[#EFE6DC] text-[#8B2E15]">
                          <InfinityIcon size={36} className="text-[#8B2E15] group-hover:scale-125 transition-transform duration-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#733617] mt-1">Tomorrow</span>
                        </div>
                      ) : (
                        <Image
                          src={item.image || '/story/timeline-1978.jpg'}
                          alt={`${item.year} ${item.title}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>

                    {/* Milestone Narrative Text */}
                    <p className="text-[11px] sm:text-xs text-[#65544A] leading-relaxed font-normal">
                      {item.description}
                    </p>

                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              CORE VALUES STRIP: Different Times. Same Values.
          ══════════════════════════════════════════════════════════════ */}
          <div className="mb-16 lg:mb-20 text-center">
            <h2 className="font-serif italic text-3xl sm:text-4xl text-[#8B2E15] mb-8 sm:mb-10 font-medium">
              Different Times. Same Values.
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {CORE_VALUES.map((val, idx) => {
                const IconComponent = val.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-[#EFE6DC] p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#8B2E15] mb-3 group-hover:bg-[#8B2E15] group-hover:text-white transition-colors">
                      <IconComponent size={24} />
                    </div>
                    <span className="text-xs sm:text-sm font-serif font-bold text-[#2D1508] leading-tight">
                      {val.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              OUR STORE PRESENCE: 3 Flagship Storefronts
          ══════════════════════════════════════════════════════════════ */}
          <div className="mb-16 lg:mb-20">
            
            {/* Header with View All Stores CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8 pb-3 border-b border-[#EFE6DC]">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508]">
                  Our Store Presence
                </h2>
                <p className="text-xs sm:text-sm text-[#65544A] mt-1">
                  Visit our stores and experience the authentic taste of Falguni.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EFE6DC] text-xs font-bold text-[#733617] hover:bg-[#FAF7F2] transition-colors shadow-2xs"
              >
                <span>View All Stores</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* 3 Store Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
              {STORES_DATA.map((store, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-[#EFE6DC] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Store Image */}
                    <div className="relative w-full aspect-[16/10] bg-[#FAF7F2] overflow-hidden">
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Store Details */}
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-bold text-[#2D1508] mb-3">
                        {store.name}
                      </h3>

                      <div className="space-y-2.5 text-xs text-[#65544A]">
                        {/* Address */}
                        <div className="flex items-start gap-2.5">
                          <MapPin size={15} className="text-[#8B2E15] flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{store.address}</p>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2.5">
                          <Phone size={14} className="text-[#8B2E15] flex-shrink-0" />
                          <a href={store.phoneHref} className="font-bold text-[#2D1508] hover:text-[#8B2E15] transition-colors">
                            {store.phone}
                          </a>
                        </div>

                        {/* Timing */}
                        <div className="flex items-center gap-2.5">
                          <Clock size={14} className="text-[#8B2E15] flex-shrink-0" />
                          <span>{store.timing}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Get Directions Button */}
                  <div className="p-6 pt-0">
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 text-center rounded-xl bg-[#8B2E15] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#732510] transition-colors shadow-2xs"
                    >
                      GET DIRECTIONS
                    </a>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              SHOP FALGUNI ONLINE: 7 Multi-Platform Channels
          ══════════════════════════════════════════════════════════════ */}
          <div className="mb-16 lg:mb-20">
            
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508]">
                Shop Falguni Online
              </h2>
              <p className="text-xs sm:text-sm text-[#65544A] mt-1">
                Find us on multiple platforms for your convenience. Same taste, now closer to you!
              </p>
            </div>

            {/* 7 Channels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
              {ONLINE_PLATFORMS.map((platform, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#EFE6DC] p-4 flex flex-col items-center justify-between text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex flex-col items-center">
                    {/* Channel Icon Badge */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-lg font-bold">
                      {platform.type === 'web' && (
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#8B2E15]">
                          <Globe size={22} />
                        </div>
                      )}
                      {platform.type === 'app' && (
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center text-[#8B2E15]">
                          <Smartphone size={22} />
                        </div>
                      )}
                      {platform.type === 'amazon' && (
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl font-serif">
                          a
                        </div>
                      )}
                      {platform.type === 'flipkart' && (
                        <div className="w-10 h-10 rounded-xl bg-[#2874F0] text-yellow-300 flex items-center justify-center font-bold text-lg italic">
                          f
                        </div>
                      )}
                      {platform.type === 'jiomart' && (
                        <div className="w-10 h-10 rounded-xl bg-[#0078AD] text-white flex items-center justify-center font-bold text-xs">
                          Jio
                        </div>
                      )}
                      {platform.type === 'swiggy' && (
                        <div className="w-10 h-10 rounded-xl bg-[#FC8019] text-white flex items-center justify-center font-bold text-xs">
                          Swiggy
                        </div>
                      )}
                      {platform.type === 'zepto' && (
                        <div className="w-10 h-10 rounded-xl bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs">
                          Zepto
                        </div>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-[#2D1508] mb-1">
                      {platform.name}
                    </h3>
                    <p className="text-[10px] text-[#65544A] mb-3 line-clamp-1">
                      {platform.subtitle}
                    </p>

                    {/* App Store Mini Badges */}
                    {platform.type === 'app' && (
                      <div className="flex items-center justify-center gap-1 mb-3 text-[9px] text-[#2D1508] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#EFE6DC]">
                        <FaGooglePlay size={9} />
                        <FaApple size={9} />
                        <span className="font-semibold">Store</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={platform.href}
                    target={platform.href.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-lg bg-[#8B2E15] text-white text-[10px] font-bold tracking-wider hover:bg-[#732510] transition-colors"
                  >
                    {platform.buttonText}
                  </a>
                </div>
              ))}
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              EMOTIONAL CLOSING BANNER
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs overflow-hidden">
            
            {/* Left Snacks Bowl */}
            <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden bg-white border border-[#EFE6DC] flex-shrink-0">
              <Image
                src="/story/chakri-left.jpg"
                alt="Falguni Authentic Handmade Snacks"
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            {/* Center Heartfelt Gratitude */}
            <div className="text-center max-w-lg">
              <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-[#8B2E15] font-normal mb-1">
                Thank you for being a part of our journey. ♡
              </p>
              <p className="text-xs text-[#65544A] italic font-serif">
                &ldquo;We don&apos;t just make snacks, we make moments.&rdquo; &mdash; <span className="font-bold not-italic">Team Falguni</span>
              </p>
            </div>

            {/* Right Snacks Bowl */}
            <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden bg-white border border-[#EFE6DC] flex-shrink-0">
              <Image
                src="/story/chakri-right.jpg"
                alt="Falguni Festive Treats"
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

          </div>

        </div>
      </div>
    </PageShell>
  );
}

