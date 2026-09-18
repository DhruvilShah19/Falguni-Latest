'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProductImageGallery from '@/components/products/detail/ProductImageGallery';
import ProductPurchaseSection, { ProductUnitOption } from '@/components/products/detail/ProductPurchaseSection';
import ProductDeliveryPincodeCard from '@/components/products/detail/ProductDeliveryPincodeCard';
import ProductTrustStrip from '@/components/products/detail/ProductTrustStrip';
import ProductInfoTabs from '@/components/products/detail/ProductInfoTabs';
import ProductReviewsSection from '@/components/products/detail/ProductReviewsSection';
import CompleteYourBoxCombo from '@/components/products/detail/CompleteYourBoxCombo';
import RelatedProductsCarousel from '@/components/products/detail/RelatedProductsCarousel';
import ProductHeritageBanner from '@/components/products/detail/ProductHeritageBanner';
import ProductStickyBottomBar from '@/components/products/detail/ProductStickyBottomBar';
import {
  getProductById,
  getProductReviews,
  setProductReview,
  deleteProductReview,
  getProductsByCategory,
  getProducts,
  addToCart,
  updateCartItem,
  subscribeToFavorites,
  addToFavorites,
  removeFromFavorites,
} from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import type { ProductsModel, RatingModel } from '@/types';

