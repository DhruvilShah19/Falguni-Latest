'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Check, Plus } from 'lucide-react';
import type { ProductsModel } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { addToCart, updateCartItem } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

export default function ProductCard({ 
  product,
  variant = 'default'
}: { 
  product: ProductsModel;
  variant?: 'default' | 'square-small' | 'rect-large' | 'rect-small' | 'squircle-small';
}) {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);

  const price       = (product.unitPrice1 && product.unitPrice1 > 0) ? product.unitPrice1 : (product.price ?? 0);
  const oldPrice    = product.unitOldPrice1 ?? 0;
  const hasDiscount = oldPrice > 0 && oldPrice > price;
  const discountPercent = product.percantageDiscount > 0
    ? product.percantageDiscount
    : (hasDiscount && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const isOutOfStock = product.quantity !== undefined && product.quantity === 0;

  const rating      = product.totalNumberOfUserRating > 0
    ? product.totalRating / product.totalNumberOfUserRating : null;
  const productId   = product.uid || product.productID;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (!firebaseUser) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    if (adding) return;
    setAdding(true);
    const docId = `${product.vendorId || 'vendor'}${product.name}unit1`;
    
    const existing = useCartStore.getState().items.find(i => i.cartDocId === docId);
    if (existing) {
      const newQty = (existing.quantity || 1) + 1;
      await updateCartItem(firebaseUser.uid, docId, {
        quantity: newQty,
        price: price * newQty,
      });
    } else {
      await addToCart(firebaseUser.uid, {
        ...product, selected: product.unitname1 || 'unit1', selectedPrice: price,
        price, quantity: 1, cartDocId: docId,
      }, docId);
    }
    
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link
      href={`/products/${productId}`}
      className="group relative flex flex-col overflow-hidden h-full"
      style={{
        borderRadius: variant === 'rect-large' ? 40 : variant === 'squircle-small' ? 32 : variant === 'rect-small' ? 24 : variant === 'square-small' ? 12 : 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = '#733617';
        el.style.boxShadow   = '0 4px 20px rgba(45,21,8,0.08)';
        el.style.transform   = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--color-border)';
        el.style.boxShadow   = 'none';
        el.style.transform   = 'translateY(0)';
      }}
    >
      {/* ════════════════════════════
          IMAGE BLOCK
      ════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ aspectRatio: (variant === 'rect-large' || variant === 'rect-small') ? '4/5' : '1/1', background: '#FAF7F2' }}>
        {product.image1 ? (
          <Image
            src={product.image1}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 22vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
            🛍
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span style={{
              padding: '3px 7px', borderRadius: 6,
              background: '#B91C1C', color: '#FFFFFF',
              fontSize: 9, fontWeight: 900, letterSpacing: '0.05em',
            }}>
              -{discountPercent}%
            </span>
          )}
          {product.endFlash && (
            <span style={{
              padding: '3px 7px', borderRadius: 6,
              background: 'rgba(239,68,68,0.9)', color: 'white',
              fontSize: 9, fontWeight: 900,
            }}>
              SALE
            </span>
          )}
          {isOutOfStock && (
            <span style={{
              padding: '3px 7px', borderRadius: 6,
              background: '#7F1D1D', color: 'white',
              fontSize: 8.5, fontWeight: 900,
            }}>
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Desktop: quick-add button — bottom right, appears on hover */}
        {!isOutOfStock && (
          <button
            onClick={handleAdd}
            disabled={adding}
            className={`absolute bottom-2.5 right-2.5 z-10 flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-40
              ${variant === 'square-small' ? 'opacity-100 scale-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-100 md:scale-75 md:group-hover:scale-100'}
            `}
            style={{
              width: 36, height: 36,
              background: added ? '#16a34a' : '#733617',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(45,21,8,0.25)',
            }}
          >
            {added ? <Check size={14} strokeWidth={3} /> : adding ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : <Plus size={14} strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* ════════════════════════════
          INFO BLOCK
      ════════════════════════════ */}
      <div className="flex flex-col flex-1 p-3 md:p-3.5 gap-1.5" style={{ background: 'var(--color-surface)' }}>
        {/* Category & Title */}
        <div className="flex items-start gap-1.5">
          <div className="flex-shrink-0 mt-0.5" style={{ width: 2, height: 10, borderRadius: 99, background: '#733617' }} />
          <div className="min-w-0">
            <p style={{ color: '#733617', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.15em', lineHeight: 1 }} className="truncate">
              {(product.brandName || 'Falguni').toUpperCase()}
              {product.subCategory && ` • ${product.subCategory.toUpperCase()}`}
            </p>
            <h3 className="line-clamp-2 leading-snug mt-0.5 capitalize font-semibold"
              style={{ color: '#2D1508', fontSize: 12 }}>
              {product.name}
            </h3>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={10} style={{
              color: '#D49B4B',
              fill:  s <= Math.round(rating !== null ? rating : 4.8) ? '#D49B4B' : '#EFE6DC',
            }} />
          ))}
          <span style={{ color: '#733617', fontSize: 9, marginLeft: 2, fontWeight: 600 }}>
            {rating !== null ? `${rating.toFixed(1)} (${product.totalNumberOfUserRating})` : '4.8 · Heritage'}
          </span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span style={{ color: '#2D1508', fontSize: 14, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--font-serif)' }}>
              ₹{price}
            </span>
            {hasDiscount && (
              <span style={{ color: '#9E8E84', fontSize: 9, textDecoration: 'line-through' }}>
                ₹{oldPrice}
              </span>
            )}
          </div>
          {product.unitname1 && (
            <span style={{ color: '#65544A', fontSize: 10, letterSpacing: '0.02em', fontWeight: 500 }}>
              {product.unitname1}
            </span>
          )}
        </div>

        {/* Mobile: full-width add to cart */}
        <button
          onClick={handleAdd}
          disabled={adding || isOutOfStock}
          className="md:hidden flex items-center justify-center gap-1 rounded-md transition-all duration-200 mt-1"
          style={{
            padding: '6px 8px',
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: isOutOfStock ? '#EFE6DC' : added ? '#16a34a' : '#733617',
            color: isOutOfStock ? '#8A796F' : '#FFFFFF',
          }}
        >
          {isOutOfStock
            ? 'OUT OF STOCK'
            : added
            ? <><Check size={12} strokeWidth={3} /> ADDED</>
            : adding
            ? 'Adding...'
            : <><ShoppingCart size={12} /> ADD TO CART</>
          }
        </button>
      </div>

      {/* Terracotta line at bottom — appears on hover */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: '#733617' }}
      />
    </Link>
  );
}
