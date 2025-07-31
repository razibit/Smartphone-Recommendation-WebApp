'use client';

import React from 'react';
import { Phone } from '@/lib/api/client';
import { OptimizedImage } from '@/components/UI';

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
    return `৳${price.toLocaleString()}`;
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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group transform hover:-translate-y-1 hover:scale-[1.02] ${
      isSelected ? 'ring-2 ring-primary-500 shadow-lg scale-[1.02]' : ''
    }`}>
      {/* Phone Image */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <OptimizedImage
          src={phone.image_url}
          alt={`${phone.brand_name} ${phone.model}`}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phone.status)}`}>
            {phone.status}
          </span>
        </div>

        {/* Selection Checkbox */}
        {onCompare && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare(phone.phone_id);
              }}
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${
                isSelected 
                  ? 'bg-primary-600 border-primary-600 shadow-lg opacity-100' 
                  : 'bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
            >
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Phone Information */}
      <div className="p-4 lg:p-6">
        {/* Brand and Model */}
        <div className="mb-4">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {phone.brand_name} {phone.model}
          </h3>
          {phone.chipset_name && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {phone.chipset_name}
            </p>
          )}
        </div>

        {/* Key Specifications */}
        <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">RAM</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatRAM(phone.ram_gb)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">Storage</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatStorage(phone.internal_storage_gb)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 lg:w-4 lg:h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-400">Screen</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {formatScreenSize(phone.screen_size)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300 shadow-sm">
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
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
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
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </button>
          
          {onSelect && (
            <button
              onClick={() => onSelect(phone.phone_id)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
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