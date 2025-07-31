'use client';

import React, { useState } from 'react';
import PhoneCard from './PhoneCard';
import { SkeletonCard } from '@/components/UI';
import { Phone, PhoneSearchResponse } from '@/lib/api/client';

interface PhoneListProps {
  searchResponse: PhoneSearchResponse | null;
  loading?: boolean;
  onPhoneSelect?: (phoneId: number) => void;
  onPhoneCompare?: (phoneIds: number[]) => void;
  onViewDetails?: (phoneId: number) => void;
  selectedPhones?: number[];
  onPageChange?: (page: number) => void;
}

export default function PhoneList({
  searchResponse,
  loading = false,
  onPhoneSelect,
  onPhoneCompare,
  onViewDetails,
  selectedPhones = [],
  onPageChange
}: PhoneListProps) {
  const [localSelectedPhones, setLocalSelectedPhones] = useState<number[]>(selectedPhones);

  const handlePhoneSelection = (phoneId: number) => {
    const updatedSelection = localSelectedPhones.includes(phoneId)
      ? localSelectedPhones.filter(id => id !== phoneId)
      : [...localSelectedPhones, phoneId];
    
    setLocalSelectedPhones(updatedSelection);
    onPhoneCompare?.(updatedSelection);
  };

  const clearSelection = () => {
    setLocalSelectedPhones([]);
    onPhoneCompare?.([]);
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} className="animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No Results State (when search has been performed but no results)
  if (searchResponse && searchResponse.phones.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No phones match your filters
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Try adjusting your filter criteria to see more results. You can broaden your search by removing some filters or changing the price range.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-sm mx-auto">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Try different brand options</li>
              <li>• Increase the price range</li>
              <li>• Remove RAM or storage filters</li>
              <li>• Check different display types</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Initial State (no search performed yet)
  if (!searchResponse) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ready to find your perfect phone?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Use the filters above to search through our comprehensive database of mobile phones.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              💡 <strong>Tip:</strong> Start with a broad search and then narrow down using specific filters like brand or price range.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out duplicate phones based on phone_id
  const uniquePhones = searchResponse.phones.filter((phone, index, array) => 
    array.findIndex(p => p.phone_id === phone.phone_id) === index
  );
  
  // Debug log to track duplicate filtering
  if (searchResponse.phones.length !== uniquePhones.length) {
    console.log(`Filtered out ${searchResponse.phones.length - uniquePhones.length} duplicate phones`);
    console.log('Original phones:', searchResponse.phones.length);
    console.log('Unique phones:', uniquePhones.length);
  }
  
  const phones = uniquePhones;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      {/* Header with Results Count and Selection Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Phone Results
          </h2>
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
            {phones.length} phones found
          </span>
        </div>

        {/* Selection Controls */}
        {localSelectedPhones.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {localSelectedPhones.length} selected for comparison
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors duration-200"
            >
              Clear Selection
            </button>
            {localSelectedPhones.length >= 2 && (
              <button
                onClick={() => {
                  // Navigate to compare page with selected phone IDs
                  const phoneIds = localSelectedPhones.join(',');
                  window.location.href = `/compare?phones=${phoneIds}`;
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare ({localSelectedPhones.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters Applied Summary */}
      {Object.keys(searchResponse.filters).length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(searchResponse.filters).map(([key, value]) => {
              if (!value) return null;
              if (key === 'priceRange' && value) {
                const range = value as any;
                if (range.min || range.max) {
                  return (
                    <span key={key} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Price: ৳{range.min || 0} - ৳{range.max || '∞'}
                    </span>
                  );
                }
                return null;
              }
              return (
                <span key={key} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {key}: {value.toString()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {phones.map((phone, index) => (
          <PhoneCard
            key={`${phone.phone_id}-${phone.brand_name}-${phone.model}-${index}`}
            phone={phone}
            isSelected={localSelectedPhones.includes(phone.phone_id)}
            onSelect={onPhoneSelect}
            onCompare={handlePhoneSelection}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Pagination */}
      {searchResponse.pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((searchResponse.pagination.page - 1) * searchResponse.pagination.limit) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(searchResponse.pagination.page * searchResponse.pagination.limit, searchResponse.pagination.total)}
            </span> of{' '}
            <span className="font-medium">{searchResponse.pagination.total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={searchResponse.pagination.page <= 1}
              onClick={() => {
                console.log('Previous button clicked, current page:', searchResponse.pagination.page);
                console.log('onPageChange function:', onPageChange);
                const prevPage = searchResponse.pagination.page - 1;
                console.log('Going to page:', prevPage);
                if (onPageChange) {
                  onPageChange(prevPage);
                } else {
                  console.error('onPageChange is not defined!');
                }
              }}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {searchResponse.pagination.page} of {searchResponse.pagination.totalPages}
              </span>
            </div>
            <button
              disabled={searchResponse.pagination.page >= searchResponse.pagination.totalPages}
              onClick={() => {
                console.log('Next button clicked, current page:', searchResponse.pagination.page);
                console.log('onPageChange function:', onPageChange);
                const nextPage = searchResponse.pagination.page + 1;
                console.log('Going to page:', nextPage);
                if (onPageChange) {
                  onPageChange(nextPage);
                } else {
                  console.error('onPageChange is not defined!');
                }
              }}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Selection Helper */}
      {localSelectedPhones.length === 1 && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Select at least one more phone to enable comparison features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}