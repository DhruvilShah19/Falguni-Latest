'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, or, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getRecentPurchasedProducts, addToCart, updateCartItem } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/ui/ProductCard';
import type { ProductsModel, CartItem } from '@/types';
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
    <div className="flex flex-col group h-full">
      {/* Image container mimicking BoutiqueItem */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl mb-3 md:mb-4 bg-black/20">
        <div className="absolute inset-0 bg-[#D4AF37]/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-700" />
        <Image 
          src={product.image1 || '/placeholder.png'} 
          alt={product.name || 'Product'} 
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out saturate-110" 
        />
      </div>
      
      {/* Centered Info container mimicking BoutiqueItem */}
      <div className="flex flex-col items-center text-center px-1">
        <span className="text-[#D4AF37] text-[8px] font-bold tracking-[0.2em] uppercase mb-1.5">
          {(product.brandName || product.category || 'Collection').toUpperCase()}
        </span>
        
        <h4 className="font-serif text-sm text-white leading-snug mb-2 group-hover:text-[#D4AF37] transition-colors duration-500 line-clamp-2 px-2">
          {product.name}
        </h4>
        
        <div className="w-6 h-[1px] bg-white/20 mb-2.5" />
        
        <div className="flex items-center justify-center gap-1.5 mb-3 w-full">
          <span className="text-sm font-light tracking-widest text-white/90">₹{price}</span>
          {hasDiscount && (
            <span className="text-white/40 text-[9px] line-through font-medium">₹{oldPrice}</span>
          )}
        </div>
        
        <button 
          onClick={handleAdd}
          disabled={adding || !firebaseUser}
          className={`w-[90%] py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 transition-all duration-300 border ${
            added 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
          }`}
        >
          {added ? (
             <><Check size={12} strokeWidth={2} /> Added</>
          ) : adding ? (
             <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
             <><Plus size={12} strokeWidth={2} /> Add to Cart</>
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
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          {icon} <span className="tracking-wide">{title}</span>
        </h3>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#2B1B17] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#2B1B17] to-transparent z-10 pointer-events-none" />
          
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
