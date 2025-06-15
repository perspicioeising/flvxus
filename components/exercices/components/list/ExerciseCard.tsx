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
        {/* Efeito de glow no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Card principal com todos os efeitos */}
        <Card
          className="relative h-full border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
          onClick={() => onView(exercise.id)}
        >
          {/* Borda gradiente animada */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          {/* Conteúdo do card */}
          <div className="relative flex flex-col h-full">
            {/* Header com imagem/ícone */}
            <div className={`relative h-40 bg-gradient-to-br from-purple-500 to-purple-600 rounded-t-2xl overflow-hidden flex items-center justify-center`}>
              {/* Efeito de partículas no fundo */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-12 -translate-y-12"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
              </div>

              {/* Ícone principal */}
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl text-white">{mainIcon.icon}</span>
                </div>

                {/* Badges de mídia */}
                {multimedia.hasAny && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    {multimedia.hasVideo && (
                      <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Video className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    {multimedia.hasAudio && (
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Volume2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Corpo do card */}
            <CardContent className="flex-1 p-5 flex flex-col">
              {/* Título e descrição */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {exercise.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {exercise.description}
                </p>
              </div>

              {/* Grupos musculares */}
              <div className="mb-4">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2 uppercase tracking-wider">
                  Grupos Musculares
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.muscleGroups.visible.map((group) => {
                    const groupIcon = getMuscleGroupIcon(group);
                    return (
                      <span
                        key={group}
                        className={`px-2.5 py-1 bg-gradient-to-r ${groupIcon.gradient} text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full shadow-sm`}
                      >
                        <span className="mr-1">{groupIcon.icon}</span>
                        {group}
                      </span>
                    );
                  })}
                  {summary.muscleGroups.remaining > 0 && (
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{summary.muscleGroups.remaining}
                    </span>
                  )}
                </div>
              </div>

              {/* Equipamentos */}
              <div className="mt-auto pt-2">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1 uppercase tracking-wider">
                  Equipamentos
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  {formatEquipmentList(exercise.equipment)}
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

}