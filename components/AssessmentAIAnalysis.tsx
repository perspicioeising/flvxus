'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Activity, 
  Heart, 
  Zap, 
  CheckCircle2, 
  Target, 
  AlertCircle, 
  BarChart3,
  Info,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  ArrowLeft,
  Save,
  Lightbulb,
  Star,
  Crown,
  Award,
  Scale,
  Flame,
  Droplets,
  Calculator,
  User,
  ListCollapse,
  Expand
} from "lucide-react";

// Tipos unificados para análise IA
interface AIAnalysis {
  classification?: string;
  somatotype?: string;
  healthStatus?: string;
  metabolicProfile?: string;
  analysis?: {
    strengths?: string[];
    improvements?: string[];
    risks?: string[];
  };
  recommendations?: {
    training?: Record<string, string | React.ReactNode>;
    nutrition?: Record<string, string | React.ReactNode>;
    lifestyle?: Record<string, string | React.ReactNode>;
  };
  progressTracking?: {
    nextAssessment?: string;
    keyMetrics?: string[];
    expectedTimeline?: string;
  };
  specificNotes?: string;
}

interface AssessmentAIAnalysisProps {
  aiAnalysis?: AIAnalysis | string | null;
  aiRecommendations?: any | string | null;
  mode?: 'view' | 'create';
  isLoading?: boolean;
  onAnalyze?: () => void;
  onSave?: () => void;
  onBack?: () => void;
  assessmentData?: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'male' | 'female';
    bmi?: number;
    fatPercentage?: number;
    fatMass?: number;
    leanMass?: number;
    protocol?: string;
  };
  studentInfo?: {
    name?: string;
    goals?: string[];
  };
  className?: string;
}

// Função auxiliar para normalizar dados
const normalizeAIData = (aiAnalysis: any, aiRecommendations: any): { analysis: AIAnalysis | null, recommendations: any } => {
  let normalizedAnalysis: AIAnalysis | null = null;
  let normalizedRecommendations: any = {};

  try {
    if (typeof aiAnalysis === 'string') {
      normalizedAnalysis = JSON.parse(aiAnalysis);
    } else if (aiAnalysis && typeof aiAnalysis === 'object') {
      normalizedAnalysis = aiAnalysis;
    }

    if (typeof aiRecommendations === 'string') {
      normalizedRecommendations = JSON.parse(aiRecommendations);
    } else if (aiRecommendations && typeof aiRecommendations === 'object') {
      normalizedRecommendations = aiRecommendations;
    }

    if (!normalizedRecommendations || Object.keys(normalizedRecommendations).length === 0) {
      normalizedRecommendations = normalizedAnalysis?.recommendations || {};
    }
  } catch (error) {
    console.error('Erro ao normalizar dados de IA:', error);
  }

  return { analysis: normalizedAnalysis, recommendations: normalizedRecommendations };
};

const formatValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (React.isValidElement(value)) return String(value);
  return String(value || '');
};

