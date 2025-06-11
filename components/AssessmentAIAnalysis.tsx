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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-gray-500/10 to-gray-600/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardContent className="text-center py-24">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Brain className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
              </div>

              <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-4">
                Análise IA não disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                Esta avaliação foi realizada sem análise de inteligência artificial
              </p>
              <Badge className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0 rounded-2xl text-base font-bold shadow-lg dark:from-gray-800 dark:to-gray-700 dark:text-gray-300">
                <Info className="h-4 w-4 mr-2" />
                Análise Manual
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Estado inicial no modo criação - sem análise ainda
  if (!hasBasicData && mode === 'create') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-indigo-600/20 dark:from-purple-500/10 dark:via-pink-400/10 dark:to-indigo-500/10 rounded-3xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardHeader className="p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-indigo-900/10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Análise Inteligente
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Gere recomendações personalizadas com IA
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center shadow-2xl">
                    <Brain className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 dark:from-white dark:via-purple-400 dark:to-white bg-clip-text text-transparent mb-4">
                  Pronto para Análise IA!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  A inteligência artificial irá analisar os dados corporais{studentInfo?.name ? ` de ${studentInfo.name}` : ''} e gerar recomendações personalizadas de treino, nutrição e estilo de vida.
                </p>

                {/* Informações do que será analisado */}
                {assessmentData && (
                  <div className="mb-10 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-lg">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-6 text-lg flex items-center justify-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Dados para Análise
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {assessmentData.bmi && (
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-md">
                          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{assessmentData.bmi}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">IMC</div>
                        </div>
                      )}
                      {assessmentData.fatPercentage && (
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-md">
                          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{assessmentData.fatPercentage}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">% Gordura</div>
                        </div>
                      )}
                      {assessmentData.leanMass && (
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-md">
                          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{assessmentData.leanMass}kg</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">M. Magra</div>
                        </div>
                      )}
                      {assessmentData.protocol && (
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-md">
                          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{assessmentData.protocol}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Protocolo</div>
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
                      className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
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
                      className="px-10 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-indigo-600/20 dark:from-purple-500/10 dark:via-pink-400/10 dark:to-indigo-500/10 rounded-3xl blur-xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
          <CardHeader className="p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-indigo-900/10 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Análise Inteligente
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {mode === 'create' ? 'Análise gerada com sucesso' : 'Classificação e perfil corporal por IA'}
                  </CardDescription>
                </div>
              </div>
              {mode === 'create' && (
                <Badge className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 rounded-2xl font-bold shadow-lg dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Análise Completa
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border-0 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
                    {analysis?.classification || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Classificação Corporal</div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border-0 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                    {analysis?.somatotype || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Somatótipo</div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border-0 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                    {analysis?.healthStatus || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Status de Saúde</div>
                </div>
              </div>
            </div>
            
            {/* Perfil Metabólico */}
            {analysis?.metabolicProfile && (
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-indigo-800 dark:text-indigo-300 text-lg">Perfil Metabólico</div>
                    <div className="text-indigo-700 dark:text-indigo-400 text-base">{analysis.metabolicProfile}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada - Pontos Fortes, Melhorias e Riscos */}
      {analysis?.analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pontos Fortes */}
          {analysis.analysis.strengths && analysis.analysis.strengths.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                
                <CardHeader className="relative p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-green-800 dark:text-green-300">Pontos Fortes</CardTitle>
                      <CardDescription className="text-green-600 dark:text-green-400">
                        Aspectos positivos identificados
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0">
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
            </div>
          )}

          {/* Áreas de Melhoria */}
          {analysis.analysis.improvements && analysis.analysis.improvements.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                
                <CardHeader className="relative p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-300">Áreas de Melhoria</CardTitle>
                      <CardDescription className="text-orange-600 dark:text-orange-400">
                        Oportunidades de desenvolvimento
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0">
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
            </div>
          )}

          {/* Fatores de Risco */}
          {analysis.analysis.risks && analysis.analysis.risks.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                
                <CardHeader className="relative p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-red-800 dark:text-red-300">Fatores de Risco</CardTitle>
                      <CardDescription className="text-red-600 dark:text-red-400">
                        Aspectos que requerem atenção
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0">
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
            </div>
          )}
        </div>
      )}

      {/* Recomendações */}
      {recommendations && Object.keys(recommendations).length > 0 && (
        <div className="space-y-6">
          {/* Recomendações de Treino */}
          {recommendations.training && Object.keys(recommendations.training).length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-blue-50/50 via-cyan-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-blue-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                        <Activity className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Recomendações de Treinamento</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Estratégias personalizadas de exercícios
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(recommendations.training).map(([key, value]) => (
                      <div key={key} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-200/30 dark:border-blue-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                          <div className="font-bold text-blue-700 dark:text-blue-300 capitalize mb-3 text-lg">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </div>
                          <div className="text-gray-900 dark:text-white leading-relaxed">{formatValue(value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recomendações Nutricionais */}
          {recommendations.nutrition && Object.keys(recommendations.nutrition).length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-green-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Recomendações Nutricionais</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Estratégias alimentares personalizadas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(recommendations.nutrition).map(([key, value]) => (
                      <div key={key} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-200/30 dark:border-green-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                          <div className="font-bold text-green-700 dark:text-green-300 capitalize mb-3 text-lg">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </div>
                          <div className="text-gray-900 dark:text-white leading-relaxed">{formatValue(value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recomendações de Estilo de Vida */}
          {recommendations.lifestyle && Object.keys(recommendations.lifestyle).length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-purple-50/50 via-indigo-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Recomendações de Estilo de Vida</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Hábitos para otimizar resultados
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(recommendations.lifestyle).map(([key, value]) => (
                      <div key={key} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-200/30 dark:border-purple-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                          <div className="font-bold text-purple-700 dark:text-purple-300 capitalize mb-3 text-lg">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </div>
                          <div className="text-gray-900 dark:text-white leading-relaxed">{formatValue(value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Plano de Acompanhamento */}
      {analysis?.progressTracking && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-500/10 to-indigo-600/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardHeader className="p-8 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Plano de Acompanhamento</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Estratégia para monitoramento de progresso
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysis.progressTracking.nextAssessment && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Próxima Avaliação</div>
                      </div>
                      <div className="text-gray-900 dark:text-white font-semibold">{analysis.progressTracking.nextAssessment}</div>
                    </div>
                  </div>
                )}
                {analysis.progressTracking.expectedTimeline && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Timeline Esperada</div>
                      </div>
                      <div className="text-gray-900 dark:text-white font-semibold">{analysis.progressTracking.expectedTimeline}</div>
                    </div>
                  </div>
                )}
                {analysis.progressTracking.keyMetrics && analysis.progressTracking.keyMetrics.length > 0 && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Métricas Chave</div>
                      </div>
                      <div className="text-gray-900 dark:text-white font-semibold">
                        {analysis.progressTracking.keyMetrics.join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Observações Específicas */}
      {analysis?.specificNotes && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-slate-500/10 to-gray-600/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardHeader className="p-8 bg-gradient-to-r from-gray-50/50 via-slate-50/50 to-gray-50/50 dark:from-gray-800/10 dark:via-slate-800/10 dark:to-gray-800/10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-gray-500 to-slate-500 rounded-2xl shadow-lg">
                    <Info className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Lightbulb className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Observações Específicas</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Considerações técnicas e metodológicas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {analysis.specificNotes}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações do Modo Criação */}
      {mode === 'create' && (onBack || onSave) && (
        <div className="flex justify-between pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
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
              className="px-10 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0 ml-auto"
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

export default AssessmentAIAnalysis;