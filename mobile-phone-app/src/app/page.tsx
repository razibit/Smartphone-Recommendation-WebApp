
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DynamicComponents } from '@/lib/dynamicImports';

// Use dynamic imports for better performance
const { SQLQueryBox, PhoneDetails } = DynamicComponents;

export default function Home() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
              Find Your Perfect
              <span className="text-primary-600 dark:text-primary-400"> Mobile Phone</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              A comprehensive database-driven system demonstrating 3NF/BCNF normalization 
              with advanced filtering, comparison, and SQL query visualization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                href="/phones"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-card hover:shadow-card-hover transform hover:-translate-y-1"
              >
                Browse Phones
              </Link>
              <Link
                href="/compare"
                className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-gray-700"
              >
                Compare Phones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Advanced functionality built on a properly normalized database structure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Filtering
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Filter by brand, chipset, display type, storage, price range, and more
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Side-by-Side Comparison
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Compare multiple phones with detailed specifications and pricing
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                SQL Query Visualization
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                See the actual SQL queries and execution times for educational purposes
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Normalized Database
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Demonstrates 3NF/BCNF principles with 15+ interconnected tables
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Database Architecture Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Database Architecture
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              This project demonstrates proper database normalization by transforming a flat CSV with 67+ columns 
              into a normalized relational database with 15 interconnected tables.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Normalization Benefits
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Eliminates Data Redundancy</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Brand and chipset information stored once and referenced</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Maintains Data Integrity</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Foreign key constraints ensure referential integrity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Supports Complex Queries</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Efficient JOINs across normalized tables</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">3NF & BCNF Compliant</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No transitive dependencies, each table has single candidate key</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-card">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Database Tables
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                  <span className="font-medium text-primary-700 dark:text-primary-300">phones</span>
                </div>
                <div className="bg-secondary-50 dark:bg-secondary-900/20 p-3 rounded-lg">
                  <span className="font-medium text-secondary-700 dark:text-secondary-300">brands</span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <span className="font-medium text-green-700 dark:text-green-300">chipsets</span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <span className="font-medium text-purple-700 dark:text-purple-300">phone_specifications</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <span className="font-medium text-orange-700 dark:text-orange-300">display_specifications</span>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                  <span className="font-medium text-pink-700 dark:text-pink-300">physical_specifications</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">camera_specifications</span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">phone_pricing</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                ...and 7 more tables for complete normalization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SQL Query Demo Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Educational SQL Query Visualization
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See exactly how your filters translate into complex SQL queries across our normalized database structure. 
              This transparency makes it an excellent learning tool for database concepts.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <SQLQueryBox
              query={`SELECT DISTINCT
    p.phone_id,
    b.brand_name,
    p.model,
    p.image_url,
    p.status,
    p.release_date,
    ps.ram_gb,
    ps.internal_storage_gb,
    ps.battery_capacity,
    ds.screen_size,
    dt.display_type_name,
    c.chipset_name,
    pr.price_unofficial,
    pr.price_official
FROM phones p
INNER JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id
LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE b.brand_name = 'Samsung'
  AND c.chipset_name LIKE '%Snapdragon%'
  AND ps.ram_gb >= 8
  AND (pr.price_unofficial >= 500 OR pr.price_official >= 500)
  AND (pr.price_unofficial <= 1200 OR pr.price_official <= 1200)
ORDER BY p.phone_id ASC
LIMIT 20 OFFSET 0`}
              visible={true}
              executionTime={15}
              resultCount={47}
            />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Syntax Highlighting
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Keywords, strings, numbers, and operators are color-coded for easy reading
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Performance Metrics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Real execution times and result counts help understand query efficiency
          </p>
        </div>
        
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Educational Value
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Query analysis shows normalization benefits and database structure
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setShowDemoModal(true)}
              className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-primary-200 dark:hover:bg-primary-900/50 inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview Phone Details Modal</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Start filtering through our database of mobile phones and see the power of normalized database design in action.
          </p>
          <Link
            href="/phones"
            className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-card hover:shadow-card-hover transform hover:-translate-y-1 inline-block"
          >
            Start Browsing Phones
          </Link>
        </div>
      </section>

      {/* Demo Phone Details Modal */}
      <PhoneDetails
        phoneId={1} // Demo with phone ID 1
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
      

    </div>
  );
}
