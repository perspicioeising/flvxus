// components/workouts/components/list/WorkoutLoadMore.tsx
'use client';

import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

interface WorkoutLoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export function WorkoutLoadMore({
  isLoading,
  hasMore,
  totalLoaded,
  totalAvailable,
  itemsPerPage,
  onLoadMore
}: WorkoutLoadMoreProps) {
  
  if (!hasMore) return null;

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-cyan-600/20 rounded-2xl blur-xl"></div>
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5 mr-2" />
              Carregar mais treinos
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                +{nextBatchSize}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}