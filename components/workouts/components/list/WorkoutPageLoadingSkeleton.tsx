// components/workouts/components/list/WorkoutPageLoadingSkeleton.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";

export function WorkoutPageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">

        {/* Header Skeleton */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-app-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-bg-secondary rounded-xl sm:rounded-2xl animate-pulse" />
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="h-6 sm:h-8 bg-app-bg-secondary rounded animate-pulse w-32 sm:w-48" />
                  <div className="h-4 sm:h-5 bg-app-bg-secondary rounded animate-pulse w-48 sm:w-64" />
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-app-bg-secondary rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/5 via-app-achievement-workout/10 to-app-achievement-workout/5 rounded-xl blur-lg"></div>
            <div className="relative h-12 sm:h-14 bg-app-bg-secondary rounded-xl animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 sm:h-14 bg-app-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Content Skeleton - Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="h-80 bg-app-card backdrop-blur-sm rounded-2xl shadow-app-medium border border-app-border-muted">
              <div className="flex flex-col h-full">
                {/* Header skeleton */}
                <div className="h-32 sm:h-36 bg-app-bg-secondary rounded-t-2xl animate-pulse" />
                
                {/* Content skeleton */}
                <CardContent className="flex-1 p-4 sm:p-5 flex flex-col">
                  <div className="space-y-3 mb-4">
                    <div className="h-5 bg-app-bg-secondary rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-full" />
                    <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-5/6" />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-app-bg-secondary rounded animate-pulse w-1/3" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-16" />
                      <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-20" />
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-2 space-y-3">
                    <div className="h-3 bg-app-bg-secondary rounded animate-pulse w-1/4" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-app-bg-secondary rounded animate-pulse w-20" />
                      <div className="h-3 bg-app-bg-secondary rounded animate-pulse w-16" />
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