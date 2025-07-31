'use client';

import React from 'react';

export interface PhoneDetails {
  phone_id: number;
  brand_name: string;
  model: string;
  image_url?: string;
  status: string;
  release_date?: string;
  ram_gb?: number;
  internal_storage_gb?: number;
  battery_capacity?: number;
  screen_size?: number;
  display_type_name?: string;
  chipset_name?: string;
  price_unofficial?: number;
  price_official?: number;
  // Extended details that might come from phone details API
  [key: string]: any;
}

interface PhoneComparisonProps {
  phones: PhoneDetails[];
  onRemovePhone?: (phoneId: number) => void;
  loading?: boolean;
}

interface ComparisonRow {
  label: string;
  key: string;
  category: string;
  formatter?: (value: any) => string;
  highlightDifferences?: boolean;
}

const comparisonFields: ComparisonRow[] = [
  // Basic Info
  { label: 'Brand', key: 'brand_name', category: 'Basic', highlightDifferences: true },
  { label: 'Model', key: 'model', category: 'Basic', highlightDifferences: false },
  { label: 'Status', key: 'status', category: 'Basic', highlightDifferences: true },
  { label: 'Release Date', key: 'release_date', category: 'Basic', highlightDifferences: true, formatter: (val) => val ? new Date(val).getFullYear().toString() : 'N/A' },
  
  // Performance
  { label: 'Chipset', key: 'chipset_name', category: 'Performance', highlightDifferences: true },
  { label: 'RAM', key: 'ram_gb', category: 'Performance', highlightDifferences: true, formatter: (val) => val ? `${val}GB` : 'N/A' },
  { label: 'Storage', key: 'internal_storage_gb', category: 'Performance', highlightDifferences: true, formatter: (val) => val ? `${val}GB` : 'N/A' },
  
  // Display
  { label: 'Screen Size', key: 'screen_size', category: 'Display', highlightDifferences: true, formatter: (val) => val ? `${val}"` : 'N/A' },
  { label: 'Display Type', key: 'display_type_name', category: 'Display', highlightDifferences: true },
  
  // Battery & Price
  { label: 'Battery', key: 'battery_capacity', category: 'Battery', highlightDifferences: true, formatter: (val) => val ? `${val}mAh` : 'N/A' },
  { label: 'Price (Unofficial)', key: 'price_unofficial', category: 'Pricing', highlightDifferences: true, formatter: (val) => val ? `$${val.toLocaleString()}` : 'N/A' },
  { label: 'Price (Official)', key: 'price_official', category: 'Pricing', highlightDifferences: true, formatter: (val) => val ? `$${val.toLocaleString()}` : 'N/A' },
];

export default function PhoneComparison({ phones, onRemovePhone, loading = false }: PhoneComparisonProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="space-y-2">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phones.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Phones Selected for Comparison
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select phones from the browse page to compare their specifications side-by-side.
          </p>
          <a
            href="/phones"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Browse Phones
          </a>
        </div>
      </div>
    );
  }

  // Helper function to check if values are different across phones
  const hasVariation = (key: string): boolean => {
    if (phones.length <= 1) return false;
    const values = phones.map(phone => phone[key]);
    const firstValue = values[0];
    return values.some(value => value !== firstValue);
  };

  // Helper function to get display value
  const getDisplayValue = (phone: PhoneDetails, field: ComparisonRow): string => {
    const value = phone[field.key];
    if (value === null || value === undefined) return 'N/A';
    return field.formatter ? field.formatter(value) : value.toString();
  };

  // Group fields by category
  const categorizedFields = comparisonFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ComparisonRow[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Phone Comparison ({phones.length} phones)
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Differences are highlighted
          </div>
        </div>
      </div>

      {/* Mobile View - Stacked Cards */}
      <div className="block lg:hidden p-4 space-y-6">
        {phones.map((phone, index) => (
          <div key={phone.phone_id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            {/* Phone Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {phone.image_url ? (
                  <img
                    src={phone.image_url}
                    alt={`${phone.brand_name} ${phone.model}`}
                    className="w-12 h-12 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {phone.brand_name} {phone.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone {index + 1}
                  </p>
                </div>
              </div>
              {onRemovePhone && (
                <button
                  onClick={() => onRemovePhone(phone.phone_id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Specifications */}
            {Object.entries(categorizedFields).map(([category, fields]) => (
              <div key={category} className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">{category}</h4>
                <div className="space-y-2">
                  {fields.map((field) => (
                    <div key={field.key} className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{field.label}:</span>
                      <span className={`text-sm font-medium ${
                        field.highlightDifferences && hasVariation(field.key)
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {getDisplayValue(phone, field)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop View - Comparison Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          {/* Phone Headers */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 w-48 bg-gray-50 dark:bg-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">Specifications</span>
              </th>
              {phones.map((phone, index) => (
                <th key={phone.phone_id} className="text-center p-4 min-w-64">
                  <div className="flex flex-col items-center space-y-2">
                    {phone.image_url ? (
                      <img
                        src={phone.image_url}
                        alt={`${phone.brand_name} ${phone.model}`}
                        className="w-16 h-16 object-contain rounded-lg bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {phone.brand_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {phone.model}
                      </p>
                    </div>
                    {onRemovePhone && (
                      <button
                        onClick={() => onRemovePhone(phone.phone_id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(categorizedFields).map(([category, fields]) => (
              <React.Fragment key={category}>
                {/* Category Header */}
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={phones.length + 1} className="px-4 py-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{category}</h4>
                  </td>
                </tr>
                
                {/* Category Fields */}
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                      {field.label}
                    </td>
                    {phones.map((phone) => (
                      <td key={phone.phone_id} className="px-4 py-3 text-center">
                        <span className={`${
                          field.highlightDifferences && hasVariation(field.key)
                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded font-medium'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {getDisplayValue(phone, field)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}