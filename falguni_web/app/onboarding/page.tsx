'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const SLIDES = [
  {
    image: '/onboarding/vendor.png',
    title: 'Choose the best Snacks for you and your family',
    body: 'The app connects you to Falguni Store to purchase your favourite homemade snacks.',
    imagePosition: 'top' as const,
  },
  {
    image: '/onboarding/rider.png',
    title: 'Quick Delivery at your doorstep',
    body: 'Your orders are delivered to your doorstep within minutes after making your purchase.',
    imagePosition: 'top' as const,
  },
  {
    image: '/onboarding/seller.jpg',
    title: "Connect directly with the seller for customizations and FAQ's",
    body: 'Click Done to get started.',
    imagePosition: 'top' as const,
    reverse: true,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const isLast = current === SLIDES.length - 1;

  // Skip onboarding if already seen
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('falguniOnboarded') === '1') {
      router.replace('/');
    }
  }, [router]);

  const finish = useCallback(() => {
    localStorage.setItem('falguniOnboarded', '1');
    router.push('/login');
  }, [router]);

  const goTo = (index: number, dir: 'next' | 'prev') => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 320);
  };

  const next = () => {
    if (isLast) { finish(); return; }
    goTo(current + 1, 'next');
  };

  const prev = () => {
    if (current === 0) return;
    goTo(current - 1, 'prev');
  };

  const slide = SLIDES[current];

  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #2B1B17 0%, #5C4033 50%, #2B1B17 100%)' }}
    >
      {/* ── Container: phone-width on desktop, full-width on mobile ── */}
      <div className="w-full max-w-sm md:max-w-5xl md:mx-auto flex flex-col md:flex-row min-h-dvh md:min-h-0 md:rounded-3xl md:overflow-hidden md:shadow-2xl relative">

        {/* ── Skip button ── */}
        <button
          onClick={finish}
          className="absolute top-5 right-5 z-20 text-sm font-semibold text-[#D4AF37] hover:opacity-80 transition md:top-6 md:right-6"
        >
          Skip
        </button>

        {/* ── Image panel ── */}
        <div
          className={`
            relative w-full md:w-1/2 transition-opacity duration-300
            ${slide.reverse ? 'order-2 md:order-1' : 'order-1'}
            ${animating ? 'opacity-0' : 'opacity-100'}
          `}
          style={{ minHeight: '45vw', maxHeight: '55vh' }}
        >
          {/* On mobile: fixed height. On desktop: fills the panel */}
          <div className="relative w-full h-64 sm:h-80 md:h-full md:min-h-[520px]">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {/* Gradient fade into background on mobile (bottom) */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 md:hidden"
              style={{ background: 'linear-gradient(to bottom, transparent, #2B1B17)' }}
            />
          </div>
        </div>

        {/* ── Text + controls panel ── */}
        <div
          className={`
            flex-1 flex flex-col justify-between px-6 py-8 md:px-10 md:py-12
            ${slide.reverse ? 'order-1 md:order-2' : 'order-2'}
            ${animating ? (direction === 'next' ? 'translate-x-4 opacity-0' : '-translate-x-4 opacity-0') : 'translate-x-0 opacity-100'}
            transition-all duration-300
          `}
        >
          <div className="flex-1 flex flex-col justify-center gap-4 mt-2 md:mt-0">
            <h1 className="text-xl md:text-3xl font-bold text-white leading-snug">
              {slide.title}
            </h1>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              {slide.body}
            </p>
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center justify-between mt-8">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 'next' : 'prev')}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 22 : 10,
                    height: 10,
                    background: i === current ? '#D4AF37' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>

            {/* Next / Done button */}
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition hover:opacity-90 active:scale-95"
              style={{ background: '#D4AF37', color: '#2B1B17' }}
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
