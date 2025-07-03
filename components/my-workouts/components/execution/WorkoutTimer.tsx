// components/my-workouts/components/execution/WorkoutTimer.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Pause } from 'lucide-react';

interface WorkoutTimerProps {
  currentTime: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
}

export function WorkoutTimer({ currentTime, isActive, onPause, onResume }: WorkoutTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <Badge className="px-3 py-2 bg-app-achievement-workout text-white rounded-xl font-bold text-sm">
        <Timer className="h-4 w-4 mr-2" />
        {formatTime(currentTime)}
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={isActive ? onPause : onResume}
        className="h-8 w-8 p-0 bg-app-card border-app-border-muted hover:bg-app-border-accent/20 rounded-lg"
      >
        {isActive ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

