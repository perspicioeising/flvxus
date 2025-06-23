// components/exercises/details/ExerciseDetailsSkeleton.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

// components/exercises/details/ExerciseDetailsSkeleton.tsx

export function ExerciseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-6xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-6">
          <div className="bg-app-card rounded-2xl sm:rounded-3xl shadow-app-xl p-4 sm:p-6 lg:p-8">
            
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="h-10 w-20 sm:w-24 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              <div className="h-10 w-10 bg-app-bg-secondary rounded-xl animate-pulse sm:hidden"></div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="h-10 w-20 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="h-10 w-20 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="h-10 w-20 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Title and Icon */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-bg-secondary rounded-xl animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 sm:h-8 bg-app-bg-secondary rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-app-bg-secondary rounded w-1/2 animate-pulse"></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-app-bg-secondary rounded-xl p-3 animate-pulse">
                  <div className="h-6 w-8 bg-app-border-muted rounded mx-auto mb-1"></div>
                  <div className="h-3 w-12 bg-app-border-muted rounded mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-app-bg-secondary rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Description */}
          <div className="bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
              <div className="h-5 w-20 bg-app-bg-secondary rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-app-bg-secondary rounded w-full animate-pulse"></div>
              <div className="h-4 bg-app-bg-secondary rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-app-bg-secondary rounded w-4/6 animate-pulse"></div>
            </div>
          </div>

          {/* Media Skeleton */}
          <div className="bg-app-card rounded-xl shadow-app-medium overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
              </div>
            </div>
            <div className="aspect-video bg-app-bg-secondary animate-pulse"></div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4 sm:grid sm:grid-cols-1 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                  <div className="h-5 w-20 bg-app-bg-secondary rounded animate-pulse"></div>
                  <div className="h-5 w-8 bg-app-bg-secondary rounded-full animate-pulse ml-auto"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="p-3 bg-app-bg-secondary rounded-lg animate-pulse">
                      <div className="h-4 bg-app-border-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Actions Skeleton */}
          <div className="lg:hidden bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="space-y-4">
              <div className="h-5 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
              
              {/* Primary actions */}
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-app-border-muted my-6"></div>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="h-11 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              </div>

              {/* Info section */}
              <div className="p-4 bg-app-bg-secondary rounded-xl animate-pulse">
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 bg-app-border-muted rounded"></div>
                      <div className="h-4 w-8 bg-app-border-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}