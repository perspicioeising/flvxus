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
import { getMuscleGroupIcon } from "@/components/exercices/constants/exercise";

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
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <Card className="relative border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group-hover:transform group-hover:scale-[1.02] cursor-pointer"
          onClick={() => onView(exercise.id)}>

          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[2px] bg-white dark:bg-gray-900 rounded-3xl"></div>

          {/* Header com ícone melhorado */}
          <div className={`relative h-48 bg-gradient-to-br ${mainIcon.gradient} rounded-t-3xl overflow-hidden flex items-center justify-center`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
            </div>
            
            {/* Ícone principal */}
            <div className="relative z-10">
              <div className={`w-28 h-28 bg-gradient-to-br ${mainIcon.color} rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-5xl">{mainIcon.icon}</span>
              </div>
              
              {/* Sparkle effect */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
              
              {/* Multimedia badges */}
              {multimedia.hasAny && (
                <div className="absolute -bottom-3 -right-3 flex gap-1">
                  {multimedia.hasVideo && (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {multimedia.hasAudio && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Volume2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating action button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Button
                size="icon"
                className="h-12 w-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 shadow-xl rounded-full border-2 border-purple-200 dark:border-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(exercise.id);
                }}
              >
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
          </div>

          <CardContent className="relative p-6 space-y-5">
            {/* Title e Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {exercise.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                {exercise.description}
              </p>
            </div>

            {/* Muscle Groups com melhor visual */}
            <div className="space-y-2">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                Grupos Musculares
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.muscleGroups.visible.map((group) => {
                  const groupIcon = getMuscleGroupIcon(group);
                  return (
                    <Badge
                      key={group}
                      className={`px-3 py-1.5 bg-gradient-to-r ${groupIcon.gradient} text-purple-800 border-purple-300 dark:text-purple-300 dark:border-purple-600 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      <span className="mr-1.5">{groupIcon.icon}</span>
                      {group}
                    </Badge>
                  );
                })}
                {summary.muscleGroups.remaining > 0 && (
                  <Badge className="px-3 py-1.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs shadow-sm">
                    +{summary.muscleGroups.remaining}
                  </Badge>
                )}
              </div>
            </div>

            {/* Equipment com novo design */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 group-hover:border-purple-300 dark:group-hover:border-purple-600 transition-colors duration-300">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mb-2">
                Equipamentos
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                {formatEquipmentList(exercise.equipment)}
              </div>
            </div>

            {/* Stats melhorados */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.variationsCount}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Variações</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{summary.tipsCount}</div>
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">Dicas</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl shadow-sm">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{summary.equipmentCount}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Equip.</div>
              </div>
            </div>

            {/* Action button principal */}
            <div className="pt-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(exercise.id);
                }}
                className="w-full bg-gradient-to-r from-purple-600 hover:from-purple-700  text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold py-3 group-hover:transform group-hover:scale-[1.02]"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
}