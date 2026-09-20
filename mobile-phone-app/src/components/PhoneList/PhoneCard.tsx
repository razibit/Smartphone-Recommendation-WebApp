'use client';

import { Phone } from '@/lib/api/client';
import { OptimizedImage } from '@/components/UI';

interface PhoneCardProps {
  phone: Phone;
  isSelected?: boolean;
  onCompare?: (phoneId: number) => void;
  onViewDetails?: (phoneId: number) => void;
}

function valueOrFallback(value: number | string | undefined, suffix = '') {
  return value === undefined || value === null ? 'N/A' : String(value) + suffix;
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'available') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (normalized === 'upcoming') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (normalized === 'rumored') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
}

export default function PhoneCard({ phone, isSelected = false, onCompare, onViewDetails }: PhoneCardProps) {
  const price = phone.price_official ?? phone.price_unofficial;

  return (
    <article className={
      isSelected
        ? 'overflow-hidden rounded-xl bg-white shadow-sm ring-2 ring-primary-500 dark:bg-gray-800'
        : 'overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800'
    }>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <OptimizedImage
          src={phone.image_url}
          alt={phone.brand_name + ' ' + phone.model}
          className="h-full w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <span className={'absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold ' + statusClass(phone.status)}>
          {phone.status}
        </span>
        {onCompare && (
          <button
            type="button"
            aria-label={isSelected ? 'Remove ' + phone.brand_name + ' ' + phone.model + ' from comparison' : 'Add ' + phone.brand_name + ' ' + phone.model + ' to comparison'}
            aria-pressed={isSelected}
            onClick={() => onCompare(phone.phone_id)}
            className={
              isSelected
                ? 'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow'
                : 'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white/90 text-gray-700 shadow-sm hover:border-primary-500 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200'
            }
          >
            {isSelected ? '✓' : '+'}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="min-h-16">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-950 dark:text-white">
            {phone.brand_name} {phone.model}
          </h3>
          {phone.chipset_name && <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">{phone.chipset_name}</p>}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <dt className="text-xs text-gray-500 dark:text-gray-400">RAM</dt>
            <dd className="mt-1 font-semibold text-gray-900 dark:text-white">{valueOrFallback(phone.ram_gb, 'GB')}</dd>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Storage</dt>
            <dd className="mt-1 font-semibold text-gray-900 dark:text-white">{valueOrFallback(phone.internal_storage_gb, 'GB')}</dd>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Display</dt>
            <dd className="mt-1 font-semibold text-gray-900 dark:text-white">{valueOrFallback(phone.screen_size, '"')}</dd>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <dt className="text-xs text-gray-500 dark:text-gray-400">Battery</dt>
            <dd className="mt-1 font-semibold text-gray-900 dark:text-white">{valueOrFallback(phone.battery_capacity, 'mAh')}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Listed price</p>
            <p className="text-lg font-bold text-gray-950 dark:text-white">
              {price === undefined ? 'Price unavailable' : '৳' + price.toLocaleString()}
            </p>
          </div>
          {phone.release_date && (
            <p className="text-right text-xs text-gray-500 dark:text-gray-400">
              Released<br />
              <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(phone.release_date).getFullYear()}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onViewDetails?.(phone.phone_id)}
          className="mt-5 w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          View details
        </button>
      </div>
    </article>
  );
}
