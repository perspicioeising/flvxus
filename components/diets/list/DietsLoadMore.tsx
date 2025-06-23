// /components/diets/components/list/DietsLoadMore.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';
import type { DietsLoadMoreProps } from '../types';

export function DietsLoadMore({
  isLoading,
  hasMore,
  totalLoaded,
  totalAvailable,
  itemsPerPage,
  onLoadMore
}: DietsLoadMoreProps) {
  if (!hasMore) return null;

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-green-500/20 to-teal-600/20 rounded-2xl blur-xl"></div>
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5 mr-2" />
              Carregar mais dietas
              <span className="ml-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                +{nextBatchSize}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}