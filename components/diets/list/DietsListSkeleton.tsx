// /components/diets/components/list/DietsListSkeleton.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MODULE_COLORS } from '../constants';

export function DietsListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

        {/* Header Skeleton */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${MODULE_COLORS.primary.gradient} rounded-3xl blur-xl opacity-20`}></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/30 rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                  <div>
                    <div className="h-8 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 sm:w-48 mb-2" />
                    <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 sm:w-64" />
                  </div>
                </div>
              </div>
              <div className="w-24 sm:w-32 h-11 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1 h-10 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="w-full lg:w-[200px] h-10 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${MODULE_COLORS.primary.gradient} rounded-2xl blur-xl opacity-10`}></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <DietsListContentSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DietsListContentSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card 
          key={i} 
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          style={{
            animation: `shimmer 1.5s infinite ${i * 0.2}s`
          }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">
              
              {/* Content Area */}
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 sm:gap-4">
                  
                  {/* Icon Placeholder */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
                  
                  {/* Text Content */}
                  <div className="space-y-2 flex-1">
                    
                    {/* Title and Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 sm:w-48" />
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16 sm:w-20" />
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    </div>
                    
                    {/* Meta Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 sm:w-32" />
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 sm:w-40" />
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 sm:w-24" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 xl:flex-col xl:items-stretch xl:w-[120px] sm:xl:w-[140px]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex gap-2 xl:flex-col xl:gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Shimmer Animation CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Export both for flexibility
export { DietsListContentSkeleton };