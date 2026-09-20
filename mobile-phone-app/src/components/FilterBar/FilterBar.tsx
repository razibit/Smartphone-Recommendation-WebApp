'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient, FilterCriteria, FilterOptions, NumericRange } from '@/lib/api/client';

interface FilterBarProps {
  onFilterApply: (filters: FilterCriteria) => void;
  onFilterReset: () => void;
  loading?: boolean;
}

function isRangeActive(range?: NumericRange): boolean {
  return range?.min !== undefined || range?.max !== undefined;
}

export default function FilterBar({ onFilterApply, onFilterReset, loading = false }: FilterBarProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFilterOptions = useCallback(async () => {
    setLoadingOptions(true);
    setError(null);
    const response = await apiClient.getFilterOptions();
    if (response.success && response.data) {
      setFilterOptions(response.data);
    } else {
      setError(response.error?.message || 'Unable to load filter options.');
    }
    setLoadingOptions(false);
  }, []);

  useEffect(() => {
    void loadFilterOptions();
  }, [loadFilterOptions]);

  const activeFilterCount = useMemo(() => {
    return [
      filters.brand,
      filters.chipset,
      filters.displayType,
      filters.internalStorage,
      filters.ramGb,
      filters.batteryCapacity,
      isRangeActive(filters.priceRange),
      isRangeActive(filters.screenSize),
    ].filter(Boolean).length;
  }, [filters]);

  const setRangeValue = (key: 'priceRange' | 'screenSize', bound: 'min' | 'max', value: string) => {
    const numericValue = value === '' ? undefined : Number(value);
    setFilters((previous) => {
      const existing = previous[key] || {};
      const nextRange: NumericRange = { ...existing, [bound]: numericValue };
      if (!isRangeActive(nextRange)) {
        const nextFilters = { ...previous };
        delete nextFilters[key];
        return nextFilters;
      }
      return { ...previous, [key]: nextRange };
    });
  };

  const cleanFilters = (): FilterCriteria => ({
    ...(filters.brand ? { brand: filters.brand.trim() } : {}),
    ...(filters.chipset ? { chipset: filters.chipset.trim() } : {}),
    ...(filters.displayType ? { displayType: filters.displayType.trim() } : {}),
    ...(filters.internalStorage ? { internalStorage: filters.internalStorage } : {}),
    ...(filters.ramGb ? { ramGb: filters.ramGb } : {}),
    ...(filters.batteryCapacity ? { batteryCapacity: filters.batteryCapacity } : {}),
    ...(isRangeActive(filters.priceRange) ? { priceRange: filters.priceRange } : {}),
    ...(isRangeActive(filters.screenSize) ? { screenSize: filters.screenSize } : {}),
  });

  const reset = () => {
    setFilters({});
    onFilterReset();
  };

  if (loadingOptions) {
    return (
      <section aria-label="Loading filter options" className="rounded-2xl bg-white p-6 shadow-card dark:bg-gray-800">
        <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !filterOptions) {
    return (
      <section aria-live="polite" className="rounded-2xl bg-white p-6 shadow-card dark:bg-gray-800">
        <div className="py-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Unable to load filters</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error || 'Filter options are unavailable.'}</p>
          <button type="button" onClick={() => void loadFilterOptions()} className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700">
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="filter-heading" className="rounded-2xl bg-white p-6 shadow-card dark:bg-gray-800">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="filter-heading" className="text-xl font-semibold text-gray-900 dark:text-white">Filter phones</h2>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
            {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Brand
          <select value={filters.brand || ''} onChange={(event) => setFilters((previous) => ({ ...previous, brand: event.target.value || undefined }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">All brands</option>
            {filterOptions.brands.map((brand) => <option key={brand.brand_id} value={brand.brand_name}>{brand.brand_name}</option>)}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Chipset
          <select value={filters.chipset || ''} onChange={(event) => setFilters((previous) => ({ ...previous, chipset: event.target.value || undefined }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">All chipsets</option>
            {filterOptions.chipsets.map((chipset) => <option key={chipset.chipset_id} value={chipset.chipset_name}>{chipset.chipset_name}</option>)}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Display type
          <select value={filters.displayType || ''} onChange={(event) => setFilters((previous) => ({ ...previous, displayType: event.target.value || undefined }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">All displays</option>
            {filterOptions.displayTypes.map((displayType) => <option key={displayType.display_type_id} value={displayType.display_type_name}>{displayType.display_type_name}</option>)}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Minimum storage
          <select value={filters.internalStorage || ''} onChange={(event) => setFilters((previous) => ({ ...previous, internalStorage: event.target.value ? Number(event.target.value) : undefined }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">Any storage</option>
            {filterOptions.storageOptions.map((storage) => <option key={storage} value={storage}>{storage}GB+</option>)}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Minimum RAM
          <select value={filters.ramGb || ''} onChange={(event) => setFilters((previous) => ({ ...previous, ramGb: event.target.value ? Number(event.target.value) : undefined }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="">Any RAM</option>
            {[3, 4, 6, 8, 12, 16].map((ram) => <option key={ram} value={ram}>{ram}GB+</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Minimum battery (mAh)
          <input type="number" min="0" value={filters.batteryCapacity ?? ''} onChange={(event) => setFilters((previous) => ({ ...previous, batteryCapacity: event.target.value ? Number(event.target.value) : undefined }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Price range (৳)</legend>
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="Minimum price" type="number" min="0" placeholder={String(filterOptions.priceRange.min)} value={filters.priceRange?.min ?? ''} onChange={(event) => setRangeValue('priceRange', 'min', event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input aria-label="Maximum price" type="number" min="0" placeholder={String(filterOptions.priceRange.max)} value={filters.priceRange?.max ?? ''} onChange={(event) => setRangeValue('priceRange', 'max', event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Screen size (inches)</legend>
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="Minimum screen size" type="number" min="0" step="0.1" placeholder="Min" value={filters.screenSize?.min ?? ''} onChange={(event) => setRangeValue('screenSize', 'min', event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input aria-label="Maximum screen size" type="number" min="0" step="0.1" placeholder="Max" value={filters.screenSize?.max ?? ''} onChange={(event) => setRangeValue('screenSize', 'max', event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => onFilterApply(cleanFilters())} disabled={loading} className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Searching…' : 'Apply filters'}
        </button>
        <button type="button" onClick={reset} disabled={loading} className="rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
          Reset
        </button>
      </div>
    </section>
  );
}
