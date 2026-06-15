'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// SVGs for Apple and Play Store
const AppleLogo = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="w-full h-full">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const PlayStoreLogo = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
  </svg>
);

// Snack Image 1: Chakli (4_1.webp)
const SnackImage1 = () => (
  <div className="relative w-full aspect-square max-w-[180px] rounded-full p-2 border border-[#D4AF37]/40 border-dashed animate-[spin_40s_linear_infinite]">
     <div className="w-full h-full rounded-full overflow-hidden relative border-4 border-[#1a100e] shadow-[0_0_40px_rgba(212,175,55,0.4)] animate-[spin_40s_linear_infinite_reverse]">
        <Image src="/4_1.webp" alt="Snacks" fill className="object-cover scale-110" sizes="200px" />
        <div className="absolute inset-0 bg-[#D4AF37]/10 mix-blend-overlay pointer-events-none" />
     </div>
     <div className="absolute inset-0 bg-[#D4AF37]/5 blur-2xl rounded-full pointer-events-none" />
  </div>
);

// Snack Image 2: Khakhra Poster (4_2.avif) & Text
const SnackImage2 = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center gap-5">
     {/* Khakhra Image Card */}
     <div className="relative w-[85%] max-w-[200px] aspect-[4/5] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)] group z-20">
        <Image src="/4_2.avif" alt="Khakhra" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="250px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a100e]/90 via-[#1a100e]/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
     </div>
     
     {/* Vector Text */}
     <div className="text-center font-serif text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] flex flex-col gap-1.5 z-30">
        <span className="text-[22px] font-bold italic tracking-wide leading-tight">Ghar ka Swad</span>
        <span className="text-[9px] tracking-[0.3em] uppercase opacity-90 font-sans font-bold text-white/90">in every bite</span>
     </div>
  </div>
);

