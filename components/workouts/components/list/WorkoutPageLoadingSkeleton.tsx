// components/workouts/components/list/WorkoutPageLoadingSkeleton.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";

export function WorkoutPageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">

        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-rose-500/20 to-pink-600/20 dark:from-pink-500/10 dark:via-rose-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-pink-200/50 dark:border-pink-800/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 sm:w-48" />
                  <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 sm:w-64" />
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-rose-500/10 to-pink-600/10 dark:from-pink-500/5 dark:via-rose-400/5 dark:to-pink-500/5 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-1" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Skeleton - Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="h-80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col h-full">
                {/* Header skeleton */}
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-2xl animate-pulse" />
                
                {/* Content skeleton */}
                <CardContent className="flex-1 p-5 flex flex-col">
                  <div className="space-y-3 mb-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-2 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                    </div>
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        ))}
                      </div>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}