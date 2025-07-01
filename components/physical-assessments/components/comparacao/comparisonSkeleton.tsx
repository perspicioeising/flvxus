// components/physical-assessments/components/comparisonSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ComparisonSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-achievement-exercise/20 to-app-achievement-workout/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card className="relative border-0 bg-app-bg-card/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-app-medium">
          <CardHeader className="p-4 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-bg-secondary rounded-xl sm:rounded-2xl animate-pulse mx-auto sm:mx-0"></div>
                <div className="text-center sm:text-left">
                  <div className="h-6 sm:h-8 w-48 sm:w-64 bg-app-bg-secondary rounded animate-pulse mb-2"></div>
                  <div className="h-4 sm:h-5 w-32 sm:w-48 bg-app-bg-secondary rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-24 h-20 sm:w-32 sm:h-24 bg-app-bg-secondary rounded-xl animate-pulse mx-auto lg:mx-0"></div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="h-4 w-24 bg-app-bg-secondary rounded animate-pulse"></div>
              <div className="h-10 w-full max-w-xs bg-app-bg-secondary rounded-xl animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-consecutive/10 via-app-achievement-exercise/10 to-app-achievement-consecutive/10 rounded-xl sm:rounded-2xl blur-xl"></div>
        <div className="relative grid w-full grid-cols-3 bg-app-bg-card/60 backdrop-blur-2xl shadow-app-medium rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 sm:h-12 bg-app-bg-secondary rounded-lg sm:rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 bg-app-bg-card/90 backdrop-blur-xl shadow-app-medium rounded-xl sm:rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-app-bg-secondary rounded-lg sm:rounded-xl animate-pulse"></div>
                  <div className="h-4 sm:h-6 w-16 sm:w-24 bg-app-bg-secondary rounded animate-pulse"></div>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-app-bg-secondary rounded-lg animate-pulse"></div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-3 sm:h-4 w-12 bg-app-bg-secondary rounded animate-pulse"></div>
                  <div className="h-6 sm:h-8 w-16 sm:w-20 bg-app-bg-secondary rounded animate-pulse"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="h-3 sm:h-4 w-16 bg-app-bg-secondary rounded animate-pulse"></div>
                  <div className="h-4 sm:h-6 w-14 sm:w-18 bg-app-bg-secondary rounded animate-pulse"></div>
                </div>
                
                <div className="border-t border-app-border-muted pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <div className="h-3 sm:h-4 w-12 bg-app-bg-secondary rounded animate-pulse"></div>
                    <div className="text-right space-y-1">
                      <div className="h-5 sm:h-6 w-16 bg-app-bg-secondary rounded animate-pulse"></div>
                      <div className="h-3 sm:h-4 w-12 bg-app-bg-secondary rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}