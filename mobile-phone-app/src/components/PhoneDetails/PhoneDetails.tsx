'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface PhoneDetailsProps {
  phoneId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedPhone {
  phone_id: number;
  model: string;
  device_type: string;
  release_date?: string;
  status: string;
  detail_url?: string;
  image_url?: string;
  scraped_at?: string;
  
  // Brand information
  brand_name: string;
  
  // Specifications
  cpu?: string;
  cpu_cores?: number;
  gpu?: string;
  ram_gb?: number;
  internal_storage_gb?: number;
  expandable_memory?: boolean;
  battery_capacity?: number;
  quick_charging?: string;
  bluetooth_version?: string;
  network?: string;
  wlan?: string;
  usb?: string;
  usb_otg?: boolean;
  usb_type_c?: boolean;
  
  // Display specifications
  screen_size?: number;
  resolution?: string;
  pixel_density?: number;
  refresh_rate?: number;
  brightness?: number;
  aspect_ratio?: string;
  screen_protection?: string;
  screen_to_body_ratio?: number;
  touch_screen?: string;
  notch?: string;
  edge?: boolean;
  
  // Physical specifications
  height?: number;
  width?: number;
  thickness?: number;
  weight?: number;
  ip_rating?: string;
  waterproof?: string;
  ruggedness?: string;
  
  // Camera specifications
  primary_camera_resolution?: string;
  primary_camera_features?: string;
  primary_camera_autofocus?: boolean;
  primary_camera_flash?: boolean;
  primary_camera_image_resolution?: string;
  video?: string;
  
  // Audio features
  audio_jack?: string;
  loudspeaker?: boolean;
  
  // Additional features
  features?: string;
  face_unlock?: boolean;
  gps?: string;
  gprs?: boolean;
  volte?: boolean;
  sim_size?: string;
  sim_slot?: string;
  speed?: string;
  
  // Lookup table names
  chipset_name?: string;
  os_name?: string;
  os_version?: string;
  user_interface?: string;
  display_type_name?: string;
  storage_type_name?: string;
  ram_type_name?: string;
  
  // Pricing information
  price_official?: number;
  price_unofficial?: number;
  price_old?: number;
  price_savings?: number;
  price_updated?: string;
  variant_description?: string;
  
  // Additional data from separate queries
  colors?: string[];
  pricing_variants?: Array<{
    price_official?: number;
    price_unofficial?: number;
    price_old?: number;
    price_savings?: number;
    price_updated?: string;
    variant_description?: string;
  }>;
}

