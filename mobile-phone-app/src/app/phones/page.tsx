'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer } from '@/components/Toast';
import FilterBar from '@/components/FilterBar';
import PhoneList from '@/components/PhoneList';
import PhoneDetails from '@/components/PhoneDetails';
import { FloatingSQLPopup } from '@/components/SQLQueryBox';
import { useToast } from '@/hooks/useToast';
import { apiClient, FilterCriteria, PhoneSearchResponse } from '@/lib/api/client';

function emptySearchResponse(filters: FilterCriteria): PhoneSearchResponse {
  return {
    phones: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    filters,
    sorting: { sortBy: 'p.phone_id', sortOrder: 'asc' },
  };
}

export default function PhonesPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error, warning } = useToast();
  const requestSequence = useRef(0);
  const [searchResults, setSearchResults] = useState<PhoneSearchResponse | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPhones, setSelectedPhones] = useState<number[]>([]);
  const [showSQLPopup, setShowSQLPopup] = useState(false);
  const [selectedPhoneId, setSelectedPhoneId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const handleFilterApply = async (filters: FilterCriteria, page = 1) => {
    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;
    setLoading(true);
    setSearchError(null);
    setCurrentFilters(filters);
    setCurrentPage(page);
    setShowSQLPopup(false);

    const response = await apiClient.searchPhones(filters, 'p.phone_id', 'asc', page, 20);
    if (sequence !== requestSequence.current) return;

    if (response.success && response.data) {
      setSearchResults(response.data);
      if (response.data.pagination.total > 0) {
        success(
          'Search completed',
          'Found ' + response.data.pagination.total + ' matching phone' + (response.data.pagination.total === 1 ? '' : 's') + '.',
          3000,
        );
      }
      if (response.meta?.diagnostics) setShowSQLPopup(true);
    } else {
      const message = response.error?.message || 'The phone search could not be completed.';
      setSearchResults(emptySearchResponse(filters));
      setSearchError(message);
      error('Search failed', message, 5000);
    }

    setLoading(false);
  };

  const handleFilterReset = () => {
    requestSequence.current += 1;
    setCurrentFilters({});
    setCurrentPage(1);
    setSearchResults(null);
    setSearchError(null);
    setSelectedPhones([]);
    setShowSQLPopup(false);
  };

  const handlePageChange = (page: number) => {
    if (!searchResults || loading) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void handleFilterApply(currentFilters, page);
  };

  const handlePhoneCompare = (phoneId: number) => {
    setSelectedPhones((current) => {
      if (current.includes(phoneId)) return current.filter((id) => id !== phoneId);
      if (current.length >= 4) {
        warning('Comparison limit reached', 'Select up to four phones for one comparison.', 3500);
        return current;
      }
      return current.concat(phoneId);
    });
  };

  const openComparison = () => {
    if (selectedPhones.length < 2) return;
    router.push('/compare?phones=' + selectedPhones.join(','));
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      success('Connection restored', 'The API service can be used again.', 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      warning('Connection lost', 'Search requests may be unavailable while offline.', 0);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [success, warning]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Catalogue search</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 dark:text-white md:text-4xl">Browse mobile phones</h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            Narrow the catalogue with structured filters, inspect device details, and select phones for comparison.
          </p>
        </header>

        {!isOnline && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200" role="status">
            You are offline. The API may be unavailable until connectivity is restored.
          </div>
        )}

        <div className="mb-8">
          <FilterBar
            onFilterApply={(filters) => void handleFilterApply(filters, 1)}
            onFilterReset={handleFilterReset}
            loading={loading}
          />
        </div>

        {searchError && (
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="text-sm">{searchError}</p>
            <button
              type="button"
              onClick={() => void handleFilterApply(currentFilters, currentPage)}
              disabled={loading}
              className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry search
            </button>
          </div>
        )}

        <PhoneList
          searchResponse={searchResults}
          loading={loading}
          onPhoneCompare={handlePhoneCompare}
          onViewDetails={(phoneId) => {
            setSelectedPhoneId(phoneId);
            setIsDetailsModalOpen(true);
          }}
          onClearSelection={() => setSelectedPhones([])}
          onOpenComparison={openComparison}
          selectedPhones={selectedPhones}
          onPageChange={handlePageChange}
        />

        {showSQLPopup && searchResults?.meta?.diagnostics && (
          <FloatingSQLPopup
            query={searchResults.meta.diagnostics.sql}
            executionTime={searchResults.meta.diagnostics.executionTime}
            resultCount={searchResults.meta.diagnostics.resultCount ?? searchResults.pagination.total}
            onClose={() => setShowSQLPopup(false)}
          />
        )}

        <PhoneDetails
          phoneId={selectedPhoneId}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPhoneId(null);
          }}
        />

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
}
