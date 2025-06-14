// components/physical-assessments/components/details/assessmentDetailsHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  User,
  Ruler,
  Weight,
  Activity,
  Sparkles,
  Crown,
  Share2,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  Scale
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AssessmentHeaderProps } from '@/components/physical-assessments/types/physical-assessment-details';

export function AssessmentDetailsHeader({
  assessment,
  userRole,
  onEdit,
  onDelete,
  onShare,
  onDownload
}: AssessmentHeaderProps) {
  const router = useRouter();

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
  const getClassificationData = (fatPercentage: number, gender: string) => {
    const ensureNumber = (value: unknown): number => {
      if (value === null || value === undefined || value === '') return 0;
      const stringValue = String(value).trim();
      if (stringValue === '') return 0;
      const num = Number(stringValue);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };

    const validFatPercentage = ensureNumber(fatPercentage);
    let classification = '';
    let badgeColor = '';

    if (gender === 'male') {
      if (validFatPercentage < 6) {
        classification = 'Muito Baixo';
        badgeColor = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      } else if (validFatPercentage < 14) {
        classification = 'Excelente';
        badgeColor = 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      } else if (validFatPercentage < 18) {
        classification = 'Bom';
        badgeColor = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      } else if (validFatPercentage < 25) {
        classification = 'Regular';
        badgeColor = 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      } else {
        classification = 'Elevado';
        badgeColor = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      }
    } else {
      if (validFatPercentage < 16) {
        classification = 'Muito Baixo';
        badgeColor = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      } else if (validFatPercentage < 21) {
        classification = 'Excelente';
        badgeColor = 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      } else if (validFatPercentage < 25) {
        classification = 'Bom';
        badgeColor = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      } else if (validFatPercentage < 32) {
        classification = 'Regular';
        badgeColor = 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      } else {
        classification = 'Elevado';
        badgeColor = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      }
    }

    return { classification, badgeColor };
  };

  const { classification, badgeColor } = getClassificationData(assessment.fat_percentage, assessment.gender);

  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-indigo-500/20 to-indigo-600/20 dark:from-indigo-500/10 dark:via-indigo-400/10 dark:to-indigo-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-800/30 rounded-3xl p-6 lg:p-8 shadow-2xl">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          
          {/* Back Button Row */}
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Mobile Action Menu - Only shows when trainer */}
            {userRole === 'trainer' ? (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onEdit} className="rounded-lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onShare} className="rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDownload} className="rounded-lg">
                      <Download className="h-4 w-4 mr-2" />
                      Relatório
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 rounded-lg">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Empty div to maintain flex layout when no trainer role
              <div className="w-12 sm:hidden"></div>
            )}
          </div>
          
          {/* Main Header Content */}
          <div className="flex flex-col items-center text-center gap-4">
            
            {/* Icon and Title */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            
            {/* Title and Info */}
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                Avaliação Física Detalhada
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Student Info Section - Single Card */}
        <div className="space-y-6">
          
          {/* Student Info Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-xl blur-lg"></div>
            <div className="relative p-4 sm:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg">
              
              {/* Student Avatar and Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shrink-0">
                  {assessment.profiles.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {assessment.profiles.full_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {assessment.gender === 'male' ? 'Masculino' : 'Feminino'}
                    </span>
                    <span>•</span>
                    <span>{assessment.age} anos</span>
                  </div>
                </div>
                <Badge className={`${badgeColor} border px-3 py-1.5 text-sm font-semibold shrink-0`}>
                  <Crown className="h-3 w-3 mr-1" />
                  {classification}
                </Badge>
              </div>

              {/* Metrics Grid - Harmonious Colors */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Height */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                    <Ruler className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Altura</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(assessment.height, 0)}cm
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Weight className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Peso</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(assessment.weight, 1)}kg
                    </div>
                  </div>
                </div>

                {/* BMI */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg border border-cyan-200/30 dark:border-cyan-700/30">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-md">
                    <Scale className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">IMC</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(assessment.bmi, 1)}
                    </div>
                  </div>
                </div>

                {/* Body Fat */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg border border-teal-200/30 dark:border-teal-700/30">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">% Gordura</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(assessment.fat_percentage, 1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body Composition Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Fat Mass */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative p-5 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">Massa Gorda</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatNumber(assessment.fat_mass, 1)}kg
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                      {formatNumber(assessment.fat_percentage, 1)}%
                    </div>
                  </div>
                </div>
                <div className="h-2.5 bg-indigo-200 dark:bg-indigo-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(ensureNumber(assessment.fat_percentage), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lean Mass */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-600/10 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative p-5 bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900/20 dark:to-teal-800/20 rounded-xl border border-cyan-200/50 dark:border-cyan-700/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg shadow-md">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-cyan-700 dark:text-cyan-300">Massa Magra</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatNumber(ensureNumber(assessment.weight) - ensureNumber(assessment.fat_mass), 1)}kg
                    </div>
                    <div className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">
                      {formatNumber(100 - ensureNumber(assessment.fat_percentage), 1)}%
                    </div>
                  </div>
                </div>
                <div className="h-2.5 bg-cyan-200 dark:bg-cyan-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100 - ensureNumber(assessment.fat_percentage), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Action Buttons - Improved Layout */}
        {userRole === 'trainer' && (
          <div className="hidden sm:block mt-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={onEdit}
                className="h-11 border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl font-semibold transition-all duration-300 group"
              >
                <Edit className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Editar
              </Button>
              
              <Button
                variant="outline"
                onClick={onShare}
                className="h-11 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-semibold transition-all duration-300 group"
              >
                <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Compartilhar
              </Button>
              
              <Button
                variant="outline"
                onClick={onDownload}
                className="h-11 border-2 border-cyan-200 dark:border-cyan-700 hover:border-cyan-300 dark:hover:border-cyan-600 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl font-semibold transition-all duration-300 group"
              >
                <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Relatório
              </Button>
              
              <Button
                variant="outline"
                onClick={onDelete}
                className="h-11 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300 group"
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Deletar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Função auxiliar para garantir números válidos
function ensureNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const stringValue = String(value).trim();
  if (stringValue === '') return 0;
  const num = Number(stringValue);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}