export default function PhoneDetails({ phoneId, isOpen, onClose }: PhoneDetailsProps) {
  const [phone, setPhone] = useState<DetailedPhone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch phone details when phoneId changes and modal is open
  useEffect(() => {
    if (phoneId && isOpen) {
      fetchPhoneDetails(phoneId);
    }
  }, [phoneId, isOpen]);

  // Handle escape key
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  const fetchPhoneDetails = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getPhoneDetails(id);
      
      if (response.success && response.data) {
        setPhone(response.data.phone);
      } else {
        setError(response.error?.message || 'Failed to load phone details');
      }
    } catch (err) {
      console.error('Error fetching phone details:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return null;
    return `৳${price.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Phone Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive specifications and information
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg text-gray-600 dark:text-gray-400">Loading phone details...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Failed to Load Phone Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                  <button
                    onClick={() => phoneId && fetchPhoneDetails(phoneId)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {phone && (
              <div className="p-6">
                {/* Phone Header */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Phone Image */}
                  <div className="lg:col-span-1">
                    <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden relative">
                      {phone.image_url ? (
                        <img
                          src={phone.image_url}
                          alt={`${phone.brand_name} ${phone.model}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${phone.image_url ? 'hidden' : ''}`}>
                        <div className="text-center">
                          <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">No Image Available</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(phone.status)}`}>
                          {phone.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {phone.brand_name} {phone.model}
                      </h1>
                      {phone.chipset_name && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                          {phone.chipset_name}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        {phone.release_date && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Released: {formatDate(phone.release_date)}</span>
                          </div>
                        )}
                        
                        {phone.device_type && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Type: {phone.device_type}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    {(phone.price_official || phone.price_unofficial || (phone.pricing_variants && phone.pricing_variants.length > 0)) && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pricing</h3>
                        <div className="space-y-2">
                          {phone.price_official && (
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {formatPrice(phone.price_official)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Official Price</span>
                            </div>
                          )}
                          {phone.price_unofficial && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                {formatPrice(phone.price_unofficial)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Market Price</span>
                            </div>
                          )}
                          {phone.pricing_variants && phone.pricing_variants.length > 1 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Multiple pricing variants available
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {phone.pricing_variants.map((variant, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                    {variant.variant_description || `Variant ${index + 1}`}: {formatPrice(variant.price_official || variant.price_unofficial)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Colors */}
                    {phone.colors && phone.colors.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Available Colors</h3>
                        <div className="flex flex-wrap gap-2">
                          {phone.colors.map((color, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specifications Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Performance Specifications */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.chipset_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Chipset</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.chipset_name}</span>
                        </div>
                      )}
                      {phone.cpu && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">CPU</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.cpu}</span>
                        </div>
                      )}
                      {phone.cpu_cores && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">CPU Cores</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.cpu_cores}</span>
                        </div>
                      )}
                      {phone.gpu && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">GPU</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.gpu}</span>
                        </div>
                      )}
                      {phone.os_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Operating System</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {phone.os_name} {phone.os_version}
                          </span>
                        </div>
                      )}
                      {phone.user_interface && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">User Interface</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.user_interface}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Memory & Storage */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memory & Storage</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.ram_gb && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">RAM</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.ram_gb}GB {phone.ram_type_name && `(${phone.ram_type_name})`}</span>
                        </div>
                      )}
                      {phone.internal_storage_gb && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Internal Storage</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.internal_storage_gb}GB {phone.storage_type_name && `(${phone.storage_type_name})`}</span>
                        </div>
                      )}
                      {phone.expandable_memory !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expandable Memory</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.expandable_memory ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Display */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Display</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.screen_size && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Screen Size</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.screen_size}"</span>
                        </div>
                      )}
                      {phone.display_type_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Display Type</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.display_type_name}</span>
                        </div>
                      )}
                      {phone.resolution && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Resolution</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.resolution}</span>
                        </div>
                      )}
                      {phone.pixel_density && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Pixel Density</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.pixel_density} ppi</span>
                        </div>
                      )}
                      {phone.refresh_rate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Refresh Rate</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.refresh_rate}Hz</span>
                        </div>
                      )}
                      {phone.brightness && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Brightness</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.brightness} nits</span>
                        </div>
                      )}
                      {phone.aspect_ratio && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Aspect Ratio</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.aspect_ratio}</span>
                        </div>
                      )}
                      {phone.screen_protection && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Screen Protection</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.screen_protection}</span>
                        </div>
                      )}
                      {phone.screen_to_body_ratio && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Screen-to-Body Ratio</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.screen_to_body_ratio}%</span>
                        </div>
                      )}
                      {phone.touch_screen && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Touch Screen</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.touch_screen}</span>
                        </div>
                      )}
                      {phone.notch && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Notch</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.notch}</span>
                        </div>
                      )}
                      {phone.edge !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Edge Display</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.edge ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Battery & Charging */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Battery & Charging</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.battery_capacity && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Battery Capacity</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.battery_capacity} mAh</span>
                        </div>
                      )}
                      {phone.quick_charging && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Quick Charging</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.quick_charging}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Specifications */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h2a2 2 0 012 2v12a4 4 0 01-2 2H9M15 3h2a2 2 0 012 2v12a4 4 0 01-2 2h-2" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Physical</h3>
                    </div>
                    <div className="space-y-3">
                      {(phone.height || phone.width || phone.thickness) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Dimensions</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {phone.height && `${phone.height}mm`}
                            {phone.width && ` × ${phone.width}mm`}
                            {phone.thickness && ` × ${phone.thickness}mm`}
                          </span>
                        </div>
                      )}
                      {phone.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Weight</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.weight}g</span>
                        </div>
                      )}
                      {phone.ip_rating && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">IP Rating</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.ip_rating}</span>
                        </div>
                      )}
                      {phone.waterproof && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Waterproof</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.waterproof}</span>
                        </div>
                      )}
                      {phone.ruggedness && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Ruggedness</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.ruggedness}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camera */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.primary_camera_resolution && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Primary Camera</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.primary_camera_resolution}</span>
                        </div>
                      )}
                      {phone.primary_camera_features && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Camera Features</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.primary_camera_features}</span>
                        </div>
                      )}
                      {phone.primary_camera_autofocus !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Autofocus</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.primary_camera_autofocus ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.primary_camera_flash !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Flash</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.primary_camera_flash ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.primary_camera_image_resolution && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Image Resolution</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.primary_camera_image_resolution}</span>
                        </div>
                      )}
                      {phone.video && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Video</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.video}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connectivity */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connectivity</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.network && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Network</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.network}</span>
                        </div>
                      )}
                      {phone.wlan && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Wi-Fi</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.wlan}</span>
                        </div>
                      )}
                      {phone.bluetooth_version && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bluetooth</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.bluetooth_version}</span>
                        </div>
                      )}
                      {phone.usb && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">USB</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.usb}</span>
                        </div>
                      )}
                      {phone.usb_otg !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">USB OTG</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.usb_otg ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.usb_type_c !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">USB Type-C</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.usb_type_c ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.gps && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">GPS</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.gps}</span>
                        </div>
                      )}
                      {phone.gprs !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">GPRS</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.gprs ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.volte !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">VoLTE</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.volte ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio & Features */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 5l7 7-7 7" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio & Features</h3>
                    </div>
                    <div className="space-y-3">
                      {phone.audio_jack && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Audio Jack</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.audio_jack}</span>
                        </div>
                      )}
                      {phone.loudspeaker !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Loudspeaker</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.loudspeaker ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.face_unlock !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Face Unlock</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.face_unlock ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {phone.sim_size && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">SIM Size</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.sim_size}</span>
                        </div>
                      )}
                      {phone.sim_slot && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">SIM Slot</span>
                          <span className="font-medium text-gray-900 dark:text-white">{phone.sim_slot}</span>
                        </div>
                      )}
                      {phone.speed && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Speed</span>
                          <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{phone.speed}</span>
                        </div>
                      )}
                      {phone.features && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block mb-2">Additional Features</span>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{phone.features}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(phone.detail_url || phone.scraped_at) && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      {phone.detail_url && (
                        <a
                          href={phone.detail_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>View Original Source</span>
                        </a>
                      )}
                      {phone.scraped_at && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Data updated: {formatDate(phone.scraped_at)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}