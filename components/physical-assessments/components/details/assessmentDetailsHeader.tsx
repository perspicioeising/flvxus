// components/physical-assessments/components/assessmentDetailsHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  User,
  Ruler,
  Weight,
  Book,
  Sparkles,
  Crown,
  Share2,
  Download,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AssessmentHeaderProps } from '@/types/physical-assessment-details';

export function AssessmentDetailsHeader({
  assessment,
  userRole,
  onEdit,
  onDelete,
  onShare,
  onDownload
}: AssessmentHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">

        {/* Header Top Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </Button>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Book className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent truncate">
                  Avaliação Física
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-lg mt-1 truncate">
                  {assessment.profiles.full_name}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Action Menu */}
          {userRole === 'trainer' && (
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Relatório
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Desktop Action Buttons */}
          {userRole === 'trainer' && (
            <div className="hidden sm:flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          )}
        </div>

        {/* Student Info Card - Mobile Optimized */}
        <StudentInfoCard assessment={assessment} />
      </div>
    </div>
  );
}

interface StudentInfoCardProps {
  assessment: AssessmentHeaderProps['assessment'];
}

function StudentInfoCard({ assessment }: StudentInfoCardProps) {
  // Função auxiliar para garantir que temos um número válido
  const formatNumber = (value: unknown, decimals: number = 2): string => {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    const stringValue = String(value).trim();
    if (stringValue === '') {
      return '0.00';
    }
    const num = Number(stringValue);
    if (isNaN(num) || !isFinite(num)) {
      return '0.00';
    }
    return num.toFixed(decimals);
  };

  // Função para classificação
  const getClassificationColor = (fatPercentage: number, gender: string) => {
    const ensureNumber = (value: unknown): number => {
      if (value === null || value === undefined || value === '') return 0;
      const stringValue = String(value).trim();
      if (stringValue === '') return 0;
      const num = Number(stringValue);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };

    const validFatPercentage = ensureNumber(fatPercentage);
    let classification = '';
    let colorClass = '';

    if (gender === 'male') {
      if (validFatPercentage < 6) {
        classification = 'Muito Baixo';
        colorClass = 'text-red-600 dark:text-red-400';
      } else if (validFatPercentage < 14) {
        classification = 'Atlético';
        colorClass = 'text-green-600 dark:text-green-400';
      } else if (validFatPercentage < 18) {
        classification = 'Fitness';
        colorClass = 'text-blue-600 dark:text-blue-400';
      } else if (validFatPercentage < 25) {
        classification = 'Aceitável';
        colorClass = 'text-yellow-600 dark:text-yellow-400';
      } else {
        classification = 'Elevado';
        colorClass = 'text-orange-600 dark:text-orange-400';
      }
    } else {
      if (validFatPercentage < 16) {
        classification = 'Muito Baixo';
        colorClass = 'text-red-600 dark:text-red-400';
      } else if (validFatPercentage < 21) {
        classification = 'Atlético';
        colorClass = 'text-green-600 dark:text-green-400';
      } else if (validFatPercentage < 25) {
        classification = 'Fitness';
        colorClass = 'text-blue-600 dark:text-blue-400';
      } else if (validFatPercentage < 32) {
        classification = 'Aceitável';
        colorClass = 'text-yellow-600 dark:text-yellow-400';
      } else {
        classification = 'Elevado';
        colorClass = 'text-orange-600 dark:text-orange-400';
      }
    }

    return { classification, colorClass };
  };

  const { classification, colorClass } = getClassificationColor(assessment.fat_percentage, assessment.gender);

  return (
    <div className="relative mx-auto max-w-md sm:max-w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
      <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg flex-shrink-0">
            {assessment.profiles.full_name.substring(0, 2).toUpperCase()}
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0 w-full">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {assessment.profiles.full_name}
            </h3>

            {/* Dados em grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mx-auto max-w-xs sm:max-w-full sm:grid-cols-4 lg:grid-cols-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">{assessment.age} anos</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">{assessment.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">{formatNumber(assessment.height, 0)}cm</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">{formatNumber(assessment.weight, 1)}kg</span>
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="w-full sm:w-auto">
            <div className={`text-lg sm:text-3xl font-black ${colorClass} flex items-center justify-center sm:justify-end gap-1 sm:gap-2`}>
              <Crown className="h-5 w-5 sm:h-8 sm:w-8" />
              <span>{classification}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">
              {formatNumber(assessment.fat_percentage)}% Gordura
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}