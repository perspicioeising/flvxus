// components/diets/create/DietFormSkeleton.tsx
export function DietFormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            <div>
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>

        {/* Steps Skeleton */}
        <div className="mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                {step < 4 && (
                  <div className="w-full h-0.5 mx-2 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3" />
              <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3" />
                <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              </div>
              <div>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3" />
                <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}