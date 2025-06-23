import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Video, Volume2, Sparkles } from "lucide-react";
import { ExerciseCardProps } from "@/components/exercices/types/exercise";
import {
  getExerciseSummary,
  formatEquipmentList,
  hasMultimedia
} from "@/components/exercices/utils/exerciseUtils";
import { getMuscleGroupIcon } from "@/components/exercices/components/constants/exercise";

export function ExerciseCard({
  exercise,
  viewMode,
  onView
}: ExerciseCardProps) {

  const summary = getExerciseSummary(exercise);
  const multimedia = hasMultimedia(exercise);
  const mainIcon = getMuscleGroupIcon(exercise.muscle_group[0] || "Outros");

  if (viewMode === 'grid') {
    return (
      <div className="relative group h-full">
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 via-app-achievement-exercise/20 to-app-text-accent/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Main card */}
        <Card
          className="relative h-full border-0 card-app transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
          onClick={() => onView(exercise.id)}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-achievement-exercise rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-app-bg-card rounded-2xl"></div>

          {/* Card content */}
          <div className="relative flex flex-col h-full">
            {/* Header with image/icon */}
            <div className="relative h-32 sm:h-36 bg-achievement-exercise rounded-t-2xl overflow-hidden flex items-center justify-center">
              {/* Background particles effect */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full transform translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full transform -translate-x-6 sm:-translate-x-8 translate-y-6 sm:translate-y-8"></div>
              </div>

              {/* Main icon */}
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center shadow-app-xl transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl sm:text-3xl text-white">{mainIcon.icon}</span>
                </div>

                {/* Media badges */}
                {multimedia.hasAny && (
                  <div className="absolute -bottom-1 -right-1 flex gap-1">
                    {multimedia.hasVideo && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-app-medium animate-bounce">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {multimedia.hasAudio && (
                      <div className="w-6 h-6 bg-achievement-workout rounded-full flex items-center justify-center shadow-app-medium animate-bounce">
                        <Volume2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card body */}
            <CardContent className="flex-1 p-4 sm:p-5 flex flex-col">
              {/* Title and description */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-app-text-primary line-clamp-1 mb-2 group-hover:text-app-text-accent transition-colors">
                  {exercise.name}
                </h3>
                <p className="text-app-text-secondary text-sm line-clamp-2">
                  {exercise.description}
                </p>
              </div>

              {/* Muscle groups */}
              <div className="mb-3 sm:mb-4">
                <div className="text-xs text-app-text-accent font-semibold mb-2 uppercase tracking-wider">
                  Grupos Musculares
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.muscleGroups.visible.map((group) => {
                    const groupIcon = getMuscleGroupIcon(group);
                    return (
                      <span
                        key={group}
                        className="px-2 py-1 bg-achievement-consecutive/10 text-achievement-consecutive text-xs font-medium rounded-full border border-app-border-accent"
                      >
                        <span className="mr-1">{groupIcon.icon}</span>
                        {group}
                      </span>
                    );
                  })}
                  {summary.muscleGroups.remaining > 0 && (
                    <span className="px-2 py-1 bg-app-bg-secondary text-app-text-muted text-xs rounded-full border border-app-border-muted">
                      +{summary.muscleGroups.remaining}
                    </span>
                  )}
                </div>
              </div>

              {/* Equipment */}
              <div className="mt-auto pt-2">
                <div className="text-xs text-app-text-accent font-semibold mb-1 uppercase tracking-wider">
                  Equipamentos
                </div>
                <p className="text-sm text-app-text-primary font-medium truncate">
                  {formatEquipmentList(exercise.equipment)}
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  // List view version (if needed)
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-achievement-exercise/10 to-app-text-accent/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <Card
        className="relative border-0 card-app cursor-pointer transition-all duration-300 group-hover:scale-[1.01]"
        onClick={() => onView(exercise.id)}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-achievement-exercise rounded-xl flex items-center justify-center shadow-app-medium">
                <span className="text-lg sm:text-2xl text-white">{mainIcon.icon}</span>
              </div>
              
              {multimedia.hasAny && (
                <div className="absolute -top-1 -right-1 flex gap-1">
                  {multimedia.hasVideo && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <Video className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  {multimedia.hasAudio && (
                    <div className="w-5 h-5 bg-achievement-workout rounded-full flex items-center justify-center">
                      <Volume2 className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-app-text-primary mb-1 group-hover:text-app-text-accent transition-colors truncate">
                {exercise.name}
              </h3>
              <p className="text-app-text-secondary text-sm line-clamp-2 mb-2">
                {exercise.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {summary.muscleGroups.visible.slice(0, 2).map((group) => (
                  <span
                    key={group}
                    className="px-2 py-1 bg-achievement-consecutive/10 text-achievement-consecutive text-xs rounded-full border border-app-border-accent"
                  >
                    {group}
                  </span>
                ))}
                {summary.muscleGroups.remaining > 0 && (
                  <span className="px-2 py-1 bg-app-bg-secondary text-app-text-muted text-xs rounded-full border border-app-border-muted">
                    +{summary.muscleGroups.remaining}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-app-bg-secondary rounded-full flex items-center justify-center group-hover:bg-app-text-accent group-hover:text-white transition-all duration-300">
                <Eye className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}