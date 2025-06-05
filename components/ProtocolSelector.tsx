'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Users, Calendar, Target, Info, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtocolInfo {
  name: string;
  description: string;
  ageRange: string;
  gender: string[];
  accuracy: string;
  requiredMeasurements: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
}

interface ProtocolSelectorProps {
  selectedProtocol: string;
  onProtocolChange: (protocol: string) => void;
  studentAge?: number;
  studentGender?: string;
}

const PROTOCOLS: Record<string, ProtocolInfo> = {
  "Jackson & Pollock (3 dobras)": {
    name: "Jackson & Pollock (3 dobras)",
    description: "Protocolo clássico e amplamente validado para estimativa de gordura corporal",
    ageRange: "18-61 anos",
    gender: ["male", "female"],
    accuracy: "±3.5%",
    requiredMeasurements: ["Tríceps", "Suprailíaca", "Coxa (♀) / Peitoral (♂)"],
    pros: ["Altamente validado", "Fácil aplicação", "Boa precisão"],
    cons: ["Menos preciso em idosos", "Requer experiência"],
    bestFor: ["Adultos jovens", "População geral", "Acompanhamento longitudinal"]
  },
  "Jackson & Pollock (7 dobras)": {
    name: "Jackson & Pollock (7 dobras)",
    description: "Versão mais precisa com 7 pontos de medição para maior acurácia",
    ageRange: "18-61 anos", 
    gender: ["male", "female"],
    accuracy: "±2.8%",
    requiredMeasurements: ["Tríceps", "Subescapular", "Peitoral", "Axilar média", "Suprailíaca", "Abdominal", "Coxa"],
    pros: ["Maior precisão", "Melhor para atletas", "Padrão ouro"],
    cons: ["Mais demorado", "Requer mais experiência", "Maior variabilidade inter-avaliador"],
    bestFor: ["Atletas", "Avaliações precisas", "Pesquisa científica"]
  },
  "Durnin & Womersley": {
    name: "Durnin & Womersley",
    description: "Protocolo britânico com 4 dobras, adequado para diferentes idades",
    ageRange: "16-68 anos",
    gender: ["male", "female"],
    accuracy: "±3.8%",
    requiredMeasurements: ["Tríceps", "Bíceps", "Subescapular", "Suprailíaca"],
    pros: ["Boa para ampla faixa etária", "Validado internacionalmente", "Relativamente simples"],
    cons: ["Menos usado no Brasil", "Equações específicas por idade"],
    bestFor: ["Diferentes idades", "População européia", "Estudos populacionais"]
  },
  "Guedes (1994)": {
    name: "Guedes (1994)",
    description: "Protocolo desenvolvido para população brasileira jovem",
    ageRange: "18-30 anos",
    gender: ["male", "female"],
    accuracy: "±3.2%",
    requiredMeasurements: ["Tríceps", "Suprailíaca", "Abdominal"],
    pros: ["Validado para brasileiros", "Específico para jovens", "Boa precisão"],
    cons: ["Limitado à faixa etária", "Menor validação internacional"],
    bestFor: ["Jovens brasileiros", "Universitários", "População local"]
  },
  "ACSM": {
    name: "ACSM",
    description: "Diretrizes do American College of Sports Medicine",
    ageRange: "18-65 anos",
    gender: ["male", "female"],
    accuracy: "±3.5%",
    requiredMeasurements: ["Baseado em Jackson & Pollock"],
    pros: ["Padrão internacional", "Amplamente aceito", "Bem documentado"],
    cons: ["Baseado em outras fórmulas", "Menos específico"],
    bestFor: ["Padrão internacional", "Certificações", "Guidelines clínicas"]
  },
  "PROESP-BR": {
    name: "PROESP-BR",
    description: "Projeto específico para jovens brasileiros em idade escolar",
    ageRange: "7-17 anos",
    gender: ["male", "female"],
    accuracy: "±4.0%",
    requiredMeasurements: ["Tríceps", "Subescapular"],
    pros: ["Específico para crianças/adolescentes", "Validado no Brasil", "Simples aplicação"],
    cons: ["Apenas para jovens", "Limitado a 2 dobras"],
    bestFor: ["Crianças", "Adolescentes", "Escolas", "Projetos esportivos"]
  }
};

