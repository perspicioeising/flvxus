// components/workouts/detail/components/WorkoutDetailSkeleton.tsx

export function WorkoutDetailSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-app-xl">
            
            {/* Back Button */}
            <div className="mb-6">
              <div className="h-12 w-12 bg-app-bg-secondary rounded-xl animate-pulse"></div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              
              {/* Workout Info */}
              <div className="flex-1">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-app-achievement-workout/20 rounded-2xl animate-pulse"></div>
                  
                  <div className="flex-1">
                    <div className="h-6 sm:h-8 w-72 bg-app-bg-secondary rounded-lg animate-pulse mb-3"></div>
                    <div className="h-4 w-96 bg-app-bg-secondary rounded-lg animate-pulse mb-4"></div>
                    <div className="h-4 w-80 bg-app-bg-secondary rounded-lg animate-pulse mb-4"></div>
                    
                    {/* Badges */}
                    <div className="flex gap-3 mb-4">
                      <div className="h-8 w-24 bg-app-bg-secondary rounded-full animate-pulse"></div>
                      <div className="h-8 w-28 bg-app-bg-secondary rounded-full animate-pulse"></div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-app-bg-secondary rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-app-bg-secondary rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 lg:w-64">
                <div className="h-12 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="h-12 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="h-12 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Stats Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
                <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
                  <div className="p-6">
                    <div className="h-6 w-32 bg-app-bg-secondary rounded-lg animate-pulse mb-6"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="p-4 bg-app-bg-secondary/20 rounded-xl border border-app-border-muted">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                            <div>
                              <div className="h-3 w-16 bg-app-bg-secondary rounded animate-pulse mb-2"></div>
                              <div className="h-6 w-12 bg-app-bg-secondary rounded animate-pulse"></div>
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
              <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
              <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
                
                {/* Header */}
                <div className="p-6 border-b border-app-border-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                      <div className="h-6 w-48 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-5 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Exercise Cards */}
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-6 bg-gradient-to-r from-app-card to-app-bg-secondary/20 rounded-2xl border-2 border-app-border-muted">
                        
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-app-achievement-workout/20 rounded-2xl animate-pulse"></div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="h-6 w-48 bg-app-bg-secondary rounded-lg animate-pulse mb-2"></div>
                                <div className="h-4 w-64 bg-app-bg-secondary rounded animate-pulse"></div>
                              </div>
                              <div className="h-8 w-24 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                            </div>

                            {/* Badges */}
                            <div className="flex gap-2 mb-4">
                              {[1, 2, 3].map((j) => (
                                <div key={j} className="h-6 w-16 bg-app-bg-secondary rounded-full animate-pulse"></div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Parameters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="p-3 bg-app-bg-secondary/20 rounded-xl border border-app-border-muted">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                                <div>
                                  <div className="h-3 w-12 bg-app-bg-secondary rounded animate-pulse mb-1"></div>
                                  <div className="h-5 w-8 bg-app-bg-secondary rounded animate-pulse"></div>
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