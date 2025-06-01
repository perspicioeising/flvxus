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
  Minus
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
  const supabase = useSupabase();
  const user = supabase?.session?.user || null;
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");

    if (user) {
      setUserName(user.user_metadata.full_name || user.email?.split("@")[0] || "Personal");
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Ativo</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Inativo</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pausado</Badge>;
      default:
        return <Badge variant="outline">Novo</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header melhorado */}
        <header className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {timeOfDay}, {userName}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Aqui está um resumo do que está acontecendo com seus alunos hoje.
              </p>
            </div>
      
          </div>
        </header>

        {/* Cards de estatísticas melhorados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-blue-500/10 -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total de Alunos
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">24</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <ArrowUp className="h-3 w-3 mr-1" />
                +8% em relação ao mês passado
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-green-500/10 -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Sessões Esta Semana
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <ActivitySquare className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">65</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12% em relação à semana passada
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-purple-500/10 -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Agendamentos Hoje
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">8</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                <Minus className="h-3 w-3 mr-1" />
                Igual a ontem
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-orange-500/10 -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Taxa de Comparecimento
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">89%</div>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                <ArrowUp className="h-3 w-3 mr-1" />
                +3% em relação ao mês passado
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Área principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico de Performance Semanal */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Performance Semanal</CardTitle>
                    <CardDescription>
                      Sessões realizadas e taxa de comparecimento
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatório Completo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-sm fill-muted-foreground"
                      />
                      <YAxis className="text-sm fill-muted-foreground" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="sessoes" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        name="Sessões Realizadas"
                      />
                      <Bar 
                        dataKey="meta" 
                        fill="hsl(var(--muted))" 
                        radius={[4, 4, 0, 0]}
                        name="Meta"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Insights de IA melhorados */}
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Insights de IA</CardTitle>
                      <CardDescription>
                        Recomendações personalizadas baseadas em dados
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    <Zap className="h-3 w-3 mr-1" />
                    Novo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {dummyInsights.map((insight) => (
                    <div key={insight.id} className="rounded-xl border bg-gradient-to-r from-card to-muted/20 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={insight.type === 'progression' ? 'default' : insight.type === 'risk' ? 'destructive' : 'secondary'} 
                                   className="text-xs">
                              {insight.type === 'progression' ? '📈 Progresso' : 
                               insight.type === 'risk' ? '⚠️ Atenção' : '🎯 Meta'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {insight.student}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm leading-relaxed">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{insight.recommendation}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confiança:</span>
                          <Progress value={insight.confidence * 100} className="h-2 w-20" />
                          <span className="text-xs font-medium">{Math.round(insight.confidence * 100)}%</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  <Link href="/ai-insights" className="flex items-center">
                    Ver Todos os Insights
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar direita */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild className="h-auto flex-col py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Link href="/students/create">
                      <UserPlus className="mb-2 h-5 w-5" />
                      <span className="text-xs">Novo Aluno</span>
                    </Link>
                  </Button>
                  <Button asChild className="h-auto flex-col py-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    <Link href="/exercises/create">
                      <Plus className="mb-2 h-5 w-5" />
                      <span className="text-xs">Exercício</span>
                    </Link>
                  </Button>
                  <Button asChild className="h-auto flex-col py-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    <Link href="/appointments/new">
                      <Calendar className="mb-2 h-5 w-5" />
                      <span className="text-xs">Agendar</span>
                    </Link>
                  </Button>
                  <Button asChild className="h-auto flex-col py-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                    <Link href="/analytics">
                      <BarChart3 className="mb-2 h-5 w-5" />
                      <span className="text-xs">Relatórios</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Status dos Alunos</CardTitle>
                <CardDescription>
                  Distribuição atual da sua base de clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {clientStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {clientStatusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alunos em Destaque */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Alunos em Destaque</CardTitle>
                  <CardDescription>
                    Seus próximos compromissos
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/students">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Todos
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummyStudents.slice(0, 4).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{student.name}</p>
                            {getStatusBadge(student.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {student.nextSession}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={student.progress} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground">{student.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild className="shrink-0">
                        <Link href={`/students/${student.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividades Recentes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Atividades Recentes</CardTitle>
                <CardDescription>
                  Últimas atualizações dos seus alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummyActivities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm truncate">{activity.student}</p>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{activity.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Ver Todas as Atividades
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}