const AssessmentAIAnalysis: React.FC<AssessmentAIAnalysisProps> = ({
  aiAnalysis,
  aiRecommendations,
  mode = 'view',
  isLoading = false,
  onAnalyze,
  onSave,
  onBack,
  assessmentData,
  studentInfo,
  className = ""
}) => {
  const { analysis, recommendations } = normalizeAIData(aiAnalysis, aiRecommendations);
  
  const hasBasicData = analysis?.classification || 
                      analysis?.somatotype || 
                      analysis?.healthStatus ||
                      Object.keys(recommendations).length > 0;

  // Estado vazio - quando não há análise IA
  if (!hasBasicData && mode === 'view') {
    return (
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative border-0 card-app">
            <CardContent className="text-center py-12 sm:py-16">
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                  <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-app-heading mb-2">
                Análise IA não disponível
              </h3>
              <p className="text-app-text-secondary max-w-md mx-auto leading-relaxed mb-4">
                Esta avaliação foi realizada sem análise de inteligência artificial
              </p>
              <Badge className="px-4 py-2 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-sm font-bold">
                <Info className="h-3 w-3 mr-1" />
                Análise Manual
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Estado inicial no modo criação
  if (!hasBasicData && mode === 'create') {
    return (
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Análise Inteligente
                </CardTitle>
                <Badge className="px-2 py-1 bg-purple-100 text-purple-600 border border-purple-200 rounded-full text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pronto
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-center py-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-app-achievement-workout/20 via-app-text-accent/20 to-app-achievement-workout/20 rounded-full flex items-center justify-center shadow-app-large">
                    <Brain className="h-10 w-10 text-app-achievement-workout" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-app-text-accent rounded-full flex items-center justify-center animate-bounce">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/30 via-app-text-accent/30 to-app-achievement-workout/30 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <h3 className="text-xl font-bold text-app-heading mb-3">
                  Pronto para Análise IA!
                </h3>
                <p className="text-app-text-secondary mb-6 max-w-lg mx-auto leading-relaxed">
                  A inteligência artificial irá analisar os dados corporais{studentInfo?.name ? ` de ${studentInfo.name}` : ''} e gerar recomendações personalizadas de treino, nutrição e estilo de vida.
                </p>

                {/* Informações do que será analisado */}
                {assessmentData && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                    <h4 className="font-bold text-app-achievement-workout mb-4 text-base flex items-center justify-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Dados para Análise
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {assessmentData.bmi && (
                        <MetricPreview
                          value={assessmentData.bmi.toFixed(1)}
                          label="IMC"
                          gradient="from-app-achievement-workout to-app-btn-primary"
                        />
                      )}
                      {assessmentData.fatPercentage && (
                        <MetricPreview
                          value={`${assessmentData.fatPercentage}%`}
                          label="% Gordura"
                          gradient="from-app-achievement-workout to-app-btn-secondary"
                        />
                      )}
                      {assessmentData.leanMass && (
                        <MetricPreview
                          value={`${assessmentData.leanMass}kg`}
                          label="M. Magra"
                          gradient="from-app-achievement-workout to-app-text-accent"
                        />
                      )}
                      {assessmentData.protocol && (
                        <MetricPreview
                          value={assessmentData.protocol}
                          label="Protocolo"
                          gradient="from-app-achievement-workout to-app-btn-accent"
                          isText
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {onBack && (
                    <Button
                      variant="outline"
                      onClick={onBack}
                      className="h-10 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  )}
                  
                  {onAnalyze && (
                    <Button
                      onClick={onAnalyze}
                      disabled={isLoading}
                      className="h-10 px-6 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl shadow-app-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Interface principal - exibir análise completa
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Classificação Principal */}
      <ClassificationCard 
        analysis={analysis} 
        mode={mode}
      />

      {/* Análise Detalhada */}
      {analysis?.analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Pontos Fortes */}
          {analysis.analysis.strengths && analysis.analysis.strengths.length > 0 && (
            <AnalysisCard
              title="Pontos Fortes"
              icon={CheckCircle2}
              items={analysis.analysis.strengths}
              gradient="from-app-achievement-workout to-app-btn-primary"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-app-border-accent"
              textColor="text-app-achievement-workout"
              dotColor="bg-app-achievement-workout"
            />
          )}

          {/* Áreas de Melhoria */}
          {analysis.analysis.improvements && analysis.analysis.improvements.length > 0 && (
            <AnalysisCard
              title="Áreas de Melhoria"
              icon={Target}
              items={analysis.analysis.improvements}
              gradient="from-amber-500 to-orange-600"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-amber-200/50"
              textColor="text-amber-700"
              dotColor="bg-amber-500"
            />
          )}

          {/* Fatores de Risco */}
          {analysis.analysis.risks && analysis.analysis.risks.length > 0 && (
            <AnalysisCard
              title="Fatores de Risco"
              icon={AlertCircle}
              items={analysis.analysis.risks}
              gradient="from-red-500 to-rose-600"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-red-200/50"
              textColor="text-red-700"
              dotColor="bg-red-500"
            />
          )}
        </div>
      )}

      {/* Recomendações */}
      {recommendations && Object.keys(recommendations).length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Recomendações de Treino */}
          {recommendations.training && Object.keys(recommendations.training).length > 0 && (
            <RecommendationSection
              title="Recomendações de Treinamento"
              icon={Activity}
              items={recommendations.training}
              gradient="from-app-achievement-workout to-app-btn-primary"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-app-border-accent"
            />
          )}

          {/* Recomendações Nutricionais */}
          {recommendations.nutrition && Object.keys(recommendations.nutrition).length > 0 && (
            <RecommendationSection
              title="Recomendações Nutricionais"
              icon={Heart}
              items={recommendations.nutrition}
              gradient="from-app-achievement-workout to-app-btn-secondary"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-app-border-accent"
            />
          )}

          {/* Recomendações de Estilo de Vida */}
          {recommendations.lifestyle && Object.keys(recommendations.lifestyle).length > 0 && (
            <RecommendationSection
              title="Recomendações de Estilo de Vida"
              icon={Zap}
              items={recommendations.lifestyle}
              gradient="from-app-achievement-workout to-app-text-accent"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-app-border-accent"
            />
          )}
        </div>
      )}

      {/* Plano de Acompanhamento */}
      {analysis?.progressTracking && (
        <ProgressTrackingCard progressTracking={analysis.progressTracking} />
      )}

      {/* Observações Específicas */}
      {analysis?.specificNotes && (
        <SpecificNotesCard notes={analysis.specificNotes} />
      )}

      {/* Ações do Modo Criação */}
      {mode === 'create' && (onBack || onSave) && (
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-app-border-muted">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="h-10 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Resultados
            </Button>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isLoading}
              className="h-10 px-6 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl shadow-app-medium"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar com Análise IA
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};


// Componentes auxiliares

// Card de Classificação Principal
function ClassificationCard({ analysis, mode }: { analysis: AIAnalysis | null; mode: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
         
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
            <ClassificationMetric
              value={analysis?.classification || 'N/A'}
              label="Classificação Corporal"
              gradient="from-app-achievement-workout to-app-btn-primary"
              icon={Crown}
            />
            <ClassificationMetric
              value={analysis?.somatotype || 'N/A'}
              label="Somatótipo"
              gradient="from-app-achievement-workout to-app-btn-secondary"
              icon={Activity}
            />
            <ClassificationMetric
              value={analysis?.healthStatus || 'N/A'}
              label="Status de Saúde"
              gradient="from-app-achievement-workout to-app-text-accent"
              icon={Shield}
            />
          </div>
          
          {/* Perfil Metabólico */}
          {analysis?.metabolicProfile && (
            <div className="p-4 bg-gradient-to-r from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-app-achievement-workout rounded-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-achievement-workout text-base mb-1">Perfil Metabólico</div>
                  <div className="text-app-text-primary text-sm leading-relaxed">{analysis.metabolicProfile}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Card de Métrica de Classificação
function ClassificationMetric({ value, label, gradient, icon: Icon }: {
  value: string;
  label: string;
  gradient: string;
  icon: any;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        </div>
        <CardContent className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                {label}
              </p>
              <div className="text-2xl sm:text-3xl font-black text-app-heading mb-1">
                {value}
              </div>
            </div>
            <div className={`relative p-2 sm:p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-app-medium`}>
              <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Card de Análise (Pontos Fortes, Melhorias, Riscos)
function AnalysisCard({ title, icon: Icon, items, gradient, bgGradient, borderColor, textColor, dotColor }: {
  title: string;
  icon: any;
  items: string[];
  gradient: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <Card className="relative border-0 card-app shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
        <CardHeader className={`p-4 sm:p-6 bg-gradient-to-br ${bgGradient}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 sm:p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-app-medium`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-app-heading">{title}</CardTitle>
              <CardDescription className={`${textColor} opacity-80 text-xs sm:text-sm`}>
                Aspectos identificados pela IA
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ul className="space-y-3">
            {items.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-3 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`}></div>
                <span className={`${textColor} text-sm leading-relaxed`}>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Seção de Recomendações
function RecommendationSection({ title, icon: Icon, items, gradient, bgGradient, borderColor }: {
  title: string;
  icon: any;
  items: Record<string, any>;
  gradient: string;
  bgGradient: string;
  borderColor: string;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">{title}</CardTitle>
              <CardDescription className="text-app-text-secondary text-sm">
                Estratégias personalizadas pela IA
              </CardDescription>
            </div>
            <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-xs">
              {Object.keys(items).length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {Object.entries(items).map(([key, value], index) => (
              <RecommendationCard
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').trim()}
                content={formatValue(value)}
                gradient={gradient}
                borderColor={borderColor}
                delay={index * 100}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Card Individual de Recomendação
function RecommendationCard({ title, content, gradient, borderColor, delay }: {
  title: string;
  content: string;
  gradient: string;
  borderColor: string;
  delay: number;
}) {
  return (
    <div 
      className="relative group animate-fadeIn" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
      <div className="relative p-4 bg-app-card backdrop-blur-sm rounded-xl border border-app-border-muted shadow-app-medium transform group-hover:scale-105 transition-all duration-300">
        <div className="font-bold text-app-heading capitalize mb-2 text-sm">
          {title}:
        </div>
        <div className="text-app-text-secondary leading-relaxed text-sm">
          {content}
        </div>
      </div>
    </div>
  );
}

// Card de Plano de Acompanhamento
function ProgressTrackingCard({ progressTracking }: { progressTracking: any }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Plano de Acompanhamento
              </CardTitle>
              <CardDescription className="text-app-text-secondary text-sm">
                Estratégia para monitoramento de progresso
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {progressTracking.nextAssessment && (
              <TrackingMetric
                icon={Clock}
                label="Próxima Avaliação"
                value={progressTracking.nextAssessment}
                gradient="from-app-achievement-workout to-app-btn-primary"
              />
            )}
            {progressTracking.expectedTimeline && (
              <TrackingMetric
                icon={TrendingUp}
                label="Timeline Esperada"
                value={progressTracking.expectedTimeline}
                gradient="from-app-achievement-workout to-app-btn-secondary"
              />
            )}
            {progressTracking.keyMetrics && progressTracking.keyMetrics.length > 0 && (
              <TrackingMetric
                icon={Target}
                label="Métricas Chave"
                value={progressTracking.keyMetrics.join(', ')}
                gradient="from-app-achievement-workout to-app-text-accent"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Métrica de Acompanhamento
function TrackingMetric({ icon: Icon, label, value, gradient }: {
  icon: any;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        </div>
        <CardContent className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                {label}
              </p>
              <div className="text-app-text-primary font-semibold text-sm">
                {value}
              </div>
            </div>
            <div className={`relative p-2 bg-gradient-to-br ${gradient} rounded-lg shadow-app-medium`}>
              <Icon className="h-4 w-4 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Card de Observações Específicas
function SpecificNotesCard({ notes }: { notes: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Observações Específicas
              </CardTitle>
              <CardDescription className="text-app-text-secondary text-sm">
                Considerações técnicas e metodológicas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-app-text-primary leading-relaxed">
                  {notes}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Preview de Métrica
function MetricPreview({ value, label, gradient, isText = false }: {
  value: string;
  label: string;
  gradient: string;
  isText?: boolean;
}) {
  return (
    <div className="text-center p-3 bg-app-card backdrop-blur-sm rounded-xl shadow-app-medium border border-app-border-accent">
      <div className={`text-${isText ? 'sm' : 'xl'} font-black text-app-heading mb-1`}>
        {value}
      </div>
      <div className="text-xs text-app-text-secondary font-medium">{label}</div>
    </div>
  );
}

export default AssessmentAIAnalysis;