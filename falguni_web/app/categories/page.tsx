'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/firestore';
import type { CategoriesModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoriesModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(c => { setCategories(c); setLoading(false); });
  }, []);

  return (
    <PageShell>
      {/* Premium Header Banner */}
      <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 py-12 md:py-20 flex flex-col items-center justify-center mb-8 md:mb-12">
         
         {/* Ambient Glows */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />
         
         <div className="relative z-10 text-center px-4">
            <div className="animate-fade-up text-[10px] md:text-xs tracking-[0.3em] font-bold text-[#D4AF37] mb-4 flex items-center justify-center gap-3">
               <span className="w-8 h-px bg-[#D4AF37]/50" />
               EXPLORE OUR MENU
               <span className="w-8 h-px bg-[#D4AF37]/50" />
            </div>
            <h1 className="animate-fade-up font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" style={{ animationDelay: '100ms' }}>
              All Categories
            </h1>
            <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-sm md:text-base leading-relaxed" style={{ animationDelay: '200ms' }}>
              Discover our authentic range of handcrafted snacks, premium sweets, and traditional Gujarati delicacies prepared with absolute purity.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 pb-24">

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          /* Mobile: 3 cols | Tablet: 4 cols | Desktop: 6 cols */
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.uid ?? cat.category}
                href={`/categories/${encodeURIComponent(cat.category)}`}
                className="group flex flex-col items-center gap-3 animate-fade-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Premium Image Card */}
                <div className="w-full aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-[#2B1B17] border border-white/5 relative shadow-lg group-hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] group-hover:border-[#D4AF37]/50 transition-all duration-500">
                  
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.category}
                      fill
                      sizes="(max-width: 768px) 33vw, 16vw"
                      className="object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-[#2B1B17]">
                      <span className="opacity-20 group-hover:opacity-60 transition-opacity drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">✨</span>
                    </div>
                  )}

                  {/* Glassmorphism gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Subtle inner ring */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-[#D4AF37]/30 pointer-events-none transition-all duration-500" />
                </div>
                
                {/* Text underneath */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] md:text-sm font-bold tracking-wide text-white text-center line-clamp-2 leading-tight uppercase group-hover:text-[#D4AF37] transition-colors">
                    {cat.category}
                  </span>
                  <div className="w-0 h-px bg-[#D4AF37] mt-1.5 transition-all duration-500 group-hover:w-6" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
