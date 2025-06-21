// components/physical-assessments/components/details/AssessmentDetailsHeader.tsx
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
  Scale,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
    let icon = Trophy;

    if (gender === 'male') {
      if (validFatPercentage < 6) {
        classification = 'Muito Baixo';
        badgeColor = 'from-red-500 to-red-600';
      } else if (validFatPercentage < 14) {
        classification = 'Excelente';
        badgeColor = 'from-green-500 to-emerald-600';
        icon = Crown;
      } else if (validFatPercentage < 18) {
        classification = 'Bom';
        badgeColor = 'from-blue-500 to-green-600';
      } else if (validFatPercentage < 25) {
        classification = 'Regular';
        badgeColor = 'from-yellow-500 to-orange-600';
      } else {
        classification = 'Elevado';
        badgeColor = 'from-orange-500 to-red-600';
      }
    } else {
      if (validFatPercentage < 16) {
        classification = 'Muito Baixo';
        badgeColor = 'from-red-500 to-red-600';
      } else if (validFatPercentage < 21) {
        classification = 'Excelente';
        badgeColor = 'from-green-500 to-emerald-600';
        icon = Crown;
      } else if (validFatPercentage < 25) {
        classification = 'Bom';
        badgeColor = 'from-blue-500 to-green-600';
      } else if (validFatPercentage < 32) {
        classification = 'Regular';
        badgeColor = 'from-yellow-500 to-orange-600';
      } else {
        classification = 'Elevado';
        badgeColor = 'from-orange-500 to-red-600';
      }
    }

    return { classification, badgeColor, icon };
  };

  const { classification, badgeColor, icon: ClassificationIcon } = getClassificationData(assessment.fat_percentage, assessment.gender);

  return (
    <div className="relative mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-green-500/20 to-green-600/20 dark:from-green-500/10 dark:via-green-400/10 dark:to-green-500/10 rounded-3xl blur-xl"></div>
      
      {/* Main Header Card */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl shadow-2xl">
        
        {/* Top Section with Actions */}
        <div className="p-6 sm:p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Desktop Actions */}
            {userRole === 'trainer' && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Editar
                </Button>
                
                {/* <Button
                  variant="outline"
                  onClick={onShare}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Share2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Compartilhar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onDownload}
                  className="h-11 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Relatório
                </Button> */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Avaliação
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Actions */}
            {userRole === 'trainer' && (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <DropdownMenuItem onClick={onEdit} className="rounded-lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={onShare} className="rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDownload} className="rounded-lg">
                      <Download className="h-4 w-4 mr-2" />
                      Relatório
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 rounded-lg">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Activity className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent mb-2">
              Avaliação Física Completa
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        {/* Student Info Section */}
        <div className="p-6 ">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-green-600/10 rounded-2xl blur-lg"></div>
            <div className="relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              
              {/* Student Profile Row */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                    {assessment.profiles.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <Badge className={`absolute -bottom-2 -right-2 px-3 py-1.5 bg-gradient-to-r ${badgeColor} text-white rounded-full text-xs font-bold border-0 shadow-lg`}>
                    <ClassificationIcon className="h-3 w-3 mr-1" />
                    {classification}
                  </Badge>
                </div>

                {/* Student Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {assessment.profiles.full_name}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {assessment.gender === 'male' ? 'Masculino' : 'Feminino'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {assessment.age} anos
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      {assessment.protocol || 'Protocolo Padrão'}
                    </span>
                  </div>
                </div>
              </div>           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para cards de métricas
interface MetricCardProps {
  icon: any;
  label: string;
  value: string;
  unit: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
}

function MetricCard({ icon: Icon, label, value, unit, gradient, bgColor, borderColor }: MetricCardProps) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`relative flex items-center gap-3 p-4 bg-gradient-to-br ${bgColor} rounded-xl border ${borderColor} transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
        <div className={`p-2.5 bg-gradient-to-br ${gradient} rounded-lg shadow-md`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {value}{unit}
          </div>
        </div>
      </div>
    </div>
  );
}