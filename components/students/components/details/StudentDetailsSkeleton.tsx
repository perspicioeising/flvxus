'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function StudentDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-6xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
            <div className="p-4 sm:p-6 lg:p-8">
              
              {/* Navigation Bar */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="h-10 w-10 sm:h-12 sm:w-24 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-10 w-20 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                  <div className="h-10 w-20 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                  <div className="h-10 w-24 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                </div>
                <div className="sm:hidden h-10 w-10 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              </div>

              {/* Student Info */}
              <div className="space-y-4">
                
                {/* Title and Icon */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-bg-secondary rounded-xl sm:rounded-2xl animate-pulse"></div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-6 sm:h-8 bg-app-bg-secondary rounded-lg animate-pulse w-3/4"></div>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-5 w-16 bg-app-bg-secondary rounded-full animate-pulse"></div>
                      <div className="h-5 w-12 bg-app-bg-secondary rounded-full animate-pulse"></div>
                      <div className="h-5 w-20 bg-app-bg-secondary rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-4 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                      <div className="h-4 w-28 bg-app-bg-secondary rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-app-border-muted rounded-xl p-3">
                      <div className="h-6 w-8 bg-app-bg-secondary rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-12 bg-app-bg-secondary rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-4 bg-app-bg-secondary rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 w-16 bg-app-bg-secondary rounded-full animate-pulse"></div>
                      <div className="h-6 w-20 bg-app-bg-secondary rounded-full animate-pulse"></div>
                      <div className="h-6 w-14 bg-app-bg-secondary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Cards Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Personal Information Card */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 sm:h-6 w-40 bg-app-bg-secondary rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                      <div className="w-8 h-8 bg-app-border-muted rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-16 bg-app-border-muted rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-app-border-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                      <div className="w-8 h-8 bg-app-border-muted rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-20 bg-app-border-muted rounded animate-pulse"></div>
                        <div className="h-4 w-28 bg-app-border-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Profile Card */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 sm:h-6 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-app-border-accent rounded-xl">
                    <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-12 bg-app-bg-secondary rounded animate-pulse"></div>
                      <div className="h-5 w-16 bg-app-bg-secondary rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Card */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 sm:h-6 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="h-5 w-8 bg-app-bg-secondary rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 border border-app-border-accent rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-app-bg-secondary rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 w-full bg-app-bg-secondary rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-app-bg-secondary rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Information Card */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 sm:h-6 w-36 bg-app-bg-secondary rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-4 bg-red-200 dark:bg-red-800 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-red-200 dark:bg-red-800 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-red-100 dark:bg-red-900 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-red-100 dark:bg-red-900 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                  <div className="w-8 h-8 bg-app-border-muted rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-app-border-muted rounded animate-pulse"></div>
                    <div className="h-4 w-40 bg-app-border-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Actions Skeleton */}
        <div className="lg:hidden mt-6">
          <Card className="border-0 card-app">
            <CardContent className="p-4 sm:p-6">
              
              {/* Quick Stats Skeleton */}
              <div className="mb-6">
                <div className="h-5 w-32 bg-app-bg-secondary rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-app-border-accent rounded-xl p-3 text-center">
                      <div className="h-6 w-8 bg-app-bg-secondary rounded animate-pulse mx-auto mb-2"></div>
                      <div className="h-3 w-12 bg-app-bg-secondary rounded animate-pulse mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-24 bg-app-bg-secondary rounded animate-pulse mb-3"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 w-full bg-app-bg-secondary rounded-xl animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}