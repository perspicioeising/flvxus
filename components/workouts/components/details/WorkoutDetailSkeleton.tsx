// components/workouts/detail/components/WorkoutDetailSkeleton.tsx

export function WorkoutDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-red-200/50 dark:border-red-800/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
            
            {/* Back Button */}
            <div className="mb-6">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              
              {/* Workout Info */}
              <div className="flex-1">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-800 dark:to-red-700 rounded-2xl animate-pulse"></div>
                  
                  <div className="flex-1">
                    <div className="h-8 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3"></div>
                    <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                    
                    {/* Badges */}
                    <div className="flex gap-3 mb-4">
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 lg:w-64">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Stats Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-2xl blur-md"></div>
                <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
                  <div className="p-6">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                            <div>
                              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exercise List Skeleton */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-2xl blur-md"></div>
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Exercise Cards */}
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                        
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-800 dark:to-red-700 rounded-2xl animate-pulse"></div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              </div>
                              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                            </div>

                            {/* Badges */}
                            <div className="flex gap-2 mb-4">
                              {[1, 2, 3].map((j) => (
                                <div key={j} className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Parameters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                <div>
                                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                                  <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}