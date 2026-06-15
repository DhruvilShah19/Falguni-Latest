'use client';
import {
  useEffect, useState, useRef, useCallback,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSliderFeeds, type SliderFeed } from '@/lib/firestore';
import { ShoppingBag, ArrowRight, Zap } from 'lucide-react';

const AUTO_MS = 5500;

/* ─────────────────────────────────────────────────────────
   HERO BANNER
───────────────────────────────────────────────────────── */
export default function HeroBanner() {
  const [slides, setSlides]   = useState<SliderFeed[]>([]);
  const [idx, setIdx]         = useState(0);
  const [prevIdx, setPrev]    = useState<number | null>(null);
  const [loaded, setLoaded]   = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Load slides */
  useEffect(() => {
    getSliderFeeds().then(s => { setSlides(s); setLoaded(true); });
  }, []);

  /* Slide transition */
  const goTo = useCallback((next: number) => {
    if (transitioning || next === idx) return;
    setTransitioning(true);
    setPrev(idx);
    setIdx(next);
    setTimeout(() => { setPrev(null); setTransitioning(false); }, 700);
  }, [transitioning, idx]);

  const advance = useCallback(() => {
    if (!slides.length) return;
    goTo((idx + 1) % slides.length);
  }, [idx, slides.length, goTo]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(advance, AUTO_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, advance]);

  const pause  = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(advance, AUTO_MS);
  };

  if (!loaded) return <Skeleton />;

  const slide = slides[idx] ?? null;
  const prevSlide = prevIdx !== null ? slides[prevIdx] : null;

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      className="relative w-full overflow-hidden select-none min-h-[420px] md:min-h-[500px] lg:min-h-[580px]"
      style={{
        borderRadius: 24,
        background: 'linear-gradient(155deg, var(--color-bg) 0%, var(--color-surface) 50%, var(--color-bg) 100%)',
      }}
    >
      {/* Gold top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none z-50"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)' }} />

      {/* Subtle background vignette */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(212,175,55,0.1) 100%)' }} />

      {/* ════════════════════════════════════
          DESKTOP LAYOUT (EDITORIAL BENTO GRID)
      ════════════════════════════════════ */}
      <div className="hidden md:flex absolute inset-0 text-[var(--color-fg)]"
           style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* LEFT COLUMN: Typography & Actions (40% width) */}
        <div className="w-[40%] h-full flex flex-col justify-between"
             style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
           
           {/* Top part: Tag and Titles */}
           <div className="flex-1 flex flex-col justify-center px-16 lg:px-24">
              {/* Category tag */}
              <div key={`tag-${idx}`} className="animate-fade-up text-[10px] tracking-[0.3em] font-bold text-[#D4AF37] mb-6 flex items-center gap-3">
                 <span className="w-8 h-px bg-[#D4AF37]/50" />
                 {(slide?.category || 'FRESH PICKS').toUpperCase()}
              </div>

              {/* Title */}
              <h1 key={`title-${idx}`} className="animate-fade-up text-5xl lg:text-6xl leading-[1.1] mb-6"
                  style={{ fontFamily: "Georgia, serif" }}>
                 <span className="text-[var(--color-fg)] block">
                   {slide?.title ? slide.title.split(' ').slice(0, Math.ceil(slide.title.split(' ').length / 2)).join(' ') : 'Authentic'}
                 </span>
                 <span className="text-[#D4AF37] block mt-1">
                   {slide?.title ? slide.title.split(' ').slice(Math.ceil(slide.title.split(' ').length / 2)).join(' ') : 'Homemade Snacks'}
                 </span>
              </h1>

              {/* Subtitle */}
              <p key={`sub-${idx}`} className="animate-fade-up text-[var(--color-fg-muted)] text-base max-w-md mb-10 leading-relaxed">
                 {slide?.detail || 'Premium, Handcrafted Indian Treats from our Kitchen to Yours. Exquisite Flavor in Every Bite.'}
              </p>

              {/* Buttons */}
              <div key={`btn-${idx}`} className="animate-fade-up flex items-center gap-8">
                 <Link href={slide?.category ? `/categories/${encodeURIComponent(slide.category)}` : '/products'}
                       className="group flex items-center gap-3 text-sm font-bold tracking-widest uppercase transition-all hover:text-white"
                       style={{ color: '#D4AF37', borderBottom: '1px solid rgba(212,175,55,0.5)', paddingBottom: 6 }}>
                    SHOP NOW
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                 </Link>
                 <Link href="/products?flash=true"
                       className="group flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-[var(--color-fg-muted)] hover:text-white transition-all"
                       style={{ paddingBottom: 6 }}>
                    FLASH DEALS
                 </Link>
              </div>
           </div>

           {/* Bottom Bar: Stats / Navigation inside the left column */}
           <div className="h-24 flex items-center justify-between px-16 lg:px-24"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              
              {/* Pagination */}
              <div className="flex items-center gap-6">
                 <span style={{ color: '#D4AF37', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {String(idx + 1).padStart(2, '0')}
                 </span>
                 <div className="flex items-center gap-4">
                    {slides.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)}
                              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                              style={{ 
                                background: i === idx ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                                transform: i === idx ? 'scale(1.5)' : 'scale(1)'
                              }} />
                    ))}
                 </div>
              </div>

              {/* Decorative crosshair or icon */}
              <div className="text-[var(--color-fg-muted)] opacity-50 flex gap-1.5">
                 <div className="w-1.5 h-1.5 bg-white/20 rounded-sm" />
                 <div className="w-1.5 h-1.5 bg-white/20 rounded-sm" />
                 <div className="w-1.5 h-1.5 bg-white/20 rounded-sm" />
                 <div className="w-1.5 h-1.5 bg-[#D4AF37]/50 rounded-sm" />
               </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Image (60% width) */}
        <div className="w-[60%] h-full relative p-12 lg:p-20 flex items-center justify-center bg-[var(--color-bg)]">
           
           {/* Crosshairs at corners for bento style */}
           <div className="absolute top-10 left-10 w-4 h-px bg-white/20" />
           <div className="absolute top-10 left-10 w-px h-4 bg-white/20" />
           
           <div className="absolute top-10 right-10 w-4 h-px bg-white/20" />
           <div className="absolute top-10 right-10 w-px h-4 bg-white/20" />

           <div className="absolute bottom-10 left-10 w-4 h-px bg-white/20" />
           <div className="absolute bottom-10 left-10 w-px h-4 bg-white/20" />
           
           <div className="absolute bottom-10 right-10 w-4 h-px bg-white/20" />
           <div className="absolute bottom-10 right-10 w-px h-4 bg-white/20" />

           {/* Square Image Container */}
           <Link href={slide?.category ? `/categories/${encodeURIComponent(slide.category)}` : '/products'}
                 className="relative w-full aspect-square max-w-[640px] overflow-hidden group cursor-pointer"
                 style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {prevSlide && (
                 <div className="absolute inset-0 z-10" style={{ animation: 'heroOut 0.8s cubic-bezier(0.25,1,0.5,1) both' }}>
                    <Image src={prevSlide.image} alt="" fill className="object-contain opacity-90 p-2" sizes="40vw" />
                 </div>
              )}
              {slide && (
                 <div className="absolute inset-0 z-20" style={{ animation: transitioning ? 'heroIn 0.8s cubic-bezier(0.25,1,0.5,1) both' : 'none' }}>
                    <Image src={slide.image} alt={slide.title || ''} fill sizes="40vw" 
                           className="object-contain opacity-90 p-2 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[1.5s] ease-out" priority />
                 </div>
              )}
              
              {/* Subtle inner shadow for depth */}
              <div className="absolute inset-0 z-30 pointer-events-none"
                   style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)' }} />
           </Link>
        </div>
      </div>

      {/* ════════════════════════════════════
          MOBILE — Elegant Full-Bleed Style
      ════════════════════════════════════ */}
      <div className="md:hidden absolute inset-0 group">
        <Link 
          href={slide?.category ? `/categories/${encodeURIComponent(slide.category)}` : '/products'}
          className="relative block w-full h-full overflow-hidden cursor-pointer" 
        >
          {slide && (
            <>
              {/* Blurred background layer to fill empty space */}
              <Image
                src={slide.image} alt=""
                fill sizes="100vw" className="object-cover blur-3xl opacity-40 scale-125 saturate-150" priority
              />
              {/* Main image uncropped */}
              <Image
                src={slide.image} alt={slide.title || ''}
                fill sizes="100vw" className="object-contain p-4 pb-48" priority
                style={{ animation: 'kenBurns 12s ease-in-out alternate infinite' }}
              />
            </>
          )}
          {/* Smooth dark gradient overlay for text readability */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(26,16,14,0.95) 0%, rgba(26,16,14,0.5) 60%, transparent 100%)' }} />
        </Link>

        {/* Text overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex flex-col gap-4 pointer-events-none">
          <div key={`m-${idx}`} className="animate-fade-up flex flex-col gap-2">
            <span style={{ color: '#D4AF37', fontSize: 10, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              {slide?.category || 'FRESH PICKS'}
            </span>
            <h2 className="font-serif text-white leading-[1.15] drop-shadow-md" style={{ fontSize: 28, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {slide?.title || 'Authentic Homemade Snacks'}
            </h2>
            <p className="text-white/80 text-xs line-clamp-2 leading-relaxed">
              {slide?.detail || 'Premium, Handcrafted Indian Treats from our Kitchen to Yours.'}
            </p>
          </div>
          
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={(e) => { e.preventDefault(); goTo(i); }}
                  className="rounded-full transition-all duration-400"
                  style={{
                    width: i === idx ? 24 : 8, height: 8,
                    background: i === idx ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                    border: 'none', cursor: 'pointer',
                  }} />
              ))}
            </div>
            <Link
              href={slide?.category ? `/categories/${encodeURIComponent(slide.category)}` : '/products'}
              className="flex items-center gap-2 rounded-full font-bold transition-transform active:scale-95 shadow-lg shadow-[#D4AF37]/20"
              style={{ fontSize: 12, padding: '10px 18px', background: 'linear-gradient(135deg, #D4AF37, #C9A227)', color: '#2B1B17' }}
            >
              <ShoppingBag size={14} /> Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0) translate(0%,  0%); }
          100% { transform: scale(1.1) translate(-1.5%,-1%); }
        }
        @keyframes heroIn {
          from { opacity:0; transform:scale(0.96); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes heroOut {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(1.04); }
        }
      `}</style>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="relative w-full overflow-hidden skeleton min-h-[420px] md:min-h-[500px] lg:min-h-[580px]"
      style={{ borderRadius: 24 }} />
  );
}
