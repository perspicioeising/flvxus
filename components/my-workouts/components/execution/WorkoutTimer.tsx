import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause } from 'lucide-react';

interface WorkoutTimerProps {
  currentTime: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
}

export function WorkoutTimer({ currentTime, isActive, onPause, onResume }: WorkoutTimerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Timer Display */}
      <div className="relative">
        <Badge className="px-4 py-2 bg-app-achievement-workout text-white rounded-xl font-bold text-base shadow-app-large">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-mono tracking-wider">{formatTime(currentTime)}</span>
        </Badge>
        
        {/* Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-app-medium transition-all duration-300 ${
          isActive 
            ? 'bg-app-achievement-consecutive animate-pulse' 
            : 'bg-yellow-500'
        }`} />
      </div>
      
      {/* Play/Pause Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={isActive ? onPause : onResume}
        className="h-9 w-9 p-0 bg-app-card border-app-border-muted hover:bg-app-bg-secondary rounded-xl transition-all duration-300 shadow-app-medium"
      >
        {isActive ? (
          <Pause className="h-4 w-4 text-app-achievement-workout" />
        ) : (
          <Play className="h-4 w-4 text-app-achievement-consecutive ml-0.5" />
        )}
      </Button>
    </div>
  );
}