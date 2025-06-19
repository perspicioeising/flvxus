import { useEffect, useRef, RefObject } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeOptions {
  threshold?: number;  // Distância mínima para considerar swipe
  preventScroll?: boolean;  // Prevenir scroll durante swipe
}

export function useSwipeGestures(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
): RefObject<HTMLDivElement> {
  const { threshold = 50, preventScroll = false } = options;
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let isSwipeGesture = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isSwipeGesture = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Verificar se é um gesto horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isSwipeGesture = true;
        if (preventScroll) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current || !isSwipeGesture) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Verificar se é um swipe horizontal válido
      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      }

      // Reset
      touchStartX.current = 0;
      touchStartY.current = 0;
      isSwipeGesture = false;
    };

    // Adicionar event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers.onSwipeLeft, handlers.onSwipeRight, threshold, preventScroll]);

  return elementRef;
}

// Hook para adicionar feedback visual durante swipe
export function useSwipeFeedback(): RefObject<HTMLDivElement> {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX = 0;
    let currentTranslate = 0;
    let isAnimating = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimating) return;
      startX = e.touches[0].clientX;
      element.style.transition = 'none';
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isAnimating) return;
      
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      // Limitar o movimento para não sair muito da tela
      const maxTranslate = window.innerWidth * 0.3;
      currentTranslate = Math.max(-maxTranslate, Math.min(maxTranslate, diff));
      
      // Aplicar transformação com resistência nas bordas
      const resistance = Math.abs(currentTranslate) / maxTranslate;
      const easedTranslate = currentTranslate * (1 - resistance * 0.5);
      
      element.style.transform = `translateX(${easedTranslate}px)`;
      
      // Adicionar opacidade baseada no movimento
      const opacity = 1 - Math.abs(easedTranslate) / maxTranslate * 0.3;
      element.style.opacity = opacity.toString();
    };

    const handleTouchEnd = () => {
      if (isAnimating) return;
      
      isAnimating = true;
      element.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
      
      setTimeout(() => {
        isAnimating = false;
        element.style.transition = '';
      }, 300);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return elementRef;
}

// Hook simplificado para usar um ref combinado
export function useCombinedRefs<T extends HTMLElement>(...refs: RefObject<T>[]): RefObject<T> {
  const combinedRef = useRef<T>(null);
  
  useEffect(() => {
    const element = combinedRef.current;
    refs.forEach(ref => {
      if (ref && typeof ref === 'object') {
        (ref as any).current = element;
      }
    });
  });

  return combinedRef;
}