'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import type { ProductsModel } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { addToCart } from '@/lib/firestore';
import { useState } from 'react';

interface Props {
  product: ProductsModel;
}

export default function ProductCard({ product }: Props) {
  const { firebaseUser } = useAuthStore();
  const [adding, setAdding] = useState(false);

  const price = product.unitPrice1 ?? 0;
  const oldPrice = product.unitOldPrice1 ?? 0;
  const hasDiscount = oldPrice > 0 && oldPrice > price;
  const rating = product.totalNumberOfUserRating > 0
    ? (product.totalRating / product.totalNumberOfUserRating).toFixed(1)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setAdding(true);
    const docId = `${product.vendorId}${product.name}unit1`;
    await addToCart(firebaseUser.uid, {
      ...product,
      selected: 'unit1',
      selectedPrice: price,
      price,
      quantity: 1,
      cartDocId: docId,
    }, docId);
    setAdding(false);
  };

  return (
    <Link
      href={`/products/${product.uid}`}
      className="group bg-[var(--color-card)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface)]">
        {product.image1 ? (
          <Image
            src={product.image1}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-fg-muted)] text-4xl">🛍</div>
        )}
        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-[var(--color-gold)] text-black text-[10px] font-black px-1.5 py-0.5 rounded-md">
            -{product.percantageDiscount}%
          </span>
        )}
        {/* Flash sale badge */}
        {product.endFlash && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            SALE
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="text-[10px] text-[var(--color-fg-muted)] uppercase tracking-wide line-clamp-1">
          {product.brandName || product.category}
        </p>
        <h3 className="text-sm font-semibold text-[var(--color-fg)] line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 text-[var(--color-gold)]">
            <Star size={11} fill="currentColor" />
            <span className="text-[11px] font-medium text-[var(--color-fg-muted)]">
              {rating} ({product.totalNumberOfUserRating})
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-sm font-bold text-[var(--color-fg)]">₹{price}</span>
          {hasDiscount && (
            <span className="text-xs text-[var(--color-fg-muted)] line-through">₹{oldPrice}</span>
          )}
        </div>

        {/* Unit label */}
        {product.unitname1 && (
          <span className="text-[10px] text-[var(--color-fg-muted)]">{product.unitname1}</span>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !firebaseUser}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-brown-dark)] text-white text-xs font-semibold hover:bg-[var(--color-gold)] hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={13} />
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
