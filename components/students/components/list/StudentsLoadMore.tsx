// /components/students/components/list/StudentsLoadMore.tsx

import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";

interface StudentsLoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export function StudentsLoadMore({
  isLoading,
  hasMore,
  totalLoaded,
  totalAvailable,
  itemsPerPage,
  onLoadMore
}: StudentsLoadMoreProps) {
  if (!hasMore) return null;

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 via-app-achievement-consecutive/20 to-app-achievement-weight/20 rounded-2xl blur-xl"></div>
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          className="relative card-app border-app-border-accent/50 rounded-2xl shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-app-text-primary hover:text-app-text-accent"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5 mr-2" />
              Carregar mais alunos
              <span className="ml-2 px-2 py-1 bg-app-text-accent/10 text-app-text-accent rounded-full text-sm">
                +{nextBatchSize}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}