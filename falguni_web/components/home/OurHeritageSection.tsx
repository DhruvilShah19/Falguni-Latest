'use client';
import React, { useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';

// ─── Legacy Badge SVG ─────────────────────────────────────────────────────────
const LegacyBadge = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" fill="none">
    <circle cx="60" cy="60" r="55" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="60" cy="60" r="48" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
    <path d="M 60 20 L 70 45 L 95 45 L 75 60 L 85 85 L 60 70 L 35 85 L 45 60 L 25 45 L 50 45 Z" fill="#D4AF37" opacity="0.9" />
    <text x="60" y="105" fill="#D4AF37" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="2">SINCE 1990</text>
  </svg>
);

// ─── Uncle Vector SVG ─────────────────────────────────────────────────────────
const UncleVector = () => (
  <svg viewBox="0 0 200 200" className="w-24 h-24 drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" fill="none">
    <circle cx="100" cy="100" r="95" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 4" opacity="0.6"/>
    <path d="M70 110 C 70 145, 130 145, 130 110 C 130 80, 70 80, 70 110" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round"/>
    <path d="M55 85 C 50 60, 100 30, 120 40 C 140 50, 145 75, 135 90 C 120 70, 70 60, 55 85 Z" fill="#D4AF37" opacity="0.9"/>
    <path d="M75 125 C 80 120, 95 120, 100 125 C 105 120, 120 120, 125 125 C 135 130, 140 115, 130 115 C 115 115, 105 110, 100 120 C 95 110, 85 115, 70 115 Z" fill="#D4AF37"/>
    <path d="M80 105 Q 85 100 90 105" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round"/>
    <path d="M110 105 Q 115 100 120 105" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function OurHeritageSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === 0 ? 1 : 0));
    }, 5000); // Auto slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mb-24">
      {/* 1. Same Heading Style */}
      <SectionHeader title="Our Heritage" subtitle="Generations of Taste" />

      {/* 2. Side by Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-[1400px] mx-auto px-5">
        
        {/* LEFT COLUMN: Beautiful Parallax Image */}
        <div 
          className="relative rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none overflow-hidden min-h-[300px] lg:min-h-[500px]"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          <div className="absolute bottom-8 left-8">
             <h3 className="text-white text-3xl font-serif drop-shadow-md">Falguni Gruh Udhyog</h3>
             <p className="text-[#D4AF37] font-bold tracking-widest text-sm uppercase mt-2">Ahmedabad, Gujarat</p>
          </div>
        </div>

        {/* RIGHT COLUMN: The Story Slider */}
        <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-b-3xl lg:rounded-r-3xl lg:rounded-bl-none p-8 md:p-12 flex flex-col justify-center min-h-[400px] lg:min-h-[500px] overflow-hidden">
          
          <div className="relative w-full h-full">
            {/* SLIDE 1: Legacy Badge + Story Part 1 */}
            <div 
              className={`absolute inset-0 flex flex-col justify-center pr-4 transition-all duration-700 ease-in-out ${
                currentSlide === 0 ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 -translate-x-8 pointer-events-none'
              }`}
            >
               <div className="mb-6"><LegacyBadge /></div>
               <h4 className="text-2xl font-serif text-white mb-4">A Legacy of Purity</h4>
               <p className="text-[var(--color-fg-muted)] leading-relaxed font-light text-lg">
                 Since our humble beginnings in Ahmedabad, Falguni Gruh Udhyog has been a beloved name dedicated to bringing the authentic taste of tradition to every home. We craft our snacks with the finest handpicked ingredients and age-old family recipes.
               </p>
            </div>

            {/* SLIDE 2: Uncle Vector + Story Part 2 (Owner's Touch) */}
            <div 
              className={`absolute inset-0 flex flex-col justify-center pr-4 transition-all duration-700 ease-in-out ${
                currentSlide === 1 ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-8 pointer-events-none'
              }`}
            >
               <div className="mb-6"><UncleVector /></div>
               <h4 className="text-2xl font-serif text-white mb-4">The Owner's Touch</h4>
               <p className="text-[var(--color-fg-muted)] leading-relaxed font-light text-lg">
                 It takes more than just spices to create magic—it takes an uncompromising commitment to quality and a personal touch. Every batch is overseen to ensure it carries the true essence of our heritage.
                 <br/><br/>
                 <strong className="text-[#D4AF37] font-serif font-semibold text-xl">Experience the pure joy of 'Ghar ka Swad' in every bite.</strong>
               </p>
            </div>
          </div>

          {/* Slider Controls - Expanded click area and z-10 */}
          <div className="absolute bottom-6 left-12 flex gap-3 z-10">
             <button 
               onClick={() => setCurrentSlide(0)}
               className="py-2 cursor-pointer"
               aria-label="Go to slide 1"
             >
               <div className={`w-12 h-1.5 rounded-full transition-colors ${currentSlide === 0 ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]/20'}`} />
             </button>
             <button 
               onClick={() => setCurrentSlide(1)}
               className="py-2 cursor-pointer"
               aria-label="Go to slide 2"
             >
               <div className={`w-12 h-1.5 rounded-full transition-colors ${currentSlide === 1 ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]/20'}`} />
             </button>
          </div>

        </div>
      </div>
    </section>
  );
}
