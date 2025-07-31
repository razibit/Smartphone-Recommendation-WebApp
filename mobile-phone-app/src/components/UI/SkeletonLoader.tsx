'use client';

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const sizeStyles = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={sizeStyles}
    />
  );
}

// Predefined skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        variant="text"
        className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 ${className}`}>
    <div className="space-y-4">
      {/* Image skeleton */}
      <SkeletonLoader variant="rounded" className="w-full aspect-[4/3]" />
      
      {/* Title skeleton */}
      <div className="space-y-2">
        <SkeletonLoader variant="text" className="h-6 w-3/4" />
        <SkeletonLoader variant="text" className="h-4 w-1/2" />
      </div>
      
      {/* Specs skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <SkeletonLoader variant="text" className="h-3 w-12 mb-2" />
            <SkeletonLoader variant="text" className="h-4 w-16" />
          </div>
        ))}
      </div>
      
      {/* Price skeleton */}
      <SkeletonLoader variant="text" className="h-8 w-24" />
      
      {/* Buttons skeleton */}
      <div className="flex space-x-2">
        <SkeletonLoader variant="rounded" className="flex-1 h-10" />
        <SkeletonLoader variant="rounded" className="w-10 h-10" />
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ 
  rows = 5, 
  cols = 4, 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: cols }).map((_, index) => (
          <SkeletonLoader key={index} variant="text" className="h-4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} variant="text" className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <SkeletonLoader variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" className="h-4 w-3/4" />
          <SkeletonLoader variant="text" className="h-3 w-1/2" />
        </div>
        <SkeletonLoader variant="rounded" className="w-20 h-8" />
      </div>
    ))}
  </div>
);