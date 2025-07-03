'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, ArrowLeft, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2, Zap, Sparkles, Save, X, Info, Flame, Scale, Activity, Crown } from "lucide-react";

const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Treinos Completados", icon: Dumbbell, color: "from-app-achievement-workout to-app-btn-primary", description: "Baseado no número de treinos finalizados" },
  { value: "consecutive_days", label: "Dias Consecutivos", icon: Calendar, color: "from-app-achievement-workout to-app-btn-secondary", description: "Dias seguidos de atividade" },
  { value: "total_weight", label: "Peso Total Levantado", icon: BarChart, color: "from-app-achievement-workout to-app-text-accent", description: "Soma total de peso em kg" },
  { value: "exercises_completed", label: "Exercícios Completados", icon: Target, color: "from-app-achievement-workout to-app-btn-accent", description: "Quantidade de exercícios realizados" },
];

export default function NewAchievementPage() {
  const router = useRouter()
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCriteria, setSelectedCriteria] = useState<typeof CRITERIA_TYPES[0] | null>(null)
  const [newAchievement, setNewAchievement] = useState({
    name: "",
    description: "",
    criteria_type: "",
    criteria_value: "",
    points_reward: "",
    icon: "trophy"
  })

  const handleAddAchievement = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAchievement),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Conquista criada com sucesso! 🎉",
        description: "Nova conquista adicionada para seus alunos",
      });
      router.push('/dashboard/achievements'); 

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conquista",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriteriaChange = (value: string) => {
    const criteria = CRITERIA_TYPES.find(t => t.value === value) || null;
    setSelectedCriteria(criteria);
    setNewAchievement(prev => ({ ...prev, criteria_type: value }));
  };

  const isFormValid = () => {
    return newAchievement.name && 
           newAchievement.description && 
           newAchievement.criteria_type && 
           newAchievement.criteria_value && 
           newAchievement.points_reward;
  };

  return (
    <div className="min-h-screen bg-app-bg-primary">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 bg-app-card border-app-border-muted rounded-xl shadow-app-medium transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-app-heading">
              Criar Nova Conquista
            </h1>
            <p className="text-app-text-secondary text-sm">
              Defina objetivos e recompense o progresso dos seus alunos
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Detalhes da Conquista
                  </CardTitle>
                  <CardDescription className="text-app-text-secondary text-sm">
                    Preencha as informações para criar uma nova conquista motivadora
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2 text-app-text-primary">
                  <Award className="h-4 w-4 text-app-achievement-workout" />
                  Nome da Conquista
                </Label>
                <Input
                  placeholder="ex: Guerreiro dos Treinos"
                  value={newAchievement.name}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10 bg-app-card border-app-border-muted rounded-xl shadow-app-medium transition-all duration-300"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2 text-app-text-primary">
                  <Info className="h-4 w-4 text-app-achievement-workout" />
                  Descrição
                </Label>
                <Textarea
                  placeholder="Descreva como ganhar esta conquista e motive seus alunos..."
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] bg-app-card border-app-border-muted rounded-xl shadow-app-medium transition-all duration-300 resize-none"
                />
              </div>

              {/* Criteria Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-app-text-primary">
                  <Target className="h-4 w-4 text-app-achievement-workout" />
                  Tipo de Critério
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CRITERIA_TYPES.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleCriteriaChange(type.value)}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        selectedCriteria?.value === type.value ? 'scale-[0.98]' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${type.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
                        selectedCriteria?.value === type.value
                          ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-app-large`
                          : 'bg-app-card border-app-border-muted hover:border-app-border-accent'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCriteria?.value === type.value
                              ? 'bg-white/20'
                              : `bg-gradient-to-r ${type.color} shadow-app-medium`
                          }`}>
                            <type.icon className={`h-4 w-4 ${
                              selectedCriteria?.value === type.value ? 'text-white' : 'text-white'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${
                              selectedCriteria?.value === type.value ? 'text-white' : 'text-app-heading'
                            }`}>
                              {type.label}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              selectedCriteria?.value === type.value ? 'text-white/80' : 'text-app-text-secondary'
                            }`}>
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value and Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-app-text-primary">
                    <BarChart className="h-4 w-4 text-app-achievement-workout" />
                    Valor Alvo
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="ex: 10"
                      value={newAchievement.criteria_value}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, criteria_value: e.target.value }))}
                      className="h-10 bg-app-card border-app-border-muted rounded-xl shadow-app-medium transition-all duration-300 pr-16"
                    />
                    {selectedCriteria && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Badge className={`px-2 py-1 bg-gradient-to-r ${selectedCriteria.color} text-white rounded-full text-xs font-bold border-0`}>
                          {selectedCriteria.label.split(' ')[0]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-app-text-primary">
                    <Flame className="h-4 w-4 text-app-achievement-workout" />
                    Pontos de Recompensa
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="ex: 100"
                      value={newAchievement.points_reward}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, points_reward: e.target.value }))}
                      className="h-10 bg-app-card border-app-border-muted rounded-xl shadow-app-medium transition-all duration-300 pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-xs font-bold">
                        XP
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              {newAchievement.name && selectedCriteria && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl blur-lg"></div>
                  <div className="relative p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-app-achievement-workout rounded-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-app-heading mb-1">Preview da Conquista</h4>
                        <p className="text-xs text-app-text-secondary">Como ficará para os alunos</p>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${selectedCriteria.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                      <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-xl shadow-app-large overflow-hidden">
                        <CardContent className="p-4">
                          <div className="text-center mb-3">
                            <div className="relative mb-3">
                              <div className={`p-2 bg-gradient-to-br ${selectedCriteria.color} rounded-lg shadow-app-medium inline-flex`}>
                                <selectedCriteria.icon className="h-5 w-5 text-white" />
                                <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm"></div>
                              </div>
                            </div>
                            <h3 className="text-base font-bold text-app-heading mb-1">
                              {newAchievement.name}
                            </h3>
                            <p className="text-xs text-app-text-secondary leading-relaxed line-clamp-2">
                              {newAchievement.description || "Descrição da conquista..."}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-app-border-muted">
                            <Badge className={`px-2 py-1 bg-gradient-to-r ${selectedCriteria.color} text-white rounded-full text-xs font-bold border-0`}>
                              <Zap className="h-3 w-3 mr-1" />
                              {newAchievement.points_reward || "?"} pts
                            </Badge>
                            <div className="p-1 bg-app-bg-secondary rounded">
                              <span className="text-xs font-semibold text-app-text-primary">
                                {newAchievement.criteria_value || "?"} {selectedCriteria.label.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-app-border-muted">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/achievements')}
                  className="h-10 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddAchievement}
                  disabled={isLoading || !isFormValid()}
                  className="h-10 px-6 bg-app-achievement-workout hover:bg-app-achievement-workout/90 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-app-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Conquista
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}