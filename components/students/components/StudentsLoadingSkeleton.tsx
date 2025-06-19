import { Card, CardContent } from "@/components/ui/card";

export function StudentsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border-0">
          <CardContent className="p-6">
            
            {/* Mobile Loading */}
            <div className="lg:hidden space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex-1 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Desktop Loading */}
            <div className="hidden lg:flex lg:items-center lg:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-24" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-80">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
              
              <div className="flex flex-col gap-3 w-36">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}