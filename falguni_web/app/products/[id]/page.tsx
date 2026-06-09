'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/firestore';
import { addToCart, updateCartItem } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';
import type { ProductsModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageShell from '@/components/layout/PageShell';
import { ChevronLeft, Star, ShoppingCart, Heart, Share2, Minus, Plus, ChevronRight, ShieldCheck, Truck, Sparkles, Leaf } from 'lucide-react';
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

  // Extract 'Ingredients: ' from the description and parse it intelligently
  const parsedDesc = useMemo(() => {
    if (!product?.description) return { text: '', ingredients: [] };
    const desc = product.description;
    const splitMatch = desc.match(/(?:ingredients|ingridients)\s*[:\-]+\s*/i);
    if (!splitMatch) return { text: desc, ingredients: [] };
    
    const splitIndex = desc.search(/(?:ingredients|ingridients)\s*[:\-]+\s*/i);
    const textBefore = desc.slice(0, splitIndex).trim();
    const afterSplit = desc.slice(splitIndex + splitMatch[0].length).trim();
    
    // Assume ingredients block ends at a double newline, otherwise take the rest of the string
    const doubleNewlineIdx = afterSplit.indexOf('\n\n');
    let ingredientsString = afterSplit;
    let textAfter = '';
    
    if (doubleNewlineIdx !== -1) {
      ingredientsString = afterSplit.slice(0, doubleNewlineIdx);
      textAfter = afterSplit.slice(doubleNewlineIdx).trim();
    }
    
    // Split into pills by comma, newline, 'and', or period-followed-by-space (protects decimals like 25.54%)
    const ingredientsList = ingredientsString
      .split(/,|\n|\band\b|\.\s+/i)
      .map(s => s.trim().replace(/\.$/, ''))
      .filter(s => s.length > 0 && s.length < 80); // remove empty or massive paragraphs
      
    const combinedText = [textBefore, textAfter].filter(Boolean).join('\n\n');
    
    return { text: combinedText, ingredients: ingredientsList };
  }, [product?.description]);

  if (loading) return <PageShell><div className="py-32 flex justify-center"><LoadingSpinner /></div></PageShell>;
  if (!product) return <PageShell><div className="text-center py-32 text-white/50 font-serif text-2xl">Product not found.</div></PageShell>;

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
    const existing = useCartStore.getState().items.find(i => i.cartDocId === docId);
    
    if (existing) {
      const newQty = (existing.quantity || 1) + quantity;
      await updateCartItem(firebaseUser.uid, docId, {
        quantity: newQty,
        price: (activeUnit?.price ?? 0) * newQty,
      });
    } else {
      await addToCart(firebaseUser.uid, {
        ...product,
        selected: selectedUnit,
        selectedPrice: activeUnit?.price,
        price: (activeUnit?.price ?? 0) * quantity,
        quantity,
        cartDocId: docId,
      }, docId);
    }
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <PageShell>
      <div className="relative min-h-screen bg-[#2B1B17] pb-32">
        
        {/* Ambient Background Glow from Product Image */}
        {images[currentImage] && (
          <div className="absolute top-0 left-0 w-full h-[600px] z-0 overflow-hidden pointer-events-none">
            <Image src={images[currentImage]} alt="ambient" fill className="object-cover blur-[120px] opacity-[0.15] scale-150 saturate-150" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2B1B17]/80 to-[#2B1B17]" />
          </div>
        )}

        {/* ── Top Controls: Back, Breadcrumbs, Actions ── */}
        <div className="absolute top-6 left-5 right-5 md:top-8 md:left-8 md:right-8 z-40 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/20 transition-all bg-[#2B1B17]/50 backdrop-blur-md shadow-lg">
              <ChevronLeft size={16} />
            </div>
            <span className="font-bold tracking-widest uppercase text-[10px] hidden sm:block mt-0.5">Back</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 bg-[#2B1B17]/50 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md shadow-lg">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-white/20" />
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <ChevronRight size={12} className="text-white/20" />
            <Link href={`/categories/${product.category}`} className="hover:text-white transition-colors">{product.category}</Link>
            <ChevronRight size={12} className="text-white/20" />
            <span className="text-[#D4AF37] truncate max-w-[200px]">{product.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all bg-[#2B1B17]/50 backdrop-blur-md shadow-lg">
              <Heart size={14} />
            </button>
            <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all bg-[#2B1B17]/50 backdrop-blur-md shadow-lg">
              <Share2 size={14} />
            </button>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pt-24 md:pt-32">

          {/* Main Product Layout */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

            {/* ── Left: Image Gallery ── */}
            <div className="w-full lg:w-1/2 flex-shrink-0 animate-fade-up">
              
              {/* Massive Main Image Frame */}
              <div className="relative w-full aspect-[4/5] md:aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#2B1B17] border border-white/10 shadow-2xl mb-4 group flex items-center justify-center">
                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
                
                {images[currentImage] ? (
                  <Image
                    src={images[currentImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-contain p-8 md:p-12 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🛍</div>
                )}

              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 mb-8">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        i === currentImage
                          ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                          : 'border-white/10 hover:border-white/30 hover:bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description Section (Desktop left column, Mobile stacked) */}
              {product.description && (
                <div className="p-6 md:p-8 rounded-[2rem] bg-[#2B1B17] border border-white/10 shadow-xl mt-4 lg:mt-8">
                  <h3 className="text-xs font-bold text-white/70 tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#D4AF37]" /> About this product
                  </h3>
                  
                  {parsedDesc.text && (
                    <p className="text-sm md:text-base text-white/60 leading-loose whitespace-pre-line font-medium">
                      {parsedDesc.text}
                    </p>
                  )}

                  {parsedDesc.ingredients.length > 0 && (
                    <div className={`${parsedDesc.text ? 'mt-6 pt-6 border-t border-white/5' : ''}`}>
                      <h4 className="text-[10px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                        <Leaf size={14} /> Key Ingredients
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {parsedDesc.ingredients.map((ing, idx) => (
                          <span 
                            key={idx} 
                            className="px-4 py-2 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-white/80 text-xs font-bold tracking-wide shadow-inner"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: Product Info ── */}
            <div className="w-full lg:w-1/2 flex flex-col pt-2 lg:pt-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                {product.percantageDiscount > 0 && (
                  <span className="px-4 py-1.5 bg-[#D4AF37] text-[#1a100e] rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {product.percantageDiscount}% OFF
                  </span>
                )}
                {product.endFlash && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-1">
                    <Sparkles size={10} /> Flash Sale
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6 drop-shadow-md">
                {product.name}
              </h1>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Array.from(new Set([product.category, product.subCategory, product.subSubCategory].filter(Boolean)))
                  .map(tag => (
                    <Link
                      key={tag}
                      href={`/categories/${encodeURIComponent(tag)}`}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
                    >
                      {tag}
                    </Link>
                  ))}
              </div>

              {/* Rating */}
              {product.totalNumberOfUserRating > 0 && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} fill={s <= Math.round(rating) ? '#D4AF37' : 'transparent'} className={s <= Math.round(rating) ? 'text-[#D4AF37]' : 'text-white/10'} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white/50 tracking-wide">
                    {rating.toFixed(1)} <span className="opacity-50 mx-1">|</span> {product.totalNumberOfUserRating} REVIEWS
                  </span>
                </div>
              )}

              {/* Price Block */}
              {activeUnit && (
                <div className="flex items-end gap-4 mb-10 pb-10 border-b border-white/10">
                  <span className="text-4xl md:text-5xl font-black text-[#D4AF37] tracking-tight">
                    ₹{activeUnit.price}
                  </span>
                  {activeUnit.oldPrice > 0 && activeUnit.oldPrice > activeUnit.price && (
                    <div className="flex flex-col pb-1">
                      <span className="text-lg text-white/40 line-through font-medium">₹{activeUnit.oldPrice}</span>
                      <span className="text-xs font-bold text-green-400 tracking-wider uppercase">
                        Save ₹{activeUnit.oldPrice - activeUnit.price}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Unit Selector */}
              {units.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-white/70 tracking-[0.15em] uppercase">Select Option</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {units.map(u => (
                      <button
                        key={u.key}
                        onClick={() => setSelectedUnit(u.key)}
                        className={`px-5 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 border-2 ${
                          selectedUnit === u.key
                            ? 'bg-[#D4AF37] text-[#2B1B17] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105'
                            : 'bg-[#2B1B17] text-white/70 border-white/10 hover:border-[#D4AF37]/50 hover:text-white'
                        }`}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Row */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-10">
                {/* Quantity Control */}
                <div className="flex items-center justify-between bg-[#2B1B17] border border-white/10 rounded-2xl h-14 px-2 w-full sm:w-36">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition">
                    <Minus size={16} />
                  </button>
                  <span className="text-base font-black text-white w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-xl ${
                    added
                      ? 'bg-green-500 text-white shadow-green-500/20'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-[#2B1B17] hover:shadow-[#D4AF37]/30 hover:scale-[1.02]'
                  } disabled:opacity-60 disabled:hover:scale-100`}
                >
                  <ShoppingCart size={18} />
                  {adding ? 'Adding...' : added ? 'ADDED TO CART' : 'Add to Cart'}
                </button>
              </div>

              {/* Premium Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#2B1B17]/50 border border-white/5">
                  <ShieldCheck size={24} className="text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white tracking-wide">100% Authentic</span>
                    <span className="text-[10px] text-white/50 tracking-wider">Premium Quality</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#2B1B17]/50 border border-white/5">
                  <Truck size={24} className="text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white tracking-wide">Fast Delivery</span>
                    <span className="text-[10px] text-white/50 tracking-wider">Secure Packaging</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
