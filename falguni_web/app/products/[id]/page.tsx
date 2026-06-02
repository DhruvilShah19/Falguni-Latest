'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/firestore';
import { addToCart } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { ChevronLeft, Star, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// Extract non-empty unit options from product
function getUnits(p: ProductsModel) {
  const units = [];
  for (let i = 1; i <= 7; i++) {
    const name = p[`unitname${i}` as keyof ProductsModel] as string;
    const price = p[`unitPrice${i}` as keyof ProductsModel] as number;
    const oldPrice = p[`unitOldPrice${i}` as keyof ProductsModel] as number;
    if (name && price > 0) units.push({ key: `unit${i}`, name, price, oldPrice });
  }
  return units;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();

  const [product, setProduct] = useState<ProductsModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('unit1');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProductById(id).then(p => { setProduct(p); setLoading(false); });
  }, [id]);

  if (loading) return <PageShell><LoadingSpinner /></PageShell>;
  if (!product) return <PageShell><div className="text-center py-20">Product not found.</div></PageShell>;

  const images = [product.image1, product.image2, product.image3].filter(Boolean);
  const units = getUnits(product);
  const activeUnit = units.find(u => u.key === selectedUnit) ?? units[0];
  const rating = product.totalNumberOfUserRating > 0
    ? (product.totalRating / product.totalNumberOfUserRating)
    : 0;

  const handleAddToCart = async () => {
    if (!firebaseUser) { router.push('/login'); return; }
    setAdding(true);
    const docId = `${product.vendorId}${product.name}${selectedUnit}`;
    await addToCart(firebaseUser.uid, {
      ...product,
      selected: selectedUnit,
      selectedPrice: activeUnit?.price,
      price: (activeUnit?.price ?? 0) * quantity,
      quantity,
      cartDocId: docId,
    }, docId);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-4 transition"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Main content: stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">

          {/* ── Left: Images ── */}
          <div className="md:w-1/2 lg:w-5/12 flex-shrink-0">
            {/* Main image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface)] mb-3">
              {images[currentImage] ? (
                <Image
                  src={images[currentImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🛍</div>
              )}
              {product.percantageDiscount > 0 && (
                <span className="absolute top-3 left-3 bg-[var(--color-gold)] text-black text-xs font-black px-2 py-0.5 rounded-lg">
                  -{product.percantageDiscount}%
                </span>
              )}
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      i === currentImage
                        ? 'border-[var(--color-gold)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'
                    }`}
                  >
                    <Image src={img} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Brand + name */}
            <div>
              <p className="text-xs text-[var(--color-fg-muted)] uppercase tracking-widest mb-1">
                {product.brandName || product.marketName}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--color-fg)] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.totalNumberOfUserRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= Math.round(rating) ? 'text-[var(--color-gold)]' : 'text-[var(--color-border)]'}
                      fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--color-fg-muted)]">
                  {rating.toFixed(1)} ({product.totalNumberOfUserRating} reviews)
                </span>
              </div>
            )}

            {/* Unit selector */}
            {units.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[var(--color-fg)] mb-2">Select Unit</p>
                <div className="flex flex-wrap gap-2">
                  {units.map(u => (
                    <button
                      key={u.key}
                      onClick={() => setSelectedUnit(u.key)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                        selectedUnit === u.key
                          ? 'bg-[var(--color-brown-dark)] text-white border-[var(--color-brown-dark)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-fg)] border-[var(--color-border)] hover:border-[var(--color-fg-muted)]'
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            {activeUnit && (
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-[var(--color-fg)]">₹{activeUnit.price}</span>
                {activeUnit.oldPrice > 0 && activeUnit.oldPrice > activeUnit.price && (
                  <>
                    <span className="text-base text-[var(--color-fg-muted)] line-through">₹{activeUnit.oldPrice}</span>
                    <span className="text-sm font-bold text-green-600">
                      Save ₹{activeUnit.oldPrice - activeUnit.price}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[var(--color-fg)]">Qty:</span>
              <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-[var(--color-surface)] transition text-[var(--color-fg)]"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-[var(--color-fg)] min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-[var(--color-surface)] transition text-[var(--color-fg)]"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-[var(--color-brown-dark)] text-white hover:bg-[var(--color-gold)] hover:text-black'
              } disabled:opacity-60`}
            >
              <ShoppingCart size={16} />
              {adding ? 'Adding...' : added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {/* Description */}
            {product.description && (
              <div className="border-t border-[var(--color-border)] pt-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)] mb-2">Description</h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Category tags */}
            <div className="flex flex-wrap gap-1.5">
              {[product.category, product.subCategory, product.subSubCategory]
                .filter(Boolean)
                .map(tag => (
                  <Link
                    key={tag}
                    href={`/categories/${encodeURIComponent(tag)}`}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-gold)] transition"
                  >
                    {tag}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
