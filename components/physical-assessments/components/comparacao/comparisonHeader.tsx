// components/physical-assessments/components/comparisonHeader.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp,
  Sparkles,
  Crown,
  Trophy,
  Award,
  AlertTriangle,
  Clock,
  Calendar
} from "lucide-react";
import { ComparisonHeaderProps } from '@/components/physical-assessments/types/assessment-comparison';

export function ComparisonHeader({
  progress,
  availableAssessments,
  selectedAssessment,
  onAssessmentSelect
}: ComparisonHeaderProps) {
  
  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
      case 'good': return <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      case 'moderate': return <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-green-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-indigo-50/50 via-emerald-50/50 to-indigo-50/50 dark:from-indigo-900/10 dark:via-emerald-900/10 dark:to-indigo-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative mx-auto sm:mx-0">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Evolução e Comparações
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Análise temporal entre avaliações
                </CardDescription>
              </div>
            </div>
            
            {/* Progress Score - RESPONSIVO */}
            <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg mx-auto lg:mx-0">
              <div className={`text-2xl sm:text-4xl font-black ${getProgressColor(progress.status)}`}>
                {progress.score.toFixed(0)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">{progress.message}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {getProgressIcon(progress.status)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300">
                  Comparar com:
                </span>
              </div>
              
              {/* Select Melhorado */}
              <div className="flex-1 max-w-xs">
                <Select
                  value={selectedAssessment?.id || ""}
                  onValueChange={(value) => {
                    const assessment = availableAssessments.find(a => a.id === value);
                    if (assessment) {
                      onAssessmentSelect(assessment);
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 focus:scale-105">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <SelectValue placeholder="Selecione uma avaliação anterior">
                        {selectedAssessment && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {format(new Date(selectedAssessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.abs(Math.ceil((new Date().getTime() - new Date(selectedAssessment.date).getTime()) / (1000 * 60 * 60 * 24)))} dias
                            </Badge>
                          </div>
                        )}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-indigo-200 dark:border-indigo-700 rounded-xl shadow-2xl">
                    {availableAssessments.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma avaliação anterior encontrada</p>
                      </div>
                    ) : (
                      availableAssessments.map((assessment) => {
                        const daysDiff = Math.abs(Math.ceil((new Date().getTime() - new Date(assessment.date).getTime()) / (1000 * 60 * 60 * 24)));
                        
                        return (
                          <SelectItem
                            key={assessment.id}
                            value={assessment.id}
                            className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg m-1 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(assessment.date), 'EEEE', { locale: ptBR })}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-400"
                                >
                                  {daysDiff === 0 ? 'Hoje' : 
                                   daysDiff === 1 ? 'Ontem' : 
                                   daysDiff < 30 ? `${daysDiff} dias` :
                                   daysDiff < 365 ? `${Math.floor(daysDiff/30)} meses` :
                                   `${Math.floor(daysDiff/365)} anos`}
                                </Badge>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {assessment.weight}kg • {assessment.fat_percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}