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
  Save
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
  // Dados de IA (podem vir de diferentes fontes)
  aiAnalysis?: AIAnalysis | string | null;
  aiRecommendations?: any | string | null;
  
  // Configurações do componente
  mode?: 'view' | 'create'; // view = visualização, create = criação
  isLoading?: boolean;
  onAnalyze?: () => void;
  onSave?: () => void;
  onBack?: () => void;
  
  // Dados para análise (modo criação)
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
    // Processar aiAnalysis
    if (typeof aiAnalysis === 'string') {
      normalizedAnalysis = JSON.parse(aiAnalysis);
    } else if (aiAnalysis && typeof aiAnalysis === 'object') {
      normalizedAnalysis = aiAnalysis;
    }

    // Processar aiRecommendations
    if (typeof aiRecommendations === 'string') {
      normalizedRecommendations = JSON.parse(aiRecommendations);
    } else if (aiRecommendations && typeof aiRecommendations === 'object') {
      normalizedRecommendations = aiRecommendations;
    }

    // Fallback: extrair recomendações da análise se não estiverem separadas
    if (!normalizedRecommendations || Object.keys(normalizedRecommendations).length === 0) {
      normalizedRecommendations = normalizedAnalysis?.recommendations || {};
    }
  } catch (error) {
    console.error('Erro ao normalizar dados de IA:', error);
  }

  return { analysis: normalizedAnalysis, recommendations: normalizedRecommendations };
};

