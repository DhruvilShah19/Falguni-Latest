'use client';
import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { Star } from 'lucide-react';
import Image from 'next/image';

const REVIEWS = [
  {
    name: 'Krupa Patel',
    time: '2 months ago',
    text: 'Authentic Gujarati snacks! Their Khakhra and Chevdo taste exactly like home. Very fresh and crisp.',
    initial: 'K',
    color: '#D4AF37'
  },
  {
    name: 'Rahul Shah',
    time: '1 month ago',
    text: 'Best place in Vastrapur for traditional sweets and namkeen. The quality is unmatched and they use the best ingredients.',
    initial: 'R',
    color: '#FF4E50'
  },
  {
    name: 'Ami Desai',
    time: '3 weeks ago',
    text: 'Highly recommend! I always buy my festive snacks from Falguni Gruh Udhyog. The taste has remained consistent for years.',
    initial: 'A',
    color: '#4A90E2'
  },
  {
    name: 'Nirav Patel',
    time: '2 months ago',
    text: 'Premium quality snacks. It is a bit crowded during festivals but totally worth the wait for the fresh fafda and jalebi.',
    initial: 'N',
    color: '#50E3C2'
  },
  {
    name: 'Megha Trivedi',
    time: '5 months ago',
    text: 'Amazing customer service and delicious food. They ship worldwide too which is great for my family abroad!',
    initial: 'M',
    color: '#B8E986'
  }
];

export default function GoogleReviewsSection() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="mb-24 overflow-hidden">
      <SectionHeader title="Customer Love" subtitle="Real Reviews" />

      {/* Google Badge / Header */}
      <div className="flex flex-col items-center justify-center mb-10 px-5 text-center">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-4xl font-bold text-white">4.8</span>
           <div className="flex flex-col items-start gap-1">
             <div className="flex gap-1">
               {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#FABB05" color="#FABB05" />)}
             </div>
             <span className="text-xs text-[var(--color-fg-muted)] font-medium">Based on 1,400+ reviews</span>
           </div>
        </div>
        
        {/* Fake Google Logo (CSS colored text to avoid loading SVGs) */}
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-xl mb-4">
           <span className="text-[#4285F4]">G</span>
           <span className="text-[#EA4335]">o</span>
           <span className="text-[#FBBC05]">o</span>
           <span className="text-[#4285F4]">g</span>
           <span className="text-[#34A853]">l</span>
           <span className="text-[#EA4335]">e</span>
        </div>

        <a 
          href="https://www.google.com/search?sca_esv=a708274f6968f4df&rlz=1C5CHFA_enUS1216US1216&sxsrf=ANbL-n7gV0g08D5rJVBBa39Rxr0jllfEqg:1780434852853&q=falguni+gruh+udhyog+(vastrapur)+reviews#lrd=0x395e84b646aaaaab:0x7acfa7e161f5e01a,1"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 rounded-full border border-[var(--color-border)] text-sm font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
        >
          Read all on Google
        </a>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div 
        className="relative flex w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10" />
        
        {/* We create two exact copies of the track to loop infinitely */}
        <div className={`flex w-max animate-marquee ${paused ? '[animation-play-state:paused]' : ''}`}>
          {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, i) => (
            <div 
              key={i} 
              className="w-[280px] md:w-[350px] mx-3 p-5 md:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3 flex-shrink-0"
            >
              {/* Reviewer Info */}
              <div className="flex gap-3 items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: review.color }}
                >
                  {review.initial}
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-[var(--color-fg)]">{review.name}</span>
                   <span className="text-xs text-[var(--color-fg-muted)]">{review.time}</span>
                </div>
                <div className="ml-auto w-5 h-5 flex items-center justify-center">
                   <svg viewBox="0 0 48 48" className="w-full h-full">
                     <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                     <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                     <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                     <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                     <path fill="none" d="M0 0h48v48H0z" />
                   </svg>
                </div>
              </div>
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#FABB05" color="#FABB05" />)}
              </div>
              {/* Text */}
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed font-medium">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
