
export function WorkoutPlanDetailSkeleton() {
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

            {/* Student Info Card */}
            <div className="p-4 sm:p-6 bg-app-bg-secondary rounded-2xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-app-border-muted rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-app-border-muted rounded w-3/4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-app-border-muted rounded w-20"></div>
                    <div className="h-4 bg-app-border-muted rounded w-16"></div>
                    <div className="h-4 bg-app-border-muted rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Visão Geral Card */}
          <div className="bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-app-bg-secondary rounded animate-pulse"></div>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-app-bg-secondary rounded-2xl p-4 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="h-3 w-12 bg-app-border-muted rounded"></div>
                      <div className="h-8 w-16 bg-app-border-muted rounded"></div>
                    </div>
                    <div className="w-10 h-10 bg-app-border-muted rounded-xl"></div>
                  </div>
                  <div className="h-2 bg-app-border-muted rounded-full"></div>
                </div>
              ))}
            </div>

            {/* Composition Chart */}
            <div className="p-6 bg-app-bg-secondary rounded-2xl animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-app-border-muted rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-app-border-muted rounded"></div>
                  <div className="h-4 w-48 bg-app-border-muted rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-app-border-muted rounded-full mb-4"></div>
                  <div className="h-6 w-20 bg-app-border-muted rounded"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between p-3 bg-app-border-muted rounded-xl">
                      <div className="h-4 w-24 bg-app-bg-secondary rounded"></div>
                      <div className="h-4 w-16 bg-app-bg-secondary rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Measurements Card */}
          <div className="bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="h-5 w-8 bg-app-bg-secondary rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-app-bg-secondary rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="p-4 bg-app-bg-secondary rounded-xl animate-pulse">
                  <div className="h-4 bg-app-border-muted rounded w-full mb-2"></div>
                  <div className="h-6 bg-app-border-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                <div className="h-5 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="h-5 w-12 bg-purple-200 rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-app-bg-secondary rounded animate-pulse"></div>
            </div>
            
            {/* Summary */}
            <div className="p-4 bg-app-bg-secondary rounded-xl mb-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-app-border-muted rounded w-full"></div>
                <div className="h-4 bg-app-border-muted rounded w-5/6"></div>
                <div className="h-4 bg-app-border-muted rounded w-4/6"></div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-app-bg-secondary rounded-xl animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-app-border-muted rounded-lg"></div>
                    <div className="h-4 w-16 bg-app-border-muted rounded"></div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-3 bg-app-border-muted rounded w-full"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol Information */}
          <div className="bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
              <div className="h-5 w-40 bg-app-bg-secondary rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-app-bg-secondary rounded-xl animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-app-border-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-app-border-muted rounded"></div>
                      <div className="h-5 w-32 bg-app-border-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Actions Skeleton */}
          <div className="lg:hidden bg-app-card rounded-xl shadow-app-medium p-4 sm:p-6">
            <div className="space-y-4">
              {/* Stats */}
              <div className="space-y-3">
                <div className="h-5 w-40 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 bg-app-bg-secondary rounded-xl animate-pulse text-center">
                      <div className="h-6 w-12 bg-app-border-muted rounded mx-auto mb-1"></div>
                      <div className="h-3 w-16 bg-app-border-muted rounded mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary actions */}
              <div className="space-y-3">
                <div className="h-4 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
                {[1, 2, 3].map((i) => (
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
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 bg-app-border-muted rounded"></div>
                      <div className="h-4 w-16 bg-app-border-muted rounded"></div>
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