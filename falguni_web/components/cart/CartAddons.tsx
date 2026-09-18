'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getRecentPurchasedProducts, addToCart, updateCartItem } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import type { ProductsModel } from '@/types';
import { RefreshCcw, Heart, Sparkles, Plus, Check } from 'lucide-react';
import Image from 'next/image';


const UpsellCard = ({ product, firebaseUser }: { product: ProductsModel, firebaseUser: any }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const price = product.unitPrice1 ?? 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firebaseUser || adding) return;
    setAdding(true);
    const docId = `${product.vendorId}${product.name}unit1`;
    
    // Check if already in cart
    import('@/store/cartStore').then(async ({ useCartStore }) => {
        const existing = useCartStore.getState().items.find(i => i.cartDocId === docId);
        if (existing) {
          const newQty = (existing.quantity || 1) + 1;
          await updateCartItem(firebaseUser.uid, docId, {
            quantity: newQty,
            price: price * newQty,
          });
        } else {
          await addToCart(firebaseUser.uid, {
            ...product, selected: 'unit1', selectedPrice: price,
            price, quantity: 1, cartDocId: docId,
          }, docId);
        }
        
        setAdding(false);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    });
  };

  const oldPrice = product.unitOldPrice1 ?? 0;
  const hasDiscount = oldPrice > 0 && oldPrice > price;

  return (
    <div className="flex flex-col group h-full bg-white border border-[var(--color-border)] rounded-2xl p-3 shadow-xs">
      {/* Image container */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl mb-3 bg-[#F5EBE1] border border-[var(--color-border)]">
        <Image 
          src={product.image1 || '/placeholder.png'} 
          alt={product.name || 'Product'} 
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out" 
        />
      </div>
      
      {/* Info container */}
      <div className="flex flex-col items-center text-center flex-1 justify-between">
        <div className="w-full flex flex-col items-center">
          <span className="text-[var(--color-primary)] text-[9px] font-bold tracking-widest uppercase mb-1">
            {(product.brandName || product.category || 'Specialty').toUpperCase()}
          </span>
          
          <h4 className="font-serif text-xs md:text-sm text-[var(--color-fg)] leading-snug mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
            {product.name}
          </h4>
          
          <div className="flex items-center justify-center gap-1.5 mb-3 w-full">
            <span className="text-xs md:text-sm font-bold text-[var(--color-fg)]">₹{price}</span>
            {hasDiscount && (
              <span className="text-[var(--color-fg-muted)] text-[10px] line-through font-medium">₹{oldPrice}</span>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleAdd}
          disabled={adding || !firebaseUser}
          className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            added 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : 'bg-[#F5EBE1] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
          }`}
        >
          {added ? (
             <><Check size={12} strokeWidth={2} /> Added</>
          ) : adding ? (
             <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
             <><Plus size={12} strokeWidth={2} /> Add</>
          )}
        </button>
      </div>
    </div>
  );
};

export default function CartAddons() {
  const { firebaseUser } = useAuthStore();
  const { items: cartItems } = useCartStore();

  const [previouslyBought, setPreviouslyBought] = useState<ProductsModel[]>([]);
  const [favorites, setFavorites] = useState<ProductsModel[]>([]);
  const [similarProducts, setSimilarProducts] = useState<ProductsModel[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    let unsubFavorites = () => {};

    const fetchAll = async () => {
      // 1. Fetch Previously Bought
      try {
        const recent = await getRecentPurchasedProducts(firebaseUser.uid);
        const cartIds = new Set(cartItems.map(i => i.productID || i.uid));
        const finalBought = recent.filter(i => !cartIds.has(i.productID || i.uid)).slice(0, 8);
        setPreviouslyBought(finalBought);
      } catch (err) {
        console.error("Error fetching previously bought", err);
      }

      // 2. Fetch Favorites using listener (so it's live)
      unsubFavorites = onSnapshot(collection(db, 'users', firebaseUser.uid, 'Favorite'), (snap) => {
        const favs = snap.docs.map(d => ({ ...d.data(), uid: d.id, productID: d.id } as ProductsModel));
        const cartIds = new Set(cartItems.map(i => i.productID || i.uid));
        setFavorites(favs.filter(i => !cartIds.has(i.productID || i.uid)));
      });

      // 3. Fetch Similar Products based on categories in cart
      try {
        const cartCategories = Array.from(new Set(cartItems.map(i => i.category).filter(Boolean)));
        if (cartCategories.length > 0) {
           // We'll just fetch a generic batch and filter, because 'in' query supports max 10
           const q = query(
             collection(db, 'Products'),
             where('category', 'in', cartCategories.slice(0, 10)),
             limit(15)
           );
           const snap = await getDocs(q);
           const cartIds = new Set(cartItems.map(i => i.productID || i.uid));
           const similar = snap.docs
             .map(d => ({ ...d.data(), productID: d.id, uid: d.id } as ProductsModel))
             .filter(i => !cartIds.has(i.productID || i.uid));
           setSimilarProducts(similar);
        } else {
           // Fallback to generic popular products if cart has no categories
           const q = query(collection(db, 'Products'), limit(8));
           const snap = await getDocs(q);
           const cartIds = new Set(cartItems.map(i => i.productID || i.uid));
           const similar = snap.docs
             .map(d => ({ ...d.data(), productID: d.id, uid: d.id } as ProductsModel))
             .filter(i => !cartIds.has(i.productID || i.uid));
           setSimilarProducts(similar);
        }
      } catch (err) {
         console.error("Error fetching similar products", err);
      }
    };

    fetchAll();

    return () => {
      unsubFavorites();
    };
  }, [firebaseUser, cartItems]); // Re-run when cartItems changes to filter out what's added


    const renderCarousel = (title: string, icon: React.ReactNode, items: ProductsModel[]) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-[var(--color-fg)] font-serif text-base mb-4 flex items-center gap-2 font-bold">
          {icon} <span className="tracking-wide">{title}</span>
        </h3>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide snap-x">
            {items.map((product, idx) => (
              <div 
                key={product.productID || product.uid} 
                className="w-36 md:w-44 flex-shrink-0 snap-start"
                style={{ animation: `fadeUp 0.5s ease-out ${idx * 50}ms both` }}
              >
                <UpsellCard product={product} firebaseUser={firebaseUser} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (previouslyBought.length === 0 && favorites.length === 0 && similarProducts.length === 0) {
     return null;
  }

  return (
    <div className="w-full">
      {renderCarousel("Buy It Again", <RefreshCcw size={14} className="text-[#D4AF37]" />, previouslyBought)}
      {renderCarousel("Your Favorites", <Heart size={14} className="text-[#D4AF37]" />, favorites)}
      {renderCarousel("You Might Also Like", <Sparkles size={14} className="text-[#D4AF37]" />, similarProducts)}
    </div>
  );
}
