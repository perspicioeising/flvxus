 'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Award
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
      <div className={`space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/10 to-app-btn-primary/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
            <CardContent className="text-center py-16 sm:py-24 px-8">
              <div className="relative mb-8">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-app-bg-secondary via-app-border-muted to-app-bg-secondary rounded-full flex items-center justify-center shadow-app-xl">
                    <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-app-text-muted" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-achievement-exercise rounded-full flex items-center justify-center shadow-app-medium">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-app-border-muted/20 via-app-bg-secondary/20 to-app-border-muted/20 rounded-full blur-3xl animate-pulse"></div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-app-text-heading mb-4">
                Análise IA não disponível
              </h3>
              <p className="text-app-text-secondary mb-8 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                Esta avaliação foi realizada sem análise de inteligência artificial
              </p>
              <Badge className="px-6 py-3 bg-gradient-to-r from-app-bg-secondary to-app-border-muted text-app-text-primary border-0 rounded-2xl text-base font-bold shadow-app-large">
                <Info className="h-4 w-4 mr-2" />
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
      <div className={`space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/20 to-app-btn-primary/20 rounded-3xl blur-xl"></div>
          <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
            <CardHeader className="p-8 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-exercise/10 to-app-bg-secondary/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-achievement-exercise rounded-2xl shadow-app-large">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-consecutive rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-app-text-heading">
                    Análise Inteligente
                  </CardTitle>
                  <CardDescription className="text-app-text-secondary">
                    Gere recomendações personalizadas com IA
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="relative mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-app-achievement-exercise/20 via-app-achievement-weight/20 to-app-achievement-exercise/20 rounded-full flex items-center justify-center shadow-app-xl">
                      <Brain className="h-16 w-16 text-app-achievement-exercise" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-achievement-consecutive rounded-full flex items-center justify-center shadow-app-medium animate-bounce">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/30 via-app-achievement-weight/30 to-app-achievement-exercise/30 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <h3 className="text-3xl font-black text-app-text-heading mb-4">
                  Pronto para Análise IA!
                </h3>
                <p className="text-app-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  A inteligência artificial irá analisar os dados corporais{studentInfo?.name ? ` de ${studentInfo.name}` : ''} e gerar recomendações personalizadas de treino, nutrição e estilo de vida.
                </p>

                {/* Informações do que será analisado */}
                {assessmentData && (
                  <div className="mb-10 p-6 bg-gradient-to-r from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-2xl border border-app-border-accent shadow-app-medium">
                    <h4 className="font-bold text-app-achievement-exercise mb-6 text-lg flex items-center justify-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Dados para Análise
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {assessmentData.bmi && (
                        <MetricPreview
                          value={assessmentData.bmi.toFixed(1)}
                          label="IMC"
                          gradient="from-app-achievement-exercise to-app-btn-primary"
                        />
                      )}
                      {assessmentData.fatPercentage && (
                        <MetricPreview
                          value={`${assessmentData.fatPercentage}%`}
                          label="% Gordura"
                          gradient="from-app-achievement-workout to-app-btn-primary"
                        />
                      )}
                      {assessmentData.leanMass && (
                        <MetricPreview
                          value={`${assessmentData.leanMass}kg`}
                          label="M. Magra"
                          gradient="from-app-achievement-weight to-app-btn-primary"
                        />
                      )}
                      {assessmentData.protocol && (
                        <MetricPreview
                          value={assessmentData.protocol}
                          label="Protocolo"
                          gradient="from-app-achievement-consecutive to-app-btn-primary"
                          isText
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {onBack && (
                    <Button
                      variant="outline"
                      onClick={onBack}
                      className="px-6 py-3 bg-app-card backdrop-blur-sm border-2 border-app-border-accent hover:border-app-achievement-exercise rounded-xl font-semibold shadow-app-medium transition-all duration-300 hover:scale-105"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Voltar
                    </Button>
                  )}
                  
                  {onAnalyze && (
                    <Button
                      onClick={onAnalyze}
                      disabled={isLoading}
                      className="px-10 py-3 bg-achievement-exercise hover:bg-app-achievement-exercise/90 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-app-xl hover:shadow-app-achievement-exercise/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-2" />
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
    <div className={`space-y-6 ${className}`}>
      {/* Classificação Principal */}
      <ClassificationCard 
        analysis={analysis} 
        mode={mode}
      />

      {/* Análise Detalhada */}
      {analysis?.analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pontos Fortes */}
          {analysis.analysis.strengths && analysis.analysis.strengths.length > 0 && (
            <AnalysisCard
              title="Pontos Fortes"
              icon={CheckCircle2}
              items={analysis.analysis.strengths}
              gradient="from-app-achievement-consecutive to-app-btn-primary"
              bgGradient="from-app-bg-secondary/30 to-app-bg-secondary/50"
              borderColor="border-app-border-accent"
              textColor="text-app-achievement-consecutive"
              dotColor="bg-app-achievement-consecutive"
            />
          )}

          {/* Áreas de Melhoria */}
          {analysis.analysis.improvements && analysis.analysis.improvements.length > 0 && (
            <AnalysisCard
              title="Áreas de Melhoria"
              icon={Target}
              items={analysis.analysis.improvements}
              gradient="from-amber-500 to-orange-600"
              bgGradient="from-amber-50/50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-800/20"
              borderColor="border-amber-200/50 dark:border-amber-700/50"
              textColor="text-amber-700 dark:text-amber-300"
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
              bgGradient="from-red-50/50 to-rose-100/50 dark:from-red-900/20 dark:to-rose-800/20"
              borderColor="border-red-200/50 dark:border-red-700/50"
              textColor="text-red-700 dark:text-red-300"
              dotColor="bg-red-500"
            />
          )}
        </div>
      )}

      {/* Recomendações */}
      {recommendations && Object.keys(recommendations).length > 0 && (
        <div className="space-y-6">
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
              gradient="from-app-achievement-consecutive to-app-btn-primary"
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
              gradient="from-app-achievement-weight to-app-btn-primary"
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
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-app-border-muted">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="px-6 py-3 bg-app-card backdrop-blur-sm border-2 border-app-border-accent hover:border-app-achievement-exercise rounded-xl font-semibold shadow-app-medium transition-all duration-300 hover:scale-105"
              disabled={isLoading}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar aos Resultados
            </Button>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isLoading}
              className="px-10 py-3 bg-achievement-consecutive hover:bg-app-achievement-consecutive/90 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-app-xl hover:shadow-app-achievement-consecutive/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
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
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/20 to-app-btn-primary/20 rounded-3xl blur-xl"></div>
      <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-exercise/10 to-app-bg-secondary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-achievement-exercise rounded-2xl shadow-app-large">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-consecutive rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-app-text-heading">
                  Análise Inteligente
                </CardTitle>
                <CardDescription className="text-app-text-secondary">
                  {mode === 'create' ? 'Análise gerada com sucesso' : 'Classificação e perfil corporal por IA'}
                </CardDescription>
              </div>
            </div>
            {mode === 'create' && (
              <Badge className="px-4 py-2 bg-gradient-to-r from-app-achievement-consecutive/20 to-app-achievement-consecutive/30 text-app-achievement-consecutive border-0 rounded-2xl font-bold shadow-app-medium">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Análise Completa
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ClassificationMetric
              value={analysis?.classification || 'N/A'}
              label="Classificação Corporal"
              gradient="from-app-achievement-exercise to-app-btn-primary"
              icon={Crown}
            />
            <ClassificationMetric
              value={analysis?.somatotype || 'N/A'}
              label="Somatótipo"
              gradient="from-app-achievement-workout to-app-btn-primary"
              icon={Activity}
            />
            <ClassificationMetric
              value={analysis?.healthStatus || 'N/A'}
              label="Status de Saúde"
              gradient="from-app-achievement-consecutive to-app-btn-primary"
              icon={Shield}
            />
          </div>
          
          {/* Perfil Metabólico */}
          {analysis?.metabolicProfile && (
            <div className="mt-8 p-6 bg-gradient-to-r from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-2xl border border-app-border-accent shadow-app-medium">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-achievement-weight rounded-xl shadow-app-medium">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-achievement-weight text-lg mb-1">Perfil Metabólico</div>
                  <div className="text-app-text-primary leading-relaxed">{analysis.metabolicProfile}</div>
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
      <div className="relative text-center p-6 bg-app-card backdrop-blur-xl rounded-2xl border border-app-border-muted shadow-app-large transform group-hover:scale-105 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        </div>
        <div className="relative">
          <Icon className={`h-8 w-8 mx-auto mb-3 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
          <div className="text-3xl font-black text-app-text-heading mb-2">
            {value}
          </div>
          <div className="text-sm text-app-text-secondary font-semibold">{label}</div>
        </div>
      </div>
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
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <Card className="relative border-0 bg-app-card backdrop-blur-xl shadow-app-large hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
        <CardHeader className={`p-6 bg-gradient-to-br ${bgGradient}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-app-medium`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-app-text-heading">{title}</CardTitle>
              <CardDescription className={`${textColor} opacity-80 text-sm`}>
                Aspectos identificados pela IA
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5 rounded-3xl blur-2xl`}></div>
      <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
        <CardHeader className={`p-8 bg-gradient-to-r ${bgGradient}`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`p-4 bg-gradient-to-br ${gradient} rounded-2xl shadow-app-large`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-consecutive rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-app-text-heading">{title}</CardTitle>
              <CardDescription className="text-app-text-secondary">
                Estratégias personalizadas pela IA
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <div className={`relative p-6 bg-app-card backdrop-blur-sm rounded-xl border ${borderColor} shadow-app-medium transform group-hover:scale-105 transition-all duration-300`}>
        <div className="font-bold text-app-text-heading capitalize mb-3 text-lg">
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
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/10 to-app-btn-primary/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-exercise/10 to-app-bg-secondary/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-achievement-exercise rounded-2xl shadow-app-large">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-consecutive rounded-full flex items-center justify-center">
                <Crown className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-app-text-heading">
                Plano de Acompanhamento
              </CardTitle>
              <CardDescription className="text-app-text-secondary">
                Estratégia para monitoramento de progresso
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progressTracking.nextAssessment && (
              <TrackingMetric
                icon={Clock}
                label="Próxima Avaliação"
                value={progressTracking.nextAssessment}
                gradient="from-app-achievement-exercise to-app-btn-primary"
              />
            )}
            {progressTracking.expectedTimeline && (
              <TrackingMetric
                icon={TrendingUp}
                label="Timeline Esperada"
                value={progressTracking.expectedTimeline}
                gradient="from-app-achievement-workout to-app-btn-primary"
              />
            )}
            {progressTracking.keyMetrics && progressTracking.keyMetrics.length > 0 && (
              <TrackingMetric
                icon={Target}
                label="Métricas Chave"
                value={progressTracking.keyMetrics.join(', ')}
                gradient="from-app-achievement-weight to-app-btn-primary"
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
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
      <div className="relative p-6 bg-app-card backdrop-blur-sm rounded-xl border border-app-border-accent shadow-app-medium transform group-hover:scale-105 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-app-medium`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="font-bold text-app-text-heading text-lg">{label}</div>
        </div>
        <div className="text-app-text-secondary font-semibold">{value}</div>
      </div>
    </div>
  );
}

// Card de Observações Específicas
function SpecificNotesCard({ notes }: { notes: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/10 to-app-border-muted/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-app-bg-secondary/30 via-app-bg-secondary/40 to-app-bg-secondary/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-app-bg-secondary to-app-border-accent rounded-2xl shadow-app-large">
                <Info className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-achievement-consecutive rounded-full flex items-center justify-center">
                <Lightbulb className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-app-text-heading">
                Observações Específicas
              </CardTitle>
              <CardDescription className="text-app-text-secondary">
                Considerações técnicas e metodológicas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="p-6 bg-app-card backdrop-blur-sm rounded-xl border border-app-border-muted shadow-app-medium">
            <p className="text-app-text-secondary leading-relaxed">
              {notes}
            </p>
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
    <div className="text-center p-4 bg-app-card backdrop-blur-sm rounded-xl shadow-app-medium border border-app-border-accent">
      <div className={`text-${isText ? 'lg' : '2xl'} font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-sm text-app-text-secondary font-medium mt-1">{label}</div>
    </div>
  );
}

export default AssessmentAIAnalysis;
                         