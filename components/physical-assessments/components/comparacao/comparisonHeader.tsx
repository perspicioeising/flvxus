// components/physical-assessments/components/comparisonHeader.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Sparkles,
  Crown,
  Trophy,
  Award,
  AlertTriangle,
  Clock,
  Calendar,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { ComparisonHeaderProps } from '@/components/physical-assessments/types/assessment-comparison';

export function ComparisonHeader({
  progress,
  availableAssessments,
  selectedAssessment,
  onAssessmentSelect
}: ComparisonHeaderProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'good': return <Trophy className="h-5 w-5 text-indigo-500" />;
      case 'moderate': return <Award className="h-5 w-5 text-blue-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getProgressGradient = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-yellow-500 to-amber-600';
      case 'good': return 'from-indigo-500 to-purple-600';
      case 'moderate': return 'from-blue-500 to-indigo-600';
      default: return 'from-red-500 to-rose-600';
    }
  };

  const getProgressBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20';
      case 'good': return 'from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20';
      case 'moderate': return 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20';
      default: return 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20';
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl blur-xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-indigo-900/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Evolução e Comparações
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Análise temporal entre avaliações físicas
                </CardDescription>
              </div>
            </div>
            
            {/* Progress Score Card */}
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${getProgressGradient(progress.status)} rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className={`relative bg-gradient-to-br ${getProgressBg(progress.status)} backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 dark:border-gray-800/50 transform group-hover:scale-105 transition-all duration-300`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      {progress.score.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mt-1">
                      {progress.message}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {getProgressIcon(progress.status)}
                    <Badge className={`px-3 py-1 bg-gradient-to-r ${getProgressGradient(progress.status)} text-white border-0 rounded-full text-xs font-bold shadow-lg`}>
                      {progress.status === 'excellent' ? 'Excelente' :
                       progress.status === 'good' ? 'Bom' :
                       progress.status === 'moderate' ? 'Moderado' : 'Atenção'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Selection Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  Comparar com:
                </span>
              </div>
              
              {/* Enhanced Select */}
              <div className="flex-1 max-w-md">
                <Select
                  value={selectedAssessment?.id || ""}
                  onValueChange={(value) => {
                    const assessment = availableAssessments.find(a => a.id === value);
                    if (assessment) {
                      onAssessmentSelect(assessment);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <SelectValue placeholder="Selecione uma avaliação anterior">
                        {selectedAssessment && (
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(selectedAssessment.date)}
                            </span>
                            <Badge className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0 rounded-full text-xs font-semibold dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300">
                              {Math.abs(Math.ceil((new Date().getTime() - new Date(selectedAssessment.date).getTime()) / (1000 * 60 * 60 * 24)))} dias
                            </Badge>
                          </div>
                        )}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-indigo-200 dark:border-indigo-700 rounded-xl shadow-2xl">
                    {availableAssessments.length === 0 ? (
                      <div className="p-8 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400 opacity-50" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          Nenhuma avaliação anterior encontrada
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {availableAssessments.map((assessment) => {
                          const daysDiff = Math.abs(Math.ceil((new Date().getTime() - new Date(assessment.date).getTime()) / (1000 * 60 * 60 * 24)));
                          
                          return (
                            <SelectItem
                              key={assessment.id}
                              value={assessment.id}
                              className="p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl m-1 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex items-center justify-between w-full gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/30 dark:to-purple-800/30 rounded-lg group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-700/30 dark:group-hover:to-purple-700/30 transition-all duration-200">
                                    <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                      {formatDate(assessment.date)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                      <span>{assessment.weight}kg</span>
                                      <span>•</span>
                                      <span>{assessment.fat_percentage.toFixed(1)}% gordura</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-400 font-semibold"
                                  >
                                    {daysDiff === 0 ? 'Hoje' : 
                                     daysDiff === 1 ? 'Ontem' : 
                                     daysDiff < 30 ? `${daysDiff} dias` :
                                     daysDiff < 365 ? `${Math.floor(daysDiff/30)} meses` :
                                     `${Math.floor(daysDiff/365)} anos`}
                                  </Badge>
                                  <ArrowUpRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Stats */}
            {selectedAssessment && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickStat
                  label="Intervalo"
                  value={`${Math.abs(Math.ceil((new Date().getTime() - new Date(selectedAssessment.date).getTime()) / (1000 * 60 * 60 * 24)))} dias`}
                  icon={Calendar}
                  gradient="from-blue-500 to-indigo-600"
                />
                <QuickStat
                  label="Peso Anterior"
                  value={`${selectedAssessment.weight}kg`}
                  icon={Activity}
                  gradient="from-purple-500 to-indigo-600"
                />
                <QuickStat
                  label="% Gordura Anterior"
                  value={`${selectedAssessment.fat_percentage.toFixed(1)}%`}
                  icon={Activity}
                  gradient="from-indigo-500 to-purple-600"
                />
                <QuickStat
                  label="IMC Anterior"
                  value={`${selectedAssessment.bmi.toFixed(1)}`}
                  icon={Activity}
                  gradient="from-teal-500 to-indigo-600"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ label, value, icon: Icon, gradient }: {
  label: string;
  value: string;
  icon: any;
  gradient: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
          <div className={`p-1.5 bg-gradient-to-br ${gradient} rounded-lg shadow-md`}>
            <Icon className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="text-lg font-black text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}