"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ActivitySquare,
  Users,
  Calendar,
  TrendingUp,
  BrainCircuit,
  ChevronRight,
  MessageSquare,
  User,
  UserPlus,
  Plus,
  Eye,
  Target,
  Clock,
  Award,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Dumbbell,
  Sparkles,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useSupabase } from "@/app/providers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Dados de demonstração atualizados
const dummyStudents = [
  { 
    id: 1, 
    name: "João Silva", 
    status: "active", 
    progress: 78, 
    nextSession: "Hoje, 15:00",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    goal: "Ganho de massa"
  },
  { 
    id: 2, 
    name: "Maria Oliveira", 
    status: "active", 
    progress: 65, 
    nextSession: "Amanhã, 10:00",
    avatar: "https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg",
    goal: "Perda de peso"
  },
  { 
    id: 3, 
    name: "Carlos Santos", 
    status: "inactive", 
    progress: 32, 
    nextSession: "Não agendado",
    avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
    goal: "Reabilitação"
  },
  { 
    id: 4, 
    name: "Ana Costa", 
    status: "active", 
    progress: 92, 
    nextSession: "Hoje, 17:30",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    goal: "Condicionamento"
  },
];

const dummyActivities = [
  { 
    id: 1, 
    student: "João Silva", 
    type: "workout_completed", 
    time: "2 horas atrás", 
    message: "Completou treino 'Força de Membros Superiores'",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"
  },
  { 
    id: 2, 
    student: "Maria Oliveira", 
    type: "message", 
    time: "5 horas atrás", 
    message: "Enviou uma mensagem sobre dores musculares",
    avatar: "https://images.pexels.com/photos/3768114/pexels-photo-3768114.jpeg"
  },
  { 
    id: 3, 
    student: "Ana Costa", 
    type: "achievement", 
    time: "1 dia atrás", 
    message: "Atingiu meta mensal de treinos!",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
  },
  { 
    id: 4, 
    student: "Carlos Santos", 
    type: "assessment_due", 
    time: "2 dias atrás", 
    message: "Avaliação mensal está atrasada",
    avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
  },
];

const dummyInsights = [
  { 
    id: 1, 
    type: "progression", 
    title: "João Silva está pronto para aumentar carga no supino", 
    confidence: 0.87, 
    student: "João Silva",
    recommendation: "Aumentar 5kg na próxima sessão"
  },
  { 
    id: 2, 
    type: "risk", 
    title: "Maria Oliveira mostra sinais de fadiga excessiva", 
    confidence: 0.72,
    student: "Maria Oliveira", 
    recommendation: "Reduzir intensidade por 1 semana"
  },
  { 
    id: 3, 
    type: "goal", 
    title: "Ana Costa está 92% próxima da meta mensal", 
    confidence: 0.95,
    student: "Ana Costa", 
    recommendation: "Manter frequência atual"
  },
];

const weeklyProgressData = [
  { name: "Seg", sessoes: 8, comparecimento: 87, meta: 10 },
  { name: "Ter", sessoes: 12, comparecimento: 92, meta: 10 },
  { name: "Qua", sessoes: 10, comparecimento: 83, meta: 10 },
  { name: "Qui", sessoes: 15, comparecimento: 94, meta: 10 },
  { name: "Sex", sessoes: 11, comparecimento: 89, meta: 10 },
  { name: "Sáb", sessoes: 6, comparecimento: 100, meta: 10 },
  { name: "Dom", sessoes: 3, comparecimento: 100, meta: 10 },
];

const clientStatusData = [
  { name: "Ativos", value: 15, color: "#22c55e" },
  { name: "Inativos", value: 3, color: "#ef4444" },
  { name: "Pausados", value: 2, color: "#f59e0b" },
  { name: "Novos", value: 4, color: "#3b82f6" },
];

