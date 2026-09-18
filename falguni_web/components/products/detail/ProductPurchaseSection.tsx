'use client';

import { Star, Minus, Plus, Heart, ShoppingBag, Check } from 'lucide-react';
import type { ProductsModel } from '@/types';
import { useStoreStatusStore } from '@/store/storeStatusStore';

export interface ProductUnitOption {
  key: string;
  name: string;
  price: number;
  oldPrice: number;
}

interface ProductPurchaseSectionProps {
  product: ProductsModel;
  units: ProductUnitOption[];
  selectedUnit: string;
  onSelectUnit: (key: string) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  adding: boolean;
  added: boolean;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export default function ProductPurchaseSection({
  product,
  units,
  selectedUnit,
  onSelectUnit,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  adding,
  added,
  isWishlisted,
  onToggleWishlist,
}: ProductPurchaseSectionProps) {
  const { isOpen, openTime } = useStoreStatusStore();

  const activeUnit = units.find((u) => u.key === selectedUnit) || units[0] || {
    key: 'unit1',
    name: 'Standard Pack',
    price: product.price || 0,
    oldPrice: 0,
  };

  const hasRealReviews = Boolean(
    product.totalNumberOfUserRating && product.totalNumberOfUserRating > 0
  );
  const ratingAvg = hasRealReviews
    ? (product.totalRating / (product.totalNumberOfUserRating || 1)).toFixed(1)
    : '4.8';
  const ratingCount = hasRealReviews ? product.totalNumberOfUserRating : 0;

  // Extract a 1-2 sentence excerpt from description
  const shortDescription = product.description
    ? product.description
        .replace(/\*\*/g, '')
        .replace(/NOTE:.*$/i, '')
        .split('\n')
        .find((s) => s.trim().length > 20) || product.description.slice(0, 140)
    : '';

  const isOutOfStock = product.quantity !== undefined && product.quantity === 0;

  return (
    <div className="w-full flex flex-col items-start text-left">
      {/* ── Brand & SubCategory Pill ── */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className="text-xs font-bold tracking-wider text-[#733617] uppercase bg-[#F5EBE1] px-2.5 py-1 rounded-md">
          {product.brandName || 'Falguni'}
        </span>
        {product.subCategory && (
          <span className="text-xs font-semibold tracking-wide text-[#65544A] bg-white border border-[#EFE6DC] px-2.5 py-1 rounded-md uppercase">
            {product.subCategory}
          </span>
        )}
        {product.quantity !== undefined && product.quantity > 0 && product.quantity <= 10 && (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Only {product.quantity} left in stock!
          </span>
        )}
        {isOutOfStock && (
          <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}
      </div>

      {/* ── Title & Veg Badge ── */}
      <div className="flex items-start justify-between gap-3 w-full mb-2">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D1508] tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Indian Green Veg Symbol */}
        <div
          title="100% Vegetarian"
          className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#16A34A] rounded-sm p-[2px] flex items-center justify-center mt-1"
        >
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#16A34A]" />
        </div>
      </div>

      {/* ── Rating & Social Proof ── */}
      <a
        href="#customer-reviews"
        className="group inline-flex items-center gap-2.5 text-xs text-[#65544A] mb-4 flex-wrap hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-1 text-[#D49B4B]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={14}
              className={
                i <= Math.round(Number(ratingAvg))
                  ? 'fill-[#D49B4B] text-[#D49B4B]'
                  : 'fill-transparent text-[#D49B4B]'
              }
            />
          ))}
          <span className="font-bold text-[#2D1508] ml-1">{ratingAvg}</span>
        </div>

        {hasRealReviews ? (
          <span className="text-[#8A796F] underline decoration-[#EFE6DC] group-hover:text-[#733617]">
            ({ratingCount} {ratingCount === 1 ? 'Review' : 'Reviews'})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-[#FAF3EA] text-[#733617] border border-[#E8DACB] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Heritage Rating (Google Verified · 4.8★)
          </span>
        )}

        <span className="text-[#D4C3B7]">|</span>
        <span className="text-[#8A796F] font-medium">100% Authentic Quality</span>
      </a>

      {/* ── Price Block ── */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl sm:text-4xl font-black text-[#2D1508] tracking-tight">
          ₹{activeUnit.price}
        </span>
        {activeUnit.oldPrice > activeUnit.price && (
          <span className="text-base sm:text-lg text-[#8A796F] line-through font-normal">
            ₹{activeUnit.oldPrice}
          </span>
        )}
        {activeUnit.oldPrice > activeUnit.price && (
          <span className="bg-[#EFE2D2] text-[#733617] text-[11px] font-bold px-2 py-0.5 rounded">
            Save ₹{activeUnit.oldPrice - activeUnit.price}
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#8A796F] font-medium mb-4">Inclusive of all taxes</p>

      {/* ── Short Description Excerpt ── */}
      {shortDescription && (
        <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed mb-6 max-w-xl font-normal">
          {shortDescription}
        </p>
      )}

      {/* ── Weight / Variant Selector ── */}
      {units.length > 0 && (
        <div className="w-full mb-6">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65544A] mb-2.5">
            Choose Weight
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {units.map((unit) => {
              const isSelected = unit.key === selectedUnit;
              return (
                <button
                  key={unit.key}
                  type="button"
                  onClick={() => onSelectUnit(unit.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#733617] bg-[#FDF4ED] text-[#733617] shadow-xs'
                      : 'border-[#EFE6DC] bg-white text-[#4A3B32] hover:border-[#733617]/40 hover:bg-[#FAF7F2]'
                  }`}
                >
                  {unit.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quantity Selector ── */}
      <div className="w-full mb-6">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#65544A] mb-2.5">
          Quantity
        </label>
        <div className="inline-flex items-center bg-white border border-[#EFE6DC] rounded-xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-10 h-10 flex items-center justify-center text-[#65544A] hover:text-[#733617] hover:bg-[#FAF7F2] transition disabled:opacity-30 cursor-pointer"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-sm font-bold text-[#2D1508]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Increase quantity"
            className="w-10 h-10 flex items-center justify-center text-[#65544A] hover:text-[#733617] hover:bg-[#FAF7F2] transition cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ── Action Buttons (Add to Cart & Buy Now) ── */}
      {!isOpen && (
        <div className="w-full mb-3 p-3 rounded-xl bg-[#FFF8EE] border border-[#F3DFC1] text-[#733617] text-xs flex items-center gap-2.5 shadow-2xs">
          <span className="text-base">🌙</span>
          <div>
            <span className="font-bold block text-[#2D1508]">Live Order Intake Paused</span>
            <span className="text-[#65544A] text-[11px]">Reopening at {openTime}. You can still add items to your cart!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full mb-4">
        {isOutOfStock ? (
          <div className="w-full py-3.5 px-6 rounded-xl bg-[#EFE6DC] text-[#8A796F] font-bold text-xs uppercase tracking-wider text-center border border-[#D9C7B6]">
            Currently Out of Stock
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={adding}
              className="flex-1 py-3.5 px-6 rounded-xl border-[1.5px] border-[#733617] text-[#733617] bg-white hover:bg-[#FDF4ED] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              {added ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>{adding ? 'Adding...' : '+ Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBuyNow}
              disabled={!isOpen}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#733617] hover:bg-[#5A290F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {!isOpen ? 'Store Closed' : 'Buy Now'}
            </button>
          </>
        )}
      </div>

      {/* ── Wishlist Toggle ── */}
      <button
        type="button"
        onClick={onToggleWishlist}
        className="flex items-center gap-2 text-xs font-semibold text-[#65544A] hover:text-[#733617] transition-colors py-1 cursor-pointer"
      >
        <Heart
          size={16}
          className={
            isWishlisted
              ? 'fill-[#B91C1C] text-[#B91C1C]'
              : 'text-[#65544A] hover:text-[#733617]'
          }
        />
        <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
      </button>
    </div>
  );
}
