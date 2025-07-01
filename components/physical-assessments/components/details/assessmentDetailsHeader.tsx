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
  Activity,
  Sparkles,
  Crown,
  Share2,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  TrendingUp,
  Heart,
  Scale,
  BarChart3,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface AssessmentHeaderProps {
  assessment: any;
  userRole: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDownload: () => void;
}

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
    let icon = Target;

    if (gender === 'male') {
      if (validFatPercentage < 6) {
        classification = 'Muito Baixo';
        badgeColor = 'from-red-500 to-red-600';
      } else if (validFatPercentage < 14) {
        classification = 'Excelente';
        badgeColor = 'from-app-achievement-workout to-app-btn-primary';
        icon = Crown;
      } else if (validFatPercentage < 18) {
        classification = 'Bom';
        badgeColor = 'from-app-achievement-workout to-app-btn-secondary';
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
        badgeColor = 'from-app-achievement-workout to-app-btn-primary';
        icon = Crown;
      } else if (validFatPercentage < 25) {
        classification = 'Bom';
        badgeColor = 'from-app-achievement-workout to-app-btn-secondary';
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
    <div className="relative mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          
          {/* Navigation Bar - Mobile First */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline sm:ml-2 font-semibold">Voltar</span>
            </Button>

            {/* Actions Menu - Mobile */}
            {userRole === 'trainer' && (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl"
                  >
                    <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 p-3">
                      <Edit className="h-4 w-4 text-app-achievement-workout" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onDelete} 
                      className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Deletar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Desktop Actions */}
            {userRole === 'trainer' && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  onClick={onEdit}
                  className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                
                <Button
                  onClick={onDelete}
                  variant="outline"
                  className="h-10 px-4 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </div>
            )}
          </div>

          {/* Assessment Info */}
          <div className="space-y-4">
            
            {/* Title and Icon */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-achievement-workout rounded-xl sm:rounded-2xl flex items-center justify-center shadow-app-large">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading leading-tight break-words">
                  Avaliação Física Completa
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-app-text-secondary">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{format(new Date(assessment.date), 'PPP', { locale: ptBR })}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{assessment.profiles.full_name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{assessment.protocol || 'Protocolo Padrão'}</span>
                  </div>

                  {assessment.updated_at !== assessment.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Atualizada em {format(new Date(assessment.updated_at), 'dd/MM/yy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>                       
          </div>
        </div>
      </div>
    </div>
  );
}