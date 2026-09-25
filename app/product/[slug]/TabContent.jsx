'use client';
import { Check, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { useState } from 'react';



const TabContent = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  return (
    <div className="border-t border-gray-100">
      <div className="flex overflow-x-auto">
        {['description', 'specifications', 'reviews'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-semibold text-lg transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      <div className="p-8">
       

        {activeTab === 'description' && (
          <div className="">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Customer Reviews
              </h3>
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <MessageSquare className="w-5 h-5" />
                Write a Review
              </button>
            </div>

            {/* Display existing reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{review.avatar || '👤'}</div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {review.user || 'Anonymous'}
                            {review.verified && (
                              <span className="ml-2 text-blue-600 text-sm bg-blue-100 px-2 py-1 rounded-full">
                                ✓ Verified
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (review.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">
                              {review.date
                                ? new Date(review.date).toLocaleDateString()
                                : 'Recently'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {review.comment || 'No comment provided'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            )}

            <ReviewForm
              isOpen={showReviewForm}
              onClose={() => setShowReviewForm(false)}
              productId={product._id}
              productName={product.name}
              orderId="12345"
              customerName="John Doe"
              onReviewSubmit={(review) => {
                // Here you would typically update the product reviews
                // For now, just close the form
                setShowReviewForm(false);
                toast.success('Review submitted successfully!');
              }}
            />
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Specifications</h3>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{spec.icon || '📱'}</span>
                      <span className="font-semibold text-gray-700">
                        {spec.label || 'Feature'}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {spec.value || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specifications available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabContent;
