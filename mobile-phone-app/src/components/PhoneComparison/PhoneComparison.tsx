'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { DetailedPhone } from '@/lib/api/client';
import { OptimizedImage } from '@/components/UI';

export type PhoneDetails = DetailedPhone;

interface PhoneComparisonProps {
  phones: PhoneDetails[];
  onRemovePhone?: (phoneId: number) => void;
  loading?: boolean;
}

interface ComparisonRow {
  label: string;
  key: keyof PhoneDetails;
  category: string;
  formatter?: (value: unknown) => string;
  highlightDifferences?: boolean;
}

const comparisonFields: ComparisonRow[] = [
  { label: 'Brand', key: 'brand_name', category: 'Overview', highlightDifferences: true },
  { label: 'Model', key: 'model', category: 'Overview' },
  { label: 'Status', key: 'status', category: 'Overview', highlightDifferences: true },
  {
    label: 'Release date',
    key: 'release_date',
    category: 'Overview',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'string' ? new Date(value).getFullYear().toString() : 'N/A',
  },
  { label: 'Chipset', key: 'chipset_name', category: 'Performance', highlightDifferences: true },
  {
    label: 'RAM',
    key: 'ram_gb',
    category: 'Performance',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'number' ? value + 'GB' : 'N/A',
  },
  {
    label: 'Storage',
    key: 'internal_storage_gb',
    category: 'Performance',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'number' ? value + 'GB' : 'N/A',
  },
  {
    label: 'Screen size',
    key: 'screen_size',
    category: 'Display',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'number' || typeof value === 'string' ? value + '"' : 'N/A',
  },
  { label: 'Display type', key: 'display_type_name', category: 'Display', highlightDifferences: true },
  {
    label: 'Battery',
    key: 'battery_capacity',
    category: 'Power and pricing',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'number' ? value + 'mAh' : 'N/A',
  },
  {
    label: 'Unofficial price',
    key: 'price_unofficial',
    category: 'Power and pricing',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'number' ? '৳' + value.toLocaleString() : 'N/A',
  },
  {
    label: 'Official price',
    key: 'price_official',
    category: 'Power and pricing',
    highlightDifferences: true,
    formatter: (value) => typeof value === 'number' ? '৳' + value.toLocaleString() : 'N/A',
  },
];

function groupFields() {
  return comparisonFields.reduce<Record<string, ComparisonRow[]>>((groups, field) => {
    (groups[field.category] ??= []).push(field);
    return groups;
  }, {});
}

function displayValue(phone: PhoneDetails, field: ComparisonRow) {
  const value = phone[field.key];
  if (value === undefined || value === null || value === '') return 'N/A';
  return field.formatter ? field.formatter(value) : String(value);
}

export default function PhoneComparison({ phones, onRemovePhone, loading = false }: PhoneComparisonProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800" aria-busy="true">
        <div className="h-6 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              {Array.from({ length: 6 }, (_, row) => <div key={row} className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phones.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-white">No phones selected</h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600 dark:text-gray-400">
          Select at least two devices from the browse page to compare their specifications.
        </p>
        <Link href="/phones" className="mt-6 inline-flex rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
          Browse phones
        </Link>
      </div>
    );
  }

  const groups = groupFields();
  const hasVariation = (key: keyof PhoneDetails) => {
    const values = phones.map((phone) => phone[key]);
    return values.some((value) => value !== values[0]);
  };

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800" aria-labelledby="comparison-heading">
      <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center dark:border-gray-700">
        <h2 id="comparison-heading" className="text-xl font-semibold text-gray-950 dark:text-white">
          Comparison · {phones.length} phones
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Highlighted values differ between devices.</p>
      </div>

      <div className="block space-y-6 p-4 lg:hidden">
        {phones.map((phone) => (
          <article key={phone.phone_id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <OptimizedImage
                  src={phone.image_url}
                  alt={phone.brand_name + ' ' + phone.model}
                  className="h-12 w-12 rounded-lg bg-white"
                  sizes="48px"
                  priority
                />
                <div>
                  <h3 className="font-semibold text-gray-950 dark:text-white">{phone.brand_name} {phone.model}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{phone.status}</p>
                </div>
              </div>
              {onRemovePhone && (
                <button
                  type="button"
                  aria-label={'Remove ' + phone.brand_name + ' ' + phone.model}
                  onClick={() => onRemovePhone(phone.phone_id)}
                  className="rounded-md px-2 py-1 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              )}
            </div>
            <dl className="mt-5 space-y-3">
              {Object.entries(groups).flatMap(([, fields]) => fields).map((field) => (
                <div key={String(field.key)} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-600 dark:text-gray-400">{field.label}</dt>
                  <dd className={
                    field.highlightDifferences && hasVariation(field.key)
                      ? 'rounded bg-primary-50 px-2 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-right font-medium text-gray-950 dark:text-white'
                  }>
                    {displayValue(phone, field)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">Phone specification comparison</caption>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th scope="col" className="w-48 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Specification</th>
              {phones.map((phone) => (
                <th scope="col" key={phone.phone_id} className="min-w-56 p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <OptimizedImage
                      src={phone.image_url}
                      alt={phone.brand_name + ' ' + phone.model}
                      className="h-16 w-16 rounded-lg bg-white"
                      sizes="64px"
                      priority
                    />
                    <span className="text-sm font-semibold text-gray-950 dark:text-white">{phone.brand_name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{phone.model}</span>
                    {onRemovePhone && (
                      <button type="button" onClick={() => onRemovePhone(phone.phone_id)} className="text-xs font-medium text-red-700 hover:underline dark:text-red-300">
                        Remove
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([category, fields]) => (
              <Fragment key={category}>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th scope="colgroup" colSpan={phones.length + 1} className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">{category}</th>
                </tr>
                {fields.map((field) => (
                  <tr key={String(field.key)} className="border-b border-gray-100 dark:border-gray-700">
                    <th scope="row" className="bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">{field.label}</th>
                    {phones.map((phone) => (
                      <td key={phone.phone_id} className="px-4 py-3 text-center text-sm">
                        <span className={
                          field.highlightDifferences && hasVariation(field.key)
                            ? 'rounded bg-primary-50 px-2 py-1 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'text-gray-900 dark:text-white'
                        }>
                          {displayValue(phone, field)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
