'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ArrowLeft, CheckCircle, Loader2, Search, Flag, Star, XCircle, User, Package, ThumbsUp, Clock } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Review {
  id: string;
  productId: string;
  userId: string;
  text: string;
  rating: number;
  sentimentLabel: string;
  sentimentScore: number;
  isFlagged: boolean;
  isApproved: boolean;
  flagReasons: string[];
  timestamp: string;
  productName?: string;
  userName?: string;
  userEmail?: string;
}

export default function ReviewModerationPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending' | 'approved'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [userMap, setUserMap] = useState<Record<string, { name: string; email: string }>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Get all products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products: Record<string, string> = {};
      productsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        products[doc.id] = data.name || 'Unknown Product';
      });
      setProductMap(products);

      // 2. Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: Record<string, { name: string; email: string }> = {};
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        users[doc.id] = {
          name: data.displayName || 'Anonymous User',
          email: data.email || 'No email'
        };
      });
      setUserMap(users);

      // 3. Get all reviews
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const reviewList = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isApproved: doc.data().isApproved || false,
      })) as Review[];
      
      // 4. Filter out dummy/test reviews
      const originalReviews = reviewList.filter(review => {
        const text = review.text?.toLowerCase() || '';
        return !text.includes('dummy') && 
               !text.includes('test') && 
               !text.includes('validation') &&
               !text.includes('sample') &&
               !text.includes('example') &&
               !text.includes('fake');
      });
      
      // 5. Enhance reviews with product and user names
      const enhancedReviews = originalReviews.map(review => ({
        ...review,
        productName: products[review.productId] || `Unknown Product`,
        userName: users[review.userId]?.name || `Unknown User`,
        userEmail: users[review.userId]?.email || 'No email',
      }));
      
      setReviews(enhancedReviews);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      await updateDoc(doc(db, 'reviews', reviewId), {
        isFlagged: false,
        isApproved: true,
        moderatedAt: new Date().toISOString(),
        moderatedBy: 'admin'
      });
      await fetchData();
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlag = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      await updateDoc(doc(db, 'reviews', reviewId), {
        isFlagged: true,
        isApproved: false,
        flaggedAt: new Date().toISOString(),
        flaggedBy: 'admin'
      });
      await fetchData();
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Failed to flag review. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      setActionLoading(reviewId);
      await deleteDoc(doc(db, 'reviews', reviewId));
      await fetchData();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (filter) {
      case 'all':
        matchesFilter = true;
        break;
      case 'pending':
        matchesFilter = !review.isFlagged && !review.isApproved;
        break;
      case 'approved':
        matchesFilter = review.isApproved && !review.isFlagged;
        break;
      case 'flagged':
        matchesFilter = review.isFlagged;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getSentimentColor = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'positive': return 'bg-success/10 text-success border-success/20';
      case 'negative': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} className={`w-3.5 h-3.5 ${i < (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
      );
    }
    return stars;
  };

  // Get counts for each status
  const pendingCount = reviews.filter(r => !r.isFlagged && !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved && !r.isFlagged).length;
  const flaggedCount = reviews.filter(r => r.isFlagged).length;

  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 sm:pt-24 lg:pt-28">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">Review Moderation</h1>
              <p className="text-sm text-text-secondary">Moderate flagged reviews</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'all' 
                ? 'bg-primary text-white border-primary' 
                : 'bg-card border-border hover:border-primary'
            }`}
          >
            <p className="text-xl font-bold">{reviews.length}</p>
            <p className="text-xs opacity-80">All</p>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'pending' 
                ? 'bg-warning text-white border-warning' 
                : 'bg-card border-border hover:border-warning'
            }`}
          >
            <p className="text-xl font-bold">{pendingCount}</p>
            <p className="text-xs opacity-80">Pending</p>
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'approved' 
                ? 'bg-success text-white border-success' 
                : 'bg-card border-border hover:border-success'
            }`}
          >
            <p className="text-xl font-bold">{approvedCount}</p>
            <p className="text-xs opacity-80">Approved</p>
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === 'flagged' 
                ? 'bg-danger text-white border-danger' 
                : 'bg-card border-border hover:border-danger'
            }`}
          >
            <p className="text-xl font-bold">{flaggedCount}</p>
            <p className="text-xs opacity-80">Flagged</p>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary">Loading reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="text-text-primary font-medium">No reviews found</p>
            <p className="text-text-secondary text-sm mt-1">
              {filter === 'pending' && 'All reviews have been moderated'}
              {filter === 'approved' && 'No approved reviews yet'}
              {filter === 'flagged' && 'No flagged reviews'}
              {filter === 'all' && 'No reviews available'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border border-border p-4 sm:p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  {/* Product & User */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-medium text-text-primary">{review.productName}</span>
                      </div>
                      <span className="text-text-secondary text-sm">•</span>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-text-secondary">{review.userName}</span>
                      </div>
                      {review.userEmail && review.userEmail !== 'No email' && (
                        <span className="text-xs text-text-secondary">({review.userEmail})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {review.isFlagged ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">
                          <Flag className="w-3 h-3" />
                          Flagged
                        </span>
                      ) : review.isApproved ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          <ThumbsUp className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating & Sentiment */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {renderStars(review.rating || 0)}
                      <span className="text-xs text-text-secondary ml-1">({review.rating || 0}/5)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSentimentColor(review.sentimentLabel)}`}>
                      {review.sentimentLabel || 'neutral'}
                    </span>
                    {review.sentimentScore !== undefined && (
                      <span className="text-xs text-text-secondary">
                        Score: {(review.sentimentScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-text-primary text-sm leading-relaxed">{review.text || 'No review text'}</p>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                    <span className="text-xs text-text-secondary">
                      {review.timestamp ? new Date(review.timestamp).toLocaleString() : 'N/A'}
                    </span>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {!review.isFlagged && !review.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            disabled={actionLoading === review.id}
                            className="px-3 py-1.5 bg-success text-white rounded-theme text-xs font-medium hover:bg-success/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleFlag(review.id)}
                            disabled={actionLoading === review.id}
                            className="px-3 py-1.5 bg-danger text-white rounded-theme text-xs font-medium hover:bg-danger/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Flag
                          </button>
                        </>
                      )}
                      {review.isApproved && !review.isFlagged && (
                        <button
                          onClick={() => handleFlag(review.id)}
                          disabled={actionLoading === review.id}
                          className="px-3 py-1.5 bg-danger text-white rounded-theme text-xs font-medium hover:bg-danger/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Flag
                        </button>
                      )}
                      {review.isFlagged && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading === review.id}
                          className="px-3 py-1.5 bg-success text-white rounded-theme text-xs font-medium hover:bg-success/80 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-1.5 bg-surface border border-border rounded-theme text-xs font-medium hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer Stats */}
        {filteredReviews.length > 0 && (
          <div className="mt-4 text-sm text-text-secondary">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </div>
        )}
      </div>
    </main>
  );
}