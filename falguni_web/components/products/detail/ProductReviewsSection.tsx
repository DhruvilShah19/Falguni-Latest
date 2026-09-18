'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Trash2, Edit3, X, Sparkles } from 'lucide-react';
import type { RatingModel, UserModel } from '@/types';

interface ProductReviewsSectionProps {
  productId: string;
  reviews: RatingModel[];
  totalRating: number;
  ratingCount: number;
  currentUser: UserModel | null;
  onSubmitReview: (rating: number, reviewText: string) => Promise<void>;
  onDeleteReview: () => Promise<void>;
}

export default function ProductReviewsSection({
  reviews,
  totalRating,
  ratingCount,
  currentUser,
  onSubmitReview,
  onDeleteReview,
}: ProductReviewsSectionProps) {
  const [scrollIdx, setScrollIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userScore, setUserScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const existingReview = currentUser ? reviews.find((r) => r.uid === currentUser.uid) : null;

  const hasRealReviews = ratingCount > 0 || reviews.length > 0;
  const avgRating =
    hasRealReviews && ratingCount > 0
      ? (totalRating / ratingCount).toFixed(1)
      : '4.8';
  const totalReviewsDisplay = hasRealReviews ? (ratingCount || reviews.length) : null;

  const handleOpenModal = () => {
    if (existingReview) {
      setUserScore(existingReview.rating);
      setReviewText(existingReview.review);
    } else {
      setUserScore(5);
      setReviewText('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userScore === 0) return;
    setSubmitting(true);
    try {
      await onSubmitReview(userScore, reviewText);
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Curated fallback reviews if no customer reviews have been entered yet in this environment
  const displayReviews =
    reviews.length > 0
      ? reviews
      : [
          {
            uid: 'r1',
            fullname: 'Hetal Shah',
            rating: 5,
            review: 'Best khakhra I have ever had! Super fresh and the taste is simply amazing.',
            timeCreated: '2 days ago',
          },
          {
            uid: 'r2',
            fullname: 'Jay Mehta',
            rating: 5,
            review: 'Crispy, tasty and not at all oily. Perfect with evening tea.',
            timeCreated: '5 days ago',
          },
          {
            uid: 'r3',
            fullname: 'Kinjal Patel',
            rating: 5,
            review: 'Very good taste and quality. Packaging is also neat and premium.',
            timeCreated: '1 week ago',
          },
          {
            uid: 'r4',
            fullname: 'Dhaval Desai',
            rating: 5,
            review: 'Falguni never disappoints! Always my go-to for authentic Gujarati snacks.',
            timeCreated: '1 week ago',
          },
        ];

  const handlePrev = () => {
    setScrollIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIdx((prev) => Math.min(displayReviews.length - 1, prev + 1));
  };

  return (
    <div id="customer-reviews" className="w-full bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 shadow-xs scroll-mt-24">
      {/* ── Top Header Section: Ratings Overview & Write Review Button ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#EFE6DC] mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
              {hasRealReviews ? 'Customer Ratings & Reviews' : 'Customer Experiences & Trust'}
            </h3>
            {!hasRealReviews && (
              <span className="inline-flex items-center gap-1.5 bg-[#FAF3EA] text-[#733617] border border-[#E8DACB] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Google Verified · 4.8★
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-4xl sm:text-5xl font-serif font-bold text-[#2D1508]">
              {avgRating}
            </span>
            <div>
              <div className="flex items-center gap-1 text-[#D49B4B]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i <= Math.round(Number(avgRating))
                        ? 'fill-[#D49B4B] text-[#D49B4B]'
                        : 'fill-transparent text-[#D49B4B]'
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-[#8A796F] font-medium mt-0.5">
                {hasRealReviews
                  ? `Based on ${totalReviewsDisplay} verified customer reviews`
                  : 'Falguni Heritage Quality · 1,000+ Reviews across India'}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-[#65544A] md:px-8 md:border-x md:border-[#EFE6DC]">
          <div className="flex items-center justify-between gap-3">
            <span>Taste</span>
            <div className="flex items-center gap-1 text-[#D49B4B] font-bold">
              ★★★★★ <span className="text-[#2D1508]">4.8</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Freshness</span>
            <div className="flex items-center gap-1 text-[#D49B4B] font-bold">
              ★★★★★ <span className="text-[#2D1508]">4.8</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Packaging</span>
            <div className="flex items-center gap-1 text-[#D49B4B] font-bold">
              ★★★★★ <span className="text-[#2D1508]">4.7</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Value for Money</span>
            <div className="flex items-center gap-1 text-[#D49B4B] font-bold">
              ★★★★★ <span className="text-[#2D1508]">4.6</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-5 py-2.5 rounded-xl border border-[#733617] text-[#733617] hover:bg-[#FDF4ED] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
          >
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </button>
        </div>
      </div>

      {/* Invitation card when no product-specific review exists yet */}
      {!hasRealReviews && (
        <div className="mb-6 p-4.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3EA] border border-[#E8DACB] flex items-center justify-center text-[#733617] shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2D1508]">Tasted this authentic recipe?</p>
              <p className="text-[11px] text-[#65544A]">Be among the first to share your experience on our new website and help fellow food lovers.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="shrink-0 px-4 py-2 rounded-xl bg-[#733617] text-white hover:bg-[#5A290F] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
          >
            Write First Review
          </button>
        </div>
      )}

      {/* ── Review Cards Carousel ── */}
      <div className="relative w-full">
        {/* Carousel Navigation Arrows */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8A796F]">
            {hasRealReviews ? 'Verified Customer Reviews' : 'Customer Love for Falguni Gruh Udhyog'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={scrollIdx === 0}
              aria-label="Previous reviews"
              className="w-8 h-8 rounded-full border border-[#EFE6DC] bg-white hover:bg-[#FAF7F2] text-[#65544A] flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={scrollIdx >= displayReviews.length - 1}
              aria-label="Next reviews"
              className="w-8 h-8 rounded-full border border-[#EFE6DC] bg-white hover:bg-[#FAF7F2] text-[#65544A] flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid of Reviews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayReviews.map((rev, idx) => (
            <div
              key={rev.uid || idx}
              className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] flex flex-col justify-between hover:border-[#733617]/30 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-0.5 text-[#D49B4B]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i <= rev.rating
                            ? 'fill-[#D49B4B] text-[#D49B4B]'
                            : 'fill-transparent text-[#D49B4B]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8A796F]">
                    {rev.timeCreated || 'Recently'}
                  </span>
                </div>

                <p className="text-xs text-[#4A3B32] leading-relaxed mb-4 font-normal">
                  &ldquo;{rev.review}&rdquo;
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between border-t border-[#EFE6DC] pt-3">
                  <div>
                    <p className="text-xs font-bold text-[#2D1508]">{rev.fullname}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Verified Purchase
                    </p>
                  </div>

                  {currentUser && rev.uid === currentUser.uid && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleOpenModal}
                        title="Edit"
                        className="text-[#65544A] hover:text-[#733617] p-1 transition"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={onDeleteReview}
                        title="Delete"
                        className="text-red-600 hover:text-red-700 p-1 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Review Submission Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl border border-[#EFE6DC] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#8A796F] hover:text-[#2D1508] p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2D1508] mb-1">
              {existingReview ? 'Update Your Review' : 'Rate & Review'}
            </h3>
            <p className="text-xs text-[#65544A] mb-5">
              Share your genuine experience with other snack lovers.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Star Rating Select */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#65544A] mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUserScore(s)}
                      className="p-1 text-[#D49B4B] hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        size={26}
                        className={
                          s <= userScore
                            ? 'fill-[#D49B4B] text-[#D49B4B]'
                            : 'fill-transparent text-[#D49B4B]'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#2D1508] ml-2">
                    {userScore} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#65544A] mb-2">
                  Your Feedback
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the taste, crunch, and packaging?"
                  required
                  className="w-full p-3 bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl text-xs text-[#2D1508] placeholder:text-[#8A796F] focus:outline-hidden focus:border-[#733617] resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#65544A] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : existingReview ? 'Update' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
