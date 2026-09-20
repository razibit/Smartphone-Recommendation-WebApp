'use client';

import Link from 'next/link';
import PhoneCard from './PhoneCard';
import { SkeletonCard } from '@/components/UI';
import { FilterCriteria, PhoneSearchResponse } from '@/lib/api/client';

interface PhoneListProps {
  searchResponse: PhoneSearchResponse | null;
  loading?: boolean;
  onPhoneCompare?: (phoneId: number) => void;
  onViewDetails?: (phoneId: number) => void;
  onClearSelection?: () => void;
  onOpenComparison?: () => void;
  selectedPhones?: number[];
  onPageChange?: (page: number) => void;
}

function filterLabel(key: string, value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (key === 'priceRange' && typeof value === 'object' && value !== null) {
    const range = value as FilterCriteria['priceRange'];
    if (!range?.min && !range?.max) return null;
    return 'Price: ' + (range.min ?? 0) + ' - ' + (range.max ?? 'Any');
  }
  if (Array.isArray(value)) return key + ': ' + value.join(', ');
  return key + ': ' + String(value);
}

export default function PhoneList({
  searchResponse,
  loading = false,
  onPhoneCompare,
  onViewDetails,
  onClearSelection,
  onOpenComparison,
  selectedPhones = [],
  onPageChange,
}: PhoneListProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <SkeletonCard key={index} className="animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!searchResponse) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">Ready to search the catalogue?</h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600 dark:text-gray-400">
          Choose filters above and run a search to see matching devices.
        </p>
      </div>
    );
  }

  const uniquePhones = searchResponse.phones.filter(
    (phone, index, phones) => phones.findIndex((item) => item.phone_id === phone.phone_id) === index,
  );

  if (uniquePhones.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">No phones match these filters</h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600 dark:text-gray-400">
          Broaden the search by removing a filter or adjusting the range values.
        </p>
      </div>
    );
  }

  const filters = Object.entries(searchResponse.filters)
    .map(([key, value]) => filterLabel(key, value))
    .filter((label): label is string => Boolean(label));
  const pagination = searchResponse.pagination;

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800" aria-labelledby="phone-results-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 id="phone-results-heading" className="text-xl font-semibold text-gray-950 dark:text-white">Phone results</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {pagination.total} matching result{pagination.total === 1 ? '' : 's'}
          </p>
        </div>
        {selectedPhones.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{selectedPhones.length} selected</span>
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onOpenComparison}
              disabled={selectedPhones.length < 2}
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compare selected
            </button>
          </div>
        )}
      </div>

      {filters.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
          {filters.map((label) => (
            <span key={label} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {uniquePhones.map((phone) => (
          <PhoneCard
            key={phone.phone_id}
            phone={phone}
            isSelected={selectedPhones.includes(phone.phone_id)}
            onCompare={onPhoneCompare}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-5 sm:flex-row dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-gray-600 dark:text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedPhones.length === 1 && (
        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          Select one more phone to enable comparison.
        </p>
      )}

      <div className="mt-6 text-center">
        <Link href="/compare" className="text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300">
          Open the comparison workspace
        </Link>
      </div>
    </section>
  );
}
