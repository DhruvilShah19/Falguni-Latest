'use client';
import Image from 'next/image';
import Link from 'next/link';
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
  const { firebaseUser } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);

  const price       = product.unitPrice1 ?? 0;
  const oldPrice    = product.unitOldPrice1 ?? 0;
  const hasDiscount = oldPrice > 0 && oldPrice > price;
  const rating      = product.totalNumberOfUserRating > 0
    ? product.totalRating / product.totalNumberOfUserRating : null;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firebaseUser || adding) return;
    setAdding(true);
    const docId = `${product.vendorId}${product.name}unit1`;
    
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
  };

  return (
    <Link
      href={`/products/${product.uid}`}
      className="group relative flex flex-col overflow-hidden h-full"
      style={{
        borderRadius: variant === 'rect-large' ? 40 : variant === 'squircle-small' ? 32 : variant === 'rect-small' ? 24 : variant === 'square-small' ? 12 : 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(212,175,55,0.35)';
        el.style.boxShadow   = '0 0 0 1px rgba(212,175,55,0.12), 0 16px 40px rgba(0,0,0,0.08)';
        el.style.transform   = 'translateY(-4px)';
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
      <div className="relative overflow-hidden" style={{ aspectRatio: (variant === 'rect-large' || variant === 'rect-small') ? '4/5' : '1/1', background: 'var(--color-bg)' }}>
        {product.image1 ? (
          <Image
            src={product.image1}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 22vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: 'rgba(0,0,0,0.15)' }}>
            🛍
          </div>
        )}

        {/* Subtle vignette always-on */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.05) 0%, transparent 30%)' }} />

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span style={{
              padding: '3px 7px', borderRadius: 6,
              background: '#D4AF37', color: '#2B1B17',
              fontSize: 9, fontWeight: 900, letterSpacing: '0.05em',
            }}>
              -{product.percantageDiscount}%
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
        </div>

        {/* Desktop: quick-add button — bottom right, appears on hover */}
        <button
          onClick={handleAdd}
          disabled={adding || !firebaseUser}
          className="hidden md:flex absolute bottom-2.5 right-2.5 z-10 items-center justify-center rounded-full
            opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100
            transition-all duration-300 disabled:opacity-40"
          style={{
            width: 36, height: 36,
            background: added ? '#16a34a' : 'linear-gradient(135deg,#D4AF37,#C9A227)',
            color: added ? 'white' : '#2B1B17',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {added ? <Check size={14} strokeWidth={3} /> : adding ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : <Plus size={14} strokeWidth={2.5} />}
        </button>
      </div>

      {/* ════════════════════════════
          INFO BLOCK
      ════════════════════════════ */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Brand accent line + name */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1" style={{ width: 2, height: 12, borderRadius: 99, background: '#D4AF37' }} />
          <div className="min-w-0">
            <p style={{ color: 'rgba(212,175,55,0.9)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.15em', lineHeight: 1 }}>
              {(product.brandName || product.category).toUpperCase()}
            </p>
            <h3 className="line-clamp-2 leading-snug mt-0.5"
              style={{ color: 'var(--color-fg)', fontSize: 12.5, fontWeight: 600 }}>
              {product.name}
            </h3>
          </div>
        </div>

        {/* Stars */}
        {rating !== null && (
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={9} style={{
                color: s <= Math.round(rating) ? '#D4AF37' : 'rgba(0,0,0,0.1)',
                fill:  s <= Math.round(rating) ? '#D4AF37' : 'rgba(0,0,0,0.1)',
              }} />
            ))}
            <span style={{ color: 'var(--color-fg-muted)', fontSize: 9, marginLeft: 2 }}>
              {product.totalNumberOfUserRating}
            </span>
          </div>
        )}

        {/* Price row — price is the hero */}
        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span style={{ color: '#D4AF37', fontSize: 17, fontWeight: 900, lineHeight: 1 }}>
              ₹{price}
            </span>
            {hasDiscount && (
              <span style={{ color: 'var(--color-fg-muted)', fontSize: 11, textDecoration: 'line-through' }}>
                ₹{oldPrice}
              </span>
            )}
          </div>
          {product.unitname1 && (
            <span style={{ color: 'var(--color-fg-muted)', fontSize: 9, letterSpacing: '0.05em' }}>
              {product.unitname1}
            </span>
          )}
        </div>

        {/* Mobile: full-width add to cart */}
        <button
          onClick={handleAdd}
          disabled={adding || !firebaseUser}
          className="md:hidden flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 disabled:opacity-40"
          style={{
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            background: added ? '#16a34a' : 'rgba(212,175,55,0.1)',
            color: added ? 'white' : '#D4AF37',
            border: `1px solid ${added ? 'transparent' : 'rgba(212,175,55,0.25)'}`,
          }}
        >
          {added
            ? <><Check size={12} strokeWidth={3} /> ADDED</>
            : adding
            ? 'Adding...'
            : <><ShoppingCart size={12} /> ADD TO CART</>
          }
        </button>
      </div>

      {/* Gold shimmer line at bottom — appears on hover */}
      <div
        className="absolute inset-x-0 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
      />
    </Link>
  );
}
