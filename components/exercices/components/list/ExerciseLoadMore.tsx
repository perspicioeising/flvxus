// /components/exercises/components/list/ExerciseLoadMore.tsx

import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import { ExerciseLoadMoreProps } from "@/components/exercices/types/exercise";

export function ExerciseLoadMore({
  isLoading,
  hasMore,
  totalLoaded,
  totalAvailable,
  itemsPerPage,
  onLoadMore
}: ExerciseLoadMoreProps) {
  if (!hasMore) return null;

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5 mr-2" />
              Carregar mais exercícios
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                +{nextBatchSize}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}