// Função auxiliar para formatar valores
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
  // Normalizar dados de IA
  const { analysis, recommendations } = normalizeAIData(aiAnalysis, aiRecommendations);
  
  // Verificar se há dados básicos
  const hasBasicData = analysis?.classification || 
                      analysis?.somatotype || 
                      analysis?.healthStatus ||
                      Object.keys(recommendations).length > 0;

  // Estado vazio - quando não há análise IA
  if (!hasBasicData && mode === 'view') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="text-center py-24">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              Análise IA não disponível
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Esta avaliação foi realizada sem análise de inteligência artificial
            </p>
            <Badge className="bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
              Análise manual
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado inicial no modo criação - sem análise ainda
  if (!hasBasicData && mode === 'create') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Análise Inteligente</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Gere recomendações personalizadas com IA
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center shadow-xl">
                  <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-indigo-400/30 rounded-full blur-2xl animate-pulse"></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Pronto para Análise IA!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                A inteligência artificial irá analisar os dados corporais{studentInfo?.name ? ` de ${studentInfo.name}` : ''} e gerar recomendações personalizadas de treino, nutrição e estilo de vida.
              </p>

              {/* Informações do que será analisado */}
              {assessmentData && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4">Dados para Análise:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {assessmentData.bmi && (
                      <div className="text-center">
                        <div className="font-bold text-purple-600 dark:text-purple-400">{assessmentData.bmi}</div>
                        <div className="text-gray-600 dark:text-gray-400">IMC</div>
                      </div>
                    )}
                    {assessmentData.fatPercentage && (
                      <div className="text-center">
                        <div className="font-bold text-purple-600 dark:text-purple-400">{assessmentData.fatPercentage}%</div>
                        <div className="text-gray-600 dark:text-gray-400">% Gordura</div>
                      </div>
                    )}
                    {assessmentData.leanMass && (
                      <div className="text-center">
                        <div className="font-bold text-purple-600 dark:text-purple-400">{assessmentData.leanMass}kg</div>
                        <div className="text-gray-600 dark:text-gray-400">M. Magra</div>
                      </div>
                    )}
                    {assessmentData.protocol && (
                      <div className="text-center">
                        <div className="font-bold text-purple-600 dark:text-purple-400">{assessmentData.protocol}</div>
                        <div className="text-gray-600 dark:text-gray-400">Protocolo</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {onBack && (
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                )}
                
                {onAnalyze && (
                  <Button
                    onClick={onAnalyze}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl"
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
    );
  }

  // Interface principal - exibir análise completa
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Classificação Principal */}
      <Card className="border-0 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Análise Inteligente</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {mode === 'create' ? 'Análise gerada com sucesso' : 'Classificação e perfil corporal por IA'}
              </CardDescription>
            </div>
            {mode === 'create' && (
              <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Análise Completa
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
                {analysis?.classification || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Classificação Corporal</div>
            </div>
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                {analysis?.somatotype || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Somatótipo</div>
            </div>
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                {analysis?.healthStatus || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Status de Saúde</div>
            </div>
          </div>
          
          {/* Perfil Metabólico */}
          {analysis?.metabolicProfile && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="font-semibold text-indigo-800 dark:text-indigo-300">Perfil Metabólico</div>
                  <div className="text-indigo-700 dark:text-indigo-400">{analysis.metabolicProfile}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Detalhada - Pontos Fortes, Melhorias e Riscos */}
      {analysis?.analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pontos Fortes */}
          {analysis.analysis.strengths && analysis.analysis.strengths.length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-green-800 dark:text-green-300">Pontos Fortes</CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400 text-sm">
                      Aspectos positivos identificados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-700 dark:text-green-300 text-sm leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Áreas de Melhoria */}
          {analysis.analysis.improvements && analysis.analysis.improvements.length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 dark:from-orange-900/20 dark:to-yellow-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-300">Áreas de Melhoria</CardTitle>
                    <CardDescription className="text-orange-600 dark:text-orange-400 text-sm">
                      Oportunidades de desenvolvimento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.analysis.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-orange-700 dark:text-orange-300 text-sm leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Fatores de Risco */}
          {analysis.analysis.risks && analysis.analysis.risks.length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-red-800 dark:text-red-300">Fatores de Risco</CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400 text-sm">
                      Aspectos que requerem atenção
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.analysis.risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-red-700 dark:text-red-300 text-sm leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recomendações */}
      {recommendations && Object.keys(recommendations).length > 0 && (
        <div className="space-y-6">
          {/* Recomendações de Treino */}
          {recommendations.training && Object.keys(recommendations.training).length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recomendações de Treinamento</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Estratégias personalizadas de exercícios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(recommendations.training).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                      <div className="font-semibold text-blue-700 dark:text-blue-300 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-900 dark:text-white text-sm leading-relaxed">{formatValue(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendações Nutricionais */}
          {recommendations.nutrition && Object.keys(recommendations.nutrition).length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recomendações Nutricionais</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Estratégias alimentares personalizadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(recommendations.nutrition).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-200/30 dark:border-green-700/30">
                      <div className="font-semibold text-green-700 dark:text-green-300 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-900 dark:text-white text-sm leading-relaxed">{formatValue(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendações de Estilo de Vida */}
          {recommendations.lifestyle && Object.keys(recommendations.lifestyle).length > 0 && (
            <Card className="border-0 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recomendações de Estilo de Vida</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Hábitos para otimizar resultados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(recommendations.lifestyle).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                      <div className="font-semibold text-purple-700 dark:text-purple-300 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-900 dark:text-white text-sm leading-relaxed">{formatValue(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plano de Acompanhamento */}
      {analysis?.progressTracking && (
        <Card className="border-0 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Plano de Acompanhamento</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Estratégia para monitoramento de progresso
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analysis.progressTracking.nextAssessment && (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">Próxima Avaliação</div>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm">{analysis.progressTracking.nextAssessment}</div>
                </div>
              )}
              {analysis.progressTracking.expectedTimeline && (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">Timeline Esperada</div>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm">{analysis.progressTracking.expectedTimeline}</div>
                </div>
              )}
              {analysis.progressTracking.keyMetrics && analysis.progressTracking.keyMetrics.length > 0 && (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">Métricas Chave</div>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm">
                    {analysis.progressTracking.keyMetrics.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações Específicas */}
      {analysis?.specificNotes && (
        <Card className="border-0 bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-800/50 dark:to-slate-800/50 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Observações Específicas</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Considerações técnicas e metodológicas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                {analysis.specificNotes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações do Modo Criação */}
      {mode === 'create' && (onBack || onSave) && (
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Resultados
            </Button>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl ml-auto"
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

export default AssessmentAIAnalysis;