export default function ProtocolSelector({ 
  selectedProtocol, 
  onProtocolChange, 
  studentAge, 
  studentGender 
}: ProtocolSelectorProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (studentAge && studentGender) {
      generateRecommendations();
    }
  }, [studentAge, studentGender]);

  const generateRecommendations = () => {
    const recs: string[] = [];
    
    Object.entries(PROTOCOLS).forEach(([key, protocol]) => {
      const ageRange = protocol.ageRange.split('-').map(a => parseInt(a.replace(/\D/g, '')));
      const minAge = ageRange[0];
      const maxAge = ageRange[1] || 100;
      
      if (studentAge && studentAge >= minAge && studentAge <= maxAge) {
        if (protocol.gender.includes(studentGender || '')) {
          recs.push(key);
        }
      }
    });
    
    setRecommendations(recs);
  };

  const getProtocolRecommendationScore = (protocolKey: string): number => {
    const protocol = PROTOCOLS[protocolKey];
    let score = 0;
    
    // Pontuação baseada na idade
    if (studentAge) {
      const ageRange = protocol.ageRange.split('-').map(a => parseInt(a.replace(/\D/g, '')));
      const minAge = ageRange[0];
      const maxAge = ageRange[1] || 100;
      
      if (studentAge >= minAge && studentAge <= maxAge) {
        score += 30;
        
        // Bonificação se estiver no meio da faixa etária
        const midAge = (minAge + maxAge) / 2;
        const distanceFromMid = Math.abs(studentAge - midAge);
        const rangeSize = maxAge - minAge;
        const proximityBonus = (1 - (distanceFromMid / (rangeSize / 2))) * 10;
        score += proximityBonus;
      }
    }
    
    // Pontuação baseada na precisão
    const accuracy = parseFloat(protocol.accuracy.replace(/[^\d.]/g, ''));
    score += (5 - accuracy) * 5; // Menor erro = maior pontuação
    
    // Bonificação para protocolos específicos
    if (protocolKey.includes('Guedes') || protocolKey.includes('PROESP-BR')) {
      score += 15; // Bonificação para protocolos brasileiros
    }
    
    return score;
  };

  const sortedProtocols = Object.entries(PROTOCOLS).sort((a, b) => {
    const scoreA = getProtocolRecommendationScore(a[0]);
    const scoreB = getProtocolRecommendationScore(b[0]);
    return scoreB - scoreA;
  });

  const getRecommendationLevel = (protocolKey: string): 'high' | 'medium' | 'low' => {
    const score = getProtocolRecommendationScore(protocolKey);
    if (score >= 40) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  };

  return (
    <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Seleção Inteligente de Protocolo
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              IA sugere o melhor protocolo baseado no perfil do aluno
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seletor de Protocolo */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Protocolo de Avaliação</Label>
          <Select value={selectedProtocol} onValueChange={onProtocolChange}>
            <SelectTrigger className="h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
              <SelectValue placeholder="Selecione o protocolo mais adequado" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl max-h-[400px]">
              {sortedProtocols.map(([key, protocol]) => {
                const level = getRecommendationLevel(key);
                const isRecommended = recommendations.includes(key);
                
                return (
                  <SelectItem key={key} value={key} className="py-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {isRecommended && level === 'high' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <div className="font-semibold">{protocol.name}</div>
                          <div className="text-sm text-gray-500">
                            {protocol.ageRange} • Precisão: {protocol.accuracy}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {isRecommended && (
                          <Badge className={`text-xs px-2 py-1 ${
                            level === 'high' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' 
                              : level === 'medium'
                              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
                          }`}>
                            {level === 'high' ? 'Recomendado' : level === 'medium' ? 'Adequado' : 'Possível'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Informações do Protocolo Selecionado */}
        {selectedProtocol && PROTOCOLS[selectedProtocol] && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {PROTOCOLS[selectedProtocol].name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {PROTOCOLS[selectedProtocol].description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Faixa Etária:</span>
                      <span className="text-sm">{PROTOCOLS[selectedProtocol].ageRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Gênero:</span>
                      <span className="text-sm">
                        {PROTOCOLS[selectedProtocol].gender.includes('male') && PROTOCOLS[selectedProtocol].gender.includes('female') 
                          ? 'Ambos' 
                          : PROTOCOLS[selectedProtocol].gender.includes('male') ? 'Masculino' : 'Feminino'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Precisão:</span>
                      <span className="text-sm">{PROTOCOLS[selectedProtocol].accuracy}</span>
                    </div>
                  </div>

                  {/* Medições Necessárias */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Medições Necessárias:</h5>
                    <div className="flex flex-wrap gap-2">
                      {PROTOCOLS[selectedProtocol].requiredMeasurements.map((measurement, index) => (
                        <Badge key={index} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                          {measurement}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Vantagens e Desvantagens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">Vantagens:</h5>
                      <ul className="text-sm space-y-1">
                        {PROTOCOLS[selectedProtocol].pros.map((pro, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-orange-700 dark:text-orange-400 mb-2">Considerações:</h5>
                      <ul className="text-sm space-y-1">
                        {PROTOCOLS[selectedProtocol].cons.map((con, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recomendação IA */}
            {studentAge && studentGender && (
              <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <strong>Recomendação IA:</strong> {getRecommendationLevel(selectedProtocol) === 'high' 
                    ? 'Este protocolo é altamente recomendado para o perfil do aluno!' 
                    : getRecommendationLevel(selectedProtocol) === 'medium'
                    ? 'Este protocolo é adequado para o perfil do aluno.'
                    : 'Considere um protocolo mais específico para melhor precisão.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}