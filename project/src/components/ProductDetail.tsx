'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/commerce/StoreProvider';
import { canUserReviewProduct } from '@/lib/order-service';
import { Star, ArrowLeft, ShoppingBag, Heart, Sparkles, MessageCircle, Send, Loader2, Shield, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface Review {
  id: string;
  productId: string;
  userName: string;
  text: string;
  starRating: number;
  sentimentLabel: string;
  sentimentScore: number;
  credibilityWeight: number;
  isFlagged: boolean;
  flagReasons: string[];
  timestamp: string;
  isVerifiedPurchase?: boolean;
}

interface ProductDetailProps {
  product: any;
  reviews: Review[];
}

export function ProductDetail({ product, reviews }: ProductDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated, cart, wishlist, addToCart, addToWishlist } = useStore();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [canReview, setCanReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  const isInCart = cart.some((item: any) => item.id === product.id);
  const isInWishlist = wishlist.some((item: any) => item.id === product.id);

  // Check if user can review
  useEffect(() => {
    const checkPurchase = async () => {
      if (isAuthenticated && user) {
        const hasPurchased = await canUserReviewProduct(user.uid, product.id);
        setCanReview(hasPurchased);
      }
      setCheckingPurchase(false);
    };
    checkPurchase();
  }, [isAuthenticated, user, product.id]);

  const averageRating = localReviews.length > 0
    ? localReviews.reduce((acc, r) => acc + r.starRating, 0) / localReviews.length
    : product.rating || 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Please sign in to write a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Authentication required.');
      await currentUser.reload();
      if (!currentUser.emailVerified) throw new Error('Verify your email before submitting a review.');
      const idToken = await currentUser.getIdToken(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating,
          text: reviewText.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit review.');

      const newReview: Review = {
        id: result.id,
        productId: result.productId,
        userName: result.userName,
        text: result.text,
        starRating: result.starRating,
        sentimentLabel: result.sentimentLabel,
        sentimentScore: result.sentimentScore,
        credibilityWeight: result.credibilityWeight,
        isFlagged: result.isFlagged,
        flagReasons: result.flagReasons,
        timestamp: result.timestamp,
        isVerifiedPurchase: result.isVerifiedPurchase,
      };

      setLocalReviews([newReview, ...localReviews]);
      setSubmitSuccess(true);
      setRating(0);
      setReviewText('');

      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    const stars = [];
    const displayRating = interactive ? (hoverRating || rating) : rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-6 h-6 ${
            i <= displayRating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && setRating(i)}
        />
      );
    }
    return stars;
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center min-h-[300px]">
          <span className="text-8xl">{product.image || '📦'}</span>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{product.name}</h1>
            <p className="text-text-secondary mt-1">{product.category}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-text-secondary text-sm">
                ({localReviews.length} reviews)
              </span>
            </div>
          </div>

          <p className="text-text-secondary leading-relaxed">{product.description}</p>

          <div className="text-3xl font-bold text-primary">
            ₹{product.price?.toLocaleString()}
          </div>

          {product.combinedScore && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">
                Trust Score: {(product.combinedScore * 10).toFixed(0)}%
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => addToCart(product)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-theme font-medium transition-all hover:scale-105 ${
                isInCart
                  ? 'bg-success/10 text-success border border-success/30'
                  : 'bg-primary text-white hover:bg-primary-light'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={() => addToWishlist(product)}
              className={`p-3 rounded-theme border-2 transition-all hover:scale-105 ${
                isInWishlist
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border hover:border-primary'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-accent' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Customer Reviews
          <span className="text-sm font-normal text-text-secondary">
            ({localReviews.length} reviews)
          </span>
        </h2>

        {/* Review Eligibility */}
        {isAuthenticated && !checkingPurchase && (
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            {canReview ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">✅ You purchased this product - Write a verified review</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-text-secondary">
                <Shield className="w-5 h-5" />
                <span className="text-sm">📦 Purchase this product to write a verified review</span>
                <Link href="/checkout" className="text-primary hover:underline text-sm">
                  Buy Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Write Review - Only if user can review */}
        {isAuthenticated && canReview ? (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-text-primary mb-4">Write a Verified Review</h3>
            {submitSuccess && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm mb-4">
                ✅ Review submitted successfully! AI will analyze sentiment shortly.
              </div>
            )}
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">
                  Your Rating
                </label>
                <div className="flex gap-1">{renderStars(rating, true)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-3 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-[100px]"
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Verified Review
                  </>
                )}
              </button>
            </form>
          </div>
        ) : isAuthenticated && !canReview && !checkingPurchase ? (
          <div className="bg-card rounded-xl border border-border p-6 mb-8 text-center">
            <Shield className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary">Purchase this product to write a verified review.</p>
            <Link
              href="/checkout"
              className="inline-block mt-2 text-primary hover:underline"
            >
              Buy Now →
            </Link>
          </div>
        ) : !isAuthenticated ? (
          <div className="bg-card rounded-xl border border-border p-6 mb-8 text-center">
            <p className="text-text-secondary">
              Please <Link href="/login" className="text-primary hover:underline">sign in</Link> to write a review.
            </p>
          </div>
        ) : null}

        {/* Reviews List */}
        {localReviews.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-text-secondary">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localReviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex">{renderStars(review.starRating)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium text-text-primary">{review.userName}</p>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary">{formatDate(review.timestamp)}</span>
                </div>
                <p className="text-text-secondary mt-3">{review.text}</p>
                {review.sentimentLabel && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      review.sentimentLabel === 'positive'
                        ? 'bg-success/10 text-success'
                        : review.sentimentLabel === 'negative'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {review.sentimentLabel}
                    </span>
                    {review.sentimentScore > 0 && (
                      <span className="text-xs text-text-secondary">
                        Trust: {(review.sentimentScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}