// The Premium Glowing Vector Layout wrapper
const PremiumVectorLayout = ({ isHovered, isFrontPhone, children }: { isHovered: boolean, isFrontPhone: boolean, children: React.ReactNode }) => (
  <div className={`w-full h-full relative flex flex-col items-center justify-between p-6 ${isFrontPhone ? 'pt-14' : 'pt-8'} overflow-hidden`}>
     {/* Ambient Glow */}
     <div className={`absolute inset-0 transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-30'}`} 
          style={{ background: 'radial-gradient(circle at center, rgba(212,175,55,0.15) 0%, transparent 60%)' }} />
     
     {/* UI Elements */}
     <div className={`w-full h-full flex flex-col items-center justify-between relative z-10 transition-all duration-1000 ${isHovered ? 'scale-105 opacity-100 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]' : 'scale-100 opacity-60 drop-shadow-[0_0_5px_rgba(212,175,55,0.2)]'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center w-full">
           <div className="w-6 h-1 bg-[#D4AF37]/50 rounded-full" />
           <div className="text-[#D4AF37] font-serif text-2xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">Falguni</div>
           <div className="w-6 h-6 rounded-full border border-[#D4AF37]/60" />
        </div>

        {/* Central Snack Vector Content */}
        <div className="flex-1 w-full flex items-center justify-center my-6">
           {children}
        </div>

        {/* Bottom Elements */}
        <div className="w-full flex flex-col gap-4 mt-auto mb-4">
           {/* Hero Card Wireframe */}
           <div className="w-full h-16 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex flex-col justify-end p-3 relative overflow-hidden">
              <div className="w-1/3 h-1.5 bg-[#D4AF37]/80 rounded-full mb-2" />
              <div className="w-full flex justify-between items-center">
                 <div className="w-1/4 h-1.5 bg-[#D4AF37]/50 rounded-full" />
                 <div className="w-5 h-2 bg-[#D4AF37]/90 rounded-full" />
              </div>
           </div>

           {/* List Wireframes */}
           <div className="flex gap-3">
             {[1,2].map(i => (
               <div key={i} className="flex-1 h-12 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center px-2 gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 shrink-0" />
                  <div className="flex flex-col gap-1 flex-1">
                     <div className="w-full h-1 bg-[#D4AF37]/60 rounded-full" />
                     <div className="w-2/3 h-1 bg-[#D4AF37]/30 rounded-full" />
                  </div>
               </div>
             ))}
           </div>
        </div>
        
     </div>
  </div>
);

export default function AppDownloadSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredStore, setHoveredStore] = useState<'apple' | 'android' | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation (-15 to 15 degrees max)
    const rotateX = -(y / rect.height) * 30; 
    const rotateY = (x / rect.width) * 30;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Compute dynamic positions based on hovered store
  // Android Phone (Phone 1)
  const androidPos = {
    rotateY: hoveredStore === 'android' ? -15 : (hoveredStore === 'apple' ? -35 : -25),
    rotateZ: hoveredStore === 'android' ? -2 : (hoveredStore === 'apple' ? 8 : 5),
    translateX: hoveredStore === 'android' ? -20 : (hoveredStore === 'apple' ? 80 : 40),
    translateZ: hoveredStore === 'android' ? 80 : (hoveredStore === 'apple' ? -40 : 0),
    zIndex: hoveredStore === 'android' ? 30 : 10,
    shadowBlur: hoveredStore === 'android' ? 100 : 40,
    shadowOffset: hoveredStore === 'android' ? 40 : 20,
    shadowColor: hoveredStore === 'android' ? 'rgba(212,175,55,0.3)' : 'rgba(0,0,0,0.8)'
  };

  // Apple Phone (Phone 2)
  const applePos = {
    rotateY: hoveredStore === 'apple' ? -15 : (hoveredStore === 'android' ? -35 : -15),
    rotateZ: hoveredStore === 'apple' ? -2 : (hoveredStore === 'android' ? 8 : -2),
    translateX: hoveredStore === 'apple' ? -20 : (hoveredStore === 'android' ? 80 : 0),
    translateZ: hoveredStore === 'apple' ? 80 : (hoveredStore === 'android' ? -40 : 60),
    zIndex: hoveredStore === 'android' ? 10 : 30,
    shadowBlur: hoveredStore === 'apple' ? 100 : (hoveredStore === 'android' ? 40 : 80),
    shadowOffset: hoveredStore === 'apple' ? 40 : (hoveredStore === 'android' ? 20 : 40),
    shadowColor: hoveredStore === 'apple' ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.95)'
  };

  return (
    <div className="relative w-full overflow-hidden bg-[var(--color-bg)] text-white py-12 md:py-24 lg:py-32" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 75% 50%, rgba(212,175,55,0.06) 0%, transparent 50%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* LEFT: Text & Buttons */}
        <div className="flex-1 max-w-2xl z-40 pointer-events-auto">
          <div className="animate-fade-up text-[11px] tracking-[0.3em] font-bold text-[#D4AF37] mb-6 flex items-center gap-4">
             <span className="w-12 h-px bg-[#D4AF37]/50" />
             GET THE APP
          </div>
          <h2 className="animate-fade-up font-serif text-4xl md:text-5xl lg:text-7xl leading-[1.05] mb-6 md:mb-8" style={{ animationDelay: '100ms' }}>
            Experience <br className="hidden md:block" />
            <span className="text-[#D4AF37]">Falguni</span> on Mobile
          </h2>
          <p className="animate-fade-up text-base md:text-lg text-white/70 mb-8 md:mb-12 max-w-md leading-relaxed" style={{ animationDelay: '200ms' }}>
            Savor the authentic taste of Indian snacks, anytime, anywhere. Order your favorites with a tap.
          </p>

          <div className="animate-fade-up flex flex-col sm:flex-row gap-5" style={{ animationDelay: '300ms' }}>
            {/* Apple App Store Button */}
            <Link
              href="https://apps.apple.com/us/app/falguni-gruh-udhyog/id6505093471"
              target="_blank"
              onMouseEnter={() => setHoveredStore('apple')}
              onMouseLeave={() => setHoveredStore(null)}
              className="group flex items-center gap-4 px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <div className="w-7 h-7 relative z-10 text-white">
                <AppleLogo />
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] uppercase tracking-wider text-white/60 group-hover:text-white/80 transition-colors">Download on the</span>
                <span className="text-xl font-semibold leading-tight mt-0.5 text-white">App Store</span>
              </div>
            </Link>

            {/* Google Play Store Button */}
            <Link
              href="https://play.google.com/store/apps/details?id=com.Falgunigruhudhyog&pli=1"
              target="_blank"
              onMouseEnter={() => setHoveredStore('android')}
              onMouseLeave={() => setHoveredStore(null)}
              className="group flex items-center gap-4 px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#34D399]/10 hover:border-[#34D399]/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#34D399]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <div className="w-7 h-7 relative z-10 text-white group-hover:text-[#34D399] transition-colors duration-300">
                <PlayStoreLogo />
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] uppercase tracking-wider text-white/60 group-hover:text-[#34D399]/80 transition-colors">Get it on</span>
                <span className="text-xl font-semibold leading-tight mt-0.5 text-white group-hover:text-[#34D399] transition-colors">Google Play</span>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT: Floating Phones with 3D Mouse Tracking */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex-1 hidden lg:flex items-center justify-center relative perspective-[1200px] w-full cursor-crosshair" 
          style={{ height: 500 }}
        >
           {/* Ambient Glows behind phones */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none transition-all duration-700 ease-out ${hoveredStore === 'android' ? 'bg-[#34D399]/15 blur-[150px]' : (hoveredStore === 'apple' ? 'bg-white/10 blur-[150px]' : 'bg-[#D4AF37]/15 blur-[120px]')}`} />

           {/* Phone 1 (Android / Google Play) */}
           <div className="absolute right-[5%] top-[10%] w-[250px] h-[520px] rounded-[36px] bg-[#1a100e] border-[5px] border-[#2B1B17] overflow-hidden pointer-events-none"
                style={{ 
                  transform: `rotateX(${tilt.x * 0.5}deg) rotateY(${androidPos.rotateY + tilt.y * 0.5}deg) rotateZ(${androidPos.rotateZ}deg) translateX(${androidPos.translateX}px) translateZ(${androidPos.translateZ}px)`,
                  boxShadow: `${-androidPos.shadowOffset - tilt.y}px ${androidPos.shadowOffset + tilt.x}px ${androidPos.shadowBlur}px ${androidPos.shadowColor}`,
                  zIndex: androidPos.zIndex,
                  transition: tilt.x === 0 && tilt.y === 0 ? 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out, z-index 0s',
                  transformStyle: 'preserve-3d'
                }}>
              <PremiumVectorLayout isHovered={hoveredStore === 'android'} isFrontPhone={false}>
                 {/* Vector representation of Chakli */}
                 <SnackImage1 />
              </PremiumVectorLayout>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent pointer-events-none" />
           </div>

           {/* Phone 2 (Apple / App Store) */}
           <div className="absolute left-[15%] top-[5%] w-[270px] h-[550px] rounded-[44px] bg-[#2B1B17] border-[8px] border-[#3e2722] shadow-[0_0_0_1px_#1a100e] overflow-hidden pointer-events-none"
                style={{ 
                  transform: `rotateX(${tilt.x}deg) rotateY(${applePos.rotateY + tilt.y}deg) rotateZ(${applePos.rotateZ}deg) translateX(${applePos.translateX}px) translateZ(${applePos.translateZ}px)`,
                  boxShadow: `${-applePos.shadowOffset - tilt.y * 1.5}px ${applePos.shadowOffset + tilt.x * 1.5}px ${applePos.shadowBlur}px ${applePos.shadowColor}`,
                  zIndex: applePos.zIndex,
                  transition: tilt.x === 0 && tilt.y === 0 ? 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out, z-index 0s',
                  transformStyle: 'preserve-3d'
                }}>
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20 border border-[#D4AF37]/10 shadow-inner" />
              
              <PremiumVectorLayout isHovered={hoveredStore === 'apple'} isFrontPhone={true}>
                 {/* Vector representation of Khakhra with Text */}
                 <SnackImage2 />
              </PremiumVectorLayout>

              {/* Screen Glare */}
              <div className={`absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none z-30 transition-opacity duration-700 ${hoveredStore === 'apple' ? 'opacity-100' : 'opacity-40'}`} />
           </div>
        </div>

      </div>
    </div>
  );
}
