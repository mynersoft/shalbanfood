'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OrderPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pageNumbers.push(i);
        }
        if (totalPages > maxVisiblePages) {
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
        <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{totalItems}</span> orders
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          {renderPageNumbers().map((pageNum, index) =>
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OrderPagination;