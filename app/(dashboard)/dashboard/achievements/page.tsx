'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2, Zap, Sparkles, Crown, Flame, TrendingUp } from "lucide-react";

const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Treinos Completados", icon: Dumbbell, color: "from-blue-500 to-cyan-500" },
  { value: "consecutive_days", label: "Dias Consecutivos", icon: Calendar, color: "from-green-500 to-emerald-500" },
  { value: "total_weight", label: "Peso Total Levantado", icon: BarChart, color: "from-purple-500 to-pink-500" },
  { value: "exercises_completed", label: "Exercícios Completados", icon: Target, color: "from-orange-500 to-red-500" },
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

  const renderAchievementIcon = (criteriaType: string): JSX.Element | null => {
    const criteriaInfo = CRITERIA_TYPES.find((t) => t.value === criteriaType);
    if (!criteriaInfo) return null;

    const IconComponent = criteriaInfo.icon;
    return (
      <div className="relative mb-6">
        <div className={`absolute inset-0 bg-gradient-to-r ${criteriaInfo.color} rounded-2xl blur-xl opacity-75`}></div>
        <div className={`relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${criteriaInfo.color} shadow-lg`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-orange-500/20 to-red-600/20 dark:from-yellow-500/10 dark:via-orange-400/10 dark:to-red-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Conquistas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      {userRole === 'trainer'
                        ? <><span className="font-semibold text-orange-600 dark:text-orange-400">{achievements.length}</span> conquistas disponíveis</>
                        : 'Acompanhe seu progresso e ganhe recompensas'}
                    </p>
                  </div>
                </div>
              </div>

              {userRole === 'trainer' && (
                <Button
                  onClick={() => router.push('/dashboard/achievements/new')}
                  variant="outline"
                  className="min-h-[44px]  bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Nova
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Student Progress Section */}
        {userRole === 'student' && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm font-bold uppercase tracking-wider">Pontos Totais</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">1,250</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Conquistas</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">8</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Rank Atual</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">Silver</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    <Star className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    <Star className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((achievement) => {
            const progress = getProgressForAchievement(achievement);
            const criteriaInfo = CRITERIA_TYPES.find((t) => t.value === achievement.criteria_type);

            return (
              <div key={achievement.id} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${criteriaInfo?.color || 'from-gray-600 to-gray-700'} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">

                  {/* Animated gradient border */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${criteriaInfo?.color || 'from-gray-500 to-gray-600'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                  {userRole === 'trainer' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 z-10 h-9 w-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 shadow-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => handleDeleteAchievement(achievement.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <CardContent className="relative p-6">
                    <div className="text-center mb-6">
                      {renderAchievementIcon(achievement.criteria_type)}
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>

                    {userRole === 'student' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Progresso</span>
                            <span className="font-bold text-gray-900 dark:text-white">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          {progress === 100 && (
                            <div className="flex items-center justify-center mt-3 text-green-600 dark:text-green-400">
                              <Award className="h-4 w-4 mr-1" />
                              <span className="text-sm font-semibold">Completa!</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={`px-3 py-1 bg-gradient-to-r ${criteriaInfo?.color || 'from-gray-500 to-gray-600'} text-white rounded-full text-xs font-semibold border-0`}>
                            <Flame className="h-3 w-3 mr-1" />
                            {achievement.points_reward} pontos
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <TrendingUp className="h-3 w-3" />
                            <span className="font-medium">{achievement.criteria_value}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {userRole === 'trainer' && (
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <Badge className={`px-3 py-1 bg-gradient-to-r ${criteriaInfo?.color || 'from-gray-500 to-gray-600'} text-white rounded-full text-xs font-semibold border-0`}>
                            <Zap className="h-3 w-3 mr-1" />
                            {achievement.points_reward} pontos
                          </Badge>
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {achievement.criteria_value} {criteriaInfo?.label}
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
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-red-600/10 rounded-3xl blur-2xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="text-center py-24">
                <div className="relative mb-8">
                  <div className="w-40 h-40 mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-2xl">
                    <Trophy className="h-20 w-20 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-clip-text text-transparent mb-4">
                  Nenhuma conquista ainda!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  {userRole === 'trainer'
                    ? "Crie conquistas para motivar seus alunos e acompanhar o progresso deles"
                    : "Em breve você poderá desbloquear conquistas incríveis!"}
                </p>

                {userRole === 'trainer' && (
                  <Button
                    onClick={() => router.push('/dashboard/achievements/new')}
                    className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 hover:from-yellow-700 hover:via-orange-700 hover:to-red-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    Criar Primeira Conquista
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}