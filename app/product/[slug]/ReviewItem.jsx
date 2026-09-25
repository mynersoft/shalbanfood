import React from 'react';
import { Star, Check, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

const ReviewItem = ({ review, onEdit, onDelete }) => {
  const isOwnReview = false; // You would get this from auth context

  return (
    <div className="border-b pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center">
              <h4 className="font-medium text-gray-900">{review.userName}</h4>
              {review.isVerifiedPurchase && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwnReview && (
          <div className="relative">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            {/* Dropdown menu for edit/delete would go here */}
          </div>
        )}
      </div>

      {/* Comment */}
      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <ImageIcon className="w-4 h-4 mr-2" />
            {review.images.length} photo{review.images.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Open lightbox modal
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Badge (for admin) */}
      {review.status !== 'approved' && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
          review.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }">
          {review.status === 'pending' ? 'Pending Approval' : 'Rejected'}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;