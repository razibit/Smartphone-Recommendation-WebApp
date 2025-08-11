'use client';

import { useState, useEffect } from 'react';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { FilterCriteria, PhoneSearchResponse, apiClient } from '@/lib/api/client';
import { DynamicComponents } from '@/lib/dynamicImports';

// Destructure dynamic components for cleaner code
const { FilterBar, PhoneList, SQLQueryBox, PhoneDetails } = DynamicComponents;

// Import FloatingSQLPopup directly
import { FloatingSQLPopup } from '@/components/SQLQueryBox';

export default function PhonesPage() {
  const [searchResults, setSearchResults] = useState<PhoneSearchResponse | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [selectedPhones, setSelectedPhones] = useState<number[]>([]);
  const [showSQLQuery, setShowSQLQuery] = useState(true);
  const [showSQLPopup, setShowSQLPopup] = useState(false);
  const [selectedPhoneId, setSelectedPhoneId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  const toast = useToast();

  const handleFilterApply = async (filters: FilterCriteria, page: number = 1) => {
    console.log('📄 handleFilterApply called with:', { filters, page });
    console.log('📄 Filters type:', typeof filters, 'Is empty:', Object.keys(filters).length === 0);
    setLoading(true);
    setCurrentFilters(filters); // Store filters even if empty - pagination needs this context
    setCurrentPage(page);
    setRetryCount(0);
    
    try {
      // Make actual API call to backend with pagination
      const response = await apiClient.searchPhones(filters, 'p.phone_id', 'asc', page, 20);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
        setSqlQuery(response.sqlQuery || null);
        setExecutionTime(response.executionTime || null);
        
        // Show SQL popup when query is available
        if (response.sqlQuery) {
          setShowSQLPopup(true);
        }
        
        // Show success message with results count
        const resultCount = response.data.pagination.total;
        if (resultCount > 0) {
          toast.success(
            'Search Completed',
            `Found ${resultCount} phone${resultCount !== 1 ? 's' : ''} matching your criteria`,
            3000
          );
        }
      } else {
        // Handle API failure
        const errorMsg = response.error?.message || 'Unknown error occurred';
        const errorCode = response.error?.code || 'UNKNOWN';
        
        setSearchResults({
          phones: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
          filters,
          sorting: {
            sortBy: 'p.phone_id',
            sortOrder: 'asc',
          },
        });
        setSqlQuery('-- API call failed or returned no data --');
        setExecutionTime(0);

        // Show appropriate error message based on error code
        if (errorCode === 'NETWORK_ERROR') {
          toast.error(
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection.',
            7000
          );
        } else if (errorCode === 'TIMEOUT_ERROR') {
          toast.error(
            'Request Timeout',
            'The search is taking longer than expected. Please try again.',
            5000
          );
        } else {
          toast.error(
            'Search Failed',
            errorMsg,
            5000
          );
        }
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      
      // On error, still show empty results structure
      setSearchResults({
        phones: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        filters,
        sorting: {
          sortBy: 'p.phone_id',
          sortOrder: 'asc',
        },
      });
      setSqlQuery('-- Error: Could not connect to API --');
      setExecutionTime(0);
      
      toast.error(
        'Unexpected Error',
        'An unexpected error occurred while searching. Please try again.',
        5000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterReset = () => {
    console.log('Resetting filters');
    setCurrentFilters({});
    setCurrentPage(1);
    setSearchResults(null);
    setSqlQuery(null);
    setExecutionTime(null);
    setSelectedPhones([]);
    setShowSQLPopup(false);
    
    toast.info(
      'Filters Reset',
      'All filters have been cleared',
      2000
    );
  };

  const handlePageChange = async (page: number) => {
    console.log('🚀 handlePageChange called with page:', page);
    console.log('Current filters:', currentFilters);
    console.log('Search results exist:', !!searchResults);
    
    // Allow pagination if we have search results, regardless of filter complexity
    if (searchResults) {
      console.log('✅ Search results exist, proceeding with pagination');
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('📄 Calling handleFilterApply with page:', page);
      await handleFilterApply(currentFilters, page);
    } else {
      console.log('❌ No search results available, cannot paginate');
    }
  };

  const handlePhoneSelect = (phoneId: number) => {
    console.log('Phone selected:', phoneId);
    // This could navigate to phone details page
  };

  const handlePhoneCompare = (phoneIds: number[]) => {
    console.log('Phones selected for comparison:', phoneIds);
    setSelectedPhones(phoneIds);
  };

  const handleViewDetails = (phoneId: number) => {
    console.log('View details for phone:', phoneId);
    setSelectedPhoneId(phoneId);
    setIsDetailsModalOpen(true);
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(
        'Connection Restored',
        'You are back online!',
        3000
      );
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(
        'Connection Lost',
        'You are currently offline. Some features may not work.',
        0 // Don't auto-dismiss
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial connection status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Retry functionality
  const handleRetrySearch = () => {
    if (Object.keys(currentFilters).length > 0) {
      setRetryCount(prev => prev + 1);
      handleFilterApply(currentFilters, currentPage);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedPhoneId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Mobile Phones
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Discover and filter through our comprehensive database of mobile phones. 
            Use the advanced filters to find devices that match your specific requirements.
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <FilterBar
            onFilterApply={(filters) => handleFilterApply(filters, 1)}
            onFilterReset={handleFilterReset}
            loading={loading}
          />
        </div>

        {/* Phone Results Section */}
        <div className="mb-8">
          <PhoneList
            searchResponse={searchResults}
            loading={loading}
            onPhoneSelect={handlePhoneSelect}
            onPhoneCompare={handlePhoneCompare}
            onViewDetails={handleViewDetails}
            selectedPhones={selectedPhones}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Floating SQL Query Popup */}
        {showSQLPopup && sqlQuery && (
          <FloatingSQLPopup
            query={sqlQuery}
            executionTime={executionTime || undefined}
            resultCount={searchResults?.pagination.total}
            onClose={() => setShowSQLPopup(false)}
          />
        )}

        {/* Offline/Connection Status Banner */}
        {!isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  You're currently offline
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Some features may not work properly. Please check your internet connection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Retry Button for Failed Searches */}
        {searchResults && searchResults.phones.length === 0 && Object.keys(currentFilters).length > 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={handleRetrySearch}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Retrying...' : `Retry Search${retryCount > 0 ? ` (${retryCount})` : ''}`}
            </button>
          </div>
        )}

        {/* Phone Details Modal */}
        <PhoneDetails
          phoneId={selectedPhoneId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
        />
        
        {/* Toast Notifications */}
        <ToastContainer
          toasts={toast.toasts}
          onClose={toast.removeToast}
        />
      </div>
    </div>
  );
}