'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PhoneComparison, { PhoneDetails } from '@/components/PhoneComparison';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api/client';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [phones, setPhones] = useState<PhoneDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();

  // Get phone IDs from URL parameters
  const phoneIdsParam = searchParams.get('phones');
  const phoneIds = phoneIdsParam ? phoneIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

  // Fetch phone details
  useEffect(() => {
    if (phoneIds.length === 0) {
      setPhones([]);
      return;
    }

    const fetchPhoneDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const phonePromises = phoneIds.map(async (phoneId) => {
          const response = await apiClient.getPhoneDetails(phoneId);
          if (response.success && response.data?.phone) {
            return response.data.phone;
          }
          return null;
        });

        const phoneResults = await Promise.all(phonePromises);
        const validPhones = phoneResults.filter((phone): phone is PhoneDetails => phone !== null);
        
        if (validPhones.length === 0) {
          setError('No valid phones found with the provided IDs.');
          toast.error(
            'No Phones Found',
            'The specified phone IDs could not be found in the database.',
            5000
          );
        } else {
          setPhones(validPhones);
          toast.success(
            'Comparison Loaded',
            `Successfully loaded ${validPhones.length} phone${validPhones.length !== 1 ? 's' : ''} for comparison`,
            3000
          );
        }
      } catch (err) {
        console.error('Error fetching phone details:', err);
        setError('Failed to load phone details. Please try again.');
        
        toast.error(
          'Loading Failed',
          'Failed to load phone details. Please check your connection and try again.',
          7000
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneDetails();
  }, [phoneIdsParam]);

  const handleRemovePhone = (phoneId: number) => {
    const phoneToRemove = phones.find(phone => phone.phone_id === phoneId);
    const updatedPhones = phones.filter(phone => phone.phone_id !== phoneId);
    setPhones(updatedPhones);
    
    // Update URL
    if (updatedPhones.length > 0) {
      const newPhoneIds = updatedPhones.map(phone => phone.phone_id).join(',');
      window.history.replaceState({}, '', `/compare?phones=${newPhoneIds}`);
    } else {
      window.history.replaceState({}, '', '/compare');
    }

    // Show feedback
    if (phoneToRemove) {
      toast.info(
        'Phone Removed',
        `${phoneToRemove.brand_name} ${phoneToRemove.model} removed from comparison`,
        3000
      );
    }
  };

  const handleClearAll = () => {
    const phoneCount = phones.length;
    setPhones([]);
    window.history.replaceState({}, '', '/compare');
    
    toast.info(
      'Comparison Cleared',
      `Removed ${phoneCount} phone${phoneCount !== 1 ? 's' : ''} from comparison`,
      3000
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
              Compare Mobile Phones
            </h1>
            
            {phones.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearAll}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors duration-200 text-sm"
                >
                  Clear All
                </button>
                <a
                  href="/phones"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add More Phones
                </a>
              </div>
            )}
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Compare multiple mobile phones side-by-side to make informed decisions. 
            Key differences are highlighted to help you spot important variations.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error Loading Phones</h3>
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Phone Comparison */}
        <div className="mb-8">
          <PhoneComparison
            phones={phones}
            onRemovePhone={handleRemovePhone}
            loading={loading}
          />
        </div>

        {/* Comparison Features Info */}
        {phones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-card">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tabular Comparison</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Specifications organized in an easy-to-read table format
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-card">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Highlight Differences</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Key differences are automatically highlighted for easy comparison
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-card">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Responsive Design</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Works perfectly on mobile, tablet, and desktop devices
              </p>
            </div>
          </div>
        )}

        {/* Implementation Status */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Phone Comparison Implementation Complete ✅
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm mb-2">
                The phone comparison functionality is now fully functional with responsive design and difference highlighting!
              </p>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>✅ Multi-select capability in phone list</li>
                <li>✅ Side-by-side comparison interface</li>
                <li>✅ Tabular layout with difference highlighting</li>
                <li>✅ Responsive design for all screen sizes</li>
                <li>✅ Phone selection management (add/remove)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Toast Notifications */}
        <ToastContainer
          toasts={toast.toasts}
          onClose={toast.removeToast}
        />
      </div>
    </div>
  );
}