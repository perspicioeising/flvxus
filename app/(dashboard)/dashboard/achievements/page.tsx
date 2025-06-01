'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2 } from "lucide-react";

const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Treinos Completados", icon: Dumbbell },
  { value: "consecutive_days", label: "Dias Consecutivos", icon: Calendar },
  { value: "total_weight", label: "Peso Total Levantado", icon: BarChart },
  { value: "exercises_completed", label: "Exercícios Completados", icon: Target },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userRole, setUserRole] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  
  const [newAchievement, setNewAchievement] = useState({
    name: "",
    description: "",
    criteria_type: "",
    criteria_value: "",
    points_reward: "",
    icon: "trophy"
  });

  const fetchUserRole = useCallback(async () => {
    try {
      if (!session || !session.user) {
        setUserRole(null);
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setUserRole(profile.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, [session, supabase]);

  const fetchAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAchievements(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar conquistas",
        description: error.message,
      });
    }
  }, [toast]);

  useEffect(() => {
    const init = async () => {
      await fetchUserRole();
      await fetchAchievements();
    };
    init();
  }, [fetchUserRole, fetchAchievements]);


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
      
      setIsAddingAchievement(false);
      setNewAchievement({
        name: "",
        description: "",
        criteria_type: "",
        criteria_value: "",
        points_reward: "",
        icon: "trophy"
      });
      
      fetchAchievements();
      
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

  const handleDeleteAchievement = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Conquista deletada",
        description: "A conquista foi removida",
      });
      
      fetchAchievements();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conquista",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface Achievement {
    id: string;
    name: string;
    description: string;
    criteria_type: string;
    criteria_value: string;
    points_reward: string;
    icon: string;
  }

  interface Progress {
    [achievementId: string]: number;
  }

  const getProgressForAchievement = (achievement: Achievement): number => {
    // This would be replaced with actual progress data from the backend
    return Math.floor(Math.random() * 100);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar conquistas</h2>
          <p className="text-muted-foreground">
            {userRole === 'trainer' 
              ? 'Gerencie as conquistas e recompensas dos seus alunos'
              : 'Acompanhe seu progresso e ganhe recompensas'}
          </p>
        </div>
        {userRole === 'trainer' && (
          <Dialog open={isAddingAchievement} onOpenChange={setIsAddingAchievement}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Criar conquista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Conquista</DialogTitle>
                <DialogDescription>
                  Configure uma nova conquista para seus alunos ganharem
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Conquista</Label>
                  <Input
                    placeholder="ex: Guerreiro dos Treinos"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Descreva como ganhar esta conquista..."
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Critério</Label>
                    <Select
                      value={newAchievement.criteria_type}
                      onValueChange={(value) => setNewAchievement(prev => ({ ...prev, criteria_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
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
                      placeholder="e.g., 10"
                      value={newAchievement.criteria_value}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, criteria_value: e.target.value }))}
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingAchievement(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAchievement} disabled={isLoading}>
                  {isLoading ? "Criando..." : "Create Achievement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {userRole === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Seu Progresso</CardTitle>
              <CardDescription>
                Acompanhe sua jornada fitness e conquistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">1,250</div>
                  <div className="text-sm text-muted-foreground">Pontos Totais</div>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-muted-foreground">Conquistas Ganhas</div>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">Silver</div>
                  <div className="text-sm text-muted-foreground">Rank Atual</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="relative group">
              {userRole === 'trainer' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteAchievement(achievement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  {renderAchievementIcon(achievement.criteria_type)}
                  <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>
                </div>

                {userRole === 'student' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressForAchievement(achievement)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${getProgressForAchievement(achievement)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline" className="bg-primary/5">
                        {achievement.points_reward} points
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {achievement.criteria_value} {achievement.criteria_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}

                {userRole === 'trainer' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-primary/5">
                        {achievement.points_reward} points
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {achievement.criteria_value} {achievement.criteria_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}