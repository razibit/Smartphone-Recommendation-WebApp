'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PhoneComparison from '@/components/PhoneComparison';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { apiClient, DetailedPhone } from '@/lib/api/client';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, removeToast, error: showError, info } = useToast();
  const requestSequence = useRef(0);
  const [phones, setPhones] = useState<DetailedPhone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneIdsParam = searchParams.get('phones');
  const phoneIds = Array.from(new Set(
    (phoneIdsParam || '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => /^\d+$/.test(value))
      .map(Number)
      .filter((value) => value > 0),
  )).slice(0, 4);
  const phoneIdsKey = phoneIds.join(',');

  useEffect(() => {
    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;
    const requestedPhoneIds = phoneIdsKey
      ? phoneIdsKey.split(',').map(Number)
      : [];

    if (requestedPhoneIds.length === 0) {
      setPhones([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all(requestedPhoneIds.map((phoneId) => apiClient.getPhoneDetails(phoneId)))
      .then((responses) => {
        if (sequence !== requestSequence.current) return;
        const validPhones = responses
          .filter((response) => response.success && response.data?.phone)
          .map((response) => response.data!.phone);
        const unavailableResponses = responses.filter((response) => !response.success);

        if (validPhones.length === 0) {
          setPhones([]);
          if (unavailableResponses.length === responses.length) {
            setError('The API service is unavailable. Check the connection and try again.');
            showError('Loading failed', 'The comparison service could not be reached.', 5000);
          } else {
            setError('No matching phone records were found.');
            showError('No phones found', 'The selected device IDs are not available.', 5000);
          }
          return;
        }

        setPhones(validPhones);
        if (validPhones.length !== requestedPhoneIds.length) {
          setError('Some selected devices could not be loaded and were omitted.');
        }
      })
      .catch(() => {
        if (sequence !== requestSequence.current) return;
        setPhones([]);
        setError('The comparison could not be loaded. Check the API connection and try again.');
        showError('Loading failed', 'The comparison service did not return the selected devices.', 7000);
      })
      .finally(() => {
        if (sequence === requestSequence.current) setLoading(false);
      });
  }, [phoneIdsKey, showError]);

  const updateSelection = (nextPhones: DetailedPhone[]) => {
    const query = nextPhones.length > 0
      ? '/compare?phones=' + nextPhones.map((phone) => phone.phone_id).join(',')
      : '/compare';
    router.replace(query);
  };

  const handleRemovePhone = (phoneId: number) => {
    const removed = phones.find((phone) => phone.phone_id === phoneId);
    updateSelection(phones.filter((phone) => phone.phone_id !== phoneId));
    if (removed) info('Phone removed', removed.brand_name + ' ' + removed.model + ' was removed.', 3000);
  };

  const handleClearAll = () => {
    updateSelection([]);
    info('Comparison cleared', 'All selected devices were removed.', 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">Decision workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 dark:text-white md:text-4xl">Compare mobile phones</h1>
            <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
              Review selected devices side by side. Differences are highlighted across the core specifications.
            </p>
          </div>
          {phones.length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={handleClearAll} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20">
                Clear all
              </button>
              <Link href="/phones" className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                Add phones
              </Link>
            </div>
          )}
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200" role="status">
            {error}
          </div>
        )}

        <PhoneComparison phones={phones} onRemovePhone={handleRemovePhone} loading={loading} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
      <CompareContent />
    </Suspense>
  );
}
