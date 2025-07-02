
import { Card, CardContent } from "@/components/ui/card";

interface AssessmentLoadingSkeletonProps {
  count?: number;
}

export function AssessmentLoadingSkeleton({ count = 6 }: AssessmentLoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="card-app backdrop-blur-sm rounded-2xl shadow-app-large border border-app-border-muted">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-app-bg-secondary rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-app-bg-secondary rounded animate-pulse w-48" />
                      <div className="h-5 bg-app-bg-secondary rounded-full animate-pulse w-20" />
                    </div>
                    <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-full" />
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-32" />
                      <div className="h-4 bg-app-bg-secondary rounded animate-pulse w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-11 h-11 bg-app-bg-secondary rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AssessmentPageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-btn-primary/20 to-app-achievement-workout/20 rounded-3xl blur-xl"></div>
          <div className="relative card-app backdrop-blur-xl border border-app-border-accent rounded-3xl p-8 shadow-app-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-app-bg-secondary rounded-2xl animate-pulse" />
                  <div>
                    <div className="h-12 bg-app-bg-secondary rounded animate-pulse w-48 mb-2" />
                    <div className="h-6 bg-app-bg-secondary rounded animate-pulse w-64" />
                  </div>
                </div>
              </div>
              <div className="w-32 h-14 bg-app-bg-secondary rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-btn-primary/10 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
          <Card className="relative border-0 card-app backdrop-blur-md shadow-app-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 h-12 bg-app-bg-secondary rounded-xl animate-pulse" />
                <div className="w-full lg:w-[220px] h-12 bg-app-bg-secondary rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Skeleton */}
        <AssessmentLoadingSkeleton />
      </div>
    </div>
  );
}
