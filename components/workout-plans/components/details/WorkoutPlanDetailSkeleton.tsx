// components/workout-plans/components/details/WorkoutPlanDetailSkeleton.tsx

export function WorkoutPlanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <div className="animate-pulse">
              
              {/* Top Actions */}
              <div className="p-6 sm:p-8 pb-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="flex gap-3">
                    <div className="w-20 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="w-24 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="w-20 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>

                {/* Title Section */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-6">
                <div className="p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
                      <div className="flex gap-3">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Skeleton */}
        <div className="relative mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
            <div className="animate-pulse">
              
              {/* Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-50/50 via-orange-50/50 to-orange-50/50 dark:from-orange-900/10 dark:via-orange-900/10 dark:to-orange-900/10 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {[1, 2, 3].map((day) => (
                  <div key={day}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                      <div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[1, 2].map((workout) => (
                        <div key={workout} className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Skeleton */}
        <div className="relative">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}