'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, Heart, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { subscribeToFavorites, removeFromFavorites } from '@/lib/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ProductsModel } from '@/types';

// 3D Interactive version of BoutiqueItem for Favorites
function Favorite3DItem({ product, userId }: { product: ProductsModel, userId: string }) {
  const price = product.unitPrice1 ?? 0;
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    await removeFromFavorites(userId, product.productID || product.uid);
  };

  return (
    <div className={`relative group flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-16 mb-12 md:mb-16 transition-all duration-700 ${isRemoving ? 'opacity-0 scale-95 translate-x-10' : 'opacity-100'}`}>
      
      {/* 3D Image Left Side */}
      <Link href={`/products/${product.productID || product.uid}`} className="w-[85%] md:w-1/2 flex justify-center perspective-[1500px]">
        <div className="relative w-full max-w-[280px] md:max-w-sm aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ease-out transform-gpu md:group-hover:[transform:rotateY(12deg)_rotateX(5deg)_scale(1.02)] border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay pointer-events-none" />
          {product.image1 ? (
            <Image 
              src={product.image1} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out saturate-110" 
            />
          ) : (
            <div className="w-full h-full bg-[#2B1B17] flex items-center justify-center text-4xl md:text-6xl opacity-20">✨</div>
          )}
        </div>
      </Link>

      {/* Details Right Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-0">
        <span className="text-[#D4AF37] text-[10px] md:text-sm font-bold tracking-[0.4em] uppercase mb-3 md:mb-4 flex items-center gap-3 md:gap-4">
          <span className="w-8 md:w-12 h-[1px] bg-[#D4AF37]/50" />
          {(product.brandName || product.category || 'Collection').toUpperCase()}
          <span className="w-8 md:w-12 h-[1px] bg-[#D4AF37]/50" />
        </span>
        
        <Link href={`/products/${product.productID || product.uid}`}>
          <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 md:mb-8 group-hover:text-[#D4AF37] transition-colors duration-500 italic md:pr-8">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-white/50 text-xs md:text-base leading-relaxed max-w-sm md:max-w-md mb-6 md:mb-8 font-light tracking-wide line-clamp-3">
          {product.description || 'A timeless selection curated for your refined taste. Discover the exquisite blend of flavors.'}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 md:gap-6 w-full justify-center md:justify-start">
          <span className="text-2xl md:text-3xl font-light tracking-widest text-white">
            ₹{price}
          </span>
          
          <button 
            onClick={handleRemove}
            className="group/btn flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full bg-white/[0.02] border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-white/70 hover:text-red-400 w-full sm:w-auto"
          >
            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FavoritesInterface() {
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const [favorites, setFavorites] = useState<ProductsModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [query, setQuery] = useState('');
  const [sortOption, setSortOption] = useState<'popular' | 'relevance' | 'priceLow' | 'priceHigh' | 'ratingHigh'>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (authLoading) return;
    
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToFavorites(firebaseUser.uid, (items) => {
      setFavorites(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser, authLoading]);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortOption]);

  const results = useMemo(() => {
    let filtered = [...favorites];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.category && p.category.toLowerCase().includes(lowerQuery)) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    }

    if (sortOption === 'priceLow') {
      filtered.sort((a, b) => (a.unitPrice1 ?? 0) - (b.unitPrice1 ?? 0));
    } else if (sortOption === 'priceHigh') {
      filtered.sort((a, b) => (b.unitPrice1 ?? 0) - (a.unitPrice1 ?? 0));
    } else if (sortOption === 'ratingHigh') {
      filtered.sort((a, b) => {
        const aRating = a.totalNumberOfUserRating > 0 ? (a.totalRating / a.totalNumberOfUserRating) : 0;
        const bRating = b.totalNumberOfUserRating > 0 ? (b.totalRating / b.totalNumberOfUserRating) : 0;
        return bRating - aRating;
      });
    } else if (sortOption === 'popular') {
      filtered.sort((a, b) => (b.totalNumberOfUserRating ?? 0) - (a.totalNumberOfUserRating ?? 0));
    }

    return filtered;
  }, [query, favorites, sortOption]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#2B1B17] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#2B1B17] flex flex-col items-center justify-center pt-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
        <Heart size={48} className="text-[#D4AF37]/30 mb-8" />
        <h1 className="font-serif text-4xl md:text-5xl text-white italic mb-6">Your Wishlist</h1>
        <p className="text-white/50 mb-10 text-center max-w-sm">Please sign in to view and manage your curated collection of favorite items.</p>
        <Link href="/login" className="px-8 py-3 rounded-xl font-bold tracking-widest uppercase text-xs bg-[#D4AF37] text-black hover:bg-[#F9EED2] transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B1B17] flex flex-col pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_80%)] pointer-events-none" />

      {/* ── Premium Header Banner ── */}
      <div className="relative w-full overflow-hidden bg-[#2B1B17] border-b border-[#D4AF37]/10 pt-28 pb-12 md:pt-36 md:pb-20 flex flex-col items-center justify-center mb-6 md:mb-12">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

         <div className="relative z-10 text-center px-4 w-full">
            <div className="animate-fade-up text-[9px] md:text-xs tracking-[0.25em] md:tracking-[0.3em] font-bold text-[#D4AF37] mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
               MAISON FALGUNI
               <span className="w-6 md:w-8 h-px bg-[#D4AF37]/50" />
            </div>
            
            <h1 className="animate-fade-up font-serif text-2xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-2 md:mb-4" style={{ animationDelay: '100ms' }}>
              Favorites
            </h1>
            
            <p className="animate-fade-up text-[var(--color-fg-muted)] max-w-lg mx-auto text-[11px] md:text-base leading-relaxed px-2" style={{ animationDelay: '200ms' }}>
              Discover your curated collection of premium sweets, savory namkeens, and healthy dry fruits.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 relative z-10 py-12">
        {favorites.length > 0 && (
          <div className="flex flex-col gap-12 animate-fade-up border-b border-[#D4AF37]/10 pb-12 mb-16" style={{ animationDelay: '100ms' }}>
            
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              {/* Summary Text / Left Side */}
              <div className="flex flex-col">
                <span className="text-white text-3xl md:text-4xl font-serif italic mb-2">{favorites.length} <span className="text-[#D4AF37]">Acquisitions</span></span>
                <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Curated for your taste</span>
              </div>

              {/* Search Bar / Right Side */}
              <div className="relative group w-full md:w-96">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-20">
                  <Search size={16} className="text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search favorites..."
                  className="relative z-10 w-full h-12 pl-12 pr-12 bg-white/[0.02] border border-white/10 rounded-full text-sm font-light text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors z-20"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Filters */}
            <div className="flex items-center gap-4 md:gap-6 flex-wrap pt-4 border-t border-white/5">
              <span className="text-[#D4AF37]/50 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 mr-2 w-full md:w-auto mb-2 md:mb-0">
                <SlidersHorizontal size={14} /> Sort By
              </span>
              
              <button 
                onClick={() => setSortOption('popular')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-2 border-b-2 transition-all ${sortOption === 'popular' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Popular
              </button>

              <button 
                onClick={() => setSortOption('ratingHigh')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-2 border-b-2 transition-all ${sortOption === 'ratingHigh' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Highest Rated
              </button>

              <button 
                onClick={() => setSortOption('priceLow')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-2 border-b-2 transition-all ${sortOption === 'priceLow' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Price: Asc
              </button>
              
              <button 
                onClick={() => setSortOption('priceHigh')}
                className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase pb-2 border-b-2 transition-all ${sortOption === 'priceHigh' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/30 border-transparent hover:text-white'}`}
              >
                Price: Desc
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Heart size={48} className="text-[#D4AF37]/20 mb-6" />
            <h3 className="font-serif text-3xl text-white italic mb-4">No Favorites Yet</h3>
            <p className="text-white/40 text-sm max-w-sm mb-8">You haven't added any creations to your wishlist. Explore our lookbook to discover your next obsession.</p>
            <Link href="/products" className="px-8 py-3 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors uppercase tracking-widest text-xs font-bold">
              Explore Collections
            </Link>
          </div>
        ) : results.length > 0 ? (
          <div className="pb-12">
            <div className="flex flex-col gap-8 animate-fade-in">
              {paginatedResults.map((product, idx) => (
                <div key={product.uid ?? product.productID} style={{ animationDelay: `${Math.min(idx, 8) * 100}ms` }} className="animate-fade-up">
                  <Favorite3DItem product={product} userId={firebaseUser.uid} />
                </div>
              ))}
            </div>

            {/* ── Editorial Pagination (Client Driven) ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-white/5">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors ${currentPage > 1 ? 'text-white/50 hover:text-[#D4AF37]' : 'text-white/10 cursor-not-allowed'}`}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                
                <span className="text-xl font-serif italic text-white/80">
                  {currentPage} <span className="text-white/20 mx-2">/</span> {totalPages}
                </span>

                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors ${currentPage < totalPages ? 'text-white/50 hover:text-[#D4AF37]' : 'text-white/10 cursor-not-allowed'}`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Search size={48} className="text-[#D4AF37]/20 mb-6" />
            <h3 className="font-serif text-3xl text-white italic mb-4">No match found</h3>
            <p className="text-white/40 text-sm max-w-sm">None of your favorites match "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
