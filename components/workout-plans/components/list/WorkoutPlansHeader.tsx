import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CalendarCheck, Zap } from 'lucide-react';
import { MODULE_COLORS } from '../../constants';

interface WorkoutPlansHeaderProps {
  userRole: 'trainer' | 'student';
  stats: { total: number };
  onCreateNew: () => void;
}

export function WorkoutPlansHeader({ userRole, stats, onCreateNew }: WorkoutPlansHeaderProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-600/20 dark:from-orange-500/10 dark:via-orange-400/10 dark:to-orange-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          
          {/* Header com ícone e título */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Ícone com badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarCheck className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>

            {/* Textos */}
            <div className="min-w-0 space-y-1 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                Rotinas
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-base leading-tight">
                <span className="font-semibold text-orange-600 dark:text-orange-400">{stats.total}</span> plano{stats.total !== 1 ? 's' : ''}
                <span className="hidden sm:inline"> • Gestão Completa</span>
              </p>
            </div>
          </div>

          {/* Botão Criar */}
          {userRole === 'trainer' && (
            <Button
              onClick={onCreateNew}
              size="icon"
              className="h-12 w-12 sm:h-14 sm:w-14 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}