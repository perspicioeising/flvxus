// components/physical-assessments/components/details/AssessmentDetailsActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Copy, Trash2, Loader2, Share2, Download, BarChart3, Info, TrendingUp } from 'lucide-react';

interface AssessmentDetailsActionsProps {
  assessment: any;
  onEdit: () => void;
  onShare: () => void;
  onDownload: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function AssessmentDetailsActions({
  assessment,
  onEdit,
  onShare,
  onDownload,
  onDelete,
  isDeleting
}: AssessmentDetailsActionsProps) {

  // Função auxiliar para garantir que temos um número válido
  const ensureNumber = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return 0;
    const stringValue = String(value).trim();
    if (stringValue === '') return 0;
    const num = Number(stringValue);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const formatNumber = (value: unknown, decimals: number = 2): string => {
    const num = ensureNumber(value);
    return num.toFixed(decimals);
  };

  const handleExport = () => {
    const assessmentData = {
      student: assessment.profiles.full_name,
      date: assessment.date,
      bmi: assessment.bmi,
      fat_percentage: assessment.fat_percentage,
      fat_mass: assessment.fat_mass,
      lean_mass: assessment.lean_mass,
      weight: assessment.weight,
      height: assessment.height,
      age: assessment.age,
      gender: assessment.gender,
      protocol: assessment.protocol,
      measurements: assessment.measurements,
      created_at: assessment.created_at
    };

    const dataStr = JSON.stringify(assessmentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `avaliacao-${assessment.profiles.full_name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lg:hidden mt-6">
      <Card className="border-0 card-app">
        <CardContent className="p-4 sm:p-6">
          
          {/* Quick Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-app-heading mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-app-text-accent" />
              Estatísticas da Avaliação
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-app-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-app-achievement-workout">
                  {formatNumber(assessment.bmi, 1)}
                </div>
                <div className="text-xs text-app-text-secondary">IMC</div>
              </div>
              
              <div className="bg-app-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-app-achievement-workout">
                  {formatNumber(assessment.fat_percentage, 1)}%
                </div>
                <div className="text-xs text-app-text-secondary">% Gordura</div>
              </div>
              
              <div className="bg-app-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-app-achievement-workout">
                  {formatNumber(assessment.fat_mass, 1)}kg
                </div>
                <div className="text-xs text-app-text-secondary">Massa Gorda</div>
              </div>
              
              <div className="bg-app-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-app-achievement-workout">
                  {formatNumber(assessment.lean_mass, 1)}kg
                </div>
                <div className="text-xs text-app-text-secondary">Massa Magra</div>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-3 mb-6">
            <h4 className="text-base font-semibold text-app-text-primary mb-3">
              Ações Principais
            </h4>
            
            <div className="space-y-3">
              <Button
                onClick={onEdit}
                className="w-full btn-gradient-primary h-12 rounded-xl font-bold shadow-app-medium hover:shadow-app-large transition-all duration-300 transform active:scale-95"
              >
                <Edit className="h-5 w-5 mr-3" />
                Editar Avaliação
              </Button>
              
              <Button
                onClick={onShare}
                variant="outline"
                className="w-full h-12 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
              >
                <Share2 className="h-5 w-5 mr-3" />
                Compartilhar Avaliação
              </Button>
              
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="outline"
                className="w-full h-12 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-3" />
                    Deletar Avaliação
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-border-muted"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-app-bg-card text-app-text-muted">
                Ações Secundárias
              </span>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => window.open(`/dashboard/assessments/${assessment.id}/report`, '_blank')}
              variant="outline"
              className="h-11 bg-app-card border-app-border-muted text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-medium transition-all duration-300"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-11 bg-app-card border-app-border-muted text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-medium transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-app-text-accent" />
              <h5 className="text-sm font-semibold text-app-text-primary">
                Informações Detalhadas
              </h5>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Aluno:</span>
                <span className="font-medium text-app-text-primary truncate ml-2 max-w-32">{assessment.profiles.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Protocolo:</span>
                <span className="font-medium text-app-text-primary">{assessment.protocol || 'Padrão'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Gênero:</span>
                <span className="font-medium text-app-text-primary">{assessment.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Idade:</span>
                <span className="font-medium text-app-text-primary">{assessment.age} anos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Peso:</span>
                <span className="font-medium text-app-text-primary">{formatNumber(assessment.weight, 1)}kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-app-text-secondary">Altura:</span>
                <span className="font-medium text-app-text-primary">{assessment.height}cm</span>
              </div>
              
              {/* Multimedia indicators */}
              <div className="pt-2 border-t border-app-border-muted">
                <div className="flex justify-between items-center">
                  <span className="text-app-text-secondary">Tem Análise IA:</span>
                  <span className={`font-medium ${assessment.ai_analysis ? 'text-app-achievement-workout' : 'text-app-text-muted'}`}>
                    {assessment.ai_analysis ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-app-text-secondary">Medidas Detalhadas:</span>
                  <span className={`font-medium ${assessment.measurements && Object.keys(assessment.measurements).length > 0 ? 'text-app-achievement-workout' : 'text-app-text-muted'}`}>
                    {assessment.measurements && Object.keys(assessment.measurements).length > 0 ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}