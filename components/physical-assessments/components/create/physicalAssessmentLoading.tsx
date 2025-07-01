
export function PhysicalAssessmentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-app-achievement-workout/30 rounded-full animate-spin border-t-app-achievement-workout"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-app-achievement-workout/50"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-app-heading">Carregando avaliação...</h3>
          <p className="text-app-text-secondary">Preparando o sistema de análise</p>
        </div>
      </div>
    </div>
  );
}

export function PhysicalAssessmentFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header Skeleton - CORES AJUSTADAS */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/5 to-app-achievement-workout/10 rounded-3xl blur-xl"></div>
          <div className="relative card-app backdrop-blur-xl border border-app-border-accent rounded-3xl p-6 lg:p-8 shadow-app-xl">
            <div className="animate-pulse space-y-6">
              {/* Back button + title skeleton */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-app-bg-secondary rounded-xl"></div>
                <div className="w-12"></div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-app-bg-secondary rounded-2xl mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-app-bg-secondary rounded w-48 mx-auto"></div>
                  <div className="h-4 bg-app-bg-secondary rounded w-64 mx-auto"></div>
                </div>
              </div>
              
              {/* Progress skeleton */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-app-bg-secondary rounded w-20"></div>
                  <div className="h-6 bg-app-bg-secondary rounded w-24"></div>
                </div>
                <div className="h-2 bg-app-bg-secondary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Steps Navigation Skeleton - CORES AJUSTADAS */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-14 h-14 bg-app-bg-secondary rounded-2xl"></div>
                <div className="ml-3 h-4 bg-app-bg-secondary rounded w-16 hidden sm:block"></div>
                {i < 5 && (
                  <div className="mx-6 h-1 w-12 bg-app-bg-secondary rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton - CORES AJUSTADAS */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/5 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
          <div className="relative card-app backdrop-blur-xl rounded-2xl shadow-app-xl">
            <div className="p-6 lg:p-8 animate-pulse space-y-6">
              <div className="space-y-4">
                <div className="h-6 bg-app-bg-secondary rounded w-40"></div>
                <div className="h-12 bg-app-bg-secondary rounded"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 bg-app-bg-secondary rounded w-32"></div>
                    <div className="h-12 bg-app-bg-secondary rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-app-bg-secondary rounded w-24"></div>
                <div className="h-24 bg-app-bg-secondary rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton - CORES AJUSTADAS */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/30 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
          <div className="relative card-app backdrop-blur-xl rounded-2xl shadow-app-large">
            <div className="p-6 animate-pulse">
              <div className="flex justify-between">
                <div className="h-12 bg-app-bg-secondary rounded w-24"></div>
                <div className="h-12 bg-app-bg-secondary rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}