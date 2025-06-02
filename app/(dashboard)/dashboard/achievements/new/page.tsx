'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useSupabase } from "@/app/providers";
import { toast, useToast } from "@/hooks/use-toast";
import { Plus, Trophy, ArrowLeft, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2 } from "lucide-react";


const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Treinos Completados", icon: Dumbbell },
  { value: "consecutive_days", label: "Dias Consecutivos", icon: Calendar },
  { value: "total_weight", label: "Peso Total Levantado", icon: BarChart },
  { value: "exercises_completed", label: "Exercícios Completados", icon: Target },
];


export default function NewAchievementPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
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
                title: "Conquista criada",
                description: "Nova conquista adicionada com sucesso",
            });
            router.push('/dashboard/achievements'); 

            setNewAchievement({
                name: "",
                description: "",
                criteria_type: "",
                criteria_value: "",
                points_reward: "",
                icon: "trophy"
            });


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

    interface CriteriaType {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  interface RenderAchievementIconProps {
    criteriaType: string;
  }

    const renderAchievementIcon = (criteriaType: string): JSX.Element | null => {
    const IconComponent = CRITERIA_TYPES.find((t: CriteriaType) => t.value === criteriaType)?.icon;
    if (!IconComponent) return null;
    return (
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
        <IconComponent className="h-6 w-6 text-primary" />
      </div>
    );
  };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="bg-background/70 backdrop-blur-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Criar Nova Conquista</h2>
            </div>

            <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Conquista</Label>
                            <Input
                                placeholder="ex: Guerreiro dos Treinos"
                                value={newAchievement.name}
                                onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-background/70 backdrop-blur-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                placeholder="Descreva como ganhar esta conquista..."
                                value={newAchievement.description}
                                onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-background/70 backdrop-blur-sm min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Critério</Label>
                                <Select
                                    value={newAchievement.criteria_type}
                                    onValueChange={(value) => setNewAchievement(prev => ({ ...prev, criteria_type: value }))}
                                >
                                    <SelectTrigger className="bg-background/70 backdrop-blur-sm">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                                        {CRITERIA_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Valor Alvo</Label>
                                <Input
                                    type="number"
                                    placeholder="ex: 10"
                                    value={newAchievement.criteria_value}
                                    onChange={(e) => setNewAchievement(prev => ({ ...prev, criteria_value: e.target.value }))}
                                    className="bg-background/70 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Pontos de Recompensa</Label>
                            <Input
                                type="number"
                                placeholder="ex: 100"
                                value={newAchievement.points_reward}
                                onChange={(e) => setNewAchievement(prev => ({ ...prev, points_reward: e.target.value }))}
                                className="bg-background/70 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard/achievements')}
                            className="bg-background/70 backdrop-blur-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddAchievement}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? "Criando..." : "Criar Conquista"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}