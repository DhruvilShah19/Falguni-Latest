'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check } from 'lucide-react';
import type { ProductsModel } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { addToCart, updateCartItem } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';

export default function BoutiqueItem({ product, priority = false }: { product: ProductsModel; priority?: boolean }) {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const price = (product.unitPrice1 && product.unitPrice1 > 0) ? product.unitPrice1 : (product.price ?? 160);
  const unitName = product.unitname1 || '200g';
  const productId = product.uid || product.productID;

  const hasRealReviews = Boolean(
    product.totalNumberOfUserRating && product.totalNumberOfUserRating > 0
  );
  const ratingAvg = hasRealReviews
    ? (product.totalRating / (product.totalNumberOfUserRating || 1)).toFixed(1)
    : '4.8';

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firebaseUser) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    if (adding) return;
    setAdding(true);

    try {
      const docId = `${product.vendorId || 'falguni'}_${productId}_unit1`;
      const existing = useCartStore.getState().items.find(i => i.cartDocId === docId);

      if (existing) {
        const newQty = (existing.quantity || 1) + 1;
        await updateCartItem(firebaseUser.uid, docId, {
          quantity: newQty,
          price: price * newQty,
        });
      } else {
        await addToCart(firebaseUser.uid, {
          ...product,
          selected: unitName,
          selectedPrice: price,
          price,
          quantity: 1,
          cartDocId: docId,
        }, docId);
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EFE6DC] p-3 md:p-3.5 flex flex-col justify-between shadow-[0_2px_12px_rgba(45,21,8,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full">
      <Link href={`/products/${productId}`} className="flex flex-col flex-1">
        {/* Overhead Dish Image Container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#FAF7F2]">
          {product.image1 ? (
            <Image
              src={product.image1}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 18vw"
              priority={priority}
              className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
              🍲
            </div>
          )}
          {/* Subtle inner plate border */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />

          {/* Bestseller Badge */}
          {product.isBestseller && (
            <div className="absolute top-2 left-2 bg-[#D4AF37] text-white text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded-md shadow-sm uppercase z-10">
              ★ Bestseller
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-[#2D1508] line-clamp-1 group-hover:text-[#733617] transition-colors mb-1">
          {product.name}
        </h3>

        {/* Golden Star Rating & Review Count */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-[#D49B4B]">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xs">★</span>
            ))}
          </div>
          {hasRealReviews ? (
            <span className="text-[11px] text-[#65544A]">
              {ratingAvg} ({product.totalNumberOfUserRating})
            </span>
          ) : (
            <span className="text-[10px] text-[#733617] font-semibold bg-[#FAF3EA] px-1.5 py-0.5 rounded border border-[#E8DACB]">
              4.8 · Heritage
            </span>
          )}
        </div>

        {/* Price & Weight Row */}
        <div className="flex items-baseline justify-between mt-auto mb-3">
          <span className="font-serif font-bold text-base text-[#2D1508]">
            ₹{price}
          </span>
          <span className="text-xs text-[#8A796F] font-medium">
            {unitName}
          </span>
        </div>
      </Link>

      {/* Full-width Brown "+ ADD" Button */}
      <button
        onClick={handleAdd}
        disabled={adding}
        className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs ${
          added
            ? 'bg-emerald-600 text-white'
            : 'bg-[#733617] text-white hover:bg-[#5A290F] active:scale-[0.98]'
        }`}
      >
        {added ? (
          <>
            <Check size={14} strokeWidth={3} />
            <span>ADDED</span>
          </>
        ) : adding ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <>
            <span>+</span>
            <span>ADD</span>
          </>
        )}
      </button>
    </div>
  );
}
