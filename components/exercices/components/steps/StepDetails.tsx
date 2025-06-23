// components/exercises/steps/StepDetails.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Target, AlertTriangle, Lightbulb, RefreshCw, Info, Brain, Loader2, CheckCircle } from 'lucide-react';

interface StepDetailsProps {
  formData: {
    name: string;
    description: string;
    muscle_group: string[];
    equipment: string[];
    variations: string;
    tips: string;
    common_errors: string;
  };
  onUpdateField: (field: string, value: any) => void;
}

export function StepDetails({ formData, onUpdateField }: StepDetailsProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedDetails, setHasGeneratedDetails] = useState(false);

  // Auto-gerar detalhes se há informações básicas mas não há detalhes
  useEffect(() => {
    const hasBasicInfo = formData.name && formData.description && formData.muscle_group?.length > 0;
    const hasNoDetails = !formData.variations && !formData.tips && !formData.common_errors;
    
    if (hasBasicInfo && hasNoDetails && !hasGeneratedDetails) {
      handleGenerateDetails();
    }
  }, [formData.name, formData.description, formData.muscle_group]);

  const handleGenerateDetails = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "É necessário ter um nome do exercício para gerar os detalhes",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch('/api/ai/exercise-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseName: formData.name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar detalhes');
      }

      // Preencher os campos de detalhes
      if (data.variations && data.variations.length > 0) {
        onUpdateField('variations', data.variations.join('\n'));
      }

      if (data.tips && data.tips.length > 0) {
        onUpdateField('tips', data.tips.join('\n'));
      }

      if (data.common_errors && data.common_errors.length > 0) {
        onUpdateField('common_errors', data.common_errors.join('\n'));
      }

      setHasGeneratedDetails(true);

      toast({
        title: "Detalhes gerados com sucesso! ✨",
        description: "Variações, dicas e erros comuns foram preenchidos automaticamente",
      });

    } catch (error: any) {
      console.error('Erro ao gerar detalhes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar detalhes",
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 achievement-exercise rounded-2xl shadow-app-large">
          <Target className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-app-heading">
            Detalhes Avançados
          </h2>
          <p className="text-app-text-secondary">
            Adicione informações complementares para enriquecer o exercício
          </p>
        </div>
      </div>

      {/* Botão para gerar detalhes */}
      {formData.name && (!formData.variations || !formData.tips || !formData.common_errors) && (
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Gerar Detalhes com IA
              </h3>
            </div>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              Nossa IA pode preencher automaticamente as variações, dicas e erros comuns baseados no exercício
            </p>
            <Button
              onClick={handleGenerateDetails}
              disabled={isGenerating}
              className="h-12 px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white font-bold rounded-xl shadow-app-large hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Gerando detalhes...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-3" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-800 dark:text-purple-300">
            <p className="font-semibold mb-1">Detalhes fazem a diferença!</p>
            <p>Quanto mais informações você fornecer, melhor será a execução do exercício pelos alunos. Todos os campos são opcionais.</p>
          </div>
        </div>
      </div>

      {/* Variations Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-app-card backdrop-blur-xl shadow-app-xl hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 achievement-exercise rounded-xl shadow-app-medium">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-text-primary">
                  Variações do Exercício
                </CardTitle>
                <CardDescription className="text-app-text-secondary">
                  Diferentes formas de executar o exercício
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-3">
              <Label htmlFor="variations" className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                Liste as variações (uma por linha)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
                <Textarea
                  id="variations"
                  value={formData.variations}
                  onChange={(e) => onUpdateField('variations', e.target.value)}
                  placeholder="Ex:
Rosca Alternada Sentado com Halteres:
Flexiona os dois braços de forma alternada, mantendo controle do movimento.

Rosca Scott (ou Rosca no Banco Scott):
Exercício de isolamento com apoio dos braços, proporcionando maior estabilidade."
                  className="relative min-h-[120px] sm:min-h-[140px] text-base bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300 resize-none"
                />
              </div>
              {formData.variations && (
                <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {formData.variations.split('\n').filter(v => v.trim()).length} variações adicionadas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-app-card backdrop-blur-xl shadow-app-xl hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 achievement-workout rounded-xl shadow-app-medium">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-text-primary">
                  Dicas de Execução
                </CardTitle>
                <CardDescription className="text-app-text-secondary">
                  Conselhos para melhor aproveitamento
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-3">
              <Label htmlFor="tips" className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                Dicas importantes (uma por linha)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
                <Textarea
                  id="tips"
                  value={formData.tips}
                  onChange={(e) => onUpdateField('tips', e.target.value)}
                  placeholder="Ex:
✔️ Posição inicial:
🟡 Sente-se em um banco com os pés firmes no chão, afastados na largura do quadril.
🟡 Segure um halter com uma das mãos.

✔️ Execução:
🟡 Com o braço estendido, flexione o cotovelo para levantar o halter.
🟡 Concentre-se na contração do bíceps no topo do movimento.

✔️ Respiração:
🟡 Expire ao subir o halter (fase concêntrica).
🟡 Inspire ao descer o halter (fase excêntrica)."
                  className="relative min-h-[120px] sm:min-h-[140px] text-base bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300 resize-none"
                />
              </div>
              {formData.tips && (
                <div className="mt-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {formData.tips.split('\n').filter(t => t.trim()).length} dicas adicionadas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Errors Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-app-card backdrop-blur-xl shadow-app-xl hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 achievement-weight rounded-xl shadow-app-medium">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-text-primary">
                  Erros Comuns
                </CardTitle>
                <CardDescription className="text-app-text-secondary">
                  Erros frequentes a serem evitados
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-3">
              <Label htmlFor="common_errors" className="text-sm font-bold text-app-text-primary uppercase tracking-wider">
                Erros a evitar (um por linha)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
                <Textarea
                  id="common_errors"
                  value={formData.common_errors}
                  onChange={(e) => onUpdateField('common_errors', e.target.value)}
                  placeholder="Ex:
❌ Movimentar o tronco para ajudar na subida (usar impulso).
❌ Não apoiar o braço corretamente na coxa, perdendo isolamento do bíceps.
❌ Flexionar o punho durante o movimento, o que pode causar desconforto.
❌ Usar cargas excessivas que prejudiquem a execução controlada.
❌ Realizar o movimento muito rápido, diminuindo a eficiência da contração muscular."
                  className="relative min-h-[120px] sm:min-h-[140px] text-base bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300 resize-none"
                />
              </div>
              {formData.common_errors && (
                <div className="mt-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {formData.common_errors.split('\n').filter(e => e.trim()).length} erros comuns adicionados
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}