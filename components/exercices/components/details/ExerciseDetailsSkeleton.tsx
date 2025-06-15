// components/exercises/details/ExerciseDetailsSkeleton.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ExerciseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header Skeleton */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-purple-500/10 to-purple-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-3xl shadow-2xl">
            <div className="p-6 lg:p-8">
              
              {/* Botão Voltar */}
              <div className="mb-6">
                <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>

              {/* Header Principal */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                
                {/* Informações do Exercício */}
                <div className="flex-1 space-y-4">
                  
                  {/* Título e ícone */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="flex gap-4">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Skeleton */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações Principais (Desktop) */}
                <div className="hidden lg:flex lg:flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Ações Principais (Mobile) */}
              <div className="lg:hidden mt-6 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-8">
          
          {/* Descrição Principal */}
          <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Mídia */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-b-2xl animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grid de Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl h-64">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ml-auto"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}