function getUnits(p: ProductsModel): ProductUnitOption[] {
  const units: ProductUnitOption[] = [];
  for (let i = 1; i <= 7; i++) {
    const name = p[`unitname${i}` as keyof ProductsModel] as string;
    let price = p[`unitPrice${i}` as keyof ProductsModel] as number;
    const oldPrice = p[`unitOldPrice${i}` as keyof ProductsModel] as number;
    if (i === 1 && (!price || price <= 0) && p.price && p.price > 0) {
      price = p.price;
    }
    if (name && name.trim() && price > 0) {
      units.push({ key: `unit${i}`, name: name.trim(), price, oldPrice: oldPrice || 0 });
    }
  }
  if (units.length === 0) {
    const fallbackPrice = p.unitPrice1 && p.unitPrice1 > 0 ? p.unitPrice1 : p.price || 0;
    units.push({
      key: 'unit1',
      name: p.unitname1 || 'Standard Pack',
      price: fallbackPrice,
      oldPrice: p.unitOldPrice1 || 0,
    });
  }
  return units;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUser, userDoc } = useAuthStore();

  const [product, setProduct] = useState<ProductsModel | null>(null);
  const [reviews, setReviews] = useState<RatingModel[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductsModel[]>([]);
  const [complementaryProducts, setComplementaryProducts] = useState<ProductsModel[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('unit1');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // 1. Fetch live product document & reviews
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProductById(id).then((p) => {
      if (!isMounted) return;
      if (p) {
        setProduct(p);
        setSelectedUnit('unit1');

        // Fetch real related products in the same category
        if (p.category) {
          getProductsByCategory(p.category).then((list) => {
            if (!isMounted) return;
            const filtered = list.filter((item) => item.uid !== p.uid && item.name !== p.name);
            setRelatedProducts(filtered.slice(0, 10));
          });
        }

        // Fetch real complementary products for "Complete Your Falguni Box"
        getProducts(30).then((all) => {
          if (!isMounted) return;
          // Pick items from different categories (e.g. Mukhvas, Namkeen, Sweets)
          const comp = all.filter(
            (item) => item.uid !== p.uid && item.category !== p.category && (item.image1 || item.image2)
          );
          setComplementaryProducts(comp.slice(0, 6));
        });
      }
      setLoading(false);
    });

    getProductReviews(id).then((r) => {
      if (isMounted) setReviews(r);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Subscribe to user favorites
  useEffect(() => {
    if (!firebaseUser) {
      setFavoriteIds(new Set());
      return;
    }
    const unsub = subscribeToFavorites(firebaseUser.uid, (items) => {
      const ids = new Set(items.map((i) => i.productID || i.uid));
      setFavoriteIds(ids);
    });
    return () => unsub();
  }, [firebaseUser]);

  const units = useMemo(() => (product ? getUnits(product) : []), [product]);
  const activeUnit = useMemo(() => {
    return units.find((u) => u.key === selectedUnit) || units[0] || {
      key: 'unit1',
      name: 'Standard Pack',
      price: product?.price || 0,
      oldPrice: 0,
    };
  }, [units, selectedUnit, product]);

  const isWishlisted = Boolean(
    product && (favoriteIds.has(product.uid) || favoriteIds.has(product.productID))
  );

  // Add to Cart
  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    setAdding(true);
    const docId = `${product.vendorId || 'vendor'}_${product.uid}_${selectedUnit}`;
    const existing = useCartStore.getState().items.find((i) => i.cartDocId === docId);

    if (existing) {
      const newQty = (existing.quantity || 1) + quantity;
      await updateCartItem(firebaseUser.uid, docId, {
        quantity: newQty,
        price: (activeUnit.price ?? 0) * newQty,
      });
    } else {
      await addToCart(
        firebaseUser.uid,
        {
          ...product,
          selected: activeUnit.name,
          selectedPrice: activeUnit.price,
          price: (activeUnit.price ?? 0) * quantity,
          quantity,
          cartDocId: docId,
        },
        docId
      );
    }
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [product, firebaseUser, router, selectedUnit, quantity, activeUnit]);

  // Buy Now (Immediate Checkout)
  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    router.push('/checkout');
  }, [handleAddToCart, router]);

  // Quick Add for related products
  const handleQuickAdd = useCallback(
    async (item: ProductsModel) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }
      const itemUnits = getUnits(item);
      const chosen = itemUnits[0];
      const docId = `${item.vendorId || 'vendor'}_${item.uid}_${chosen.key}`;
      const existing = useCartStore.getState().items.find((i) => i.cartDocId === docId);

      if (existing) {
        const newQty = (existing.quantity || 1) + 1;
        await updateCartItem(firebaseUser.uid, docId, {
          quantity: newQty,
          price: (chosen.price ?? 0) * newQty,
        });
      } else {
        await addToCart(
          firebaseUser.uid,
          {
            ...item,
            selected: chosen.name,
            selectedPrice: chosen.price,
            price: chosen.price,
            quantity: 1,
            cartDocId: docId,
          },
          docId
        );
      }
    },
    [firebaseUser, router]
  );

  // Add Complete Combo Bundle to cart
  const handleAddCombo = useCallback(
    async (comboList: ProductsModel[]) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }
      for (const item of comboList) {
        const itemUnits = getUnits(item);
        const chosen = itemUnits[0];
        const docId = `${item.vendorId || 'vendor'}_${item.uid}_${chosen.key}`;
        const existing = useCartStore.getState().items.find((i) => i.cartDocId === docId);

        if (existing) {
          const newQty = (existing.quantity || 1) + 1;
          await updateCartItem(firebaseUser.uid, docId, {
            quantity: newQty,
            price: (chosen.price ?? 0) * newQty,
          });
        } else {
          await addToCart(
            firebaseUser.uid,
            {
              ...item,
              selected: chosen.name,
              selectedPrice: chosen.price,
              price: chosen.price,
              quantity: 1,
              cartDocId: docId,
            },
            docId
          );
        }
      }
    },
    [firebaseUser, router]
  );

  // Wishlist Toggle
  const handleToggleWishlist = useCallback(async () => {
    if (!firebaseUser || !product) {
      router.push('/login');
      return;
    }
    const prodId = product.productID || product.uid;
    if (isWishlisted) {
      await removeFromFavorites(firebaseUser.uid, prodId);
    } else {
      await addToFavorites(firebaseUser.uid, product);
    }
  }, [firebaseUser, product, isWishlisted, router]);

  // Review Submission
  const handleReviewSubmit = useCallback(
    async (rating: number, reviewText: string) => {
      if (!firebaseUser || !userDoc || !product) {
        router.push('/login');
        return;
      }
      const existing = reviews.find((r) => r.uid === userDoc.uid);
      const oldRating = existing ? existing.rating : 0;
      await setProductReview(product.uid, rating, reviewText, userDoc, oldRating);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const timeCreated = new Date().toLocaleDateString('en-US', options);
      const newReview: RatingModel = {
        uid: userDoc.uid,
        rating,
        review: reviewText,
        fullname: userDoc.fullname || 'Anonymous Customer',
        profilePicture: userDoc.userPic || '',
        timeCreated,
      };

      if (existing) {
        setReviews((prev) => prev.map((r) => (r.uid === userDoc.uid ? newReview : r)));
      } else {
        setReviews((prev) => [newReview, ...prev]);
      }

      const diff = rating - oldRating;
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              totalNumberOfUserRating: existing
                ? prev.totalNumberOfUserRating
                : (prev.totalNumberOfUserRating || 0) + 1,
              totalRating: (prev.totalRating || 0) + diff,
            }
          : prev
      );
    },
    [firebaseUser, userDoc, product, reviews, router]
  );

  // Review Deletion
  const handleDeleteReview = useCallback(async () => {
    if (!userDoc || !product) return;
    const existing = reviews.find((r) => r.uid === userDoc.uid);
    if (!existing) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    await deleteProductReview(product.uid, userDoc.uid, existing.rating);
    setReviews((prev) => prev.filter((r) => r.uid !== userDoc.uid));
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            totalNumberOfUserRating: Math.max(0, (prev.totalNumberOfUserRating || 1) - 1),
            totalRating: Math.max(0, (prev.totalRating || 0) - existing.rating),
          }
        : prev
    );
  }, [userDoc, product, reviews]);

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF7F2] px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D1508] mb-3">
            Product Not Found
          </h2>
          <p className="text-sm text-[#65544A] mb-6">
            The culinary delicacy you are looking for is currently unavailable.
          </p>
          <Link
            href="/products"
            className="px-6 py-3 rounded-xl bg-[#733617] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5A290F] transition shadow-sm"
          >
            Explore All Products
          </Link>
        </div>
      </PageShell>
    );
  }

  const galleryImages = [product.image1, product.image2, product.image3].filter(Boolean) as string[];

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* ── 1. Breadcrumbs ── */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-6 font-medium flex-wrap">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <Link
              href={`/categories/${encodeURIComponent(product.category || 'all')}`}
              className="hover:text-[#733617] transition-colors uppercase tracking-wider"
            >
              {product.category || 'Shop'}
            </Link>
            {product.subCategory && (
              <>
                <span className="text-[#B5A599]">&gt;</span>
                <span className="text-[#65544A] uppercase tracking-wider">
                  {product.subCategory}
                </span>
              </>
            )}
            <span className="text-[#B5A599]">&gt;</span>
            <span className="text-[#733617] font-semibold truncate max-w-[220px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* ── 2. Top Hero Section (Image Gallery + Purchase Controls) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8">
            {/* Left: Interactive Image Gallery (6 cols) */}
            <div className="lg:col-span-6 w-full">
              <ProductImageGallery
                images={galleryImages}
                productName={product.name}
                discountPercent={product.percantageDiscount || 0}
                isBestseller={
                  product.isBestseller !== undefined
                    ? Boolean(product.isBestseller)
                    : Boolean(
                        (product.totalNumberOfUserRating && product.totalNumberOfUserRating > 0) ||
                          product.percantageDiscount > 0
                      )
                }
              />
            </div>

            {/* Right: Purchase Controls (6 cols) */}
            <div className="lg:col-span-6 w-full">
              <ProductPurchaseSection
                product={product}
                units={units}
                selectedUnit={selectedUnit}
                onSelectUnit={setSelectedUnit}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                adding={adding}
                added={added}
                isWishlisted={isWishlisted}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>
          </div>

          {/* ── 3. Delivery Pincode Verification Card ── */}
          <ProductDeliveryPincodeCard />

          {/* ── 4. Trust Badges Strip (4 Pillars) ── */}
          <ProductTrustStrip />

          {/* ── 5. Dynamic Info Tabs (About, Ingredients, Nutrition, Allergens, Storage) + "Perfect For" Sidebar ── */}
          <ProductInfoTabs product={product} />

          {/* ── 6. Customer Ratings & Reviews Section with Write Review Modal ── */}
          <ProductReviewsSection
            productId={product.uid}
            reviews={reviews}
            totalRating={product.totalRating || 0}
            ratingCount={product.totalNumberOfUserRating || 0}
            currentUser={userDoc}
            onSubmitReview={handleReviewSubmit}
            onDeleteReview={handleDeleteReview}
          />

          {/* ── 7. "Complete Your Falguni Box" (Live Complementary Combo Bundle) ── */}
          <CompleteYourBoxCombo
            currentProduct={product}
            complementaryProducts={complementaryProducts}
            onAddComboToCart={handleAddCombo}
          />

          {/* ── 8. "You may also love" (Real Category Related Products Carousel) ── */}
          <RelatedProductsCarousel
            products={relatedProducts}
            onQuickAdd={handleQuickAdd}
          />

          {/* ── 9. "Made with the Falguni Touch" Heritage Showcase ── */}
          <ProductHeritageBanner productImage={product.image1} />
        </div>

        {/* ── 10. Sticky Bottom Action Bar (when scrolled) ── */}
        <ProductStickyBottomBar
          product={product}
          activeUnit={activeUnit}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          adding={adding}
          added={added}
        />
      </div>
    </PageShell>
  );
}
