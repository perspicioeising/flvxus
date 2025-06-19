// /components/workout-plans/components/list/WorkoutPlansLoadMore.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronDown, Calendar } from 'lucide-react';

interface WorkoutPlansLoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export function WorkoutPlansLoadMore({
  isLoading,
  hasMore,
  totalLoaded,
  totalAvailable,
  itemsPerPage,
  onLoadMore
}: WorkoutPlansLoadMoreProps) {
  if (!hasMore) {
    return null;
  }

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-orange-600 dark:text-orange-400">{totalLoaded}</span> de{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{totalAvailable}</span> planos
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div 
                className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(totalLoaded / totalAvailable) * 100}%` }}
              ></div>
            </div>

            {/* Load more button */}
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-orange-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0 min-h-[52px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5 mr-3 group-hover:translate-y-1 transition-transform duration-300" />
                  Carregar mais {nextBatchSize} planos
                </>
              )}
            </Button>

            {/* Remaining count */}
            {!isLoading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Ainda há <span className="font-semibold text-orange-600 dark:text-orange-400">{remainingItems}</span> planos para carregar
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}