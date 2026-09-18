'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Check, Plus, ShoppingBag } from 'lucide-react';
import { getProducts, addToCart, updateCartItem } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import type { ProductsModel } from '@/types';

export default function CartFrequentlyBoughtTogether() {
  const { firebaseUser } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const [products, setProducts] = useState<ProductsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    getProducts(25).then((all) => {
      if (!isMounted) return;
      const cartIds = new Set(cartItems.map((i) => i.productID || i.uid));
      // Pick items with images and exclude items currently in cart
      const available = all.filter(
        (p) => !cartIds.has(p.productID || p.uid) && (p.image1 || p.image2)
      );
      setProducts(available.slice(0, 10));
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const handleAdd = async (product: ProductsModel) => {
    if (!firebaseUser) return;
    const prodId = product.uid || product.productID;
    setAddingId(prodId);

    const price = product.unitPrice1 && product.unitPrice1 > 0 ? product.unitPrice1 : product.price || 0;
    const unitName = product.unitname1 || '200g';
    const docId = `${product.vendorId || 'vendor'}_${product.uid}_unit1`;

    const existing = useCartStore.getState().items.find((i) => i.cartDocId === docId);
    if (existing) {
      const newQty = (existing.quantity || 1) + 1;
      await updateCartItem(firebaseUser.uid, docId, {
        quantity: newQty,
        price: price * newQty,
      });
    } else {
      await addToCart(
        firebaseUser.uid,
        {
          ...product,
          selected: unitName,
          selectedPrice: price,
          price,
          quantity: 1,
          cartDocId: docId,
        },
        docId
      );
    }

    setAddingId(null);
    setAddedIds((prev) => new Set(prev).add(prodId));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(prodId);
        return next;
      });
    }, 2000);
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="w-full mt-8 sm:mt-10">
      {/* ── Section Title & Subtitle ── */}
      <div className="mb-4">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D1508]">
          Frequently Bought Together
        </h3>
        <p className="text-xs sm:text-sm text-[#8A796F] mt-0.5">
          Customers also add these products with their cart
        </p>
      </div>

      {/* ── Carousel / Grid Container ── */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 pt-1 snap-x snap-mandatory"
        >
          {products.map((p) => {
            const prodId = p.uid || p.productID;
            const price = p.unitPrice1 && p.unitPrice1 > 0 ? p.unitPrice1 : p.price || 0;
            const weight = p.unitname1 || '200g';
            const isAdded = addedIds.has(prodId);
            const isAdding = addingId === prodId;

            return (
              <div
                key={prodId}
                className="w-[150px] sm:w-[170px] md:w-[180px] shrink-0 snap-start bg-white border border-[#EFE6DC] rounded-xl p-3 flex flex-col justify-between hover:shadow-xs transition"
              >
                {/* Product Photo */}
                <Link
                  href={`/products/${p.uid}`}
                  className="w-full aspect-square rounded-lg bg-[#FAF7F2] border border-[#EFE6DC] relative overflow-hidden mb-2.5 flex items-center justify-center group/img"
                >
                  {p.image1 ? (
                    <Image
                      src={p.image1}
                      alt={p.name}
                      fill
                      sizes="180px"
                      className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-[#8A796F] opacity-40" />
                  )}
                </Link>

                {/* Details */}
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <Link
                      href={`/products/${p.uid}`}
                      className="font-bold text-xs sm:text-sm text-[#2D1508] hover:text-[#733617] transition line-clamp-1 block"
                    >
                      {p.name}
                    </Link>
                    <span className="text-[11px] text-[#8A796F] font-medium block mt-0.5">
                      {weight}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-[#2D1508] block mt-1 mb-2.5">
                      ₹{price}
                    </span>
                  </div>

                  {/* + ADD Button */}
                  <button
                    onClick={() => handleAdd(p)}
                    disabled={isAdding || !firebaseUser}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                      isAdded
                        ? 'bg-emerald-50 text-[#2E7D32] border border-emerald-300'
                        : 'border border-[#733617] text-[#733617] hover:bg-[#733617] hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={12} strokeWidth={2.5} />
                        <span>Added</span>
                      </>
                    ) : isAdding ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus size={12} strokeWidth={2.5} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Next Arrow */}
        {products.length > 4 && (
          <button
            onClick={scrollRight}
            aria-label="Next frequently bought products"
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#EFE6DC] shadow-sm items-center justify-center text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] transition z-10"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
