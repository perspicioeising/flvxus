// /components/physical-assessments/components/list/AssessmentLoadingSkeleton.tsx

import { Card, CardContent } from "@/components/ui/card";

interface AssessmentLoadingSkeletonProps {
  count?: number;
}

export function AssessmentLoadingSkeleton({ count = 6 }: AssessmentLoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-4 max-w-7xl">

        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                  <div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-2" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
                  </div>
                </div>
              </div>
              <div className="w-32 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-2xl blur-md"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="w-full lg:w-[220px] h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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