// components/my-workouts/components/lists/WorkoutPlansList.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Calendar, Dumbbell, Plus, Eye } from 'lucide-react';
import { WorkoutPlan } from '../../types';
import { WorkoutPlanCard } from '../cards/WorkoutPlanCard';

interface WorkoutPlansListProps {
  workoutPlans: WorkoutPlan[];
  onViewPlan: (planId: string) => void;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function WorkoutPlansList({ 
  workoutPlans, 
  onViewPlan, 
  title = "Suas Rotinas",
  emptyMessage = "Nenhuma rotina encontrada",
  className = '' 
}: WorkoutPlansListProps) {
  
  return (
    <Card className={`border-0 card-app ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-app-heading flex items-center gap-3">
          <div className="w-8 h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center">
            <CalendarCheck className="h-4 w-4 text-white" />
          </div>
          {title}
          {workoutPlans.length > 0 && (
            <span className="text-sm font-normal text-app-text-muted">
              ({workoutPlans.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {workoutPlans.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-app-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-app-text-muted" />
            </div>
            <h4 className="text-base font-semibold text-app-heading mb-2">
              {emptyMessage}
            </h4>
            <p className="text-sm text-app-text-secondary">
              Entre em contato com seu personal trainer para criar uma nova rotina de treinos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutPlans.map((plan) => (
              <WorkoutPlanCard
                key={plan.id}
                plan={plan}
                onViewPlan={onViewPlan}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}