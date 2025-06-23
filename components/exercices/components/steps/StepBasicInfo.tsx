// components/exercises/steps/StepBasicInfo.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Brain, Loader2, Info, Dumbbell, Settings, Sparkles } from 'lucide-react';

const MUSCLE_GROUPS = [
  "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Corpo Inteiro", "Cardio"
];

const EQUIPMENT_TYPES = [
  "Peso Livre", "Máquina", "Cabo", "Peso Corporal", 
  "Elástico", "Kettlebell", "TRX", "Outros"
];

interface StepBasicInfoProps {
  formData: {
    name: string;
    description: string;
    muscle_group: string[];
    equipment: string[];
  };
  onUpdateField: (field: string, value: any) => void;
  isLoading?: boolean;
}

export function StepBasicInfo({ formData, onUpdateField, isLoading }: StepBasicInfoProps) {
  const { toast } = useToast();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateWithAI = async () => {
    if (!formData.name || formData.name.trim() === "") {
      toast({
        variant: "destructive",
        title: "Nome do exercício necessário",
        description: "Por favor, informe o nome do exercício para gerar sugestões",
      });
      return;
    }

    try {
      setIsGeneratingAI(true);
      const response = await fetch('/api/ai/exercise-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exerciseName: formData.name }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update form with AI suggestions
      onUpdateField('description', data.description);
      onUpdateField('muscle_group', data.muscle_group);
      onUpdateField('equipment', data.equipment);

      toast({
        title: "Sugestões geradas com sucesso! 🎉",
        description: "Os campos foram preenchidos com sugestões da IA",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar sugestões",
        description: error.message,
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão IA */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 achievement-exercise rounded-2xl shadow-app-large">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-app-heading">
              Informações Básicas
            </h2>
            <p className="text-app-text-secondary">
              Defina o nome, descrição e categorias do exercício
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={generateWithAI} 
          disabled={isGeneratingAI || !formData.name}
          className="group bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-600 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 rounded-xl h-12 px-6 font-semibold transition-all duration-300 transform hover:scale-105"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
              <span className="text-purple-800 dark:text-purple-300">Gerando...</span>
            </>
          ) : (
            <>
              <Brain className="mr-3 h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
              <span className="text-purple-800 dark:text-purple-300">Gerar com IA</span>
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Dica: Use a IA para acelerar o processo!</p>
            <p>Digite apenas o nome do exercício e deixe a IA preencher automaticamente a descrição, grupos musculares e equipamentos necessários.</p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Nome */}
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-bold text-app-text-primary uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-app-text-accent" />
            Nome do Exercício <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              placeholder="ex.: Supino Reto com Barra"
              className="relative h-12 sm:h-14 text-base sm:text-lg bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-bold text-app-text-primary uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-app-text-accent" />
            Descrição *
          </Label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-btn-primary/20 to-app-text-accent/20 rounded-xl blur opacity-50"></div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onUpdateField('description', e.target.value)}
              placeholder="Descreva o exercício em detalhes, incluindo posição inicial, execução e respiração..."
              className="relative min-h-[120px] sm:min-h-[140px] text-base bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300 resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Equipamentos */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-app-text-primary uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-4 w-4 text-app-text-accent" />
            Equipamentos * 
            {formData.equipment.length > 0 && (
              <Badge className="ml-2 px-2 py-0.5 bg-app-text-accent/10 text-app-text-accent border border-app-border-accent rounded-full text-xs">
                {formData.equipment.length} selecionado{formData.equipment.length > 1 ? 's' : ''}
              </Badge>
            )}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EQUIPMENT_TYPES.map((type) => (
              <div key={type} className="relative group/checkbox">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 to-app-btn-primary/10 rounded-xl blur opacity-0 group-hover/checkbox:opacity-100 transition-opacity duration-300"></div>
                <label className={`relative flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                  formData.equipment.includes(type)
                    ? 'bg-gradient-to-r from-app-text-accent/10 to-app-btn-primary/10 border-app-border-accent shadow-app-large'
                    : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.equipment.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateField('equipment', [...formData.equipment, type]);
                      } else {
                        onUpdateField('equipment', formData.equipment.filter(eq => eq !== type));
                      }
                    }}
                    className="w-4 h-4 text-app-text-accent bg-app-bg-secondary border-app-border-default rounded focus:ring-app-text-accent focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className={`text-sm font-medium ${
                    formData.equipment.includes(type)
                      ? 'text-app-text-accent'
                      : 'text-app-text-primary'
                  }`}>{type}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Grupos Musculares */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-app-text-primary uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-app-text-accent" />
            Grupos musculares * 
            {formData.muscle_group.length > 0 && (
              <Badge className="ml-2 px-2 py-0.5 bg-app-text-accent/10 text-app-text-accent border border-app-border-accent rounded-full text-xs">
                {formData.muscle_group.length} selecionado{formData.muscle_group.length > 1 ? 's' : ''}
              </Badge>
            )}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MUSCLE_GROUPS.map((type) => (
              <div key={type} className="relative group/checkbox">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 to-app-btn-primary/10 rounded-xl blur opacity-0 group-hover/checkbox:opacity-100 transition-opacity duration-300"></div>
                <label className={`relative flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                  formData.muscle_group.includes(type)
                    ? 'bg-gradient-to-r from-app-text-accent/10 to-app-btn-primary/10 border-app-border-accent shadow-app-large'
                    : 'bg-app-card border-app-border-muted hover:border-app-border-accent hover:shadow-app-medium'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.muscle_group.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateField('muscle_group', [...formData.muscle_group, type]);
                      } else {
                        onUpdateField('muscle_group', formData.muscle_group.filter(eq => eq !== type));
                      }
                    }}
                    className="w-4 h-4 text-app-text-accent bg-app-bg-secondary border-app-border-default rounded focus:ring-app-text-accent focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className={`text-sm font-medium ${
                    formData.muscle_group.includes(type)
                      ? 'text-app-text-accent'
                      : 'text-app-text-primary'
                  }`}>{type}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}