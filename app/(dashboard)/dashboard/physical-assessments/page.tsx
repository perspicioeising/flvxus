// /opt/flvxus/app/(dashboard)/dashboard/physical-assessments/page.tsx - CORRIGIDO
'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Brain,
  Calculator,
  User,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Activity,
  Sparkles,
  BarChart3,
  Users,
  Target,
  Zap,
  Scale,
  Ruler,
  Heart,
  FileText,
  ForkliftIcon,
  RepeatIcon,
  BookDown,
  Book
} from "lucide-react";

interface Assessment {
  id: string;
  student_id: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  protocol: string;
  bmi: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  ai_analysis?: any;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

const PROTOCOLS = {
  'jackson_pollock_3': 'Jackson & Pollock (3 dobras)',
  'jackson_pollock_7': 'Jackson & Pollock (7 dobras)',
  'durnin_womersley': 'Durnin & Womersley',
  'slaughter': 'Slaughter et al.',
  'boileau': 'Boileau et al.',
  'guedes_1994': 'Guedes 1994'
};

export default function PhysicalAssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    avgFatPercentage: 0,
    avgBMI: 0
  });

  const fetchAssessments = useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('🔍 Fazendo requisição para /api/physical-assessments...');

      const response = await fetch('/api/physical-assessments');
      const data = await response.json();

      console.log('📦 Resposta da API:', data);
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar avaliações');
      }

      // ===== CORREÇÃO: ADAPTAÇÃO PARA NOVA ESTRUTURA =====
      let assessmentsList: Assessment[] = [];

      if (data.assessments) {
        // Formato novo: { assessments: [...], total: number }
        assessmentsList = data.assessments;
        console.log('✅ Usando formato novo com data.assessments');
      } else if (Array.isArray(data)) {
        // Formato antigo (array direto) - compatibilidade
        assessmentsList = data;
        console.log('⚠️ Usando formato antigo (array direto)');
      } else {
        console.error('❌ Formato de resposta não reconhecido:', data);
        assessmentsList = [];
      }

      console.log(`📊 Total de avaliações encontradas: ${assessmentsList.length}`);
      console.log('🗂️ Primeiras 2 avaliações:', assessmentsList.slice(0, 2));

      setAssessments(assessmentsList);
      calculateStats(assessmentsList);

    } catch (error: any) {
      console.error('❌ Erro ao buscar avaliações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error.message,
      });
      // Em caso de erro, manter o array vazio
      setAssessments([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUserRole = useCallback(async () => {
    try {
      console.log('👤 Buscando role do usuário...');
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Role encontrado:', data.role);
        setUserRole(data.role);
      } else {
        console.warn('⚠️ Erro ao buscar role:', data);
        setUserRole(null);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar role do usuário:', error);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      console.log('🚀 Inicializando página...');
      await fetchUserRole();
      await fetchAssessments();
    };
    initializePage();
  }, [fetchUserRole, fetchAssessments]);

  // Debug: adicionar console.log para verificar userRole
  useEffect(() => {
    console.log('👤 UserRole atual:', userRole);
  }, [userRole]);

  const calculateStats = (assessmentsList: Assessment[]) => {
    console.log('📊 Calculando estatísticas para', assessmentsList.length, 'avaliações');

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const thisMonth = assessmentsList.filter(assessment => {
      const assessmentDate = new Date(assessment.created_at);
      return assessmentDate.getMonth() === currentMonth &&
        assessmentDate.getFullYear() === currentYear;
    }).length;

    const avgFatPercentage = assessmentsList.length > 0
      ? assessmentsList.reduce((sum, a) => sum + (a.fat_percentage || 0), 0) / assessmentsList.length
      : 0;

    const avgBMI = assessmentsList.length > 0
      ? assessmentsList.reduce((sum, a) => sum + (a.bmi || 0), 0) / assessmentsList.length
      : 0;

    const newStats = {
      total: assessmentsList.length,
      thisMonth,
      avgFatPercentage: parseFloat(avgFatPercentage.toFixed(1)),
      avgBMI: parseFloat(avgBMI.toFixed(1))
    };

    console.log('📊 Stats calculados:', newStats);
    setStats(newStats);
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.profiles.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProtocol = protocolFilter === "all" || assessment.protocol === protocolFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const assessmentDate = new Date(assessment.created_at);
      const currentDate = new Date();

      switch (dateFilter) {
        case "today":
          matchesDate = assessmentDate.toDateString() === currentDate.toDateString();
          break;
        case "week":
          const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = assessmentDate >= weekAgo;
          break;
        case "month":
          matchesDate = assessmentDate.getMonth() === currentDate.getMonth() &&
            assessmentDate.getFullYear() === currentDate.getFullYear();
          break;
      }
    }

    return matchesSearch && matchesProtocol && matchesDate;
  });

  const getClassificationBadge = (fatPercentage: number, gender: string) => {
    let classification = '';
    let colorClass = '';

    if (gender === 'male') {
      if (fatPercentage < 6) {
        classification = 'Muito Baixo';
        colorClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      } else if (fatPercentage < 14) {
        classification = 'Atlético';
        colorClass = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      } else if (fatPercentage < 18) {
        classification = 'Fitness';
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      } else if (fatPercentage < 25) {
        classification = 'Aceitável';
        colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      } else {
        classification = 'Elevado';
        colorClass = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      }
    } else {
      if (fatPercentage < 16) {
        classification = 'Muito Baixo';
        colorClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      } else if (fatPercentage < 21) {
        classification = 'Atlético';
        colorClass = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      } else if (fatPercentage < 25) {
        classification = 'Fitness';
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      } else if (fatPercentage < 32) {
        classification = 'Aceitável';
        colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      } else {
        classification = 'Elevado';
        colorClass = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      }
    }

    return (
      <Badge className={`${colorClass} font-semibold text-xs`}>
        {classification}
      </Badge>
    );
  };

  // ===== LOADING STATE COM DEBUG =====
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Main loading screen
  if (isLoading && PhysicalAssessmentsPage.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Header Skeleton */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                    <div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-2" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
                    </div>
                  </div>
                </div>
                <div className="w-32 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Statistics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <div className="text-left">
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
              <CardContent className="p-6">
                {/* Filters Skeleton */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                  <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                  <div className="w-full lg:w-[220px] h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                </div>

                {/* Loading Skeleton */}
                <LoadingSkeleton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-2 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              {/* Header com ícone e título */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Ícone com badge */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Book className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </div>
                </div>

                {/* Textos */}
                <div className="min-w-0 space-y-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                    Avaliações
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-base leading-tight">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span> avaliações
                    <span className="hidden xs:inline"> • Sistema inteligente</span>
                  </p>
                </div>
              </div>

              {/* Botão (condicional) */}
              {(userRole === 'trainer' || userRole === null) && (
                <Button
                  onClick={() => router.push('/dashboard/physical-assessments/new')}
                  variant="outline"
                  className="h-10 px-4 sm:h-12 sm:px-5 bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm hover:shadow transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:rotate-90 transition-all duration-300" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Nova</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4">
          {[
            {
              value: stats.total,
              label: "Total",
              color: "from-blue-600 to-purple-600",
              icon: FileText,
              progress: 100,
              shortLabel: true
            },
            {
              value: stats.thisMonth,
              label: "Este Mês",
              color: "from-green-600 to-emerald-600",
              icon: Calendar,
              progress: Math.min((stats.thisMonth / Math.max(stats.total, 1)) * 100, 100),
              shortLabel: true
            },
            {
              value: stats.avgFatPercentage,
              label: "% Gordura Média",
              color: "from-orange-600 to-red-600",
              icon: BarChart3,
              progress: Math.min((stats.avgFatPercentage / 35) * 100, 100),
              suffix: "%",
              shortLabel: false
            },
            {
              value: stats.avgBMI,
              label: "IMC Médio",
              color: "from-purple-600 to-pink-600",
              icon: Scale,
              progress: Math.min((stats.avgBMI / 35) * 100, 100),
              shortLabel: true
            }
          ].map((metric, index) => {
            const Icon = metric.icon;

            return (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] h-full flex flex-col">
                  <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>

                  <CardContent className="relative p-3 sm:p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider truncate ${metric.color.replace('from-', 'text-').replace(' to-purple-600', '').replace(' to-emerald-600', '').replace(' to-red-600', '').replace(' to-pink-600', '')} dark:opacity-80`}>
                          {metric.label}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-lg sm:rounded-xl shadow-lg flex-shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">
                        {metric.value}{metric.suffix || ''}
                      </p>
                      <div className="h-1 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${Math.min(metric.progress, 100)}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-2xl blur-md"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Input
                    placeholder="Buscar por aluno ou email..."
                    className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={protocolFilter} onValueChange={setProtocolFilter}>
                  <SelectTrigger className="w-full lg:w-[250px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold">Protocolo</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                    <SelectItem value="all">Todos os Protocolos</SelectItem>
                    {Object.entries(PROTOCOLS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full lg:w-[200px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">Período</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                    <SelectItem value="all">Todos os Períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta Semana</SelectItem>
                    <SelectItem value="month">Este Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        <div className="space-y-6">
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-6">

                      {/* Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {assessment.profiles.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                            <Activity className="h-3 w-3 text-white" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {assessment.profiles.full_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {assessment.profiles.email}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs">
                              {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </Badge>
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs">
                              {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS]}
                            </Badge>
                            {getClassificationBadge(assessment.fat_percentage, assessment.gender)}
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:w-80">
                        {[
                          {
                            value: assessment.bmi,
                            label: "IMC",
                            colors: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                            text: "text-blue-600 dark:text-blue-400",
                            isPercentage: false
                          },
                          {
                            value: assessment.fat_percentage,
                            label: "Gordura",
                            colors: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
                            text: "text-red-600 dark:text-red-400",
                            isPercentage: true
                          },
                          {
                            value: assessment.lean_mass,
                            label: "M. Magra",
                            colors: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                            text: "text-green-600 dark:text-green-400",
                            isPercentage: false,
                            unit: "kg"
                          },
                          {
                            value: assessment.weight,
                            label: "Peso",
                            colors: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
                            text: "text-purple-600 dark:text-purple-400",
                            isPercentage: false,
                            unit: "kg"
                          }
                        ].map((item, index) => {
                          // Função para formatar o valor de exibição
                          const formatDisplayValue = (value: number) => {
                            if (item.isPercentage) return `${value}%`;

                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(1)}k`; // Formata para "Xk" quando ≥ 1000
                            }

                            if (item.unit) {
                              return `${value}${item.unit}`;
                            }

                            return value;
                          };

                          // Função para formatar o valor completo (tooltip)
                          const formatFullValue = (value: number | null | undefined) => {
                            if (value == null) return "-"; // ou algum outro placeholder

                            if (item.isPercentage) return `${value.toLocaleString()}%`;
                            if (item.unit) return `${value.toLocaleString()} ${item.unit}`;
                            return value.toLocaleString();
                          };


                          const displayValue = formatDisplayValue(item.value);
                          const fullValue = formatFullValue(item.value);

                          return (
                            <div
                              key={index}
                              className={`text-center p-2 bg-gradient-to-r ${item.colors} rounded-xl min-h-[80px] flex flex-col justify-between`}
                              title={fullValue}
                            >
                              <div className={`text-xl font-bold ${item.text} truncate`}>
                                {displayValue}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {item.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 xl:flex-col xl:w-36">
                        <Button
                          onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-semibold border-0"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        {assessment.ai_analysis && (
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}?tab=analysis`)}
                            className="flex-1 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Análise IA
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-cyan-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center shadow-2xl">
                      <Brain className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
                  </div>

                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-4">
                    {searchQuery || protocolFilter !== 'all' || dateFilter !== 'all'
                      ? 'Nenhuma avaliação encontrada'
                      : 'Transforme Vidas com IA!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    {searchQuery || protocolFilter !== 'all' || dateFilter !== 'all'
                      ? "Ajuste os filtros de busca para encontrar a avaliação que você procura"
                      : "Comece criando avaliações físicas inteligentes com análise de IA para transformar a vida dos seus alunos"}
                  </p>

                  {(userRole === 'trainer' || userRole === null) && (
                    <Button
                      onClick={() => router.push('/dashboard/physical-assessments/new')}
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                    >
                      <Plus className="mr-3 h-6 w-6" />
                      {searchQuery || protocolFilter !== 'all' || dateFilter !== 'all'
                        ? 'Criar Nova Avaliação'
                        : 'Começar Agora'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}