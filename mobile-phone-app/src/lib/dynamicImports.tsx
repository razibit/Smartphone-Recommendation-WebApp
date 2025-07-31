import dynamic from 'next/dynamic';
import React from 'react';

// Loading components for better UX during code splitting
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

const LoadingCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 animate-pulse">
    <div className="space-y-4">
      <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const LoadingTable = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      ))}
    </div>
  </div>
);

// Dynamically imported components with loading states
export const DynamicPhoneList = dynamic(
  () => import('@/components/PhoneList').then(mod => mod.default),
  {
    loading: () => <LoadingCard />,
    ssr: true
  }
);

export const DynamicPhoneComparison = dynamic(
  () => import('@/components/PhoneComparison').then(mod => mod.default),
  {
    loading: () => <LoadingTable />,
    ssr: false // Comparison page doesn't need SSR
  }
);

export const DynamicPhoneDetails = dynamic(
  () => import('@/components/PhoneDetails').then(mod => mod.default),
  {
    loading: () => <LoadingSpinner />,
    ssr: true
  }
);

export const DynamicFilterBar = dynamic(
  () => import('@/components/FilterBar').then(mod => mod.default),
  {
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 animate-pulse">
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          ))}
        </div>
      </div>
    ),
    ssr: true
  }
);

export const DynamicSQLQueryBox = dynamic(
  () => import('@/components/SQLQueryBox').then(mod => mod.default),
  {
    loading: () => (
      <div className="bg-gray-900 rounded-lg p-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    ),
    ssr: false // Code display doesn't need SSR
  }
);

// Feature-specific lazy imports for advanced functionality
export const DynamicToastContainer = dynamic(
  () => import('@/components/Toast').then(mod => mod.ToastContainer),
  {
    loading: () => null, // No loading state for toast
    ssr: false
  }
);

// Admin/development components removed

// Chart components for analytics (if added later)
// Currently commented out as recharts is not installed
// export const DynamicChartComponents = {
//   BarChart: dynamic(
//     () => import('recharts').then(mod => mod.BarChart),
//     { ssr: false }
//   ),
//   LineChart: dynamic(
//     () => import('recharts').then(mod => mod.LineChart),
//     { ssr: false }
//   ),
//   PieChart: dynamic(
//     () => import('recharts').then(mod => mod.PieChart),
//     { ssr: false }
//   ),
// };

// Utility function to preload components
export const preloadComponent = (componentName: keyof typeof DynamicComponents) => {
  const component = DynamicComponents[componentName];
  if (component && 'preload' in component) {
    (component as any).preload();
  }
};

// Export all dynamic components for easy access
export const DynamicComponents = {
  PhoneList: DynamicPhoneList,
  PhoneComparison: DynamicPhoneComparison,
  PhoneDetails: DynamicPhoneDetails,
  FilterBar: DynamicFilterBar,
  SQLQueryBox: DynamicSQLQueryBox,
  ToastContainer: DynamicToastContainer,
} as const;