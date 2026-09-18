'use client';
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Hetal Shah',
    text: 'Best khakhra I have ever had! Super fresh and the taste is simply amazing.',
  },
  {
    name: 'Jay Mehta',
    text: 'Chavdo, sweets, namkeen, everything is so fresh and full of authentic taste.',
  },
  {
    name: 'Kinjal Patel',
    text: 'Fafda and jalebi are simply awesome. Consistent quality as always!',
  },
  {
    name: 'Dhaval Desai',
    text: 'Love the variety and the homemade touch in every product.',
  },
  {
    name: 'Krupa Patel',
    text: 'Authentic Gujarati snacks! Their Khakhra and Chevdo taste exactly like home.',
  },
  {
    name: 'Rahul Shah',
    text: 'Best place in Vastrapur for traditional sweets and namkeen. The quality is unmatched.',
  },
];

export default function GoogleReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 md:py-16 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">

        {/* ── Section Header with Rating & Arrows matching mockup ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-[34px] font-bold text-[#2D1508] tracking-tight">
              What Our Customers Say
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-serif font-bold text-lg text-[#2D1508]">
                4.8/5
              </span>
              <div className="flex text-[#D49B4B] text-sm">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="text-xs text-[#65544A] font-medium">
                Based on 1,400+ reviews
              </span>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Previous review"
              className="w-9 h-9 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] shadow-xs transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Next review"
              className="w-9 h-9 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] shadow-xs transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Testimonial Cards Carousel / Grid ── */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pb-4 pt-1 snap-x snap-mandatory"
        >
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[310px] bg-white rounded-2xl border border-[#EFE6DC] p-5 md:p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(45,21,8,0.03)] hover:shadow-md transition-all"
            >
              <div>
                {/* Terracotta Quote Mark */}
                <span className="font-serif text-3xl font-bold text-[#733617] leading-none select-none block mb-2">
                  “
                </span>

                <p className="text-xs sm:text-sm text-[#4A3B32] leading-relaxed mb-6">
                  {review.text}
                </p>
              </div>

              <div>
                <p className="font-semibold text-xs sm:text-sm text-[#2D1508] mb-1">
                  {review.name}
                </p>
                <div className="flex text-[#D49B4B] text-xs">
                  {[...Array(5)].map((_, starIdx) => (
                    <span key={starIdx}>★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
