'use client';

import { useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  {
    question: "Should I create an account to shop here?",
    answer: "Yes. Creating an account enhances your shopping experience, provides order tracking, faster checkout, and exclusive offers."
  },
  {
    question: "What online payment options are available?",
    answer: "Debit/Credit Cards, Net Banking, and other common payment modes depending on your region."
  },
  {
    question: "What is the shelf life of your products?",
    answer: "Shelf life varies by product and is mentioned on the packaging. You may inquire individually if needed."
  },
  {
    question: "Do you deliver overseas?",
    answer: "Yes, international delivery is supported for selected products. Check availability based on your region."
  },
  {
    question: "Do you offer refunds or cancellations?",
    answer: "Please review our Refunds & Returns policy for full details on the eligible items and process."
  },
  {
    question: "When will I receive my order?",
    answer: "Local orders: 2–3 days. Outside Gujarat: 3–4 days. International orders: Based on destination shipping policies."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

        {/* ── Premium Header Banner ── */}
        <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-20 flex flex-col items-center justify-center mb-6 md:mb-12">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

           {/* Back Button */}
           <div className="absolute top-28 md:top-36 left-4 md:left-8 z-50">
               <Link 
                 href="/profile" 
                 className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4AF37] transition-colors text-[9px] md:text-xs font-bold uppercase tracking-widest"
               >
                 <ArrowLeft size={14} /> Back
               </Link>
           </div>

           <div className="relative z-10 text-center px-4 w-full mt-4 md:mt-0">
             <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
               SUPPORT
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
             </div>
             
             <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
               F.A.Q.
             </h1>
             
             <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
               Find quick answers to common doubts and queries about ordering Falguni's premium snacks and sweets.
             </p>
           </div>
        </div>

        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 relative z-10">

          {/* Accordion List */}
          <div className="flex flex-col gap-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`bg-white/[0.02] border transition-all duration-500 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm ${
                    isOpen ? 'border-[#D4AF37]/50 bg-white/[0.04]' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none group"
                  >
                    <span className={`font-semibold tracking-wide transition-colors ${isOpen ? 'text-[#D4AF37]' : 'text-white group-hover:text-[#D4AF37]/80'}`}>
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-[#D4AF37]/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      {isOpen ? (
                        <Minus size={16} className="text-[#D4AF37]" />
                      ) : (
                        <Plus size={16} className="text-white/60 group-hover:text-white" />
                      )}
                    </div>
                  </button>
                  
                  <div 
                    className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-6 pb-6 pt-0 text-white/60 leading-relaxed text-sm md:text-base border-t border-white/5 mt-2 pt-4 mx-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
