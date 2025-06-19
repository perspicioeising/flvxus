// components/workouts/components/list/WorkoutLoadMore.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Loader2, CheckCircle } from "lucide-react";

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
  
  if (!hasMore) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            Todos os treinos foram carregados
          </span>
        </div>
      </div>
    );
  }

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-rose-500/10 rounded-2xl blur-xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="p-6">
            
            {/* Load More Info */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Mostrando <span className="font-semibold text-pink-600 dark:text-pink-400">{totalLoaded}</span> de{' '}
                  <span className="font-semibold text-pink-600 dark:text-pink-400">{totalAvailable}</span> treinos
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(totalLoaded / totalAvailable) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Load More Button */}
              <Button
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-pink-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Carregando treinos...
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-5 w-5" />
                    Carregar mais {nextBatchSize} treino{nextBatchSize !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
