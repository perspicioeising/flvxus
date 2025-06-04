'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Dumbbell, 
  Calendar, 
  BarChart, 
  Target, 
  Award, 
  Lock, 
  CheckCircle,
  Clock
} from "lucide-react";
import { useSupabase } from "@/app/providers";
import { format } from "date-fns";

export default function MyAchievementsPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    nextLevelPoints: 0,
    progressToNextLevel: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchAchievements(),
          fetchStats()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar suas conquistas."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/user/achievements');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAchievements(data.achievements || []);
      setUserAchievements(data.userAchievements || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStats({
        totalPoints: data.totalPoints,
        level: data.level,
        nextLevelPoints: data.nextLevel.pointsRequired,
        progressToNextLevel: data.nextLevel.progressPercentage
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getCriteriaTypeIcon = (type: string) => {
    switch (type) {
      case 'workouts_completed':
        return <Dumbbell className="h-5 w-5" />;
      case 'consecutive_days':
        return <Calendar className="h-5 w-5" />;
      case 'total_weight':
        return <BarChart className="h-5 w-5" />;
      case 'exercises_completed':
        return <Target className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const formatCriteriaType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Carregando conquistas...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos seus dados.</p>
        </div>
      </div>
    );
  }

  // Group achievements by status (earned vs. in progress)
  const earnedAchievements = achievements.filter((a: any) => a.earned);
  const inProgressAchievements = achievements.filter((a: any) => !a.earned);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Minhas Conquistas</h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e desbloqueie novas conquistas
        </p>
      </div>

      {/* Level Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Nível {stats.level}</h3>
                <p className="text-muted-foreground">Fitness Master</p>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{stats.totalPoints} pontos totais</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso para Nível {stats.level + 1}</span>
                <span>{Math.round(stats.progressToNextLevel)}%</span>
              </div>
              <Progress value={stats.progressToNextLevel} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Conquistas Desbloqueadas
          </CardTitle>
          <CardDescription>
            Conquistas que você já alcançou em sua jornada fitness
          </CardDescription>
        </CardHeader>
        <CardContent>
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement: any) => {
                const userAchievement = userAchievements.find((ua: any) => ua.achievement_id === achievement.id);
                
                return (
                  <Card key={achievement.id} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                          {getCriteriaTypeIcon(achievement.criteria_type)}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        
                        <Badge className="bg-green-500 text-white mb-3">
                          <Award className="h-3 w-3 mr-1" />
                          Conquistado
                        </Badge>
                        
                        {userAchievement && (
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Obtido em {format(new Date(userAchievement.earned_at), 'dd/MM/yyyy')}
                          </div>
                        )}
                        
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">Recompensa: </span>
                          <span className="font-medium">{achievement.points_reward} pontos</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você ainda não desbloqueou nenhuma conquista</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete treinos e desafios para ganhar suas primeiras conquistas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Progress Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Conquistas em Progresso
          </CardTitle>
          <CardDescription>
            Conquistas que você está trabalhando para alcançar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inProgressAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressAchievements.map((achievement: any) => (
                <Card key={achievement.id} className="border-muted-foreground/20">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        {getCriteriaTypeIcon(achievement.criteria_type)}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      
                      <div className="w-full space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span>{achievement.progress}%</span>
                          <span>{achievement.criteria_value} {formatCriteriaType(achievement.criteria_type)}</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Recompensa: </span>
                        <span className="font-medium">{achievement.points_reward} pontos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você já desbloqueou todas as conquistas disponíveis!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Parabéns pelo seu progresso incrível
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}