// /components/exercises/components/list/ExerciseLoadingSkeleton.tsx

import { Card, CardContent } from "@/components/ui/card";

interface ExerciseLoadingSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

export function ExerciseLoadingSkeleton({ viewMode = 'grid', count = 12 }: ExerciseLoadingSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="relative group h-full">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-achievement-exercise/10 to-app-text-accent/10 rounded-2xl blur-md opacity-50"></div>

            {/* Main card */}
            <Card className="relative h-full border-0 card-app transition-all duration-300 rounded-2xl overflow-hidden">
              {/* Card content */}
              <div className="relative flex flex-col h-full">
                {/* Header with image/icon */}
                <div className="relative h-32 sm:h-36 achievement-exercise rounded-t-2xl overflow-hidden flex items-center justify-center">
                  {/* Background particles effect */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full transform translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full transform -translate-x-6 sm:-translate-x-8 translate-y-6 sm:translate-y-8"></div>
                  </div>

                  {/* Main icon skeleton */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center shadow-app-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <CardContent className="flex-1 p-4 sm:p-5 flex flex-col">
                  {/* Title and description */}
                  <div className="mb-3 sm:mb-4">
                    <div className="h-5 sm:h-6 bg-app-bg-secondary rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>

                  {/* Muscle groups */}
                  <div className="mb-3 sm:mb-4">
                    <div className="h-3 bg-app-bg-secondary rounded animate-pulse w-24 mb-2"></div>
                    <div className="flex flex-wrap gap-1.5">
                      <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-16"></div>
                      <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-20"></div>
                      <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-12"></div>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="mt-auto pt-2">
                    <div className="h-3 bg-app-bg-secondary rounded animate-pulse w-20 mb-1"></div>
                    <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-full"></div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // List view skeleton
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/5 via-achievement-exercise/5 to-app-text-accent/5 rounded-xl blur-lg opacity-50"></div>
          
          <Card className="relative border-0 card-app transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 achievement-exercise rounded-xl flex items-center justify-center shadow-app-medium">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="h-5 sm:h-6 bg-app-bg-secondary rounded animate-pulse w-2/3 mb-2"></div>
                  <div className="space-y-1 mb-3">
                    <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-3/4"></div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-16"></div>
                    <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-20"></div>
                    <div className="h-6 bg-app-bg-secondary rounded-full animate-pulse w-12"></div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-app-bg-secondary rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

export function ExercisePageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">

        {/* Header Skeleton */}
        <div className="relative mb-6 sm:mb-8">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-btn-primary/10 to-app-text-accent/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-app-xl">
            
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-achievement-consecutive rounded-full transform translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-achievement-exercise rounded-full transform -translate-x-4 sm:-translate-x-6 translate-y-4 sm:translate-y-6"></div>
            </div>

            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                
                {/* Left side - Icon and content */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  
                  {/* Icon container */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 achievement-exercise rounded-xl sm:rounded-2xl animate-pulse"></div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="h-6 sm:h-8 lg:h-10 bg-app-bg-secondary rounded animate-pulse w-32 sm:w-48 mb-2"></div>
                    <div className="h-4 sm:h-5 bg-app-bg-secondary rounded animate-pulse w-24 sm:w-40"></div>
                  </div>
                </div>

                {/* Right side - Action button */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-app-bg-secondary rounded-xl animate-pulse shrink-0"></div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-text-accent/30 to-transparent"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-achievement-workout/5 via-achievement-exercise/5 to-achievement-workout/5 rounded-xl blur-lg"></div>
            <div className="relative">
              <div className="h-12 sm:h-14 bg-app-card border border-app-border-muted rounded-xl shadow-app-medium animate-pulse"></div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1 h-12 sm:h-14 bg-app-card border-2 border-app-border-muted rounded-xl animate-pulse"></div>
            <div className="col-span-1 h-12 sm:h-14 bg-app-card border-2 border-app-border-muted rounded-xl animate-pulse"></div>
            <div className="col-span-1 h-12 sm:h-14 bg-app-card border-2 border-dashed border-app-border-muted rounded-xl animate-pulse"></div>
            <div className="col-span-1 h-12 sm:h-14 bg-app-card border-2 border-dashed border-app-border-muted rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <ExerciseLoadingSkeleton />
      </div>
    </div>
  );
}