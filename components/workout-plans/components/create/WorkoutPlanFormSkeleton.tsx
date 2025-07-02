
export function WorkoutPlanFormSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-3xl p-6 lg:p-8 shadow-app-xl">
            
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="flex items-center justify-between w-full">
                <div className="h-12 w-12 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="w-12"></div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-app-achievement-workout/30 rounded-2xl animate-pulse"></div>
                <div>
                  <div className="h-6 w-48 bg-app-bg-secondary rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-app-bg-secondary rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
            <div className="p-6 lg:p-8 space-y-6">
              
              {/* Form Fields Skeleton */}
              <div className="space-y-4">
                <div className="h-5 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="h-14 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              </div>
              
              <div className="space-y-4">
                <div className="h-5 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                <div className="h-32 bg-app-bg-secondary rounded-xl animate-pulse"></div>
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-app-bg-accent rounded-xl animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-app-achievement-workout/30 rounded-xl animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-app-bg-secondary rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-32 bg-app-bg-secondary rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/50 to-app-achievement-workout/20 rounded-2xl blur-md"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-medium">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="h-12 w-20 bg-app-bg-secondary rounded-xl animate-pulse"></div>
                <div className="h-12 w-32 bg-app-achievement-workout/30 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
