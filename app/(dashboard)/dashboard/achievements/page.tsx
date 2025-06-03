'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  {/* Cabeçalho Aprimorado */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gerenciar Conquistas</h2>
              <p className="text-muted-foreground">
                {userRole === 'trainer' 
                  ? 'Gerencie as conquistas e recompensas dos seus alunos'
                  : 'Acompanhe seu progresso e ganhe recompensas'}
              </p>
            </div>
          </div>
        </div>
        
        {userRole === 'trainer' && (
          <Button 
            onClick={() => router.push('/dashboard/achievements/new')}
                className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-6 w-6" /> Adicionar
          </Button>
        )}
      </div>
    </div>
  </div>

  {/* Seção de Progresso (Alunos) */}
  {userRole === 'student' && (
    <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Seu Progresso</CardTitle>
        <CardDescription className="text-muted-foreground">
          Acompanhe sua jornada fitness e conquistas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-primary/10 text-center hover:bg-primary/20 transition-colors">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">1,250</div>
            <div className="text-sm text-muted-foreground">Pontos Totais</div>
          </div>
          <div className="p-4 rounded-lg bg-background/40 text-center hover:bg-primary/10 transition-colors">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Conquistas Ganhas</div>
          </div>
          <div className="p-4 rounded-lg bg-background/40 text-center hover:bg-primary/10 transition-colors">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">Silver</div>
            <div className="text-sm text-muted-foreground">Rank Atual</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )}

  {/* Lista de Conquistas */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {achievements.map((achievement) => (
      <Card 
        key={achievement.id} 
        className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30 group"
      >
        {userRole === 'trainer' && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive"
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
                <span>Progresso</span>
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
                  {achievement.points_reward} pontos
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
                  {achievement.points_reward} pontos
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
  );
}