export default function DashboardPage() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, [supabase]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");

    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Personal");
    }
    setLoading(false);
  }, [user]);

  if (loading) {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "workout_completed":
        return <ActivitySquare className="h-5 w-5 text-green-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />;
      case "assessment_due":
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600 rounded-full text-xs font-semibold">Ativo</Badge>;
      case "inactive":
        return <Badge className="px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 dark:border-red-600 rounded-full text-xs font-semibold">Inativo</Badge>;
      case "paused":
        return <Badge className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-300 dark:border-yellow-600 rounded-full text-xs font-semibold">Pausado</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full">Novo</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      {timeOfDay}, {userName}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      Aqui está um resumo do que está acontecendo com seus alunos hoje
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  asChild
                  className="group bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 hover:from-green-700 hover:via-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <Link href="/students/create">
                    <UserPlus className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Novo Aluno
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 font-bold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300"
                >
                  <Link href="/analytics">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
                    Relatórios
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Total de Alunos</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">24</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="font-semibold">+8%</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">vs mês passado</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Sessões Semanais</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">65</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                    <ActivitySquare className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="font-semibold">+12%</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">vs semana passada</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Agendamentos Hoje</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">8</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Minus className="h-4 w-4 mr-1" />
                  <span className="font-semibold">Igual</span>
                  <span className="ml-1">a ontem</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">Comparecimento</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">89%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="font-semibold">+3%</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">vs mês passado</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Performance Semanal
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Sessões realizadas e taxa de comparecimento
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatório
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyProgressData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="name" 
                          className="text-sm"
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          className="text-sm"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar 
                          dataKey="sessoes" 
                          fill="url(#colorGradient1)" 
                          radius={[8, 8, 0, 0]}
                          name="Sessões Realizadas"
                        />
                        <Bar 
                          dataKey="meta" 
                          fill="url(#colorGradient2)" 
                          radius={[8, 8, 0, 0]}
                          name="Meta"
                          opacity={0.3}
                        />
                        <defs>
                          <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                          </linearGradient>
                          <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-6 pb-4 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-orange-900/10 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                          <BrainCircuit className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                          Insights de IA
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Recomendações personalizadas baseadas em dados
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 dark:border-purple-600 rounded-full text-xs font-semibold">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Novo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {dummyInsights.map((insight) => (
                    <div key={insight.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge 
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  insight.type === 'progression' 
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600' 
                                    : insight.type === 'risk' 
                                    ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 dark:border-red-600'
                                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-600'
                                }`}
                              >
                                {insight.type === 'progression' ? '📈 Progresso' : 
                                 insight.type === 'risk' ? '⚠️ Atenção' : '🎯 Meta'}
                              </Badge>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {insight.student}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{insight.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{insight.recommendation}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confiança:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={insight.confidence * 100} className="h-2 w-24" />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{Math.round(insight.confidence * 100)}%</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="h-8 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border-0"
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 h-12 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 font-semibold"
                    asChild
                  >
                    <Link href="/ai-insights" className="flex items-center justify-center">
                      Ver Todos os Insights
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Ações Rápidas</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Acesso rápido às principais funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      asChild 
                      className="h-auto flex-col py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      <Link href="/students/create">
                        <UserPlus className="mb-2 h-5 w-5" />
                        <span className="text-xs">Novo Aluno</span>
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="h-auto flex-col py-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      <Link href="/exercises/create">
                        <Plus className="mb-2 h-5 w-5" />
                        <span className="text-xs">Exercício</span>
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="h-auto flex-col py-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      <Link href="/appointments/new">
                        <Calendar className="mb-2 h-5 w-5" />
                        <span className="text-xs">Agendar</span>
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="h-auto flex-col py-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      <Link href="/analytics">
                        <BarChart3 className="mb-2 h-5 w-5" />
                        <span className="text-xs">Relatórios</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Status Distribution */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Status dos Alunos</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Distribuição atual da sua base
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="h-[200px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {clientStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {clientStatusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-4 w-4 rounded-full shadow-sm" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students Highlight */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-green-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
                <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Alunos em Destaque</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Seus próximos compromissos
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Link href="/students">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Todos
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-3">
                  {dummyStudents.slice(0, 4).map((student) => (
                    <div key={student.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-700 shadow-lg">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-bold">
                              {student.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                              {getStatusBadge(student.status)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {student.nextSession}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <Progress value={student.progress} className="h-2 w-20" />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{student.progress}%</span>
                              </div>
                              <Badge className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs">
                                {student.goal}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild 
                          className="shrink-0 rounded-xl hover:bg-white dark:hover:bg-gray-700 shadow-sm"
                        >
                          <Link href={`/students/${student.id}`}>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Atividades Recentes</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Últimas atualizações dos seus alunos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-4">
                  {dummyActivities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{activity.student}</p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.message}</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 h-11 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 font-semibold"
                  >
                    Ver Todas as Atividades
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}