'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, FilterOptions, FilterCriteria } from '@/lib/api/client';

interface FilterBarProps {
  onFilterApply: (filters: FilterCriteria) => void;
  onFilterReset: () => void;
  loading?: boolean;
}

export default function FilterBar({ onFilterApply, onFilterReset, loading = false }: FilterBarProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoadingOptions(true);
        setError(null);
        const response = await apiClient.getFilterOptions();
        
        if (response.success && response.data) {
          setFilterOptions(response.data);
        } else {
          setError(response.error?.message || 'Failed to load filter options');
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Error fetching filter options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: numValue,
      },
    }));
  };

  const handleApplyFilters = () => {
    // Clean up empty values
    const cleanFilters: FilterCriteria = {};
    
    if (filters.brand?.trim()) cleanFilters.brand = filters.brand.trim();
    if (filters.chipset?.trim()) cleanFilters.chipset = filters.chipset.trim();
    if (filters.displayType?.trim()) cleanFilters.displayType = filters.displayType.trim();
    if (filters.internalStorage?.trim()) cleanFilters.internalStorage = filters.internalStorage.trim();
    if (filters.ramGb && filters.ramGb > 0) cleanFilters.ramGb = filters.ramGb;
    if (filters.batteryCapacity && filters.batteryCapacity > 0) cleanFilters.batteryCapacity = filters.batteryCapacity;
    
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max > 0)) {
      cleanFilters.priceRange = filters.priceRange;
    }

    onFilterApply(cleanFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    onFilterReset();
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterCriteria];
    if (key === 'priceRange') {
      return value && ((value as any).min > 0 || (value as any).max > 0);
    }
    return value && value !== '' && value !== undefined;
  });

  if (loadingOptions) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Filters
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Filter Phones
        </h2>
        {hasActiveFilters && (
          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
            {Object.keys(filters).filter(key => {
              const value = filters[key as keyof FilterCriteria];
              if (key === 'priceRange') {
                return value && ((value as any).min > 0 || (value as any).max > 0);
              }
              return value && value !== '';
            }).length} filter{Object.keys(filters).length !== 1 ? 's' : ''} active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Brand Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Brand
          </label>
          <select
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Brands</option>
            {filterOptions?.brands?.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_name}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chipset Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Chipset
          </label>
          <select
            value={filters.chipset || ''}
            onChange={(e) => handleFilterChange('chipset', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Chipsets</option>
            {filterOptions?.chipsets?.map((chipset) => (
              <option key={chipset.chipset_id} value={chipset.chipset_name}>
                {chipset.chipset_name}
              </option>
            ))}
          </select>
        </div>

        {/* Display Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Type
          </label>
          <select
            value={filters.displayType || ''}
            onChange={(e) => handleFilterChange('displayType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Display Types</option>
            {filterOptions?.displayTypes?.map((displayType) => (
              <option key={displayType.display_type_id} value={displayType.display_type_name}>
                {displayType.display_type_name}
              </option>
            ))}
          </select>
        </div>

        {/* Storage Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Min Storage (GB)
          </label>
          <select
            value={filters.internalStorage || ''}
            onChange={(e) => handleFilterChange('internalStorage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any Storage</option>
            {filterOptions?.storageOptions?.map((storage) => (
              <option key={storage} value={storage.toString()}>
                {storage}GB+
              </option>
            ))}
          </select>
        </div>

        {/* RAM Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Min RAM (GB)
          </label>
          <select
            value={filters.ramGb || ''}
            onChange={(e) => handleFilterChange('ramGb', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any RAM</option>
            <option value="3">3GB+</option>
            <option value="4">4GB+</option>
            <option value="6">6GB+</option>
            <option value="8">8GB+</option>
            <option value="12">12GB+</option>
            <option value="16">16GB+</option>
          </select>
        </div>
      </div>

      {/* Price Range Filter */}
      {filterOptions?.priceRange && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range ($)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder={`Min ($${filterOptions.priceRange.min})`}
                value={filters.priceRange?.min || ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder={`Max ($${filterOptions.priceRange.max})`}
                value={filters.priceRange?.max || ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleApplyFilters}
          disabled={loading}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-card hover:shadow-card-hover transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Applying Filters...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </>
          )}
        </button>
        
        <button
          onClick={handleResetFilters}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}