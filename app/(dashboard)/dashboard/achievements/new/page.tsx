'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSupabase } from "@/app/providers";
import { toast, useToast } from "@/hooks/use-toast";
import { Plus, Trophy, ArrowLeft, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2, Zap, Sparkles, Save, X, Info, Flame } from "lucide-react";

const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Treinos Completados", icon: Dumbbell, color: "from-blue-500 to-cyan-500", description: "Baseado no número de treinos finalizados" },
  { value: "consecutive_days", label: "Dias Consecutivos", icon: Calendar, color: "from-green-500 to-emerald-500", description: "Dias seguidos de atividade" },
  { value: "total_weight", label: "Peso Total Levantado", icon: BarChart, color: "from-purple-500 to-pink-500", description: "Soma total de peso em kg" },
  { value: "exercises_completed", label: "Exercícios Completados", icon: Target, color: "from-orange-500 to-red-500", description: "Quantidade de exercícios realizados" },
];

export default function NewAchievementPage() {
  const router = useRouter()
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-clip-text text-transparent">
              Criar Nova Conquista
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Defina objetivos e recompense o progresso dos seus alunos
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-red-600/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardHeader className="p-8 pb-6 bg-gradient-to-r from-yellow-50/50 via-orange-50/50 to-red-50/50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalhes da Conquista
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Preencha as informações para criar uma nova conquista motivadora
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Name Input */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  Nome da Conquista
                </Label>
                <Input
                  placeholder="ex: Guerreiro dos Treinos"
                  value={newAchievement.name}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                  className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Descrição
                </Label>
                <Textarea
                  placeholder="Descreva como ganhar esta conquista e motive seus alunos..."
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                />
              </div>

              {/* Criteria Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Tipo de Critério
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CRITERIA_TYPES.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleCriteriaChange(type.value)}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        selectedCriteria?.value === type.value ? 'scale-[0.98]' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${type.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedCriteria?.value === type.value
                          ? 'bg-gradient-to-r ' + type.color + ' text-white border-transparent shadow-xl'
                          : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCriteria?.value === type.value
                              ? 'bg-white/20'
                              : 'bg-gradient-to-r ' + type.color + ' shadow-md'
                          }`}>
                            <type.icon className={`h-5 w-5 ${
                              selectedCriteria?.value === type.value ? 'text-white' : 'text-white'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${
                              selectedCriteria?.value === type.value ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}>
                              {type.label}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              selectedCriteria?.value === type.value ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Valor Alvo
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="ex: 10"
                      value={newAchievement.criteria_value}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, criteria_value: e.target.value }))}
                      className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 pr-20"
                    />
                    {selectedCriteria && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Badge className={`px-3 py-1 bg-gradient-to-r ${selectedCriteria.color} text-white rounded-full text-xs font-semibold border-0`}>
                          {selectedCriteria.label.split(' ')[0]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    Pontos de Recompensa
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="ex: 100"
                      value={newAchievement.points_reward}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, points_reward: e.target.value }))}
                      className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-orange-300 dark:border-orange-600 rounded-full text-xs font-semibold">
                        XP
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              {newAchievement.name && selectedCriteria && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl">
                    <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Preview da Conquista
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className={`p-4 bg-gradient-to-br ${selectedCriteria.color} rounded-2xl shadow-lg`}>
                        <selectedCriteria.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {newAchievement.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {newAchievement.description || "Descrição da conquista..."}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className={`px-3 py-1 bg-gradient-to-r ${selectedCriteria.color} text-white rounded-full text-xs font-semibold border-0`}>
                            {newAchievement.criteria_value || "?"} {selectedCriteria.label}
                          </Badge>
                          <Badge className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xs font-semibold border-0">
                            <Zap className="h-3 w-3 mr-1" />
                            {newAchievement.points_reward || "?"} pontos
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/achievements')}
                  className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddAchievement}
                  disabled={isLoading || !isFormValid()}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 hover:from-yellow-700 hover:via-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-orange-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
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