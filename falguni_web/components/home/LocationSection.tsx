'use client';
import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { MapPin, Navigation } from 'lucide-react';

// Dense Street Map UI Vector Pattern
const VectorMapBackground = () => (
  <svg className="absolute inset-0 w-full h-full opacity-40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Dense City Grid Pattern */}
      <pattern id="streetGrid" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        {/* Minor streets */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        <line x1="25" y1="0" x2="25" y2="100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        <line x1="75" y1="0" x2="75" y2="100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        {/* Major streets */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />
        <line x1="0" y1="0" x2="0" y2="100" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />
      </pattern>
      
      {/* Radial vignette to keep the center pin area focused and fade the edges */}
      <radialGradient id="fadeMapGradient" cx="50%" cy="50%" r="50%">
        <stop offset="20%" stopColor="#221512" stopOpacity="0" />
        <stop offset="100%" stopColor="#221512" stopOpacity="1" />
      </radialGradient>
    </defs>
    
    {/* Base City Grid */}
    <rect width="100%" height="100%" fill="url(#streetGrid)" />
    
    {/* Vastrapur Lake Abstract Shape */}
    <path d="M 80 150 Q 180 50 250 120 T 220 280 T 50 220 Z" fill="#D4AF37" opacity="0.1" />
    
    {/* Major Highway (e.g. SG Highway) */}
    <path d="M -50 -50 L 500 600" stroke="#D4AF37" strokeWidth="8" opacity="0.4" strokeLinecap="round" />
    <path d="M 300 -100 L 100 500" stroke="#D4AF37" strokeWidth="4" opacity="0.3" strokeLinecap="round" />
    
    {/* Subtle route line to the pin */}
    <path d="M 100 500 Q 150 400 250 250" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="6 6" opacity="0.8" className="animate-pulse" />

    {/* Vignette Overlay */}
    <rect width="100%" height="100%" fill="url(#fadeMapGradient)" />
  </svg>
);

export default function LocationSection() {
  return (
    <section className="mb-12 md:mb-24 px-4 md:px-8 lg:px-12">
      <SectionHeader title="Find Us" subtitle="Store Location" />

      <div className="relative max-w-7xl mx-auto w-full rounded-3xl lg:rounded-[2rem] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col md:flex-row items-stretch shadow-2xl group">
        
        {/* LEFT / TOP: Vector Map & Pin */}
        <div className="relative flex-1 min-h-[200px] md:min-h-[300px] bg-[#221512] flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden">
          <VectorMapBackground />
          
          {/* Animated Glowing Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="absolute inset-0 bg-[#D4AF37] blur-[30px] md:blur-[40px] opacity-20 rounded-full animate-pulse-gold w-24 h-24 md:w-32 md:h-32 -m-6 md:-m-8" />
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8952A] rounded-full flex items-center justify-center shadow-xl mb-3 md:mb-4 transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
              <MapPin size={28} color="#2B1B17" className="animate-bounce mt-1 md:w-9 md:h-9" />
            </div>
            
            <div className="w-16 h-2 bg-black/40 blur-sm rounded-[100%] mx-auto scale-x-125" />
          </div>
        </div>

        {/* RIGHT / BOTTOM: Store Details */}
        <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-16 relative z-10 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-bg)]">
          <div className="w-10 md:w-12 h-1 bg-[#D4AF37] mb-4 md:mb-6 rounded-full" />
          
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-1.5 md:mb-2 tracking-wide">Falguni Gruh Udhyog</h3>
          <p className="text-[#D4AF37] font-bold tracking-widest text-[10px] md:text-xs uppercase mb-6 md:mb-8">Vastrapur • Ahmedabad</p>
          
          <p className="text-[var(--color-fg-muted)] leading-relaxed text-xs md:text-sm lg:text-base mb-6 md:mb-8 max-w-sm">
            Visit our flagship store to experience the rich aroma of freshly prepared Gujarati snacks and authentic traditional sweets, crafted daily with love and purity.
          </p>

          <a 
            href="https://www.google.com/maps/place/Falguni+Gruh+Udhyog+(Vastrapur)/@23.035607,72.5251858,17z/data=!3m2!4b1!5s0x395e84b609751615:0xa08aadf19342b162!4m6!3m5!1s0x395e84b646aaaaab:0x7acfa7e161f5e01a!8m2!3d23.035607!4d72.5277607!16s%2Fg%2F11jygkzsly?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 rounded-xl text-xs md:text-sm w-max font-bold"
          >
            <Navigation size={16} className="md:w-[18px] md:h-[18px]" />
            GET DIRECTIONS
          </a>
        </div>

      </div>
    </section>
  );
}
