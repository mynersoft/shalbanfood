import React, { useState } from 'react';
import ReviewStats from './ReviewStats';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { useProductReviews } from '../hooks/useReviews';

const ProductReviewsSection = ({ productId, user }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { data } = useProductReviews(productId);

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div>
          <ReviewStats stats={data?.stats} />
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews Column */}
        <div className="lg:col-span-2">
          {showReviewForm ? (
            <ReviewForm
              productId={productId}
              userId={user.id}
              userName={user.name}
              userAvatar={user.avatar}
              onSuccess={() => setShowReviewForm(false)}
            />
          ) : (
            <ReviewList productId={productId} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviewsSection;