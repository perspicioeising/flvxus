import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Clock,
  Dumbbell,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WorkoutHistory } from '../../types';

interface RecentHistoryListProps {
  history: WorkoutHistory[];
  className?: string;
}

export function RecentHistoryList({ history, className = '' }: RecentHistoryListProps) {
  if (history.length === 0) {
    return (
      <Card className={`border-0 card-app ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <History className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-app-heading">
              Histórico Recente
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-app-text-muted" />
            </div>
            <h4 className="text-base font-semibold text-app-heading mb-2">
              Nenhum Treino Realizado
            </h4>
            <p className="text-sm text-app-text-secondary">
              Comece sua jornada executando seu primeiro treino!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 card-app ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <History className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-app-heading">
              Histórico Recente
            </CardTitle>
          </div>
          
          <Badge className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-semibold">
            {history.length} recente{history.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {history.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl hover:bg-app-border-accent/20 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-app-achievement-workout to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-semibold text-app-heading truncate">
                  {item.workout.name}
                </h5>
                <div className="flex items-center gap-3 text-xs text-app-text-muted mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(item.completed_at), 'dd/MM', { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.duration}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>{item.exercises_completed} ex.</span>
                  </div>
                </div>
              </div>
              
              {item.total_weight > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-app-heading">
                    {item.total_weight.toFixed(0)}kg
                  </p>
                  <p className="text-xs text-app-text-muted">total</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}