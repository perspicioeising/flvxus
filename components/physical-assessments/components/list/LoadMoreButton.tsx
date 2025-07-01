
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";

interface LoadMoreButtonProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export function LoadMoreButton({
  isLoading,
  hasMore,
  totalLoaded,
  totalAvailable,
  itemsPerPage,
  onLoadMore
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  const remainingItems = totalAvailable - totalLoaded;
  const nextBatchSize = Math.min(itemsPerPage, remainingItems);

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-btn-primary/20 to-app-achievement-workout/20 rounded-2xl blur-xl"></div>
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          className="relative card-app backdrop-blur-xl border border-app-border-accent rounded-2xl shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-app-text-primary hover:text-app-achievement-workout"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5 mr-2" />
              Carregar mais avaliações
              <span className="ml-2 px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout rounded-full text-sm border border-app-border-accent">
                +{nextBatchSize}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
