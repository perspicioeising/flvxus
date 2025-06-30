// components/workouts/components/list/WorkoutHeader.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Activity } from "lucide-react";
import { WorkoutHeaderProps } from '../../types';

export function WorkoutHeader({ userRole, stats, onCreateNew }: WorkoutHeaderProps) {
  return (
    <div className="relative mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-app-xl">
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-app-achievement-workout rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-app-achievement-consecutive rounded-full transform -translate-x-6 sm:-translate-x-8 translate-y-6 sm:translate-y-8"></div>
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left side - Icon and content */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              
              {/* Icon container */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-achievement-workout rounded-xl sm:rounded-2xl flex items-center justify-center shadow-app-large">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-app-achievement-consecutive rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading mb-1">
                  Treinos
                </h1>
                
                <p className="text-app-text-secondary text-sm sm:text-base">
                  <span className="font-semibold text-app-achievement-workout">{stats.total}</span> treinos disponíveis
                </p>
              </div>
            </div>

            {/* Right side - Action button */}
            {userRole === 'trainer' && (
              <Button
                onClick={onCreateNew}
                className="h-12 w-12 sm:h-14 sm:w-14 bg-achievement-workout hover:bg-app-achievement-workout/90 rounded-xl shadow-app-large hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-achievement-workout/30 to-transparent"></div>
      </div>
    </div>
  );
}