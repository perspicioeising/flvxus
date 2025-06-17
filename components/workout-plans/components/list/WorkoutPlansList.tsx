import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CalendarCheck, Loader2 } from 'lucide-react';
import { WorkoutPlanCard } from './WorkoutPlanCard';
import { WorkoutPlanListProps } from '../../types';
import { MODULE_COLORS } from '../../constants';
import { useInfiniteScroll }  from '@/hooks/useInfiniteScroll';

export function WorkoutPlansList({
  plans,
  isLoading,
  pagination,
  hasMorePlans,
  onLoadMore,
  onView,
  onEdit,
  onClone,
  onDelete,
}: WorkoutPlanListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!hasMorePlans || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMorePlans, isLoading, onLoadMore]);

  return (
    <div className="relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${MODULE_COLORS.primary.gradient} rounded-2xl blur-xl opacity-10`}></div>
      
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          
          {/* Plans Grid */}
          <div className="space-y-3 sm:space-y-4">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <WorkoutPlanCard
                  plan={plan}
                  onView={onView}
                  onEdit={onEdit}
                  onClone={onClone}
                  onDelete={onDelete}
                  isLoading={isLoading}
                />
              </div>
            ))}

            {/* Load More Trigger */}
             {loadMoreRef && infiniteScrollEnabled && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Carregando mais rotinas...
                    </span>
                  </div>
                </div>
              )}


          </div>

          {/* Empty State */}
          {plans.length === 0 && !isLoading && (
            <div className="text-center py-12 sm:py-20">
              <div className="relative mb-6 sm:mb-8">
                <div className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br ${MODULE_COLORS.primary.bg} rounded-full flex items-center justify-center shadow-2xl`}>
                  <CalendarCheck className={`h-12 w-12 sm:h-16 sm:w-16 ${MODULE_COLORS.primary.text}`} />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r ${MODULE_COLORS.primary.gradient} rounded-full blur-3xl opacity-30 animate-pulse`}></div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
                Nenhum plano encontrado
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                Ajuste os filtros de busca para encontrar o plano que você procura ou crie um novo plano de treino
              </p>

              <Button
                onClick={() => window.location.reload()}
                className={`bg-gradient-to-r ${MODULE_COLORS.primary.gradient} ${MODULE_COLORS.primary.hover} text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl ${MODULE_COLORS.primary.shadow} transition-all duration-500 transform hover:scale-110 border-0 min-h-[44px] text-sm sm:text-base`}
              >
                <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Novo Plano
              </Button>
            </div>
          )}

          {/* Loading indicator for more items */}
          {isLoading && plans.length > 0 && (
            <div className="flex justify-center py-4">
              <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${MODULE_COLORS.primary.bg} ${MODULE_COLORS.primary.border} rounded-full`}>
                <Loader2 className={`h-4 w-4 animate-spin ${MODULE_COLORS.primary.text}`} />
                <span className={`text-sm font-medium ${MODULE_COLORS.primary.text}`}>
                  Carregando...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}