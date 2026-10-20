'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2, Zap, Sparkles, Crown, Flame, TrendingUp, Shield, Scale, Activity, User, Info } from "lucide-react";

const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Treinos Completados", icon: Dumbbell, color: "from-app-achievement-workout to-app-btn-primary" },
  { value: "consecutive_days", label: "Dias Consecutivos", icon: Calendar, color: "from-app-achievement-workout to-app-btn-secondary" },
  { value: "total_weight", label: "Peso Total Levantado", icon: BarChart, color: "from-app-achievement-workout to-app-text-accent" },
  { value: "exercises_completed", label: "Exercícios Completados", icon: Target, color: "from-app-achievement-workout to-app-btn-accent" },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userRole, setUserRole] = useState(null);

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

  const getProgressForAchievement = (achievement: Achievement): number => {
    // This would be replaced with actual progress data from the backend
    return Math.floor(Math.random() * 100);
  };

  const renderAchievementIcon = (criteriaType: string) => {
    const criteriaInfo = CRITERIA_TYPES.find((t) => t.value === criteriaType);
    if (!criteriaInfo) return null;

    const IconComponent = criteriaInfo.icon;
    return (
      <div className="relative mb-4">
        <div className={`absolute inset-0 bg-gradient-to-br ${criteriaInfo.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
        <div className={`relative p-3 bg-gradient-to-br ${criteriaInfo.color} rounded-xl shadow-app-medium`}>
          <IconComponent className="h-6 w-6 text-white" />
          <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-app-achievement-workout/30 rounded-full animate-spin border-t-app-achievement-workout"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-app-achievement-workout/50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg-primary">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                      Conquistas
                    </CardTitle>
                    <CardDescription className="text-app-text-secondary text-sm">
                      {userRole === 'trainer'
                        ? <>
                            <span className="font-semibold text-app-achievement-workout">{achievements.length}</span> conquistas disponíveis
                          </>
                        : 'Acompanhe seu progresso e ganhe recompensas'}
                    </CardDescription>
                  </div>
                </div>

                {userRole === 'trainer' && (
                  <Button
                    onClick={() => router.push('/dashboard/achievements/new')}
                    className="h-10 px-4 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl shadow-app-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Student Progress Section */}
            {userRole === 'student' && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  <ProgressCard
                    title="Pontos Totais"
                    value="1,250"
                    icon={Trophy}
                    gradient="from-app-achievement-workout to-app-btn-primary"
                    progress={75}
                  />
                  <ProgressCard
                    title="Conquistas"
                    value="8"
                    icon={Award}
                    gradient="from-app-achievement-workout to-app-btn-secondary"
                    progress={66}
                  />
                  <ProgressCard
                    title="Rank Atual"
                    value="Silver"
                    icon={Crown}
                    gradient="from-app-achievement-workout to-app-text-accent"
                    progress={0}
                    showStars
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((achievement, index) => {
            const progress = getProgressForAchievement(achievement);
            const criteriaInfo = CRITERIA_TYPES.find((t) => t.value === achievement.criteria_type);

            return (
              <div key={achievement.id} className="relative group animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${criteriaInfo?.color || 'from-app-achievement-workout to-app-btn-primary'} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                <Card className="relative border-0 card-app shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">

                  {userRole === 'trainer' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 z-10 h-8 w-8 bg-app-card/90 backdrop-blur-sm hover:bg-app-card hover:text-red-500 shadow-app-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => handleDeleteAchievement(achievement.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center mb-4">
                      {renderAchievementIcon(achievement.criteria_type)}
                      <h3 className="text-lg font-bold text-app-heading mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-app-text-secondary leading-relaxed line-clamp-2">
                        {achievement.description}
                      </p>
                    </div>

                    {userRole === 'student' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-gradient-to-r from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-app-text-primary">Progresso</span>
                            <span className="font-bold text-app-heading">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-app-bg-secondary" />
                          {progress === 100 && (
                            <div className="flex items-center justify-center mt-2 text-app-achievement-workout">
                              <Award className="h-3 w-3 mr-1" />
                              <span className="text-xs font-semibold">Completa!</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={`px-2 py-1 bg-gradient-to-r ${criteriaInfo?.color || 'from-app-achievement-workout to-app-btn-primary'} text-white rounded-full text-xs font-bold border-0`}>
                            <Flame className="h-3 w-3 mr-1" />
                            {achievement.points_reward} pts
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-app-text-muted">
                            <TrendingUp className="h-3 w-3" />
                            <span className="font-medium">{achievement.criteria_value}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {userRole === 'trainer' && (
                      <div className="border-t border-app-border-muted pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <Badge className={`px-2 py-1 bg-gradient-to-r ${criteriaInfo?.color || 'from-app-achievement-workout to-app-btn-primary'} text-white rounded-full text-xs font-bold border-0`}>
                            <Zap className="h-3 w-3 mr-1" />
                            {achievement.points_reward} pts
                          </Badge>
                          <div className="p-2 bg-app-bg-secondary rounded-lg">
                            <span className="text-xs font-semibold text-app-text-primary">
                              {achievement.criteria_value} {criteriaInfo?.label?.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {achievements.length === 0 && (
          <Card className="border-0 card-app">
            <CardContent className="text-center py-12 sm:py-16">
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-app-heading mb-2">
                Nenhuma conquista ainda!
              </h3>
              <p className="text-app-text-secondary max-w-lg mx-auto leading-relaxed mb-6">
                {userRole === 'trainer'
                  ? "Crie conquistas para motivar seus alunos e acompanhar o progresso deles"
                  : "Em breve você poderá desbloquear conquistas incríveis!"}
              </p>

              {userRole === 'trainer' && (
                <Button
                  onClick={() => router.push('/dashboard/achievements/new')}
                  className="px-6 py-3 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-bold rounded-xl shadow-app-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Conquista
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para cards de progresso
function ProgressCard({ title, value, icon: Icon, gradient, progress, showStars = false }: {
  title: string;
  value: string;
  icon: any;
  gradient: string;
  progress: number;
  showStars?: boolean;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        </div>
        <CardContent className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                {title}
              </p>
              <div className="text-2xl sm:text-3xl font-black text-app-heading">
                {value}
              </div>
            </div>
            <div className={`relative p-2 sm:p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-app-medium`}>
              <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
            </div>
          </div>

          {showStars ? (
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-app-achievement-workout fill-app-achievement-workout" />
              <Star className="h-4 w-4 text-app-achievement-workout fill-app-achievement-workout" />
              <Star className="h-4 w-4 text-app-text-muted" />
              <Star className="h-4 w-4 text-app-text-muted" />
              <Star className="h-4 w-4 text-app-text-muted" />
            </div>
          ) : (
            <Progress value={progress} className="h-2 bg-app-bg-secondary" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}