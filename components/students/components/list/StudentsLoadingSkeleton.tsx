// /components/students/components/StudentsLoadingSkeleton.tsx

import { Card, CardContent } from "@/components/ui/card";

export function StudentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeleton para filtros */}
      <div className="space-y-4">
        <div className="h-14 bg-app-bg-secondary rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-app-bg-secondary rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Skeleton para cards de estudantes */}
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="border-0 bg-app-card rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                {/* Avatar skeleton */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-app-bg-secondary rounded-2xl animate-pulse"></div>
                
                {/* Content skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-app-bg-secondary rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-app-bg-secondary rounded w-16 animate-pulse"></div>
                  </div>
                  
                  <div className="h-4 bg-app-bg-secondary rounded w-2/3 animate-pulse"></div>
                  
                  <div className="flex gap-2">
                    <div className="h-6 bg-app-bg-secondary rounded-full w-20 animate-pulse"></div>
                    <div className="h-6 bg-app-bg-secondary rounded-full w-24 animate-pulse"></div>
                    <div className="h-6 bg-app-bg-secondary rounded-full w-16 animate-pulse"></div>
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