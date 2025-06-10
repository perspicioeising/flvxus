'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";

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
    training?: Record<string, React.ReactNode>;
    nutrition?: Record<string, React.ReactNode>;
    lifestyle?: Record<string, string>;
  };
  progressTracking?: {
    nextAssessment?: string;
    keyMetrics?: string[];
    expectedTimeline?: string;
  };
  specificNotes?: string;
}

interface AssessmentAIAnalysisProps {
  aiAnalysis?: AIAnalysis | null; // MUDANÇA: Permitir undefined/null
  aiRecommendations?: {
    training?: Record<string, string>;
    nutrition?: Record<string, string>;
    lifestyle?: Record<string, string>;
  } | null; // MUDANÇA: Permitir undefined/null
  className?: string;
}

// Função auxiliar para garantir que o valor seja uma string
const formatString = (value: unknown): string => {
  return typeof value === 'string' ? value : String(value || '');
};

const AssessmentAIAnalysis: React.FC<AssessmentAIAnalysisProps> = ({
  aiAnalysis,
  aiRecommendations,
  className = ""
}) => {
  // DEBUG: Logs para identificar o problema
  console.log('=== DEBUG AI ANALYSIS COMPONENT ===');
  console.log('aiAnalysis received:', aiAnalysis);
  console.log('aiRecommendations received:', aiRecommendations);
  console.log('aiAnalysis type:', typeof aiAnalysis);

  // Normalizar dados - tratar strings JSON se necessário
  let normalizedAnalysis: AIAnalysis | null = null;
  let normalizedRecommendations: Record<string, any> = {};

  try {
    // Se aiAnalysis é uma string, tentar fazer parse
    if (typeof aiAnalysis === 'string') {
      normalizedAnalysis = JSON.parse(aiAnalysis);
    } else if (aiAnalysis && typeof aiAnalysis === 'object') {
      normalizedAnalysis = aiAnalysis;
    }

    // Se aiRecommendations é uma string, tentar fazer parse
    if (typeof aiRecommendations === 'string') {
      normalizedRecommendations = JSON.parse(aiRecommendations);
    } else if (aiRecommendations && typeof aiRecommendations === 'object') {
      normalizedRecommendations = aiRecommendations;
    }

    // Fallback: pegar recomendações de dentro da análise se não estiverem separadas
    if (!normalizedRecommendations || Object.keys(normalizedRecommendations).length === 0) {
      normalizedRecommendations = normalizedAnalysis?.recommendations || {};
    }
  } catch (error) {
    console.error('Erro ao fazer parse dos dados de IA:', error);
  }

  console.log('normalizedAnalysis:', normalizedAnalysis);
  console.log('normalizedRecommendations:', normalizedRecommendations);

  // Verificar se há pelo menos alguns dados básicos
  const hasBasicData = normalizedAnalysis?.classification || 
                      normalizedAnalysis?.somatotype || 
                      normalizedAnalysis?.healthStatus ||
                      Object.keys(normalizedRecommendations).length > 0;

  console.log('hasBasicData:', hasBasicData);

  // Se não há análise IA, mostrar estado vazio
  if (!hasBasicData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="text-center py-24">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              Análise IA não disponível
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Esta avaliação não possui análise de inteligência artificial
            </p>
            <Badge className="bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
              Análise manual realizada
            </Badge>
            
            {/* DEBUG INFO - REMOVER EM PRODUÇÃO */}
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                🔍 Debug Info (clique para ver)
              </summary>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                <pre className="overflow-auto max-h-40">
                  {JSON.stringify({ 
                    aiAnalysis, 
                    aiRecommendations, 
                    normalizedAnalysis, 
                    normalizedRecommendations,
                    hasBasicData 
                  }, null, 2)}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Classificação Principal */}
      <Card className="border-0 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Análise Inteligente</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Classificação e perfil corporal por IA
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
                {normalizedAnalysis?.classification || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Classificação Corporal</div>
            </div>
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                {normalizedAnalysis?.somatotype || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Somatótipo</div>
            </div>
            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                {normalizedAnalysis?.healthStatus || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Status de Saúde</div>
            </div>
          </div>
          
          {/* Perfil Metabólico se disponível */}
          {normalizedAnalysis?.metabolicProfile && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="font-semibold text-indigo-800 dark:text-indigo-300">Perfil Metabólico</div>
                  <div className="text-indigo-700 dark:text-indigo-400">{normalizedAnalysis.metabolicProfile}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Detalhada - Pontos Fortes, Melhorias e Riscos */}
      {normalizedAnalysis?.analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pontos Fortes */}
          {normalizedAnalysis.analysis.strengths && normalizedAnalysis.analysis.strengths.length > 0 && (
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
                  {normalizedAnalysis.analysis.strengths.map((strength: string, index: number) => (
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
          {normalizedAnalysis.analysis.improvements && normalizedAnalysis.analysis.improvements.length > 0 && (
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
                  {normalizedAnalysis.analysis.improvements.map((improvement: string, index: number) => (
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
          {normalizedAnalysis.analysis.risks && normalizedAnalysis.analysis.risks.length > 0 && (
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
                  {normalizedAnalysis.analysis.risks.map((risk: string, index: number) => (
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
      {(normalizedRecommendations && Object.keys(normalizedRecommendations).length > 0) && (
        <div className="space-y-6">
          {/* Recomendações de Treino */}
          {normalizedRecommendations.training && Object.keys(normalizedRecommendations.training).length > 0 && (
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
                  {Object.entries(normalizedRecommendations.training).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                      <div className="font-semibold text-blue-700 dark:text-blue-300 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-900 dark:text-white text-sm leading-relaxed">{formatString(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendações Nutricionais */}
          {normalizedRecommendations.nutrition && Object.keys(normalizedRecommendations.nutrition).length > 0 && (
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
                  {Object.entries(normalizedRecommendations.nutrition).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-green-200/30 dark:border-green-700/30">
                      <div className="font-semibold text-green-700 dark:text-green-300 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-900 dark:text-white text-sm leading-relaxed">{formatString(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendações de Estilo de Vida */}
          {normalizedRecommendations.lifestyle && Object.keys(normalizedRecommendations.lifestyle).length > 0 && (
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
                  {Object.entries(normalizedRecommendations.lifestyle).map(([key, value]) => (
                    <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
                      <div className="font-semibold text-purple-700 dark:text-purple-300 capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-900 dark:text-white text-sm leading-relaxed">{formatString(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plano de Acompanhamento */}
      {normalizedAnalysis?.progressTracking && (
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
              {normalizedAnalysis.progressTracking.nextAssessment && (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">Próxima Avaliação</div>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm">{normalizedAnalysis.progressTracking.nextAssessment}</div>
                </div>
              )}
              {normalizedAnalysis.progressTracking.expectedTimeline && (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">Timeline Esperada</div>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm">{normalizedAnalysis.progressTracking.expectedTimeline}</div>
                </div>
              )}
              {normalizedAnalysis.progressTracking.keyMetrics && normalizedAnalysis.progressTracking.keyMetrics.length > 0 && (
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300">Métricas Chave</div>
                  </div>
                  <div className="text-gray-900 dark:text-white text-sm">
                    {normalizedAnalysis.progressTracking.keyMetrics.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações Específicas */}
      {normalizedAnalysis?.specificNotes && (
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
                {normalizedAnalysis.specificNotes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentAIAnalysis;