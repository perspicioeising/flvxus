// components/physical-assessments/components/assessmentDetailsSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AssessmentDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
            
            {/* Header Top Row */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-300 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
                  <div className="min-w-0 flex-1">
                    <div className="h-5 sm:h-8 w-32 sm:w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 sm:h-5 w-24 sm:w-36 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="hidden sm:flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-24 h-8 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Student Info Card Skeleton */}
            <div className="relative mx-auto max-w-md sm:max-w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
              <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse flex-shrink-0"></div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4 mx-auto sm:mx-0"></div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mx-auto max-w-xs sm:max-w-full sm:grid-cols-4 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-center sm:justify-start gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    <div className="h-6 sm:h-10 w-24 sm:w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto sm:mx-0 mb-2"></div>
                    <div className="h-4 sm:h-5 w-20 sm:w-28 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto sm:mx-0 mb-1"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
          <div className="relative grid w-full grid-cols-2 sm:grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 sm:h-12 bg-gray-300 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main Metrics Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="space-y-1">
                      <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-6 sm:h-10 w-12 sm:w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="w-8 h-8 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-700 rounded-lg sm:rounded-2xl animate-pulse"></div>
                  </div>
                  <div className="h-1 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Large Content Card Skeleton */}
          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
            <CardHeader className="p-4 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
                <div>
                  <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 sm:h-5 w-48 sm:w-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-4 sm:space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 sm:h-24 bg-gray-300 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}