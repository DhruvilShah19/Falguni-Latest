'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, getProductReviews, setProductReview, deleteProductReview } from '@/lib/firestore';
import { addToCart, updateCartItem } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';
import type { ProductsModel, RatingModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ShareButton from '@/components/ui/ShareButton';
import BackButton from '@/components/ui/BackButton';
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
  const { firebaseUser, userDoc } = useAuthStore();

  const [product, setProduct] = useState<ProductsModel | null>(null);
  const [reviews, setReviews] = useState<RatingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('unit1');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [isWritingReview, setIsWritingReview] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingReview = userDoc ? reviews.find(r => r.uid === userDoc.uid) : null;

  useEffect(() => {
    getProductById(id).then(p => { setProduct(p); setLoading(false); });
    getProductReviews(id).then(r => setReviews(r));
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

  const handleReviewSubmit = async () => {
    if (!firebaseUser || !userDoc) {
      router.push('/login');
      return;
    }
    if (userRating === 0) return;
    setSubmittingReview(true);
    try {
      const oldRating = existingReview ? existingReview.rating : 0;
      await setProductReview(id, userRating, userReviewText, userDoc, oldRating);
      
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const timeCreated = new Date().toLocaleDateString('en-US', options);
      const newReview: RatingModel = {
        uid: userDoc.uid,
        rating: userRating,
        review: userReviewText,
        fullname: userDoc.fullname || 'Anonymous',
        profilePicture: userDoc.userPic || '',
        timeCreated
      };
      
      if (existingReview) {
        setReviews(prev => prev.map(r => r.uid === userDoc.uid ? newReview : r));
      } else {
        setReviews(prev => [newReview, ...prev]);
      }
      
      setIsWritingReview(false);
      setUserRating(0);
      setUserReviewText('');
      
      if (product) {
        if (existingReview) {
          const diff = userRating - oldRating;
          setProduct({ ...product, totalRating: (product.totalRating || 0) + diff });
        } else {
          setProduct({ 
            ...product, 
            totalNumberOfUserRating: (product.totalNumberOfUserRating || 0) + 1, 
            totalRating: (product.totalRating || 0) + userRating 
          });
        }
      }
    } catch (e) {
      console.error("Error adding review", e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview || !userDoc) return;
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    
    setIsDeleting(true);
    try {
      await deleteProductReview(id, userDoc.uid, existingReview.rating);
      setReviews(prev => prev.filter(r => r.uid !== userDoc.uid));
      
      if (product) {
        setProduct({ 
          ...product, 
          totalNumberOfUserRating: Math.max(0, (product.totalNumberOfUserRating || 0) - 1), 
          totalRating: Math.max(0, (product.totalRating || 0) - existingReview.rating) 
        });
      }
    } catch (e) {
      console.error("Error deleting review", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const descriptionBlock = product.description ? (
    <div className="md:p-8 md:rounded-[2rem] md:bg-[#2B1B17] md:border border-white/10 md:shadow-xl mt-4 lg:mt-8">
      <h3 className="text-[10px] md:text-xs font-bold text-white/70 tracking-[0.2em] uppercase mb-3 md:mb-5 flex items-center gap-2">
        <Sparkles size={14} className="text-[#D4AF37] md:w-4 md:h-4" /> About this product
      </h3>
      
      {parsedDesc.text && (
        <p className="text-[13px] md:text-base text-white/60 leading-relaxed md:leading-loose whitespace-pre-line font-medium">
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
  ) : null;

  const ctaContent = (
    <>
      {/* Quantity Control */}
      <div className="flex items-center justify-between bg-[#2B1B17] border border-white/10 rounded-xl md:rounded-2xl h-14 md:h-16 px-2 md:px-3 w-28 md:w-36 flex-shrink-0">
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition">
          <Minus size={16} className="md:w-5 md:h-5" />
        </button>
        <span className="text-base md:text-lg font-black text-white w-6 md:w-8 text-center">{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition">
          <Plus size={16} className="md:w-5 md:h-5" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={adding}
        className={`flex-1 flex items-center justify-center gap-2 md:gap-3 h-14 md:h-16 rounded-xl md:rounded-2xl font-bold text-sm md:text-base tracking-widest uppercase transition-all duration-300 shadow-lg md:shadow-xl ${
          added
            ? 'bg-green-500 text-white shadow-green-500/20'
            : 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-[#2B1B17] hover:shadow-[#D4AF37]/30 hover:scale-[1.02]'
        } disabled:opacity-60 disabled:hover:scale-100`}
      >
        <ShoppingCart size={18} className="md:w-[22px] md:h-[22px]" />
        {adding ? 'Adding...' : added ? 'ADDED TO CART' : 'Add to Cart'}
      </button>
    </>
  );

  const reviewsBlock = (
    <div className="mt-6 md:mt-8 mb-8 pt-6 md:pt-8 border-t border-white/5 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h3 className="text-sm md:text-base font-bold text-[#D4AF37] tracking-[0.15em] uppercase flex items-center gap-2">
          <Star size={16} fill="currentColor" /> Customer Reviews ({reviews.length})
        </h3>
        {!isWritingReview && !existingReview && (
          <button 
            onClick={() => {
              if (!firebaseUser) router.push('/login');
              else setIsWritingReview(true);
            }}
            className="self-start md:self-auto px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs md:text-sm font-bold tracking-widest uppercase transition-all shadow-lg"
          >
            Write a Review
          </button>
        )}
      </div>

      {isWritingReview && (
        <div className="mb-8 p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.08)] animate-fade-up backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
          
          <h4 className="text-sm md:text-base font-black text-white mb-6 tracking-widest uppercase flex items-center gap-2">
            <Sparkles size={18} className="text-[#D4AF37]" /> Rate & Review
          </h4>
          
          <div className="flex gap-2.5 mb-8">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setUserRating(star)} className="focus:outline-none transition-transform hover:scale-125">
                <Star size={28} className={star <= userRating ? 'text-[#D4AF37] fill-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'text-white/10 fill-white/5'} />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="text-[10px] md:text-xs font-bold text-white/50 tracking-[0.2em] uppercase mb-3 block">Quick Select</label>
            <div className="flex flex-wrap gap-2.5">
              {["Amazing Quality ✨", "Highly Recommended 🔥", "Fast Delivery 📦", "Value for Money 💰", "Smells Incredible 🌸", "Perfect! 🎯"].map(pill => (
                <button
                  key={pill}
                  onClick={() => setUserReviewText(prev => prev ? `${prev} ${pill}` : pill)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 text-white/80 hover:text-white text-[10px] md:text-xs font-semibold tracking-wide transition-all duration-300 shadow-inner"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={userReviewText}
            onChange={(e) => setUserReviewText(e.target.value)}
            placeholder="Write your review here..."
            className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/60 mb-6 placeholder:text-white/30 min-h-[120px] backdrop-blur-md shadow-inner transition-all"
          />

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIsWritingReview(false)}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold tracking-widest uppercase transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleReviewSubmit}
              disabled={submittingReview || userRating === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-[#2B1B17] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {reviews.map((rev, idx) => (
            <div key={rev.uid || idx} className="p-5 md:p-6 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-xl backdrop-blur-md transition-all hover:bg-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    {rev.profilePicture ? (
                      <Image src={rev.profilePicture} alt={rev.fullname} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-sm md:text-base font-bold">
                        {rev.fullname?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-white mb-1 tracking-wide">{rev.fullname || 'Anonymous'}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-[2px]">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={10} className={s <= Math.round(rev.rating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-white/10 fill-transparent'} />
                        ))}
                      </div>
                      {rev.timeCreated && <span className="text-[9px] md:text-[10px] text-white/40 font-medium tracking-wider">{rev.timeCreated}</span>}
                    </div>
                  </div>
                </div>
                {userDoc && rev.uid === userDoc.uid && !isWritingReview && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setUserRating(rev.rating); setUserReviewText(rev.review); setIsWritingReview(true); }} className="text-[10px] md:text-xs text-[#D4AF37] hover:text-white uppercase tracking-wider font-bold transition-colors">Edit</button>
                    <button disabled={isDeleting} onClick={handleDeleteReview} className="text-[10px] md:text-xs text-red-400/80 hover:text-red-400 uppercase tracking-wider font-bold transition-colors">{isDeleting ? '...' : 'Delete'}</button>
                  </div>
                )}
              </div>
              <p className="text-[13px] md:text-sm text-white/70 leading-relaxed font-medium">
                {rev.review}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !isWritingReview && (
          <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/50 text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        )
      )}
    </div>
  );

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

        {/* Floating Top Nav for Product Image */}
        <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex items-center justify-between z-50 pointer-events-none">
          <BackButton />

          <div className="hidden lg:flex pointer-events-auto items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 bg-[#2B1B17]/50 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md shadow-lg">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-white/20" />
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <ChevronRight size={12} className="text-white/20" />
            <Link href={`/categories/${product.category}`} className="hover:text-white transition-colors">{product.category}</Link>
            <ChevronRight size={12} className="text-white/20" />
            <span className="text-[#D4AF37] truncate max-w-[200px]">{product.name}</span>
          </div>
          
          <div className="pointer-events-auto flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-red-400 bg-black/30 backdrop-blur-md shadow-lg hover:bg-black/50 transition-all">
              <Heart size={18} strokeWidth={2.5} className="md:w-4 md:h-4" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-white bg-black/30 backdrop-blur-md shadow-lg hover:bg-black/50 transition-all">
              <Share2 size={18} strokeWidth={2.5} className="md:w-4 md:h-4 pr-0.5" />
            </button>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-5 lg:px-8 pt-1 md:pt-12 lg:pt-16">

          {/* Main Product Layout */}
          <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:gap-16">

            {/* ── Left: Image Gallery ── */}
            <div className="w-full lg:w-1/2 flex-shrink-0 animate-fade-up flex flex-col">
              
              {/* Massive Main Image Frame */}
              <div className="relative aspect-[5/4] md:aspect-[4/3] md:rounded-[2rem] overflow-hidden bg-[#2B1B17] border-b md:border border-white/10 shadow-2xl mb-3 md:mb-4 group flex items-center justify-center -mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-full">
                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none z-10" />
                
                {images[currentImage] ? (
                  <Image
                    src={images[currentImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🛍</div>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex justify-center md:justify-start gap-3 overflow-x-auto scrollbar-hide py-2 mb-4 md:mb-8">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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

              {/* Description Section (Desktop only here) */}
              <div className="hidden lg:block">
                {descriptionBlock}
              </div>
            </div>

            {/* ── Right: Product Info ── */}
            <div className="w-full lg:w-1/2 flex flex-col pt-0 md:pt-2 lg:pt-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              
              {/* Mobile Breadcrumb Path */}
              <div className="flex lg:hidden items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 w-max mb-4 backdrop-blur-sm shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
                <Link href="/" className="hover:text-[#D4AF37] transition-colors shrink-0">Home</Link>
                <ChevronRight size={10} className="text-white/20 shrink-0" />
                <Link href="/categories" className="hover:text-[#D4AF37] transition-colors shrink-0">Categories</Link>
                <ChevronRight size={10} className="text-white/20 shrink-0" />
                <Link href={`/categories/${product.category}`} className="text-[#D4AF37] hover:text-white transition-colors truncate max-w-[150px] shrink-0">{product.category}</Link>
              </div>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-2 md:mb-4">
                {Array.from(new Set([product.category, product.subCategory, product.subSubCategory].filter(Boolean)))
                  .map(tag => (
                    <Link
                      key={tag}
                      href={`/categories/${encodeURIComponent(tag)}`}
                      className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase hover:text-white transition-all"
                    >
                      {tag}
                    </Link>
                  ))}
              </div>

              {/* Title */}
              <h1 className="font-serif text-[28px] md:text-5xl lg:text-6xl text-white leading-tight md:leading-[1.1] mb-2 md:mb-6 drop-shadow-md">
                {product.name}
              </h1>

              {/* Price, Rating & Actions Row */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/5">
                <div className="flex flex-col gap-3 md:gap-4">
                  {/* Price */}
                  {activeUnit && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        ₹{activeUnit.price}
                      </span>
                      {activeUnit.oldPrice > 0 && activeUnit.oldPrice > activeUnit.price && (
                        <span className="text-sm md:text-lg text-white/40 line-through font-medium">₹{activeUnit.oldPrice}</span>
                      )}
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={`md:w-4 md:h-4 ${product.totalNumberOfUserRating > 0 && s <= Math.round(rating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-white/10 fill-transparent'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-white/80 tracking-widest whitespace-nowrap">
                      {product.totalNumberOfUserRating > 0 ? `${product.totalNumberOfUserRating} REVIEWS` : 'NEW'}
                    </span>
                  </div>
                </div>

                {/* Mobile Like & Share */}
                <div className="flex md:hidden items-center gap-2 mt-1">
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-red-400 bg-[#2B1B17]/50 border border-white/5 shadow-sm transition-all">
                    <Heart size={18} strokeWidth={2} />
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-[#2B1B17]/50 border border-white/5 shadow-sm transition-all">
                    <Share2 size={18} strokeWidth={2} className="pr-0.5" />
                  </button>
                </div>
              </div>

              {/* Unit Selector */}
              {units.length > 0 && (
                <div className="mb-6 md:mb-10">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <p className="text-[10px] md:text-xs font-bold text-white/70 tracking-[0.15em] uppercase">Select Option</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 md:gap-3">
                    {units.map(u => (
                      <button
                        key={u.key}
                        onClick={() => setSelectedUnit(u.key)}
                        className={`px-4 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-300 border-2 ${
                          selectedUnit === u.key
                            ? 'bg-[#D4AF37] text-[#2B1B17] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105'
                            : 'bg-[#2B1B17] text-white/70 border-white/10 hover:border-[#D4AF37]/50 hover:text-white'
                        }`}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Row (Desktop Only here) */}
              <div className="hidden md:flex flex-row items-center gap-4 mb-10">
                {ctaContent}
              </div>

              {/* Description Section (Mobile only here, sits directly under options) */}
              <div className="block lg:hidden mb-10">
                {descriptionBlock}
              </div>

              {/* Premium Trust Badges */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-10">
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#2B1B17]/50 border border-white/5">
                  <ShieldCheck size={20} className="md:w-6 md:h-6 text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-bold text-white tracking-wide">100% Authentic</span>
                    <span className="text-[9px] md:text-[10px] text-white/50 tracking-wider">Premium Quality</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#2B1B17]/50 border border-white/5">
                  <Truck size={20} className="md:w-6 md:h-6 text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-bold text-white tracking-wide">Fast Delivery</span>
                    <span className="text-[9px] md:text-[10px] text-white/50 tracking-wider">Secure Packaging</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Full Width Reviews Section */}
          {reviewsBlock}
          
        </div>
      </div>

      {/* Quantity & CTA Row (Sticky on Mobile, explicitly outside transformed containers) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[40] p-4 pt-3 pb-6 bg-[#1A110D] border-t border-[#D4AF37]/20 flex flex-row items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {ctaContent}
      </div>
    </PageShell>
  );
}
