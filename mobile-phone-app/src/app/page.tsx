'use client';

import Link from 'next/link';

const capabilities = [
  {
    title: 'Search with precision',
    description: 'Filter devices by brand, chipset, display, storage, memory, battery, screen size, and price.',
  },
  {
    title: 'Compare decisions',
    description: 'Select up to four devices and review their specifications in a responsive comparison view.',
  },
  {
    title: 'Inspect device details',
    description: 'Open a focused detail view with technical specifications, variants, colours, and pricing.',
  },
  {
    title: 'Understand the data',
    description: 'Review the relational data model and, when enabled for development, the query diagnostics returned by the API.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-gray-200 bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 dark:border-gray-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-300">
              PhoneDB
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-6xl">
              Search, understand, and compare mobile phones.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              PhoneDB turns a structured mobile phone catalogue into a practical
              search and comparison experience for product research and technical
              evaluation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/phones"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Browse phones
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Open comparison
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-gray-900" aria-labelledby="capabilities-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="capabilities-heading" className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
              A focused catalogue workflow
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              The interface keeps discovery, comparison, and data transparency in one
              place without requiring a separate account or workflow.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <article key={capability.title} className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
                <h3 className="font-semibold text-gray-950 dark:text-white">{capability.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{capability.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-950" aria-labelledby="architecture-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <h2 id="architecture-heading" className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
              Built around a clear data path
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-400">
              The Next.js frontend communicates with a typed Express API. The API
              validates requests, builds parameterized MySQL queries, and returns
              stable response envelopes for the browse, detail, and comparison flows.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {['Next.js', 'React', 'TypeScript', 'Express', 'MySQL'].map((technology) => (
                <span key={technology} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  {technology}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-950 dark:text-white">Development diagnostics</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Query text and timing are shown only when the backend is explicitly
              configured to expose diagnostics in a non-production environment. The
              product interface never presents fabricated query results.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary-700 py-16 text-white dark:bg-primary-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Start with the catalogue</h2>
          <p className="mx-auto mt-3 max-w-2xl text-primary-100">
            Apply a few filters, select devices, and use the comparison workspace to
            make the differences easy to review.
          </p>
          <Link
            href="/phones"
            className="mt-7 inline-flex items-center rounded-lg bg-white px-5 py-3 font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Browse phones
          </Link>
        </div>
      </section>
    </div>
  );
}
