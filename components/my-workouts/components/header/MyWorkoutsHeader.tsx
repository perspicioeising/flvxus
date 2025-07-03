import React from 'react';
import { 
  Dumbbell, 
  Sparkles 
} from 'lucide-react';

export function MyWorkoutsHeader() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-orange-500/10 to-app-achievement-workout/10 rounded-2xl blur-xl"></div>
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 sm:p-6 shadow-app-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-achievement-workout rounded-2xl flex items-center justify-center shadow-app-large">
              <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading">
              Meus Treinos
            </h1>
            <p className="text-sm sm:text-base text-app-text-secondary mt-1">
              Acompanhe sua jornada fitness e execute seus treinos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}