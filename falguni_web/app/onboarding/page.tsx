'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const SLIDES = [
  {
    image: '/onboarding/snacks.png',
    tag: 'Premium Homemade',
    title: 'Choose the best Snacks for you and your family',
    body: 'Discover a curated selection of authentic homemade snacks and sweets, crafted with love and delivered fresh to your door.',
  },
  {
    image: '/onboarding/delivery.png',
    tag: 'Fast & Reliable',
    title: 'Quick Delivery right to your doorstep',
    body: 'Every order is packed with care and delivered swiftly — so the freshness and flavour arrive just as they left the kitchen.',
  },
  {
    image: '/onboarding/support.png',
    tag: 'Always Here for You',
    title: 'Direct support & custom orders, anytime',
    body: 'Connect with our team for personalised orders, special requests, or any questions — we\'re always just a message away.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const touchStartX = useRef<number | null>(null);
  const isLast = current === SLIDES.length - 1;

  // Skip if already onboarded
  useEffect(() => {
    if (localStorage.getItem('falguniOnboarded') === '1') {
      router.replace('/');
    }
  }, [router]);

  const finish = useCallback(() => {
    localStorage.setItem('falguniOnboarded', '1');
    router.push('/login');
  }, [router]);

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    if (sliding || index === current) return;
    setSlideDir(dir);
    setSliding(true);
    setTimeout(() => {
      setCurrent(index);
      setSliding(false);
    }, 380);
  }, [sliding, current]);

  const next = () => isLast ? finish() : goTo(current + 1, 'left');
  const prev = () => current > 0 && goTo(current - 1, 'right');

  // Swipe support
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const slide = SLIDES[current];

  // Animation classes for the content panel
  const contentAnim = sliding
    ? slideDir === 'left'
      ? '-translate-x-6 opacity-0'
      : 'translate-x-6 opacity-0'
    : 'translate-x-0 opacity-100';

  return (
    <div
      className="min-h-dvh w-full flex flex-col md:flex-row"
      style={{ background: 'linear-gradient(160deg, #2B1B17 0%, #5C4033 55%, #2B1B17 100%)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

      {/* ════════════════════════════════════════
          MOBILE LAYOUT  (< md)
          Full-screen: image top, content bottom
      ════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 md:hidden">

        {/* Image */}
        <div className={`relative mx-5 mt-12 rounded-3xl overflow-hidden flex-shrink-0 transition-opacity duration-380 ${sliding ? 'opacity-0' : 'opacity-100'}`}
          style={{ height: '42vh' }}>
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Bottom scrim */}
          <div className="absolute inset-x-0 bottom-0 h-20"
            style={{ background: 'linear-gradient(to top, #3D2318, transparent)' }} />
        </div>

        {/* Content */}
        <div className={`flex-1 flex flex-col justify-between px-6 pt-6 pb-10 transition-all duration-380 ${contentAnim}`}>
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              {slide.tag}
            </span>
            <h1 className="text-xl font-black text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              {slide.body}
            </p>
          </div>

          {/* Controls: Skip (left) · Dots (center) · Next (right) */}
          <div className="flex items-center justify-between mt-8">
            {/* Skip — hidden on last slide */}
            {!isLast ? (
              <button
                onClick={finish}
                className="text-sm font-semibold text-[#D4AF37] hover:opacity-70 transition min-w-[48px]"
              >
                Skip
              </button>
            ) : (
              <span className="min-w-[48px]" />
            )}
            <Dots total={SLIDES.length} current={current} onDot={(i) => goTo(i, i > current ? 'left' : 'right')} />
            <NextButton isLast={isLast} onClick={next} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT  (≥ md)
          Left panel = image, Right panel = text
      ════════════════════════════════════════ */}
      <div className="hidden md:flex flex-1 items-stretch min-h-dvh">

        {/* Left: Image panel */}
        <div className={`relative w-1/2 transition-opacity duration-380 ${sliding ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
          {/* Right edge scrim to blend into right panel */}
          <div className="absolute inset-y-0 right-0 w-32"
            style={{ background: 'linear-gradient(to right, transparent, #3D2318)' }} />

          {/* Slide counter badge */}
          <div className="absolute top-8 left-8 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
            <span className="text-xs font-semibold text-white/70">
              {current + 1} / {SLIDES.length}
            </span>
          </div>
        </div>

        {/* Right: Content panel */}
        <div className="w-1/2 flex flex-col justify-between px-14 py-14 relative">

          {/* Logo */}
          <div className="mb-6">
            <p className="text-[#D4AF37] font-black text-2xl tracking-tight">Falguni</p>
            <p className="text-white/40 text-xs">Gruh Udhyog</p>
          </div>

          {/* Text */}
          <div className={`flex-1 flex flex-col justify-center gap-5 transition-all duration-380 ${contentAnim}`}>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              {slide.tag}
            </span>
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-base text-white/60 leading-relaxed max-w-sm">
              {slide.body}
            </p>
          </div>

          {/* Controls: Skip (left) · Dots (center) · Next (right) */}
          <div className="flex items-center justify-between mt-12">
            {!isLast ? (
              <button
                onClick={finish}
                className="text-sm font-semibold text-[#D4AF37] hover:opacity-70 transition min-w-[48px]"
              >
                Skip
              </button>
            ) : (
              <span className="min-w-[48px]" />
            )}
            <Dots total={SLIDES.length} current={current} onDot={(i) => goTo(i, i > current ? 'left' : 'right')} />
            <NextButton isLast={isLast} onClick={next} />
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Shared sub-components ── */

function Dots({ total, current, onDot }: { total: number; current: number; onDot: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          aria-label={`Go to slide ${i + 1}`}
          className="rounded-full transition-all duration-300 focus:outline-none"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            background: i === current ? '#D4AF37' : 'rgba(255,255,255,0.25)',
          }}
        />
      ))}
    </div>
  );
}

function NextButton({ isLast, onClick }: { isLast: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
      style={{ background: '#D4AF37', color: '#2B1B17' }}
    >
      {isLast ? 'Get Started' : 'Next'}
      <span className="text-base leading-none">{isLast ? '🎉' : '→'}</span>
    </button>
  );
}
