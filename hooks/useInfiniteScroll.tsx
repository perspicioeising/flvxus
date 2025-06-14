// /hooks/useInfiniteScroll.tsx

import { useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distância do final da página para disparar o load (em pixels)
  enabled?: boolean; // Se o infinite scroll está habilitado
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  enabled = true
}: UseInfiniteScrollOptions) {
  
  const handleScroll = useCallback(() => {
    if (!enabled || !hasMore || isLoading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom < threshold) {
      onLoadMore();
    }
  }, [enabled, hasMore, isLoading, onLoadMore, threshold]);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, enabled]);

  // Função para disparar load manual (para usar com botão)
  const triggerLoad = useCallback(() => {
    if (hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return {
    triggerLoad
  };
}