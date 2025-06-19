export function PhysicalAssessmentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full animate-spin border-t-indigo-600 dark:border-t-indigo-400"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-indigo-400 dark:border-t-indigo-500"></div>
        </div>
      </div>
    </div>
  );
}

// components/physical-assessments/components/PhysicalAssessmentFormSkeleton.tsx

export function PhysicalAssessmentFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-indigo-500/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-800/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
            <div className="animate-pulse space-y-6">
              {/* Back button + title skeleton */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="w-12"></div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
                </div>
              </div>
              
              {/* Progress skeleton */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Steps Navigation Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="ml-3 h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 hidden sm:block"></div>
                {i < 5 && (
                  <div className="mx-6 h-1 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-indigo-500/10 to-indigo-600/10 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
            <div className="p-6 lg:p-8 animate-pulse space-y-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-indigo-200/50 dark:from-gray-700/50 dark:to-indigo-700/50 rounded-2xl blur-md"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-lg">
            <div className="p-6 animate-pulse">
              <div className="flex justify-between">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}