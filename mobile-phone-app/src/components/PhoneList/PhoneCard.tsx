'use client';

import React from 'react';
import { Phone } from '@/lib/api/client';

interface PhoneCardProps {
  phone: Phone;
  isSelected?: boolean;
  onSelect?: (phoneId: number) => void;
  onCompare?: (phoneId: number) => void;
  onViewDetails?: (phoneId: number) => void;
}

export default function PhoneCard({ 
  phone, 
  isSelected = false, 
  onSelect, 
  onCompare, 
  onViewDetails 
}: PhoneCardProps) {
  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Price N/A';
    return `$${price.toLocaleString()}`;
  };

  const formatStorage = (storage?: number) => {
    if (!storage) return 'N/A';
    return `${storage}GB`;
  };

  const formatRAM = (ram?: number) => {
    if (!ram) return 'N/A';
    return `${ram}GB RAM`;
  };

  const formatBattery = (battery?: number) => {
    if (!battery) return 'N/A';
    return `${battery}mAh`;
  };

  const formatScreenSize = (size?: number) => {
    if (!size) return 'N/A';
    return `${size}"`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'rumored':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const displayPrice = phone.price_official || phone.price_unofficial;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group ${
      isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
    }`}>
      {/* Phone Image */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {phone.image_url ? (
          <img
            src={phone.image_url}
            alt={`${phone.brand_name} ${phone.model}`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${phone.image_url ? 'hidden' : ''}`}>
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">No Image</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phone.status)}`}>
            {phone.status}
          </span>
        </div>

        {/* Selection Checkbox */}
        {onCompare && (
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare(phone.phone_id);
              }}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                isSelected 
                  ? 'bg-primary-600 border-primary-600' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary-500'
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Phone Information */}
      <div className="p-6">
        {/* Brand and Model */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {phone.brand_name} {phone.model}
          </h3>
          {phone.chipset_name && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {phone.chipset_name}
            </p>
          )}
        </div>

        {/* Key Specifications */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">RAM</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatRAM(phone.ram_gb)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">Storage</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatStorage(phone.internal_storage_gb)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h2a2 2 0 012 2v12a4 4 0 01-2 2H9M15 3h2a2 2 0 012 2v12a4 4 0 01-2 2h-2" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">Screen</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatScreenSize(phone.screen_size)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">Battery</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatBattery(phone.battery_capacity)}
            </p>
          </div>
        </div>

        {/* Display Type */}
        {phone.display_type_name && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {phone.display_type_name}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(displayPrice)}
              </p>
              {phone.price_official && phone.price_unofficial && phone.price_official !== phone.price_unofficial && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Official: {formatPrice(phone.price_official)}
                </p>
              )}
            </div>
            {phone.release_date && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Released</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(phone.release_date).getFullYear()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails?.(phone.phone_id)}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
          
          {onSelect && (
            <button
              onClick={() => onSelect(phone.phone_id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center justify-center ${
                isSelected
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isSelected ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}