import React from 'react';
import { Star } from 'lucide-react';

const ReviewStats = ({ stats }) => {
  if (!stats) return null;

  const { averageRating, totalReviews, ratingDistribution } = stats;

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center">
            <div className="text-4xl font-bold text-gray-900 mr-3">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : star - 0.5 <= averageRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0;
          const percentage = getPercentage(count);
          
          return (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm text-gray-600 w-4">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 ml-1" />
              </div>
              <div className="flex-1 ml-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 w-12 ml-3 text-right">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewStats;