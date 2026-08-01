'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, Search, Flag, Star } from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Review {
  id: string;
  productId: string;
  userId: string;
  text: string;
  rating: number;
  sentimentLabel: string;
  isFlagged: boolean;
  flagReasons: string[];
  timestamp: string;
}

export default function ReviewModerationPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'reviews'));
      const reviewList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      setReviews(reviewList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, action: 'approve' | 'flag') => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        isFlagged: action === 'flag',
        moderatedAt: new Date().toISOString(),
      });
      // Refresh the list
      await fetchReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          review.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'flagged' && review.isFlagged) ||
                         (filter === 'pending' && !review.isFlagged);
    return matchesSearch && matchesFilter;
  });

  const getSentimentColor = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-lg hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Review Moderation</h1>
            <p className="text-text-secondary mt-1">Moderate flagged reviews</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-theme text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-card border border-border hover:bg-card/80'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-theme text-sm font-medium transition-colors ${
              filter === 'flagged' ? 'bg-danger text-white' : 'bg-card border border-border hover:bg-card/80'
            }`}
          >
            Flagged ({reviews.filter(r => r.isFlagged).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-theme text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-success text-white' : 'bg-card border border-border hover:bg-card/80'
            }`}
          >
            Pending ({reviews.filter(r => !r.isFlagged).length})
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
            className="input pl-10"
          />
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary">Loading reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="text-text-primary font-medium">No reviews found</p>
            <p className="text-text-secondary text-sm mt-1">All reviews are moderated</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-text-secondary">({review.rating || 0}/5)</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(review.sentimentLabel)}`}>
                        {review.sentimentLabel || 'neutral'}
                      </span>
                      {review.isFlagged && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">
                          <Flag className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-text-primary">{review.text || 'No review text'}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      User: {review.userId?.slice(0, 12)}... • {review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'N/A'}
                    </p>
                    {review.flagReasons && review.flagReasons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {review.flagReasons.map((reason, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-warning/10 text-warning rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {review.isFlagged ? (
                      <button
                        onClick={() => handleModerate(review.id, 'approve')}
                        className="px-4 py-2 bg-success text-white rounded-theme text-sm font-medium hover:bg-success/80 transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(review.id, 'flag')}
                        className="px-4 py-2 bg-danger text-white rounded-theme text-sm font-medium hover:bg-danger/80 transition-colors"
                      >
                        Flag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}