'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, Check, ChevronDown } from 'lucide-react';
import type { ProductsModel } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { addToCart, updateCartItem, addToFavorites, removeFromFavorites } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';

interface ShopProductCardProps {
  product: ProductsModel;
  priority?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (productId: string, favorited: boolean) => void;
  badge?: 'BESTSELLER' | 'NEW' | null;
}

interface UnitVariant {
  name: string;
  price: number;
  oldPrice?: number;
  unitIndex: number;
}

export default function ShopProductCard({
  product,
  priority = false,
  isFavorited: initialFavorited = false,
  onFavoriteToggle,
  badge,
}: ShopProductCardProps) {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);

  const productId = product.uid || product.productID || '';
  const isOutOfStock = product.quantity !== undefined && product.quantity === 0;

  // Extract all available unit variants from product (unitname1..7, unitPrice1..7)
  const variants: UnitVariant[] = useMemo(() => {
    const list: UnitVariant[] = [];
    for (let i = 1; i <= 7; i++) {
      const uName = (product as any)[`unitname${i}`];
      const uPrice = (product as any)[`unitPrice${i}`];
      const uOldPrice = (product as any)[`unitOldPrice${i}`];

      if (uPrice && uPrice > 0) {
        list.push({
          name: uName || (i === 1 ? '200g' : `Pack ${i}`),
          price: uPrice,
          oldPrice: uOldPrice > 0 ? uOldPrice : undefined,
          unitIndex: i,
        });
      }
    }

    // Fallback if no unitPrice1..7 is defined
    if (list.length === 0) {
      list.push({
        name: product.unitname1 || '200g',
        price: product.price || 160,
        unitIndex: 1,
      });
    }

    return list;
  }, [product]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const activeVariant = variants[selectedVariantIndex] || variants[0];

  const hasRealReviews = Boolean(
    product.totalNumberOfUserRating && product.totalNumberOfUserRating > 0
  );
  const ratingAvg = hasRealReviews
    ? (product.totalRating / (product.totalNumberOfUserRating || 1)).toFixed(1)
    : '4.8';

  // Determine badge if not explicitly passed
  const displayBadge = useMemo(() => {
    if (badge) return badge;
    if (product.isBestseller) return 'BESTSELLER';
    const nameLower = product.name?.toLowerCase() || '';
    const brandLower = product.brandName?.toLowerCase() || '';
    if (
      nameLower.includes('khakhra') ||
      nameLower.includes('cheese') ||
      nameLower.includes('pickle') ||
      brandLower.includes('bestseller')
    ) {
      return 'BESTSELLER';
    }
    if (
      nameLower.includes('bhakharwadi') ||
      nameLower.includes('khaman') ||
      nameLower.includes('papad') ||
      brandLower.includes('new')
    ) {
      return 'NEW';
    }
    return null;
  }, [badge, product]);

  // Wishlist toggle handler
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firebaseUser) {
      router.push(`/login?redirect=/products`);
      return;
    }

    const nextState = !favorited;
    setFavorited(nextState);
    if (onFavoriteToggle) {
      onFavoriteToggle(productId, nextState);
    }

    try {
      if (nextState) {
        await addToFavorites(firebaseUser.uid, product);
      } else {
        await removeFromFavorites(firebaseUser.uid, productId);
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      // Rollback on failure
      setFavorited(!nextState);
    }
  };

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!firebaseUser) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    if (adding) return;
    setAdding(true);

    try {
      const docId = `${product.vendorId || 'falguni'}_${productId}_unit${activeVariant.unitIndex}`;
      const existing = useCartStore.getState().items.find(i => i.cartDocId === docId);

      if (existing) {
        const newQty = (existing.quantity || 1) + 1;
        await updateCartItem(firebaseUser.uid, docId, {
          quantity: newQty,
          price: activeVariant.price * newQty,
        });
      } else {
        await addToCart(
          firebaseUser.uid,
          {
            ...product,
            selected: activeVariant.name,
            selectedPrice: activeVariant.price,
            price: activeVariant.price,
            quantity: 1,
            cartDocId: docId,
          },
          docId
        );
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  const hasVariantDiscount = activeVariant.oldPrice && activeVariant.oldPrice > activeVariant.price;
  const variantDiscountPct = hasVariantDiscount
    ? Math.round(((activeVariant.oldPrice! - activeVariant.price) / activeVariant.oldPrice!) * 100)
    : (product.percantageDiscount || 0);

  return (
    <div className="bg-white rounded-2xl border border-[#EFE6DC] p-3 md:p-3.5 flex flex-col justify-between shadow-[0_2px_10px_rgba(45,21,8,0.03)] hover:shadow-xl hover:border-[#D9C7B6] hover:-translate-y-1 transition-all duration-300 group h-full">
      <Link href={`/products/${productId}`} className="flex flex-col flex-1">
        {/* Top Product Image Container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#FAF7F2] flex items-center justify-center">
          {/* Badges on Top Left */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex flex-col gap-1 items-start">
            {variantDiscountPct > 0 ? (
              <span className="bg-[#B91C1C] text-white text-[9.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                {variantDiscountPct}% OFF
              </span>
            ) : displayBadge ? (
              <span
                className={`text-[9.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs ${
                  displayBadge === 'BESTSELLER'
                    ? 'bg-[#733617] text-white'
                    : 'bg-[#8B4513] text-white'
                }`}
              >
                {displayBadge}
              </span>
            ) : null}

            {isOutOfStock && (
              <span className="bg-red-700 text-white text-[8.5px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist Heart Button on Top Right */}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#733617] shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <Heart
              size={15}
              className={
                favorited
                  ? 'fill-[#733617] text-[#733617]'
                  : 'text-[#733617] stroke-[1.8] hover:text-[#5A290F]'
              }
            />
          </button>

          {/* Product Dish Photo */}
          {product.image1 ? (
            <Image
              src={product.image1}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-4xl opacity-25">
              🍲
            </div>
          )}

          {/* Subtle dish border rim */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
        </div>

        {/* Brand & Subcategory Header */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A796F] truncate">
            {product.brandName || 'Falguni'}
          </span>
          {product.subCategory && (
            <span className="text-[9px] font-semibold text-[#733617] bg-[#F5EBE1] px-1.5 py-0.5 rounded truncate max-w-[120px]">
              {product.subCategory}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-[#2D1508] line-clamp-1 group-hover:text-[#733617] transition-colors mb-1">
          {product.name}
        </h3>

        {/* Star Rating & Social Proof */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-[#D49B4B] items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={11}
                className={
                  star <= Math.round(Number(ratingAvg))
                    ? 'fill-[#D49B4B] text-[#D49B4B]'
                    : 'fill-transparent text-[#D49B4B]'
                }
              />
            ))}
          </div>
          {hasRealReviews ? (
            <span className="text-[11px] text-[#65544A] font-medium">
              {ratingAvg} ({product.totalNumberOfUserRating})
            </span>
          ) : (
            <span className="text-[10px] text-[#733617] font-semibold bg-[#FAF3EA] px-1.5 py-0.5 rounded border border-[#E8DACB]">
              4.8 · Heritage
            </span>
          )}
        </div>

        {/* Price & Current Weight Row */}
        <div className="flex items-baseline justify-between mb-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif font-bold text-base text-[#2D1508]">
              ₹{activeVariant.price}
            </span>
            {activeVariant.oldPrice && activeVariant.oldPrice > activeVariant.price && (
              <span className="text-xs text-[#9E8E84] line-through font-normal">
                ₹{activeVariant.oldPrice}
              </span>
            )}
          </div>
          <span className="text-xs text-[#65544A] font-medium">
            {activeVariant.name}
          </span>
        </div>
      </Link>

      {/* Weight Variant Selector Dropdown */}
      <div className="mb-2.5 relative">
        <div className="relative w-full">
          <select
            value={selectedVariantIndex}
            onChange={e => setSelectedVariantIndex(Number(e.target.value))}
            className="w-full appearance-none bg-white border border-[#E8DFD5] hover:border-[#733617]/50 rounded-lg px-3 py-1.5 text-xs text-[#2D1508] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#733617] cursor-pointer transition-colors pr-8"
          >
            {variants.map((v, idx) => (
              <option key={idx} value={idx}>
                {v.name} {variants.length > 1 ? `- ₹${v.price}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A796F] pointer-events-none"
          />
        </div>
      </div>

      {/* Add To Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={adding || isOutOfStock}
        className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 border ${
          isOutOfStock
            ? 'bg-[#EFE6DC] border-[#D9C7B6] text-[#8A796F] cursor-not-allowed opacity-75'
            : added
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-[#733617] text-[#733617] bg-white hover:bg-[#733617] hover:text-white active:scale-[0.98] cursor-pointer'
        }`}
      >
        {isOutOfStock ? (
          <span>OUT OF STOCK</span>
        ) : added ? (
          <>
            <Check size={14} strokeWidth={3} />
            <span>ADDED</span>
          </>
        ) : adding ? (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <>
            <span className="text-sm font-light leading-none">+</span>
            <span>ADD TO CART</span>
          </>
        )}
      </button>
    </div>
  );
}
