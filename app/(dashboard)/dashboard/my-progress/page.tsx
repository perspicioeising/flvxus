'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Activity,
  Scale,
  Ruler,
  Heart,
  Camera,
  ChevronRight,
  CalendarDays,
  BarChart as BarChartIcon,
  Trophy,
  Target,
  Dumbbell,
  Award,
  Star,
  Zap,
  TrendingUp
} from "lucide-react";
import { useSupabase } from "@/app/providers";

export default function MyProgressPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [physicalAssessments, setPhysicalAssessments] = useState<any[]>([]);
  const [posturalAssessments, setPosturalAssessments] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    totalPoints: 0,
    streak: 0,
    level: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchPhysicalAssessments(),
          fetchPosturalAssessments(),
          fetchAchievements(),
          fetchUserAchievements(),
          fetchInsights(),
          fetchStats()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados de progresso."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchPhysicalAssessments = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session?.user?.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('physical_assessments')
        .select('*')
        .eq('student_id', profile.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setPhysicalAssessments(data || []);
    } catch (error) {
      console.error("Error fetching physical assessments:", error);
    }
  };

  const fetchPosturalAssessments = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session?.user?.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('posture_assessments')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosturalAssessments(data || []);
    } catch (error) {
      console.error("Error fetching postural assessments:", error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', session?.user?.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('tenant_id', profile.tenant_id);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session?.user?.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements (*)
        `)
        .eq('user_id', profile.id);

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai/exercise-insights');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setInsights(data || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, total_points')
        .eq('user_id', session?.user?.id)
        .single();

      if (!profile) return;

      // Get workout history count
      const { count: workoutsCount } = await supabase
        .from('workout_history')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', profile.id);

      // Calculate level based on points
      const level = Math.floor(Math.sqrt(profile.total_points / 100)) + 1;

      // Calculate streak (mock data for now)
      const streak = 3; // In a real app, this would be calculated from workout history

      setStats({
        workoutsCompleted: workoutsCount || 0,
        totalPoints: profile.total_points || 0,
        streak,
        level
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getProgressData = () => {
    return physicalAssessments.slice(0, 10).map((assessment: any) => ({
      date: format(new Date(assessment.date), 'MMM d'),
      weight: assessment.weight,
      bodyFat: parseFloat(assessment.fat_percentage),
      leanMass: parseFloat(assessment.lean_mass),
      fatMass: parseFloat(assessment.fat_mass)
    })).reverse();
  };

  const getMeasurementsData = () => {
    if (physicalAssessments.length === 0) return [];
    
    const latest = physicalAssessments[0];
    return [
      { name: 'Peito', value: latest.chest },
      { name: 'Cintura', value: latest.waist },
      { name: 'Quadril', value: latest.hips },
      { name: 'Braço Esquerdo', value: latest.left_arm },
      { name: 'Braço Direito', value: latest.right_arm },
      { name: 'Coxa Esquerda', value: latest.left_thigh },
      { name: 'Coxa Direita', value: latest.right_thigh }
    ].filter(item => item.value);
  };

  const getAchievementProgress = (achievement: any) => {
    // In a real app, this would calculate actual progress based on user data
    // For now, we'll return random progress
    return Math.floor(Math.random() * 100);
  };

  const getNextLevelPoints = () => {
    const currentLevel = stats.level;
    const pointsForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * currentLevel * 100;
    return {
      current: stats.totalPoints - pointsForCurrentLevel,
      required: pointsForNextLevel - pointsForCurrentLevel
    };
  };

  const nextLevel = getNextLevelPoints();
  const levelProgress = (nextLevel.current / nextLevel.required) * 100;

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meu Progresso</h2>
        <p className="text-muted-foreground">
          Acompanhe sua jornada fitness e conquistas
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">{stats.level}</p>
                  <p className="text-xs text-muted-foreground">Fitness Master</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>{nextLevel.current} / {nextLevel.required} pontos</span>
                <span>Nível {stats.level + 1}</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Treinos Completados</p>
                <p className="text-2xl font-bold">{stats.workoutsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sequência Atual</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">{stats.streak}</p>
                  <p className="text-xs text-muted-foreground">dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="achievements">
        <TabsList>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="physical">Composição Corporal</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Conquistas</CardTitle>
              <CardDescription>
                Acompanhe seu progresso e desbloqueie novas conquistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement: any) => {
                  const isEarned = userAchievements.some((ua: any) => ua.achievement_id === achievement.id);
                  const progress = getAchievementProgress(achievement);
                  
                  return (
                    <Card 
                      key={achievement.id} 
                      className={`border ${isEarned ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                            isEarned ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            {achievement.criteria_type === 'workouts_completed' && (
                              <Dumbbell className={`h-8 w-8 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                            )}
                            {achievement.criteria_type === 'consecutive_days' && (
                              <CalendarDays className={`h-8 w-8 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                            )}
                            {achievement.criteria_type === 'total_weight' && (
                              <BarChartIcon className={`h-8 w-8 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                            )}
                            {achievement.criteria_type === 'exercises_completed' && (
                              <Target className={`h-8 w-8 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                          
                          {isEarned ? (
                            <Badge className="bg-primary text-primary-foreground">
                              <Award className="h-3 w-3 mr-1" />
                              Conquistado
                            </Badge>
                          ) : (
                            <div className="w-full space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>{progress}%</span>
                                <span>{achievement.criteria_value} {achievement.criteria_type.replace('_', ' ')}</span>
                              </div>
                              <Progress value={progress} className="h-2" />
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

                {achievements.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma conquista disponível ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physical Tab */}
        <TabsContent value="physical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso da Composição Corporal</CardTitle>
              <CardDescription>
                Acompanhe as mudanças no seu peso e composição corporal ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {physicalAssessments.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%\" height="100%">
                    <LineChart data={getProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        name="Peso (kg)"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bodyFat"
                        name="Gordura Corporal (%)" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="leanMass"
                        name="Massa Magra (kg)" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma avaliação física encontrada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solicite ao seu treinador uma avaliação física para acompanhar seu progresso
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {physicalAssessments.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Medidas Recentes</CardTitle>
                  <CardDescription>
                    Suas medidas corporais mais recentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMeasurementsData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Avaliações</CardTitle>
                  <CardDescription>
                    Visualize todos os seus registros de avaliação física
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {physicalAssessments.map((assessment: any) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(assessment.date), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Peso: {assessment.weight}kg</span>
                            <span>Gordura: {assessment.fat_percentage}%</span>
                            <span>Protocolo: {assessment.protocol}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Personalizados</CardTitle>
              <CardDescription>
                Recomendações baseadas no seu histórico de treinos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight: any, index) => (
                    <Card key={index} className={`border-l-4 ${
                      insight.type === 'progression' ? 'border-l-green-500' : 
                      insight.type === 'frequency' ? 'border-l-blue-500' : 
                      'border-l-orange-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${
                            insight.type === 'progression' ? 'bg-green-100 text-green-700' : 
                            insight.type === 'frequency' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {insight.type === 'progression' && <TrendingUp className="h-5 w-5" />}
                            {insight.type === 'frequency' && <Activity className="h-5 w-5" />}
                            {insight.type === 'balance' && <Scale className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                            <div className="bg-muted/50 p-3 rounded-md text-sm">
                              <strong>Recomendação:</strong> {insight.recommendation}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum insight disponível ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete mais treinos para receber recomendações personalizadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}